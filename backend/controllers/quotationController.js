const Quotation = require('../models/Quotation');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// CONFIG: Minimum Profit Margin % (e.g., 10%)
const MIN_MARGIN_PERCENT = 10;

// 1. Create Quotation with Margin Check
exports.createQuotation = async (req, res) => {
  try {
    const { retailerId, customerInfo, items, validDays = 7 } = req.body;

    const quotationNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    let grandTotal = 0;
    let isLowMargin = false;
    const processedItems = [];

    // PROCESS ITEMS & CHECK MARGIN
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);

      // Calculate Margin: ((Selling - Base) / Base) * 100
      const margin = ((item.quotedPrice - product.basePrice) / product.basePrice) * 100;

      if (margin < MIN_MARGIN_PERCENT) {
        isLowMargin = true; // FLOWCHART: Low -> Request Approval
      }

      const subTotal = item.quantity * item.quotedPrice;
      grandTotal += subTotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        quotedPrice: item.quotedPrice,
        basePrice: product.basePrice, // Save this for audit
        subTotal
      });
    }

    // DETERMINE STATUS
    // If low margin, it goes to 'PENDING_APPROVAL'. If good, it goes to 'APPROVED' (ready to send)
    const initialStatus = isLowMargin ? 'PENDING_APPROVAL' : 'APPROVED';
    const marginStatus = isLowMargin ? 'Low_Margin' : 'Healthy';

    const quote = await Quotation.create({
      quotationNumber,
      retailer: retailerId || null,
      customerInfo: customerInfo || {}, // If direct customer
      salesman: req.user._id,
      items: processedItems,
      totalAmount: grandTotal,
      grandTotal: grandTotal,
      validUntil,
      status: initialStatus,
      marginStatus: marginStatus
    });

    res.status(201).json({
      success: true,
      message: isLowMargin ? "Quote requires Manager Approval (Low Margin)." : "Quote Created Successfully.",
      quote
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Manager Approval (For Low Margin Quotes)
exports.approveQuotation = async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });

    quote.status = 'APPROVED'; // Manager overrides the low margin warning
    await quote.save();

    // SPOT DISCOUNT AUDIT TRAIL
    if (quote.marginStatus === 'Low_Margin') {
      await AuditLog.create({
        action: 'APPROVED_LOW_MARGIN_QUOTATION',
        performedBy: req.user._id,
        targetId: quote._id.toString(),
        details: { message: "Manager approved a spot discount quotation", requestedBy: quote.salesman },
        ipAddress: req.ip
      });
    }

    res.json({ success: true, message: "Quote Approved. Salesman can now send it." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. THE CONVERSION ENGINE (Quote -> Order)
exports.convertQuoteToOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const quote = await Quotation.findById(id);
    if (!quote) return res.status(404).json({ message: "Quotation not found" });

    // VALIDATION CHECKS
    if (quote.status === 'CONVERTED') return res.status(400).json({ message: "Already converted!" });
    if (quote.status !== 'ACCEPTED' && quote.status !== 'APPROVED') {
      return res.status(400).json({ message: "Quote must be Accepted by client first." });
    }
    if (new Date() > quote.validUntil) return res.status(400).json({ message: "Quotation Expired!" });

    const orderItems = [];

    // A. STOCK CHECK & RESERVE (Flowchart: VerifyStock -> ReserveLock)
    for (const item of quote.items) {
      const product = await Product.findById(item.product);

      if (product.inventory.stockCount < item.quantity) {
        // FLOWCHART: Out of Stock -> Backorder (Return error for now)
        return res.status(409).json({ message: `Insufficient stock for ${product.name}. Cannot convert.` });
      }

      // RESERVE STOCK NOW
      product.inventory.stockCount -= item.quantity;
      await product.save();

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        wholesalePriceAtTime: item.quotedPrice,
        subTotal: item.subTotal
      });
    }

    // B. CREATE ORDER DOCUMENT
    const newOrder = await Order.create({
      salesman: quote.salesman,
      retailer: quote.retailer,
      items: orderItems,
      totalOrderValue: quote.grandTotal,
      netPayable: quote.grandTotal,
      status: 'Pending', // Ready for Packing
      deliveryInfo: quote.deliveryInfo // Copy logistics info if it exists
    });

    // C. CLOSE QUOTATION
    quote.status = 'CONVERTED';
    quote.convertedOrderId = newOrder._id;
    await quote.save();

    res.json({
      success: true,
      message: "Quotation successfully converted to Order!",
      orderId: newOrder._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. GET All Quotations
exports.getQuotations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Salesman') {
      query.salesman = req.user._id;
    }
    const quotes = await Quotation.find(query)
      .populate('retailer', 'shopName')
      .populate('salesman', 'username')
      .sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. GET single quote
exports.getQuotationById = async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id)
      .populate('retailer', 'shopName address')
      .populate('items.product', 'name sku productCode');
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. REJECT quote
exports.rejectQuotation = async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });

    quote.status = 'REJECTED';
    await quote.save();

    res.json({ success: true, message: "Quote Rejected." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};