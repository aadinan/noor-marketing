import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckCircle, XCircle, Package, Truck, Store, TrendingUp,
  ArrowLeft, ChevronRight, RefreshCw, Clock, Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const PIPELINE_STAGES = [
  { key: 'Pending', label: 'Booked', icon: '📋', color: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { key: 'Processing', label: 'Credit Check', icon: '🔍', color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'Packed', label: 'Packing', icon: '📦', color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200 text-purple-700' },
  { key: 'Out for Delivery', label: 'Delivery', icon: '🚚', color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200 text-orange-700' },
  { key: 'Delivered', label: 'Delivered', icon: '✅', color: 'bg-green-500', light: 'bg-green-50 border-green-200 text-green-700' }
];

const OrderPipeline = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(null); // null = show all
  const [updating, setUpdating] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Move this order to "${newStatus}"?`)) return;
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success(`Order moved to ${newStatus}`);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Reason for cancellation:');
    if (!reason) return;
    setUpdating(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: 'Cancelled' } : o
      ));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const stages = PIPELINE_STAGES.map(s => s.key);
    const idx = stages.indexOf(currentStatus);
    return idx < stages.length - 1 ? stages[idx + 1] : null;
  };

  const filteredOrders = activeStage
    ? orders.filter(o => o.status === activeStage)
    : orders.filter(o => o.status !== 'Cancelled');

  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.key] = orders.filter(o => o.status === s.key).length;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner message="Loading order pipeline..." />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role="Manager" title="Order Pipeline" />
      <div className="p-4 md:p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Order Pipeline</h1>
            <p className="text-gray-500 text-sm">{filteredOrders.length} active orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 transition"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Pipeline Stage Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <button
            onClick={() => setActiveStage(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition ${
              !activeStage ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All ({orders.filter(o => o.status !== 'Cancelled').length})
          </button>
          {PIPELINE_STAGES.map(stage => (
            <button
              key={stage.key}
              onClick={() => setActiveStage(activeStage === stage.key ? null : stage.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-1.5 ${
                activeStage === stage.key ? stage.color + ' text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {stage.icon} {stage.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                activeStage === stage.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {stageCounts[stage.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Order Cards */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No orders in this stage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const stage = PIPELINE_STAGES.find(s => s.key === order.status);
              const nextStatus = getNextStatus(order.status);
              const isUpdating = updating === order._id;

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Stage indicator bar */}
                  {stage && <div className={`h-1 ${stage.color}`} />}

                  <div className="p-4">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-blue-600 font-bold text-sm">#{order._id?.slice(-6).toUpperCase()}</p>
                        <p className="font-black text-slate-800 text-lg">{order.retailer?.shopName || 'Unknown Shop'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-800">₹{order.netPayable?.toLocaleString()}</p>
                        {stage && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${stage.light}`}>
                            {stage.icon} {stage.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">{order.items?.length || 0} items</p>
                      <div className="space-y-1">
                        {(order.items || []).slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.product?.name || 'Unknown Product'}</span>
                            <span className="font-bold text-gray-800">x{item.quantity}</span>
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(order._id, nextStatus)}
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-75"
                        >
                          {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          → {PIPELINE_STAGES.find(s => s.key === nextStatus)?.label}
                        </button>
                      )}
                      {['Pending', 'Processing'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={isUpdating}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm border border-red-100 transition disabled:opacity-75"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPipeline;
