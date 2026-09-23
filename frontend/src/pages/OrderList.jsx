import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, ArrowLeft, ShoppingCart, Search } from 'lucide-react';

const STATUS_COLOR = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Reserved: 'bg-blue-100 text-blue-700',
    Packed: 'bg-indigo-100 text-indigo-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-600',
};

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/orders')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data.orders || []);
                setOrders(data);
            })
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = orders.filter(o =>
        o.retailer?.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        o.status?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-xl mb-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black">All Orders</h1>
                    {/* Quick Add "+" */}
                    <button
                        onClick={() => navigate('/orders/new')}
                        className="p-2 bg-blue-500 rounded-full"
                        title="New Order"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by shop or status..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl outline-none"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="px-4 mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">{filtered.length} orders</span>
                <button
                    onClick={() => navigate('/orders/new')}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                    <Plus size={14} /> New Order
                </button>
            </div>

            {/* List */}
            <div className="px-4 space-y-3">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No orders yet</p>
                        <button
                            onClick={() => navigate('/orders/new')}
                            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} /> Create First Order
                        </button>
                    </div>
                ) : (
                    filtered.map(o => (
                        <div key={o._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-black text-slate-800">{o.retailer?.shopName || 'Unknown Shop'}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {o.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                                <span className="text-xs text-gray-500">
                                    {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                                </span>
                                <span className="font-black text-slate-900">₹{o.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderList;
