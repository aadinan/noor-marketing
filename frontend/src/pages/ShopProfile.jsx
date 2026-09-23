import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Store, Phone, MapPin, User, CreditCard, AlertTriangle,
  TrendingUp, ShoppingBag, IndianRupee, Edit2, ArrowLeft,
  CheckCircle, XCircle, Lock, Unlock, Package, Clock,
  RefreshCw, Plus
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [editData, setEditData] = useState({});

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const canManage = ['Manager', 'Boss', 'Admin', 'manager', 'boss', 'admin'].includes(user.role);

  const fetchShop = async () => {
    try {
      const [shopRes, ordersRes] = await Promise.all([
        api.get(`/retailers/${id}`),
        api.get(`/orders?retailer=${id}`).catch(() => ({ data: [] }))
      ]);
      setShop(shopRes.data);
      setEditData({
        shopName: shopRes.data.shopName,
        ownerName: shopRes.data.ownerName,
        phoneNumber: shopRes.data.phoneNumber,
        creditLimit: shopRes.data.creditLimit,
        'address.city': shopRes.data.address?.city,
        'address.line1': shopRes.data.address?.line1
      });
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.data || []);
      setOrders(ordersData);
    } catch (err) {
      toast.error('Failed to load shop profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [id]);

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const updatePayload = {
        shopName: editData.shopName,
        ownerName: editData.ownerName,
        phoneNumber: editData.phoneNumber,
        creditLimit: Number(editData.creditLimit),
        address: {
          city: editData['address.city'],
          line1: editData['address.line1']
        }
      };
      const res = await api.put(`/retailers/${id}`, updatePayload);
      setShop(res.data.data);
      setEditMode(false);
      toast.success('Shop profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFreezeToggle = async () => {
    if (!window.confirm(shop.creditFrozen ? 'Unfreeze credit for this shop?' : 'Freeze credit for this shop? They will not be able to place new orders.')) return;
    setFreezing(true);
    try {
      await api.put(`/retailers/${id}/freeze`, {
        freeze: !shop.creditFrozen,
        reason: shop.creditFrozen ? '' : 'Manual freeze by manager'
      });
      setShop(prev => ({ ...prev, creditFrozen: !prev.creditFrozen }));
      toast.success(shop.creditFrozen ? 'Credit unfrozen' : 'Credit frozen');
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setFreezing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading shop profile..." />;
  if (!shop) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-bold">Shop not found</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">← Go Back</button>
    </div>
  );

  const outstanding = shop.outstandingBalance || 0;
  const limit = shop.creditLimit || 10000;
  const ratio = Math.min(outstanding / limit, 1);
  const isOverLimit = outstanding >= limit;
  const isWarning = ratio >= 0.7;

  // KPIs
  const totalOrderValue = orders.reduce((s, o) => s + (o.netPayable || 0), 0);
  const lastOrder = orders[0];

  const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Packed: 'bg-purple-100 text-purple-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-600'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-xl mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black">Shop Profile</h1>
          <div className="flex gap-2">
            {canManage && (
              <button
                onClick={handleFreezeToggle}
                disabled={freezing}
                className={`p-2 rounded-full ${shop.creditFrozen ? 'bg-green-600' : 'bg-red-600'}`}
                title={shop.creditFrozen ? 'Unfreeze Credit' : 'Freeze Credit'}
              >
                {shop.creditFrozen ? <Unlock size={18} /> : <Lock size={18} />}
              </button>
            )}
            <button
              onClick={() => setEditMode(!editMode)}
              className="p-2 bg-blue-500 rounded-full"
              title="Edit Shop"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Shop Identity */}
        {editMode ? (
          <div className="space-y-3">
            <input
              className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg outline-none text-lg font-bold"
              value={editData.shopName || ''}
              onChange={e => setEditData({ ...editData, shopName: e.target.value })}
              placeholder="Shop Name"
            />
            <input
              className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg outline-none"
              value={editData.ownerName || ''}
              onChange={e => setEditData({ ...editData, ownerName: e.target.value })}
              placeholder="Owner Name"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="bg-slate-800 text-white px-4 py-2 rounded-lg outline-none text-sm"
                value={editData.phoneNumber || ''}
                onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })}
                placeholder="Phone"
              />
              <input
                type="number"
                className="bg-slate-800 text-white px-4 py-2 rounded-lg outline-none text-sm"
                value={editData.creditLimit || ''}
                onChange={e => setEditData({ ...editData, creditLimit: e.target.value })}
                placeholder="Credit Limit"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-sm"
              >
                {savingEdit ? 'Saving...' : '✓ Save Changes'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-blue-400">
                <Store size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{shop.shopName}</h2>
                <p className="text-slate-400 text-sm">{shop.ownerName}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1"><Phone size={14} /> {shop.phoneNumber}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {shop.address?.city}</span>
            </div>
            {shop.creditFrozen && (
              <div className="mt-3 bg-red-900/40 border border-red-500/40 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm font-bold">
                <Lock size={14} /> Credit Frozen — New orders blocked
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Outstanding Balance</p>
            <p className={`text-2xl font-black ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{outstanding.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">of ₹{limit.toLocaleString()} limit</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Orders Value</p>
            <p className="text-2xl font-black text-blue-600">₹{totalOrderValue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{orders.length} orders placed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Credit Limit</p>
            <p className="text-2xl font-black text-slate-700">₹{limit.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Available: ₹{Math.max(0, limit - outstanding).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Last Order</p>
            <p className="text-lg font-black text-slate-700">
              {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('en-IN') : 'Never'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastOrder ? `₹${lastOrder.netPayable?.toLocaleString()}` : 'No orders yet'}
            </p>
          </div>
        </div>

        {/* Credit Bar */}
        <div className={`p-4 rounded-xl border-l-4 ${
          isOverLimit ? 'bg-red-50 border-red-500' :
          isWarning ? 'bg-orange-50 border-orange-400' :
          'bg-green-50 border-green-400'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-600 uppercase">Credit Utilization</p>
            <p className={`text-sm font-black ${
              isOverLimit ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'
            }`}>{Math.round(ratio * 100)}%</p>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverLimit ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-green-400'
              }`}
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Credit limit exceeded — manager approval required for new orders
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/orders/new?retailer=${id}`)}
            className="bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition"
          >
            <ShoppingBag size={20} /> New Order
          </button>
          <button
            onClick={() => navigate(`/collection?retailer=${id}`)}
            className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition"
          >
            <IndianRupee size={20} /> Collect Payment
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Clock size={18} /> Order History
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">
              {orders.length} total
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold">No orders yet</p>
                <button
                  onClick={() => navigate(`/orders/new?retailer=${id}`)}
                  className="mt-3 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Create First Order
                </button>
              </div>
            ) : (
              orders.slice(0, 10).map(order => (
                <div key={order._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-slate-800 font-mono text-sm">#{order._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.items?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">₹{order.netPayable?.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-black text-slate-800 mb-3">Shop Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">GST Number</span>
              <span className="font-bold text-gray-800">{shop.gstNumber || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-bold text-gray-800 text-right max-w-[60%]">
                {shop.address?.line1 ? `${shop.address.line1}, ` : ''}{shop.address?.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned Rep</span>
              <span className="font-bold text-gray-800">{shop.assignedSalesman?.username || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Payment Days</span>
              <span className="font-bold text-gray-800">{shop.metrics?.averagePaymentDays || 30} days</span>
            </div>
            {shop.incentiveStaffName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Incentive Contact</span>
                <span className="font-bold text-gray-800">{shop.incentiveStaffName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete Shop (Admin only) */}
        {['Admin', 'admin'].includes(user.role) && (
          <button
            onClick={async () => {
              if (!window.confirm('Permanently delete this shop? This cannot be undone.')) return;
              try {
                await api.delete(`/retailers/${id}`);
                toast.success('Shop deleted');
                navigate('/retailers');
              } catch (err) {
                toast.error('Delete failed');
              }
            }}
            className="w-full p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition"
          >
            🗑 Delete Shop
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopProfile;
