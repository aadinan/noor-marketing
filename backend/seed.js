// backend/seed.js — FULL PRODUCTION SEED SCRIPT
// Covers all 18 models with realistic dummy data
// Schema-validated against all model files
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// ── Models ──────────────────────────────────────────────────────────────────
const User                = require('./models/User');
const Product             = require('./models/Product');
const Retailer            = require('./models/Retailer');
const Order               = require('./models/Order');
const Collection          = require('./models/Collection');
const Payment             = require('./models/Payment');
const Quotation           = require('./models/Quotation');
const Estimate            = require('./models/Estimate');
const ProjectOrder        = require('./models/ProjectOrder');
const CreditRequest       = require('./models/CreditRequest');
const AuditLog            = require('./models/AuditLog');
const Supplier            = require('./models/Supplier');
const PurchaseOrder       = require('./models/PurchaseOrder');
const Delivery            = require('./models/Delivery');
const InventoryTransaction= require('./models/InventoryTransaction');
const Incentive           = require('./models/Incentive');
const Notification        = require('./models/Notification');
const StockException      = require('./models/StockException');

// ── Counter for unique numbers ────────────────────────────────────────────
let counter = 1000;
const uid = () => (counter++).toString();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas...');

    // ── 1. WIPE ALL COLLECTIONS ─────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Retailer.deleteMany({}),
      Order.deleteMany({}),
      Collection.deleteMany({}),
      Payment.deleteMany({}),
      Quotation.deleteMany({}),
      Estimate.deleteMany({}),
      ProjectOrder.deleteMany({}),
      CreditRequest.deleteMany({}),
      AuditLog.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Delivery.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      Incentive.deleteMany({}),
      Notification.deleteMany({}),
      StockException.deleteMany({}),
    ]);
    console.log('🗑️  Database wiped clean (all 18 collections).');

    // ── 2. USERS (6 roles) ───────────────────────────────────────────────
    // Passwords are hashed via pre-save hook in User.js
    const users = await User.create([
      { username: 'Boss Ish',       password: 'pass123', role: 'Boss'      },
      { username: 'Admin Tech',     password: 'pass123', role: 'Admin'     },
      { username: 'Manager Khan',   password: 'pass123', role: 'Manager'   },
      { username: 'sale',           password: 'pass123', role: 'Salesman'  },
      { username: 'Salesman B',     password: 'pass123', role: 'Salesman'  },
      { username: 'wh',             password: 'pass123', role: 'Warehouse' },
    ]);
    const [boss, admin, manager, salesmanA, salesmanB, warehouse] = users;
    console.log(`👥 ${users.length} Users created.`);

    // ── 3. SUPPLIERS ─────────────────────────────────────────────────────
    const suppliers = await Supplier.create([
      {
        name: 'Wipro Lighting India Ltd',
        contactPerson: 'Ramakrishna Nair',
        email: 'sales@wiprolighting.com',
        phone: '9100000001',
        gstNumber: '29AABCW1234A1Z5',
        address: 'Electronic City, Bengaluru, Karnataka',
        creditPeriodDays: 45,
        activeProducts: 3,
        totalPurchasedValue: 250000
      },
      {
        name: 'Teso Switchgear Pvt Ltd',
        contactPerson: 'Anand Shetty',
        email: 'orders@teso.in',
        phone: '9100000002',
        gstNumber: '29AACTS4567B1Z3',
        address: 'Peenya Industrial Area, Bengaluru, Karnataka',
        creditPeriodDays: 30,
        activeProducts: 2,
        totalPurchasedValue: 80000
      },
    ]);
    console.log(`🏭 ${suppliers.length} Suppliers created.`);

    // ── 4. PRODUCTS (5 realistic SKUs) ───────────────────────────────────
    const products = await Product.create([
      {
        sku: 'WP-LED-9W',
        productCode: 'WIP-001',
        name: 'Wipro 9W LED Bulb (Cool White)',
        brand: 'Wipro',
        category: 'Lighting',
        basePrice: 68,
        mrp: 149,
        isActive: true,
        inventory: {
          stockCount: 500,
          packagingQty: 1,
          location: { zone: 'Zone 2', rack: 'A', shelf: '1', bin: 'B1' },
          alertLevel: 100,
          maxCapacity: 1000,
        },
        specifications: {
          wattage: '9W',
          lumens: '800lm',
          cct: '6500K',
          mountingType: 'None',
        },
        metrics: {
          classification: 'A',
          averageDailySales: 45,
          leadTimeDays: 7,
          safetyStock: 150,
          reorderPoint: 350,
        },
      },
      {
        sku: 'TS-SW-6A',
        productCode: 'TESO-55',
        name: 'Teso 6A One-Way Switch',
        brand: 'Teso',
        category: 'Switchgear',
        basePrice: 12,
        mrp: 38,
        isActive: true,
        inventory: {
          stockCount: 20,  // Deliberately low — below alertLevel for testing
          packagingQty: 20,
          location: { zone: 'Zone 5', rack: 'C', shelf: '2', bin: '' },
          alertLevel: 50,
          maxCapacity: 500,
        },
        specifications: {
          modules: '1M',
          ampere: '6A',
          material: 'Polycarbonate',
          indicator: false,
        },
        metrics: {
          classification: 'A',
          averageDailySales: 10,
          leadTimeDays: 5,
          safetyStock: 30,
          reorderPoint: 80,
        },
      },
      {
        sku: 'WP-COB-3W',
        productCode: 'WIP-COB-02',
        name: 'Wipro 3W Cabinet COB Light',
        brand: 'Wipro',
        category: 'Lighting',
        basePrice: 110,
        mrp: 275,
        isActive: true,
        inventory: {
          stockCount: 150,
          packagingQty: 1,
          location: { zone: 'Zone 1', rack: 'B', shelf: '3', bin: '' },
          alertLevel: 20,
          maxCapacity: 300,
        },
        specifications: {
          wattage: '3W',
          lumens: '250lm',
          cct: '3000K',
          cutoutInch: 2.5,
          mountingType: 'Concealed',
        },
        metrics: {
          classification: 'B',
          averageDailySales: 2,
          leadTimeDays: 10,
          safetyStock: 10,
          reorderPoint: 15,
        },
      },
      {
        sku: 'TS-DB-4WAY',
        productCode: 'TESO-DB-101',
        name: 'Teso 4-Way Distribution Board',
        brand: 'Teso',
        category: 'Switchgear',
        basePrice: 450,
        mrp: 980,
        isActive: true,
        inventory: {
          stockCount: 60,
          packagingQty: 1,
          location: { zone: 'Zone 3', rack: 'D', shelf: '1', bin: '' },
          alertLevel: 10,
          maxCapacity: 100,
        },
        specifications: {
          ampere: '32A',
          material: 'Metal',
          boxType: '4-way SPN',
        },
        metrics: {
          classification: 'B',
          averageDailySales: 1,
          leadTimeDays: 14,
          safetyStock: 5,
          reorderPoint: 10,
        },
      },
      {
        sku: 'WP-TRK-24W',
        productCode: 'WIP-TRK-03',
        name: 'Wipro 24W Track Light (Adjustable)',
        brand: 'Wipro',
        category: 'Lighting',
        basePrice: 650,
        mrp: 1399,
        isActive: true,
        inventory: {
          stockCount: 80,
          packagingQty: 1,
          location: { zone: 'Zone 4', rack: 'E', shelf: '2', bin: '' },
          alertLevel: 15,
          maxCapacity: 200,
        },
        specifications: {
          wattage: '24W',
          lumens: '2200lm',
          cct: '4000K',
          beamAngle: '30°',
          mountingType: 'Open',
        },
        metrics: {
          classification: 'C',
          averageDailySales: 0.5,
          leadTimeDays: 21,
          safetyStock: 5,
          reorderPoint: 15,
        },
      },
    ]);
    console.log(`📦 ${products.length} Products created.`);

    // ── 5. RETAILERS (4 shops with varying credit health) ────────────────
    const retailers = await Retailer.create([
      {
        shopName: 'Mangalore Light House',
        ownerName: 'Suresh Kumar',
        phoneNumber: '919000000001',
        gstNumber: '29AABCS1234A1Z2',
        address: { line1: 'Main Road, Hampankatta', city: 'Mangalore' },
        assignedSalesman: salesmanA._id,
        outstandingBalance: 45000,
        creditLimit: 50000,
        isActive: true,
        creditFrozen: false,
        tagName: 'High Value',
        lastVisitDate: new Date(),
        lastOrderDate: new Date(),
        visitCount: 12,
        gpsLocation: { lat: 12.8701, lng: 74.8426, accuracy: 5 },
        metrics: { averagePaymentDays: 22, averageMonthlySales: 35000 },
      },
      {
        shopName: 'Udupi Electricals',
        ownerName: 'Ramesh Hegde',
        phoneNumber: '919000000002',
        gstNumber: '29AABCU5678B1Z3',
        address: { line1: 'Car Street', city: 'Udupi' },
        assignedSalesman: salesmanA._id,
        outstandingBalance: 5000,
        creditLimit: 20000,
        isActive: true,
        creditFrozen: false,
        tagName: 'Regular',
        lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        visitCount: 8,
        gpsLocation: { lat: 13.3379, lng: 74.7421, accuracy: 8 },
        metrics: { averagePaymentDays: 15, averageMonthlySales: 12000 },
      },
      {
        shopName: 'Kundapur Electricals & Hardware',
        ownerName: 'Vishwanath Shetty',
        phoneNumber: '919000000003',
        gstNumber: '29AABCK9012C1Z4',
        address: { line1: 'National Highway, Kundapur', city: 'Kundapur' },
        assignedSalesman: salesmanB._id,
        outstandingBalance: 0,
        creditLimit: 30000,
        isActive: true,
        creditFrozen: false,
        tagName: 'New',
        visitCount: 3,
        gpsLocation: { lat: 13.6257, lng: 74.6900, accuracy: 10 },
        metrics: { averagePaymentDays: 30, averageMonthlySales: 8000 },
      },
      {
        shopName: 'Puttur Power Solutions',
        ownerName: 'Dinesh Gowda',
        phoneNumber: '919000000004',
        gstNumber: '29AABCP3456D1Z5',
        address: { line1: 'Market Road', city: 'Puttur' },
        assignedSalesman: salesmanB._id,
        outstandingBalance: 18000,
        creditLimit: 15000,  // OVER LIMIT — triggers credit freeze scenario
        isActive: true,
        creditFrozen: true,
        freezeReason: 'Outstanding balance exceeds credit limit',
        visitCount: 20,
        gpsLocation: { lat: 12.7626, lng: 75.2073, accuracy: 6 },
        metrics: { averagePaymentDays: 45, averageMonthlySales: 9000 },
      },
    ]);
    console.log(`🏪 ${retailers.length} Retailers created (1 frozen, 1 near limit).`);

    // ── 6. ORDERS ─────────────────────────────────────────────────────────
    const order1 = await Order.create({
      salesman: salesmanA._id,
      retailer: retailers[0]._id,
      items: [
        {
          product: products[0]._id,
          quantity: 100,
          wholesalePriceAtTime: products[0].basePrice,
          subTotal: products[0].basePrice * 100,
          locationSnap: 'Zone 2 > A > 1',
        },
        {
          product: products[2]._id,
          quantity: 20,
          wholesalePriceAtTime: products[2].basePrice,
          subTotal: products[2].basePrice * 20,
          locationSnap: 'Zone 1 > B > 3',
        },
      ],
      totalOrderValue: products[0].basePrice * 100 + products[2].basePrice * 20,
      discountApplied: 0,
      netPayable: products[0].basePrice * 100 + products[2].basePrice * 20,
      staffIncentiveAmount: 200,
      status: 'Processing',
      approvedBy: manager._id,
      geofenceVerified: true,
    });

    const order2 = await Order.create({
      salesman: salesmanA._id,
      retailer: retailers[1]._id,
      items: [
        {
          product: products[1]._id,
          quantity: 50,
          wholesalePriceAtTime: products[1].basePrice,
          subTotal: products[1].basePrice * 50,
          locationSnap: 'Zone 5 > C > 2',
        },
      ],
      totalOrderValue: products[1].basePrice * 50,
      discountApplied: 12,
      netPayable: products[1].basePrice * 50 - 12,
      status: 'Packed',
    });

    const order3 = await Order.create({
      salesman: salesmanB._id,
      retailer: retailers[2]._id,
      items: [
        {
          product: products[3]._id,
          quantity: 5,
          wholesalePriceAtTime: products[3].basePrice,
          subTotal: products[3].basePrice * 5,
          locationSnap: 'Zone 3 > D > 1',
        },
      ],
      totalOrderValue: products[3].basePrice * 5,
      discountApplied: 0,
      netPayable: products[3].basePrice * 5,
      status: 'Pending',
    });

    const order4 = await Order.create({
      salesman: salesmanA._id,
      retailer: retailers[0]._id,
      items: [
        {
          product: products[4]._id,
          quantity: 10,
          wholesalePriceAtTime: products[4].basePrice,
          subTotal: products[4].basePrice * 10,
          locationSnap: 'Zone 4 > E > 2',
        },
      ],
      totalOrderValue: products[4].basePrice * 10,
      discountApplied: 0,
      netPayable: products[4].basePrice * 10,
      status: 'Delivered',
      deliveryInfo: {
        isSiteDelivery: true,
        siteName: 'Green Valley Villa #45',
        siteContactName: 'Watchman',
        siteContactPhone: '9000009999',
        locationCoordinates: { lat: 12.8701, lng: 74.8426, googleMapLink: 'https://maps.google.com/?q=12.8701,74.8426' },
        instructions: 'Call before entering gate',
      },
    });

    console.log('📋 4 Orders created (Processing, Packed, Pending, Delivered).');

    // ── 7. COLLECTIONS (Payments Collected) ──────────────────────────────
    const collections = await Collection.create([
      {
        salesman: salesmanA._id,
        clientType: 'Shop',
        retailer: retailers[0]._id,
        amountCollected: 10000,
        paymentMode: 'Cash',
        referenceNumber: '',
        note: 'Festival advance payment',
        discountAsked: 0,
        discountStatus: 'None',
        isOfflineEntry: false,
      },
      {
        salesman: salesmanA._id,
        clientType: 'Shop',
        retailer: retailers[1]._id,
        amountCollected: 3000,
        paymentMode: 'UPI',
        referenceNumber: 'UPI-TXN-78432',
        note: 'Partial payment',
        discountAsked: 100,
        discountStatus: 'Auto-Approved',
        isOfflineEntry: false,
      },
      {
        salesman: salesmanB._id,
        clientType: 'Shop',
        retailer: retailers[3]._id,
        amountCollected: 5000,
        paymentMode: 'Cheque',
        referenceNumber: 'CHQ-004521',
        note: 'Post-dated cheque',
        discountAsked: 500,
        discountStatus: 'Pending_Approval',  // Triggers manager approval queue
        isOfflineEntry: false,
      },
    ]);
    console.log(`💰 ${collections.length} Collections recorded.`);

    // ── 8. PAYMENTS ───────────────────────────────────────────────────────
    const payments = await Payment.create([
      {
        retailer: retailers[0]._id,
        collectedBy: salesmanA._id,
        amount: 10000,
        method: 'CASH',
        status: 'COLLECTED',
        orderId: order1._id,
        notes: 'Festival season cash payment',
      },
      {
        retailer: retailers[1]._id,
        collectedBy: salesmanA._id,
        amount: 3000,
        method: 'UPI',
        transactionReference: 'UPI-TXN-78432',
        status: 'VERIFIED',
        orderId: order2._id,
        location: { lat: 13.3379, lng: 74.7421 },
      },
    ]);
    console.log(`💳 ${payments.length} Payments recorded.`);

    // ── 9. QUOTATIONS ─────────────────────────────────────────────────────
    const quotations = await Quotation.create([
      {
        quotationNumber: `QT-2026-${uid()}`,
        salesman: salesmanA._id,
        retailer: retailers[2]._id,
        customerInfo: {
          name: 'Vishwanath Shetty',
          phone: '919000000003',
          address: 'Kundapur',
          customerType: 'Retailer',
        },
        items: [
          {
            product: products[0]._id,
            quantity: 200,
            quotedPrice: products[0].basePrice * 0.95,
            basePrice: products[0].basePrice,
            subTotal: products[0].basePrice * 0.95 * 200,
          },
        ],
        totalAmount: products[0].basePrice * 0.95 * 200,
        grandTotal: products[0].basePrice * 0.95 * 200 * 1.18,  // + 18% GST
        marginStatus: 'Healthy',
        status: 'SENT',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        terms: 'Prices valid for 7 days. GST extra.',
      },
      {
        quotationNumber: `QT-2026-${uid()}`,
        salesman: salesmanB._id,
        customerInfo: {
          name: 'Jayaram Contractor',
          phone: '919100000001',
          address: 'Sullia Road, Puttur',
          customerType: 'Contractor',
        },
        items: [
          {
            product: products[4]._id,
            quantity: 50,
            quotedPrice: products[4].basePrice * 0.88,  // Low margin — triggers Low_Margin flag
            basePrice: products[4].basePrice,
            subTotal: products[4].basePrice * 0.88 * 50,
          },
        ],
        totalAmount: products[4].basePrice * 0.88 * 50,
        grandTotal: products[4].basePrice * 0.88 * 50 * 1.18,
        marginStatus: 'Low_Margin',
        status: 'PENDING_APPROVAL',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`📄 ${quotations.length} Quotations created.`);

    // ── 10. ESTIMATES ─────────────────────────────────────────────────────
    const estimates = await Estimate.create([
      {
        estimateNumber: `EST-2026-${uid()}`,
        salesman: salesmanA._id,
        retailer: retailers[0]._id,
        customerInfo: {
          name: 'Suresh Kumar',
          phone: '919000000001',
          address: 'Mangalore',
          customerType: 'Retailer',
        },
        items: [
          {
            product: products[0]._id,
            quantity: 500,
            price: products[0].basePrice,
            subTotal: products[0].basePrice * 500,
          },
          {
            product: products[2]._id,
            quantity: 100,
            price: products[2].basePrice,
            subTotal: products[2].basePrice * 100,
          },
        ],
        totalAmount: products[0].basePrice * 500 + products[2].basePrice * 100,
        discountPercent: 5,
        discountAmount: (products[0].basePrice * 500 + products[2].basePrice * 100) * 0.05,
        finalAmount: (products[0].basePrice * 500 + products[2].basePrice * 100) * 0.95,
        status: 'APPROVED',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: 'Bulk Diwali order estimate',
      },
      {
        estimateNumber: `EST-2026-${uid()}`,
        salesman: salesmanB._id,
        customerInfo: {
          name: 'Anil Prabhu',
          phone: '919200000001',
          address: 'Manipal',
          customerType: 'Contractor',
        },
        items: [
          {
            product: products[3]._id,
            quantity: 20,
            price: products[3].basePrice,
            subTotal: products[3].basePrice * 20,
          },
        ],
        totalAmount: products[3].basePrice * 20,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: products[3].basePrice * 20,
        status: 'DRAFT',
      },
    ]);
    console.log(`📝 ${estimates.length} Estimates created.`);

    // ── 11. PROJECT ORDERS ────────────────────────────────────────────────
    const projectOrders = await ProjectOrder.create([
      {
        projectName: 'Green Valley Apartments — Full Electrical',
        clientName: 'Prabhakar Constructions Pvt Ltd',
        clientType: 'Contractor',
        siteAddress: 'Green Valley Layout, Derebail, Mangalore',
        estimatedValue: 450000,
        salesman: salesmanA._id,
        items: [
          { productName: 'Wipro 9W LED Bulb', product: products[0]._id, quantity: 800, unit: 'pcs', price: products[0].basePrice, subTotal: products[0].basePrice * 800 },
          { productName: 'Teso 6A Switch',    product: products[1]._id, quantity: 400, unit: 'pcs', price: products[1].basePrice, subTotal: products[1].basePrice * 400 },
          { productName: 'Teso DB 4-Way',     product: products[3]._id, quantity: 50,  unit: 'pcs', price: products[3].basePrice, subTotal: products[3].basePrice * 50  },
        ],
        discountPercent: 8,
        totalAmount: (products[0].basePrice * 800 + products[1].basePrice * 400 + products[3].basePrice * 50) * 0.92,
        requiresSiteDelivery: true,
        staggeredDelivery: true,
        milestones: [
          { description: 'Phase 1 — Ground Floor Materials', targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), status: 'Pending' },
          { description: 'Phase 2 — Upper Floors', targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'Pending' },
        ],
        quotationStatus: 'APPROVED',
        orderStatus: 'ACTIVE',
        approvedBy: manager._id,
        notes: 'VIP project — Preferred customer of Boss',
      },
      {
        projectName: 'Manipal University Hostel Block C',
        clientName: 'Anand Constructions',
        clientType: 'Contractor',
        siteAddress: 'Madhav Nagar, Manipal',
        estimatedValue: 190000,
        salesman: salesmanB._id,
        items: [
          { productName: 'Wipro Track Light 24W', product: products[4]._id, quantity: 120, unit: 'pcs', price: products[4].basePrice, subTotal: products[4].basePrice * 120 },
        ],
        discountPercent: 5,
        totalAmount: products[4].basePrice * 120 * 0.95,
        requiresSiteDelivery: false,
        quotationStatus: 'PENDING_REVIEW',
        orderStatus: 'NOT_STARTED',
      },
    ]);
    console.log(`🏗️  ${projectOrders.length} Project Orders created.`);

    // ── 12. CREDIT REQUESTS ───────────────────────────────────────────────
    const creditRequests = await CreditRequest.create([
      {
        retailer: retailers[0]._id,
        requestedBy: salesmanA._id,
        requestedAmount: 75000,
        currentLimit: 50000,
        reason: 'Diwali season incoming — expecting 3x sales this month',
        status: 'PENDING',
      },
      {
        retailer: retailers[3]._id,
        requestedBy: salesmanB._id,
        requestedAmount: 25000,
        currentLimit: 15000,
        reason: 'Customer wants to clear backlog before year-end',
        status: 'APPROVED',
        adminComment: 'Approved for 60 days only. Review after December.',
        reviewedBy: manager._id,
        reviewedAt: new Date(),
      },
    ]);
    console.log(`💳 ${creditRequests.length} Credit Requests created.`);

    // ── 13. AUDIT LOGS ────────────────────────────────────────────────────
    await AuditLog.create([
      {
        action: 'APPROVED_SPOT_DISCOUNT_COLLECTION',
        performedBy: manager._id,
        targetId: collections[2]._id.toString(),
        details: { amount: 500, retailerId: retailers[3]._id, discountType: 'Cash Discount' },
        ipAddress: '192.168.1.10',
      },
      {
        action: 'CREDIT_LIMIT_OVERRIDE',
        performedBy: manager._id,
        targetId: retailers[0]._id.toString(),
        details: { oldLimit: 50000, newLimit: 75000, reason: 'Festival Season Approval' },
        ipAddress: '192.168.1.10',
      },
      {
        action: 'ORDER_CREDIT_APPROVED',
        performedBy: boss._id,
        targetId: order1._id.toString(),
        details: { orderId: order1._id, retailerBalance: 45000 },
        ipAddress: '192.168.1.1',
      },
    ]);
    console.log('📋 3 Audit Log entries created.');

    // ── 14. PURCHASE ORDERS ───────────────────────────────────────────────
    const purchaseOrders = await PurchaseOrder.create([
      {
        poNumber: `PO-2026-${uid()}`,
        supplier: suppliers[0]._id,
        createdBy: warehouse._id,
        items: [
          { product: products[0]._id, orderedQty: 1000, receivedQty: 0, unitCost: 58, totalCost: 58000 },
          { product: products[2]._id, orderedQty: 200,  receivedQty: 0, unitCost: 95, totalCost: 19000 },
        ],
        totalAmount: 77000,
        status: 'SENT',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        poNumber: `PO-2026-${uid()}`,
        supplier: suppliers[1]._id,
        createdBy: warehouse._id,
        items: [
          { product: products[1]._id, orderedQty: 500, receivedQty: 500, unitCost: 9, totalCost: 4500 },
        ],
        totalAmount: 4500,
        status: 'COMPLETED',
        expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`📦 ${purchaseOrders.length} Purchase Orders created.`);

    // ── 15. DELIVERIES ────────────────────────────────────────────────────
    const deliveries = await Delivery.create([
      {
        order: order2._id,
        salesman: salesmanA._id,
        retailer: retailers[1]._id,
        status: 'DELIVERED',
        deliveredAt: new Date(),
        paymentCollected: 600,
        paymentMode: 'Cash',
        driverNotes: 'Delivered to shop owner directly',
        proofDescription: 'Photo taken at shop entrance',
      },
      {
        order: order3._id,
        salesman: salesmanB._id,
        retailer: retailers[2]._id,
        status: 'PENDING',
        paymentMode: 'Credit',
      },
    ]);
    console.log(`🚚 ${deliveries.length} Delivery records created.`);

    // ── 16. INVENTORY TRANSACTIONS ────────────────────────────────────────
    await InventoryTransaction.create([
      {
        productId: products[0]._id,
        user: warehouse._id,
        type: 'INWARD',
        quantity: 1000,
        toLocation: 'Zone 2 > A > 1',
        reason: 'New stock arrived from Wipro',
        referenceId: purchaseOrders[0]._id.toString(),
      },
      {
        productId: products[0]._id,
        user: warehouse._id,
        type: 'OUTWARD',
        quantity: 100,
        fromLocation: 'Zone 2 > A > 1',
        reason: 'Sales order dispatch',
        referenceId: order1._id.toString(),
      },
      {
        productId: products[1]._id,
        user: warehouse._id,
        type: 'ADJUSTMENT',
        quantity: -5,
        fromLocation: 'Zone 5 > C > 2',
        reason: 'Physical count discrepancy — 5 units damaged',
      },
    ]);
    console.log('📊 3 Inventory Transactions logged.');

    // ── 17. INCENTIVES ────────────────────────────────────────────────────
    const now = new Date();
    await Incentive.create([
      {
        salesman: salesmanA._id,
        order: order1._id,
        amount: 1360,
        percentage: 2,
        type: 'Order Commission',
        paidStatus: 'Unpaid',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        notes: '2% on Rs 68,000 order',
      },
      {
        salesman: salesmanB._id,
        amount: 3000,
        type: 'Monthly Target',
        paidStatus: 'Paid',
        month: now.getMonth(),
        year: now.getFullYear(),
        notes: 'Hit 100% monthly target',
      },
    ]);
    console.log('🎯 2 Incentive records created.');

    // ── 18. NOTIFICATIONS ─────────────────────────────────────────────────
    await Notification.create([
      {
        recipientRole: 'Manager',
        recipientId: manager._id,
        type: 'CREDIT_APPROVAL',
        title: 'New Credit Limit Request',
        message: `Salesman 'sale' has requested a credit limit increase for Mangalore Light House from ₹50,000 to ₹75,000.`,
        relatedId: creditRequests[0]._id.toString(),
        relatedModel: 'CreditRequest',
        isRead: false,
      },
      {
        recipientRole: 'Manager',
        recipientId: manager._id,
        type: 'DISCOUNT_APPROVAL',
        title: 'Spot Discount Needs Approval',
        message: `Salesman B requested ₹500 discount for Puttur Power Solutions (above auto-approve limit).`,
        relatedId: collections[2]._id.toString(),
        relatedModel: 'Collection',
        isRead: false,
      },
      {
        recipientRole: 'Warehouse',
        recipientId: warehouse._id,
        type: 'LOW_STOCK_ALERT',
        title: '⚠️ Low Stock: Teso 6A Switch',
        message: `Teso 6A Switch (SKU: TS-SW-6A) is below alert level. Current: 20, Alert Level: 50.`,
        relatedId: products[1]._id.toString(),
        relatedModel: 'Product',
        isRead: false,
      },
    ]);
    console.log('🔔 3 Notifications created.');

    // ── 19. STOCK EXCEPTIONS ─────────────────────────────────────────────
    await StockException.create([
      {
        product: products[1]._id,
        reportedBy: warehouse._id,
        systemCount: 25,
        actualCount: 20,
        discrepancy: -5,
        notes: 'Found 5 units with broken casing — moved to reject bin',
        status: 'PENDING_REVIEW',
      },
    ]);
    console.log('⚠️  1 Stock Exception reported.');

    // ── SUMMARY ───────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('  ✅  SEEDING COMPLETE — ALL 18 MODELS POPULATED');
    console.log('═'.repeat(60));
    console.log('\n📌 Login Credentials (password: pass123)');
    console.log('  Boss        →  username: "Boss Ish"');
    console.log('  Admin       →  username: "Admin Tech"');
    console.log('  Manager     →  username: "Manager Khan"');
    console.log('  Salesman A  →  username: "sale"');
    console.log('  Salesman B  →  username: "Salesman B"');
    console.log('  Warehouse   →  username: "wh"');
    console.log('\n📦 Test Scenarios Seeded:');
    console.log('  • 1 Retailer near credit limit (Mangalore Light House)');
    console.log('  • 1 Retailer credit frozen (Puttur Power Solutions)');
    console.log('  • 1 Low-stock product below alert level (Teso Switch)');
    console.log('  • 1 Pending credit approval notification for Manager');
    console.log('  • 1 Pending discount approval for Manager');
    console.log('  • 1 Stock Exception pending review');
    console.log('  • Audit logs for spot discount + credit override');
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED:');
    console.error(err.message || err);
    if (err.errors) {
      Object.entries(err.errors).forEach(([field, e]) => {
        console.error(`  → ${field}: ${e.message}`);
      });
    }
    process.exit(1);
  }
};

seedData();