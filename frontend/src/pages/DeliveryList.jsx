import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Truck, CheckCircle, Package, MapPin, IndianRupee, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const DeliveryList = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveryId, setActiveDeliveryId] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentCollected, setPaymentCollected] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/deliveries?status=PENDING,OUT_FOR_DELIVERY');
      setDeliveries(data.deliveries || data || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (id) => {
    if (!paymentCollected && paymentMode !== 'Credit') {
      toast.error('Please enter payment amount');
      return;
    }
    
    try {
      setProcessing(true);
      await api.patch(`/deliveries/${id}/deliver`, {
        paymentMode,
        paymentCollected: Number(paymentCollected)
      });
      
      toast.success('Delivery marked as completed');
      
      // Optimistic UI update
      setDeliveries(deliveries.filter(d => d._id !== id || d.id !== id));
      setActiveDeliveryId(null);
      setPaymentMode('Cash');
      setPaymentCollected('');
    } catch (error) {
      toast.error('Failed to update delivery');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <p className="text-[#6B7280]">Loading deliveries...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-white border-b border-[#E2E8F0] p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#6B7280]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Pending Deliveries</h1>
          <p className="text-sm text-[#6B7280]">{deliveries.length} remaining</p>
        </div>
      </div>

      <div className="p-4 flex-1">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#6B7280] bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
            <CheckCircle className="w-16 h-16 text-[#0D9488] mb-4" />
            <p className="text-lg font-medium text-[#111827]">All Caught Up!</p>
            <p className="text-sm">No pending deliveries for today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const id = delivery._id || delivery.id;
              const isMarking = activeDeliveryId === id;
              
              return (
                <div key={id} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-[#E2E8F0]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[#111827] text-lg">{delivery.shopName}</h3>
                      <span className="bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded text-xs font-medium uppercase">
                        {delivery.status || 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-[#6B7280] mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{delivery.address || 'No address provided'}</p>
                    </div>

                    <div className="bg-[#F8FAFC] p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 font-medium text-[#111827] text-sm">
                        <Package className="w-4 h-4" /> Order Items
                      </div>
                      <ul className="text-sm text-[#6B7280] space-y-1 pl-6 list-disc">
                        {delivery.items?.map((item, idx) => (
                          <li key={idx}>{item.name} - {item.quantity} {item.unit}</li>
                        ))}
                        {(!delivery.items || delivery.items.length === 0) && (
                          <li>Items not listed</li>
                        )}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex justify-between items-center font-medium">
                        <span className="text-[#111827]">Order Value:</span>
                        <span className="text-[#111827] font-mono">₹{delivery.orderValue}</span>
                      </div>
                    </div>
                  </div>

                  {isMarking ? (
                    <div className="p-4 bg-[#F8FAFC]">
                      <h4 className="font-medium text-[#111827] mb-3 text-sm">Payment Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-[#6B7280] mb-1">Payment Mode</label>
                          <select 
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="w-full border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#111827] outline-none focus:border-[#2563EB]"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Credit">Credit</option>
                          </select>
                        </div>
                        
                        {paymentMode !== 'Credit' && (
                          <div>
                            <label className="block text-xs text-[#6B7280] mb-1">Amount Collected (₹)</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-[#6B7280]" />
                              </div>
                              <input 
                                type="number"
                                value={paymentCollected}
                                onChange={(e) => setPaymentCollected(e.target.value)}
                                className="w-full pl-9 border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#111827] font-mono outline-none focus:border-[#2563EB]"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => setActiveDeliveryId(null)}
                            className="flex-1 py-2 border border-[#E2E8F0] rounded-lg text-[#6B7280] font-medium text-sm"
                            disabled={processing}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleMarkDelivered(id)}
                            className="flex-1 py-2 bg-[#2563EB] hover:bg-[#1E40AF] text-white rounded-lg font-medium text-sm disabled:opacity-50"
                            disabled={processing}
                          >
                            {processing ? 'Saving...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white">
                      <button 
                        onClick={() => {
                          setActiveDeliveryId(id);
                          setPaymentCollected(delivery.orderValue || '');
                        }}
                        className="w-full py-2.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <Truck className="w-4 h-4" /> Mark as Delivered
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryList;
