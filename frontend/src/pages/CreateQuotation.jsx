import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Check, Plus } from 'lucide-react';

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [cart, setCart] = useState([]);

  const [activeProduct, setActiveProduct] = useState(null);
  const [qtForm, setQtForm] = useState({ price: '', qty: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load Shops & Products
    const loadData = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          api.get('/retailers'),
          api.get('/products')
        ]);
        setRetailers(rRes.data.data || rRes.data);
        setProducts(pRes.data.products || pRes.data.data || pRes.data);
      } catch (err) {
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, []);

  const handleProductClick = (product) => {
    setActiveProduct(product);
    setQtForm({ price: product.basePrice, qty: 1 });
  };

  const addItem = () => {
    if (qtForm.price && qtForm.qty) {
      setCart([...cart, {
        product: activeProduct._id,
        name: activeProduct.name,
        quotedPrice: parseFloat(qtForm.price),
        quantity: parseInt(qtForm.qty)
      }]);
      setActiveProduct(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/quotations', {
        retailerId: selectedRetailer,
        items: cart
      });

      if (res.data.message && res.data.message.includes("Low Margin")) {
        toast.warning("Quote created but sent for Manager Approval (Low Margin)");
      } else {
        toast.success("Quote Created Successfully!");
      }
      navigate('/quotations');
    } catch (err) {
      toast.error("Failed to create quote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-black mb-4">New Quotation</h1>

      {/* 1. Select Shop */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-400">Select Client</label>
          <button type="button" onClick={() => navigate('/retailers/new')} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
            <Plus size={12} /> Add Shop
          </button>
        </div>
        <select
          className="w-full p-2 border rounded-lg"
          onChange={(e) => setSelectedRetailer(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {retailers.map(r => <option key={r._id} value={r._id}>{r.shopName}</option>)}
        </select>
      </div>

      {/* 2. Add Products */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase">Products</p>
        <button type="button" onClick={() => navigate('/products/new')} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
          <Plus size={12} /> Add Product
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-20">
        {products.map(p => (
          <div key={p._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <button
              onClick={() => handleProductClick(p)}
              className="text-left w-full h-full pb-1"
            >
              <p className="font-bold text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-500">Base Price: ₹{p.basePrice}</p>
            </button>

            {activeProduct?._id === p._id && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex gap-1 animate-in zoom-in-95">
                <input
                  type="number"
                  value={qtForm.price}
                  onChange={e => setQtForm({ ...qtForm, price: e.target.value })}
                  className="w-full text-xs p-2 border rounded bg-gray-50 outline-none focus:border-blue-500"
                  placeholder="Price"
                />
                <input
                  type="number"
                  min="1"
                  value={qtForm.qty}
                  onChange={e => setQtForm({ ...qtForm, qty: e.target.value })}
                  className="w-12 text-xs p-2 border rounded bg-gray-50 text-center outline-none focus:border-blue-500"
                  placeholder="Qty"
                />
                <button onClick={addItem} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"><Check size={16} /></button>
                <button onClick={() => setActiveProduct(null)} className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 transition"><X size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t flex justify-between items-center z-50">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase">Items</p>
          <p className="font-black text-xl">{cart.length}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selectedRetailer || cart.length === 0 || submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition"
        >
          {submitting ? "Creating..." : "Create Quote"}
        </button>
      </div>
    </div>
  );
};

export default CreateQuotation;