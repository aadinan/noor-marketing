import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Search, Store, ArrowLeft, Phone, AlertTriangle } from 'lucide-react';
import Fuse from 'fuse.js';

const RetailerList = () => {
    const navigate = useNavigate();
    const [retailers, setRetailers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/retailers')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setRetailers(data);
                setFiltered(data);
            })
            .catch(() => toast.error('Failed to load shops'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(retailers);
            return;
        }

        const fuse = new Fuse(retailers, {
            keys: ['shopName', 'ownerName', 'address.city'],
            threshold: 0.4,
        });

        const results = fuse.search(search);
        setFiltered(results.map(r => r.item));
    }, [search, retailers]);

    const trustColor = (score) => {
        if (score >= 70) return 'bg-green-100 text-green-700';
        if (score >= 40) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-xl mb-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black">My Shops</h1>
                    {/* Quick Add "+" */}
                    <button
                        onClick={() => navigate('/retailers/new')}
                        className="p-2 bg-blue-500 rounded-full flex items-center gap-1"
                        title="Add New Shop"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by shop, owner, city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl outline-none"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="px-4 mb-4 flex justify-between items-center text-sm text-gray-500 font-bold">
                <span>{filtered.length} shops found</span>
                <button
                    onClick={() => navigate('/retailers/new')}
                    className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                    <Plus size={14} /> Add Shop
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
                        <Store size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No shops found</p>
                        <p className="text-sm mt-1">Try a different search or add a new shop</p>
                        <button
                            onClick={() => navigate('/retailers/new')}
                            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} /> Add First Shop
                        </button>
                    </div>
                ) : (
                    filtered.map(r => (
                        <div
                            key={r._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition"
                            onClick={() => navigate(`/retailers/${r._id}`)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-100 p-2 rounded-lg">
                                        <Store size={18} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">{r.shopName}</p>
                                        <p className="text-xs text-gray-400">{r.ownerName} · {r.address?.city}</p>
                                    </div>
                                </div>
                                {r.metrics?.trustScore !== undefined && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trustColor(r.metrics.trustScore)}`}>
                                        Trust {r.metrics.trustScore}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone size={12} />
                                    {r.phoneNumber}
                                </div>
                                {r.outstandingBalance > 0 ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                                        <AlertTriangle size={12} />
                                        Due: ₹{r.outstandingBalance?.toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-green-600">✓ Clear</span>
                                )}
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => navigate(`/orders/new?retailer=${r._id}`)}
                                    className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold py-1.5 rounded-lg hover:bg-blue-100 transition"
                                >
                                    New Order
                                </button>
                                <button
                                    onClick={() => navigate(`/collection?retailer=${r._id}`)}
                                    className="flex-1 bg-green-50 text-green-700 text-xs font-bold py-1.5 rounded-lg hover:bg-green-100 transition"
                                >
                                    Collect
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RetailerList;
