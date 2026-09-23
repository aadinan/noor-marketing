import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, AlertTriangle, Users, Package, ShoppingCart, FileText, TrendingUp, Grid, ShieldAlert, Truck, TruckIcon, FolderOpen, Briefcase, IndianRupee } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [creditRequests, setCreditRequests] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [todaysCollections, setTodaysCollections] = useState([]);
  const [dormantShops, setDormantShops] = useState([]);
  const [pendingCreditOrders, setPendingCreditOrders] = useState([]);
  const [pendingProjectOrders, setPendingProjectOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({ pending: 0, outForDelivery: 0, delivered: 0 });

  useEffect(() => {
    api.get('/dashboard/manager').then(res => {
      setCreditRequests(Array.isArray(res.data?.pendingCreditRequests) ? res.data.pendingCreditRequests : []);
      api.get('/products/reorder-report').then(res2 => setLowStock(Array.isArray(res2.data) ? res2.data : [])).catch(e => console.log('Reorder not ready'));
    }).catch(err => {
      console.error('Manager dashboard error:', err);
      setCreditRequests([]);
    });
    api.get('/orders?status=Pending').then(res => {
      const orders = Array.isArray(res.data) ? res.data : [];
      setRecentOrders(orders.slice(0,5));
      setPendingCreditOrders(orders);
    }).catch(() => {});
    api.get('/collections/today').then(res => setTodaysCollections(res.data.data || [])).catch(() => {});
    api.get('/retailers/dormant').then(res => setDormantShops(res.data.data || [])).catch(() => {});

    api.get('/project-orders?quotationStatus=PENDING_REVIEW').then(res => {
      setPendingProjectOrders(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});

    api.get('/deliveries/all').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setDeliveries({
        pending: data.filter(d => d.status === 'Pending').length,
        outForDelivery: data.filter(d => d.status === 'Out for Delivery').length,
        delivered: data.filter(d => d.status === 'Delivered').length
      });
    }).catch(() => {});
  }, []);

  const handleApproveCreditReq = async (id) => {
    try {
      await api.put(`/credit/${id}/approve`, { adminComment: 'Manager Approved' });
      toast.success('Credit Approved ✓');
      setCreditRequests(creditRequests.filter(req => req._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectCreditReq = async (id) => {
    try {
      await api.put(`/credit/${id}/reject`, { adminComment: 'Manager Rejected' });
      toast.info('Credit request rejected');
      setCreditRequests(creditRequests.filter(req => req._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleApproveCreditOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/approve-credit`, { action: 'approve' });
      toast.success('Order Credit Approved');
      setPendingCreditOrders(pendingCreditOrders.filter(o => o._id !== id));
    } catch (err) {
      toast.error('Failed to approve credit');
    }
  };

  const handleApproveProjectOrder = async (id) => {
    try {
      await api.put(`/project-orders/${id}/approve`);
      toast.success('Project Order Approved');
      setPendingProjectOrders(pendingProjectOrders.filter(o => o._id !== id));
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleRejectProjectOrder = async (id) => {
    try {
      await api.put(`/project-orders/${id}/reject`);
      toast.info('Project Order Rejected');
      setPendingProjectOrders(pendingProjectOrders.filter(o => o._id !== id));
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  return (
    <AppLayout title="Manager Dashboard" breadcrumb={['Manager Dashboard']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Operations Command Center</h1>

        {/* WIDGET D: Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/project-orders')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <FolderOpen className="text-blue-600" /> <span className="font-bold text-gray-800">Project Orders</span>
            </button>
            <button onClick={() => navigate('/incentives')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <IndianRupee className="text-green-600" /> <span className="font-bold text-gray-800">Incentives</span>
            </button>
            <button onClick={() => navigate('/purchase-orders/new')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <Briefcase className="text-purple-600" /> <span className="font-bold text-gray-800">Purchase Orders</span>
            </button>
            <button onClick={() => navigate('/eod-report')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <FileText className="text-red-600" /> <span className="font-bold text-gray-800">EOD Report</span>
            </button>
          </div>
        </div>

        {/* WIDGET C: Delivery Overview */}
        <div className="mb-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 cursor-pointer hover:bg-slate-50 transition" onClick={() => navigate('/delivery')}>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><TruckIcon className="text-blue-600"/> Delivery Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-bold text-gray-500">Pending</p>
              <p className="text-2xl font-black text-gray-800">{deliveries.pending}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-bold text-gray-500">Out for Delivery</p>
              <p className="text-2xl font-black text-orange-600">{deliveries.outForDelivery}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-bold text-gray-500">Delivered Today</p>
              <p className="text-2xl font-black text-green-600">{deliveries.delivered}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* WIDGET A: Pending Credit Orders */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">Pending Credit Orders</h3>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{pendingCreditOrders.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {pendingCreditOrders.length === 0 ? <p className="text-gray-400 text-center py-4">No pending credit orders.</p> : pendingCreditOrders.map(order => (
                <div key={order._id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{order.retailer?.shopName || 'Unknown Shop'}</p>
                    <p className="text-xs text-gray-500">Salesman: {order.salesman?.username || 'N/A'}</p>
                    <p className="text-sm font-bold text-blue-600">₹{order.netPayable}</p>
                  </div>
                  <button onClick={() => handleApproveCreditOrder(order._id)} className="bg-green-100 text-green-700 px-3 py-1 rounded font-bold text-sm hover:bg-green-200">Approve</button>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET B: Pending Project Orders */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-purple-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">Pending Project Orders</h3>
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">{pendingProjectOrders.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {pendingProjectOrders.length === 0 ? <p className="text-gray-400 text-center py-4">No pending project orders.</p> : pendingProjectOrders.map(order => (
                <div key={order._id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{order.projectName}</p>
                    <p className="text-xs text-gray-500">Client: {order.clientName}</p>
                    <p className="text-sm font-bold text-blue-600">Est. Value: ₹{order.estimatedValue}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveProjectOrder(order._id)} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"><CheckCircle size={18} /></button>
                    <button onClick={() => handleRejectProjectOrder(order._id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* OLD WIDGET 1: CREDIT CONTROL (High Priority) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Users size={20} /> Pending Credit Approvals
              </h3>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{creditRequests.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {creditRequests.length === 0 ? <p className="text-gray-400 text-center py-4">All Clean! No pending credit requests.</p> : creditRequests.map(req => (
                <div key={req._id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{req.retailer?.shopName || 'Unknown Shop'}</p>
                    <p className="text-xs text-gray-500">Asking: <span className="text-blue-600 font-bold">₹{req.requestedAmount}</span> (Current: ₹{req.currentLimit})</p>
                    <p className="text-xs text-orange-500 italic">"{req.reason}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveCreditReq(req._id)} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"><CheckCircle size={18} /></button>
                    <button onClick={() => handleRejectCreditReq(req._id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OLD WIDGET 3: ORDER PIPELINE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-green-600 p-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ShoppingCart size={20} /> Order Pipeline
              </h3>
            </div>
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'].map(stage => (
                  <div key={stage} className="flex-shrink-0 bg-gray-50 border border-slate-200 rounded-lg p-3 min-w-[120px]">
                    <p className="text-xs font-bold text-gray-500 mb-1">{stage}</p>
                    <p className="text-xl font-black text-gray-800">
                      {recentOrders.filter(o => o.status === stage).length}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {recentOrders.slice(0,3).map(order => (
                  <div key={order._id} className="flex justify-between items-center text-sm border rounded-lg p-2">
                    <div>
                      <p className="font-bold">{order.retailer?.shopName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} items · ₹{order.netPayable}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OLD WIDGET 4: TODAY'S COLLECTIONS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-teal-600 p-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <TrendingUp size={20} /> Today's Collections
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {todaysCollections.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No collections today yet</p>
              ) : todaysCollections.slice(0,5).map(col => (
                <div key={col._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <p className="font-bold">{col.retailer?.shopName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{col.salesman?.username} · {col.paymentMode}</p>
                  </div>
                  <span className="font-bold text-green-600">₹{col.amountCollected?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OLD WIDGET 2: INVENTORY HEALTH (Scientific Alerts) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-orange-500 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Package size={20} /> Reorder Alerts (Low Stock)
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Velocity</th>
                    <th className="p-3 text-right">Order Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStock.map(item => (
                    <tr key={item.sku} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-red-600 font-bold">{item.stock}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.type === 'A' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          Class {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-blue-600">+{item.suggestedOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OLD WIDGET 5: DORMANT SHOP RE-ENGAGEMENT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
            <div className="bg-purple-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <AlertTriangle size={20} /> Dormant Shop Re-engagement
              </h3>
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">{dormantShops.length} shops</span>
            </div>
            <div className="p-4">
              {dormantShops.length === 0 ? (
                <p className="text-center text-gray-400 py-4">🎉 All shops are active! No dormant shops found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dormantShops.slice(0, 6).map(shop => (
                    <div
                      key={shop._id}
                      className="border border-purple-100 bg-purple-50 rounded-xl p-3 cursor-pointer hover:bg-purple-100 transition"
                      onClick={() => navigate(`/retailers/${shop._id}`)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-800 text-sm">{shop.shopName}</p>
                        {shop.outstandingBalance > 0 && (
                          <span className="text-xs text-red-600 font-bold">₹{shop.outstandingBalance?.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{shop.address?.city}</p>
                      <p className="text-xs text-purple-600 font-bold mt-1">
                        Last order: {shop.lastOrderDate ? new Date(shop.lastOrderDate).toLocaleDateString('en-IN') : 'Never'}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/orders/new?retailer=${shop._id}`); }}
                        className="mt-2 w-full text-xs bg-purple-600 text-white py-1.5 rounded-lg font-bold hover:bg-purple-700 transition"
                      >
                        + Book Order Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;