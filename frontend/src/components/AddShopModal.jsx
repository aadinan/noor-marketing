import React, { useState } from 'react';
import api from '../api/axios';
import { X, Store, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AddShopModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        phoneNumber: '',
        address: { city: '', area: '', localAddress: '' }
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/retailers/quick-add', { 
                shopName: formData.shopName, 
                ownerName: formData.ownerName,
                phoneNumber: formData.phoneNumber,
                address: {
                    city: formData.address.city,
                    area: formData.address.area,
                    localAddress: formData.address.localAddress
                }
            });
            toast.success("Shop added successfully!");
            const newShop = res.data.data || res.data;
            onSuccess(newShop); // Pass full shop object (including _id) back to caller
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add shop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold flex items-center gap-2"><Store size={18} className="text-blue-600" /> Add Quick Shop</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Shop Name</label>
                        <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-blue-500 transition"
                            value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Owner Name</label>
                        <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-blue-500 transition"
                            value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                        <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-blue-500 transition"
                            value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                            <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-blue-500 transition"
                                value={formData.address.city} onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Area / Route</label>
                            <input required type="text" className="w-full mt-1 p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-blue-500 transition"
                                value={formData.address.area} onChange={e => setFormData({ ...formData, address: { ...formData.address, area: e.target.value } })} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl mt-2 disabled:opacity-50 transition flex justify-center items-center gap-2">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Shop"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShopModal;
