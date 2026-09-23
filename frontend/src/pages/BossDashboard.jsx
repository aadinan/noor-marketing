import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, AlertTriangle, Package, LogOut, FolderOpen, Gift, Truck, Briefcase } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AppLayout from '../components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

const BossDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/boss')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Loading Intelligence..." />;
  if (!data) return <div className="p-10 text-center text-red-500">Could not load dashboard. Please try again.</div>;

  const today = data.today || {};
  const graphData = data.graphData || [];
  const inventoryAlerts = data.inventoryAlerts || [];
  const agingLedger = data.agingLedger || { days30: 0, days60: 0, days90plus: 0 };

  return (
    <AppLayout title="Boss Dashboard" breadcrumb={['Boss Dashboard']}>
      <div className="p-8 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Executive Overview</h1>

        {/* QUICK LINKS SECTION */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/project-orders')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <FolderOpen className="text-blue-600" /> <span className="font-bold text-gray-800">Project Orders</span>
            </button>
            <button onClick={() => navigate('/incentives')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <Gift className="text-pink-600" /> <span className="font-bold text-gray-800">Incentives</span>
            </button>
            <button onClick={() => navigate('/delivery')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <Truck className="text-orange-600" /> <span className="font-bold text-gray-800">Deliveries</span>
            </button>
            <button onClick={() => navigate('/purchase-orders/new')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <Briefcase className="text-purple-600" /> <span className="font-bold text-gray-800">Purchase Orders</span>
            </button>
          </div>
        </div>

        {/* 1. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 font-bold text-sm uppercase">Today's Revenue</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ArrowUpRight /></div>
            </div>
            <p className="text-3xl font-black text-slate-800">₹{today.revenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-400 mt-2">{today.orders || 0} orders placed</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 font-bold text-sm uppercase">Cash Collected</h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Wallet /></div>
            </div>
            <p className="text-3xl font-black text-slate-800">₹{today.collected?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-400 mt-2">Cash & UPI received today</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-500 font-bold text-sm uppercase">Market Debt</h3>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle /></div>
            </div>
            <p className="text-3xl font-black text-red-600">₹{today.outstandingDebts?.toLocaleString() || 0}</p>
            <p className="text-xs text-red-400 mt-2 font-bold">Total outstanding across all retailers</p>
          </div>
        </div>

        {/* 2. GRAPH */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Sales vs. Collection (7 Day Trend)</h3>
          {graphData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-slate-400">
              <p>No transaction data for the last 7 days.</p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#6B7280" />
                  <YAxis axisLine={false} tickLine={false} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', color: '#111827', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Area type="monotone" dataKey="Sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="Collection" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorCol)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. AGING LEDGER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Aging Credit Ledger (Market Outstanding)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">0-30 Days</p>
              <p className="text-2xl font-black text-green-700">₹{agingLedger.days30?.toLocaleString()}</p>
              <p className="text-xs text-green-500 mt-1">Current</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
              <p className="text-xs text-orange-600 font-bold uppercase mb-1">31-60 Days</p>
              <p className="text-2xl font-black text-orange-700">₹{agingLedger.days60?.toLocaleString()}</p>
              <p className="text-xs text-orange-500 mt-1">Overdue</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
              <p className="text-xs text-red-600 font-bold uppercase mb-1">90+ Days</p>
              <p className="text-2xl font-black text-red-700">₹{agingLedger.days90plus?.toLocaleString()}</p>
              <p className="text-xs text-red-500 mt-1">Critical</p>
            </div>
          </div>
        </div>

        {/* 4. QUICK ACTIONS PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Executive Control Panel</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/orders')} className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 font-bold text-sm hover:bg-blue-100 transition">
              📋 View All Orders
            </button>
            <button onClick={() => navigate('/retailers')} className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 font-bold text-sm hover:bg-green-100 transition">
              🏪 Shop Database
            </button>
            <button onClick={() => navigate('/eod-report')} className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-600 font-bold text-sm hover:bg-purple-100 transition">
              📊 EOD Report
            </button>
            <button onClick={() => navigate('/inventory')} className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 font-bold text-sm hover:bg-orange-100 transition">
              📦 Stock Status
            </button>
          </div>
        </div>

        {/* 3. INVENTORY ALERTS */}
        {inventoryAlerts.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
              <Package size={20} /> Low Stock Alerts
            </h3>
            <div className="space-y-2">
              {inventoryAlerts.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.brand} · SKU: {item.sku}</p>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">
                    Stock: {item.inventory?.stockCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default BossDashboard;