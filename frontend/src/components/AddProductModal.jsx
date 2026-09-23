import React, { useState } from 'react';
import api from '../api/axios';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', mrp: 0, basePrice: 0,
        inventory: { stockCount: 0 }
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/products', formData);
            toast.success("Product added successfully!");
            onSuccess(res.data.product || res.data.data || res.data); // handles variations in API response
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold flex items-center gap-2"><PackagePlus size={18} className="text-emerald-600" /> Add Quick Product</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                        <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">SKU Code</label>
                            <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition"
                                value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                            <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition"
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">MRP (₹)</label>
                            <input required type="number" step="any" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition font-mono"
                                value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
                            <input required type="number" step="any" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition font-mono"
                                value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Stock</label>
                            <input required type="number" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition font-mono"
                                value={formData.inventory.stockCount} onChange={e => setFormData({ ...formData, inventory: { stockCount: parseInt(e.target.value) || 0 } })} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl mt-2 disabled:opacity-50 transition flex justify-center items-center gap-2">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
