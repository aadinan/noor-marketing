import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, ExternalLink, RefreshCw, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import ManagerPINModal from '../components/ManagerPINModal';
import AddShopModal from '../components/AddShopModal';
import AddProductModal from '../components/AddProductModal';
import { useSearchParams } from 'react-router-dom';

const NewOrder = () => {
  const navigate = useNavigate();

  // Data State - Initialize as empty arrays to prevent crashes
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

  // Form State
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState('Weekly Credit');
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [pinMessage, setPinMessage] = useState('');
  const [searchParams] = useSearchParams();

  const loadData = async () => {
    setProductsLoading(true);
    setProductsError(false);
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/retailers'),
        api.get('/products')
      ]);

      const retailersData = Array.isArray(rRes.data) ? rRes.data : (rRes.data.data || []);
      const productsData = Array.isArray(pRes.data) ? pRes.data : (pRes.data.products || pRes.data.data || []);

      setRetailers(retailersData);
      setProducts(productsData);

      // Pre-select retailer from URL query param
      const preSelected = searchParams.get('retailer');
      if (preSelected) setSelectedRetailer(preSelected);

    } catch (err) {
      console.error("Data Load Error:", err);
      if (err.response?.status === 504 || err.code === 'ECONNABORTED' || !err.response) {
        setProductsError(true);
      }
      toast.error("Failed to load shop/product data");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);

    // Logic: Stock Check
    if ((product.inventory?.stockCount ?? 0) <= 0) {
      toast.error("Out of Stock!");
      return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product: product._id,
        name: product.name,
        price: product.basePrice,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const calculateTotal = () => {
    const gross = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Logic: Ready Cash Discount (2%)
    const discount = paymentTerms === 'Ready Cash' ? (gross * 0.02) : 0;
    return { gross, discount, net: gross - discount };
  };

  const handleEstimate = async () => {
    if (!selectedRetailer || cart.length === 0) {
      toast.warning("Please select a shop and add items.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/estimates', {
        retailerId: selectedRetailer,
        items: cart,
        paymentTerms
      });
      toast.success("Estimate Saved!");
      navigate('/estimates');
    } catch (err) {
      toast.error(err.response?.data?.message || "Estimate Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (managerPIN = null) => {
    if (!selectedRetailer || cart.length === 0) {
      toast.warning("Please select a shop and add items.");
      return;
    }

    setSubmitting(true);

    const payload = {
      retailerId: selectedRetailer,
      items: cart,
      paymentTerms,
      managerPIN // Passed only if credit limit is hit
    };

    try {
      const res = await api.post('/orders', payload);

      if (res.data.message && res.data.message.includes("Yellow State")) {
        toast.warning("Order placed with Manager Override!");
      } else {
        toast.success("Order Placed Successfully!");
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'Manager') {
        navigate('/manager');
      } else if (user?.role === 'Boss' || user?.role === 'Admin') {
        navigate('/boss');
      } else {
        navigate('/sales');
      }

    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresManagerAuth) {
        setPinMessage(err.response.data.message);
        setPinModalOpen(true);
      } else {
        toast.error(err.response?.data?.message || "Order Failed");
      }
    } finally {
      if (!pinModalOpen) setSubmitting(false);
    }
  };

  const handlePinConfirm = (pin) => {
    setPinModalOpen(false);
    handleSubmit(pin);
  };

  const handlePinCancel = () => {
    setPinModalOpen(false);
    setSubmitting(false);
    toast.error("Order Cancelled by User");
  };

  const { gross, discount, net } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <h1 className="text-2xl font-black mb-4 text-slate-800 flex items-center gap-2">
        <ShoppingCart /> New Order
      </h1>

      {/* 1. SELECT SHOP */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Select Shop</label>
          <button onClick={() => setShopModalOpen(true)} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
            <Plus size={12} /> Add Shop
          </button>
        </div>
        <select
          className="w-full p-3 bg-gray-50 rounded-lg outline-none border border-gray-200"
          onChange={(e) => setSelectedRetailer(e.target.value)}
          value={selectedRetailer}
        >
          <option value="">-- Choose Client --</option>
          {retailers.map(r => (
            <option key={r._id} value={r._id}>
              {r.shopName} (Due: ₹{r.outstandingBalance})
            </option>
          ))}
        </select>
      </div>

      {/* CREDIT STATUS BANNER */}
      {selectedRetailer && (() => {
        const shop = retailers.find(r => r._id === selectedRetailer);
        if (!shop) return null;
        const outstanding = shop.outstandingBalance || 0;
        const limit = shop.creditLimit || 10000;
        const ratio = outstanding / limit;
        const isOverLimit = outstanding >= limit;
        const isWarning = ratio >= 0.7;
        return (
          <div className={`p-4 rounded-xl mb-4 border-l-4 ${
            isOverLimit ? 'bg-red-50 border-red-500' :
            isWarning ? 'bg-orange-50 border-orange-400' :
            'bg-green-50 border-green-400'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Credit Status</p>
                <p className="font-bold text-gray-800">{shop.shopName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Outstanding / Limit</p>
                <p className={`font-black text-sm ${
                  isOverLimit ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'
                }`}>
                  ₹{outstanding.toLocaleString()} / ₹{limit.toLocaleString()}
                </p>
              </div>
            </div>
            {isOverLimit && (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Credit limit exceeded - Manager approval required
              </p>
            )}
          </div>
        );
      })()}

      {/* 2. ADD PRODUCTS */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-gray-400 uppercase">Products</p>
          <button onClick={() => setProductModalOpen(true)} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
            <Plus size={12} /> Add Product
          </button>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
          {['All', 'Wires', 'Switches', 'Lighting', 'MCBs', 'Sockets', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                categoryFilter === cat ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {productsLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))
        ) : productsError ? (
          <div className="text-center py-8 text-gray-400">
            <p className="font-bold text-red-500 mb-2">Connection Timeout</p>
            <button onClick={loadData} className="mt-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-blue-100 transition">
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="font-bold">No products found</p>
            <button onClick={() => setProductModalOpen(true)} className="mt-2 text-blue-600 text-sm font-bold flex items-center gap-1 mx-auto hover:underline">
              <Plus size={14} /> Add a product first
            </button>
          </div>
        ) : (
          (() => {
            const filteredProducts = categoryFilter === 'All' ? products : products.filter(p => p.category?.toLowerCase().includes(categoryFilter.toLowerCase()));
            return filteredProducts.map(p => (
              <div key={p._id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
                <div>
                  <p className="font-bold text-slate-800">{p.name}</p>
                  <div className="flex gap-2 text-xs">
                    <span className={(p.inventory?.stockCount ?? 0) < 10 ? "text-red-500 font-bold" : "text-gray-500"}>
                      Stock: {p.inventory?.stockCount ?? 0}
                    </span>
                    <span className="font-bold text-blue-600">₹{p.basePrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  className="bg-slate-900 text-white p-2 rounded-lg active:scale-95 transition disabled:opacity-50"
                  disabled={(p.inventory?.stockCount ?? 0) <= 0}
                >
                  <Plus size={20} />
                </button>
              </div>
            ));
          })()
        )}
      </div>

      {/* 3. CART & PAYMENT TERMS */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-5 rounded-t-3xl border-t border-gray-100 z-50">

          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Payment Terms</span>
            <select
              className="bg-blue-50 text-blue-700 text-sm font-bold p-2 rounded-lg outline-none"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            >
              <option value="Weekly Credit">Weekly Credit</option>
              <option value="Ready Cash">Ready Cash (-2%)</option>
            </select>
          </div>

          <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
            {cart.map(item => (
              <div key={item.product} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">₹{item.price * item.quantity}</span>
                  <Trash2 size={14} className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => removeFromCart(item.product)} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-gray-400">Total Payable</p>
              <p className="text-2xl font-black text-slate-900">₹{net.toLocaleString()}</p>
              {discount > 0 && <p className="text-xs text-green-600 font-bold">Included Discount: ₹{discount}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEstimate}
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition disabled:opacity-75"
              >
                Save as Estimate
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-green-200 active:scale-95 transition disabled:opacity-75"
              >
                {submitting ? "Confirming..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ManagerPINModal
        isOpen={pinModalOpen}
        message={pinMessage}
        onConfirm={handlePinConfirm}
        onCancel={handlePinCancel}
      />
      <AddShopModal
        isOpen={shopModalOpen}
        onClose={() => setShopModalOpen(false)}
        onSuccess={(shop) => { setRetailers([...retailers, shop]); setSelectedRetailer(shop._id); }}
      />
      <AddProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSuccess={(product) => setProducts([product, ...products])}
      />
    </div>
  );
};

export default NewOrder;