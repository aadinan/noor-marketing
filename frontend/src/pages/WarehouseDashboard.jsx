import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Box, Truck, CheckSquare, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/dashboard/warehouse');
      setPendingOrders(res.data.pendingOrders);
    } catch (err) {
      console.error("Failed to load orders");
    }
  };

  const handleMarkPacked = async (orderId) => {
    if (!window.confirm("Confirm all items are packed?")) return;

    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'Packed' });
      toast.success("Order Packed Successfully!");
      setPendingOrders(pendingOrders.filter(o => o._id !== orderId));
      setViewingOrder(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <AppLayout title="Warehouse Dashboard" breadcrumb={['Warehouse Dashboard']}>
      <div className="min-h-screen bg-slate-50 p-4 pb-20">
        <header className="flex justify-between items-center mb-6 pb-4">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Box className="text-blue-600" /> Warehouse Ops
          </h1>
          <button onClick={() => navigate('/inventory')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2">
            <Truck size={16} /> Stock View
          </button>
        </header>

        {!viewingOrder && (
          <div className="grid gap-4 animate-in fade-in">
            <h2 className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-2">
              Ready to Pick ({pendingOrders.length})
            </h2>

            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No pending orders. Good job!</p>
            ) : (
              pendingOrders.map(order => (
                <div
                  key={order._id}
                  onClick={() => setViewingOrder(order)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition cursor-pointer hover:border-slate-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-blue-600 font-bold">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold text-lg text-slate-800">{order.retailer?.shopName || "Unknown Shop"}</p>
                      <p className="text-sm text-gray-500">{order.items.length} Items</p>
                    </div>
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                      START PICKING
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {viewingOrder && (
          <div className="animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setViewingOrder(null)}
              className="mb-4 text-sm text-gray-500 hover:text-slate-800 flex items-center gap-1 font-bold"
            >
              <ArrowLeft size={16} /> Back to Queue
            </button>

            <div className="bg-white text-slate-800 rounded-t-xl p-4 shadow-sm border border-slate-200">
              <h2 className="font-bold text-xl">{viewingOrder.retailer?.shopName}</h2>
              <p className="text-gray-500 text-sm">Order #{viewingOrder._id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="bg-slate-50 border-x border-b border-slate-200 text-slate-800 p-4 space-y-3 min-h-[60vh] pb-32">
              {viewingOrder.items
                .sort((a, b) => (a.locationSnap || "").localeCompare(b.locationSnap || ""))
                .map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm bg-slate-100 w-fit px-3 py-1 rounded-md">
                      <MapPin size={16} className="text-blue-600" /> 
                      Zone &gt; Rack &gt; Shelf &gt; Bin: {item.locationSnap || "General Zone"}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <h4 className="font-bold text-lg leading-tight text-slate-800">{item.product?.name || "Unknown Item"}</h4>
                      <div className="text-right bg-blue-50 p-2 rounded-lg border border-blue-100 min-w-[60px]">
                        <span className="block text-[10px] text-blue-600 uppercase font-bold text-center">Qty</span>
                        <span className="block text-2xl font-black text-center text-blue-700">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
              <button
                onClick={() => handleMarkPacked(viewingOrder._id)}
                className="w-full bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckSquare /> MARK AS PACKED
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WarehouseDashboard;