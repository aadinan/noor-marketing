import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, CheckCircle, XCircle, Share2, ArrowLeft, Plus, Filter } from 'lucide-react';
import api from '../api/axios';

const EstimateList = () => {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState('ESTIMATES'); // ESTIMATES or QUOTATIONS
  const [filterStatus, setFilterStatus] = useState('All'); // All, PENDING, APPROVED, REJECTED, CONVERTED
  const [role, setRole] = useState('Salesman');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setRole(parsed.role);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeMainTab]);

  const fetchData = async () => {
    setLoading(true);
    setFilterStatus('All');
    try {
      if (activeMainTab === 'ESTIMATES') {
        const res = await api.get('/estimates');
        setData(res.data.estimates || res.data || []);
      } else {
        const res = await api.get('/quotations');
        setData(res.data.quotations || res.data || []);
      }
    } catch (error) {
      // Dummy data for building UI
      if (activeMainTab === 'ESTIMATES') {
        setData([
          { _id: '1', estimateNumber: 'EST-1001', customerName: 'Ali Shop', totalAmount: 45000, discountPercent: 5, status: 'PENDING_APPROVAL', date: '2023-11-01' },
          { _id: '2', estimateNumber: 'EST-1002', customerName: 'Mega Mart', totalAmount: 120000, discountPercent: 10, status: 'APPROVED', date: '2023-10-28' }
        ]);
      } else {
        setData([
          { _id: '3', quotationNumber: 'QTN-2001', shopName: 'BuildWell Hardware', grandTotal: 56000, marginStatus: 'Good', status: 'ACCEPTED', date: '2023-10-30' },
          { _id: '4', quotationNumber: 'QTN-2002', shopName: 'City Lights', grandTotal: 15000, marginStatus: 'Low', status: 'PENDING', date: '2023-11-02' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const isManagement = role === 'Manager' || role === 'Boss';

  // Actions
  const handleEstimateConvert = async (id) => {
    try {
      await api.post(`/estimates/${id}/convert`);
      toast.success('Estimate converted to Order');
      fetchData();
    } catch (e) { toast.error('Conversion failed'); }
  };

  const handleQuotationConvert = async (id) => {
    try {
      await api.post(`/quotations/${id}/convert`);
      toast.success('Quotation converted to Order');
      fetchData();
    } catch (e) { toast.error('Conversion failed'); }
  };

  const handleApproveEstimate = async (id) => {
    try {
      await api.put(`/estimates/${id}/approve`);
      toast.success('Estimate approved');
      fetchData();
    } catch (e) { toast.error('Approval failed'); }
  };

  const handleRejectEstimate = async (id) => {
    try {
      await api.put(`/estimates/${id}/reject`);
      toast.success('Estimate rejected');
      fetchData();
    } catch (e) { toast.error('Rejection failed'); }
  };

  const shareWhatsApp = (item) => {
    const num = item.estimateNumber || item.quotationNumber;
    const amount = item.totalAmount || item.grandTotal;
    const text = encodeURIComponent(`Hello, here is your requested document ${num} for the amount of Rs.${amount}. Please review.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredData = data.filter(item => {
    if (filterStatus === 'All') return true;
    let s = item.status || '';
    // map accepted to approved logically for filtering if needed, but direct match is better
    if (filterStatus === 'APPROVED' && s === 'ACCEPTED') return true;
    if (filterStatus === 'PENDING' && s === 'PENDING_APPROVAL') return true;
    return s === filterStatus;
  });

  const getBadgeClass = (status) => {
    if (['APPROVED', 'ACCEPTED', 'CONVERTED'].includes(status)) return "bg-[#F0FDF4] text-[#0D9488]";
    if (['REJECTED'].includes(status)) return "bg-[#FFF1F2] text-[#E11D48]";
    return "bg-[#FFF7ED] text-[#EA580C]";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">
      <div className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#6B7280]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#111827]">Estimates & Quotations</h1>
        </div>

        {/* Main Tabs */}
        <div className="flex bg-[#F8FAFC] p-1 rounded-lg mb-3">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeMainTab === 'ESTIMATES' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveMainTab('ESTIMATES')}
          >
            Estimates
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeMainTab === 'QUOTATIONS' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveMainTab('QUOTATIONS')}
          >
            Quotations
          </button>
        </div>

        {/* Sub Tabs / Filters */}
        <div className="flex overflow-x-auto pb-1 gap-2 hide-scrollbar">
          {['All', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                filterStatus === status 
                  ? 'bg-[#111827] text-white border-[#111827]' 
                  : 'bg-white text-[#6B7280] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1">
        {loading ? (
          <p className="text-center text-[#6B7280] py-10">Loading...</p>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-10 bg-white border border-[#E2E8F0] rounded-xl text-[#6B7280] flex flex-col items-center">
            <FileText className="w-12 h-12 mb-3 text-[#cbd5e1]" />
            <p>No {activeMainTab.toLowerCase()} found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item) => {
              const id = item._id || item.id;
              const isEstimate = activeMainTab === 'ESTIMATES';
              const number = isEstimate ? item.estimateNumber : item.quotationNumber;
              const client = isEstimate ? item.customerName : item.shopName;
              const amount = isEstimate ? item.totalAmount : item.grandTotal;
              
              return (
                <div key={id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-[#111827] font-mono text-sm">{number}</h3>
                      <p className="text-sm font-medium text-[#6B7280]">{client}</p>
                      <p className="text-xs text-[#94a3b8]">{item.date}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getBadgeClass(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-3 rounded-lg mb-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-[#6B7280] mb-1">Total Amount</p>
                      <p className="font-mono font-bold text-[#111827] text-lg">₹{amount}</p>
                    </div>
                    {isEstimate && item.discountPercent > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-[#6B7280] mb-1">Discount</p>
                        <p className="font-medium text-[#111827]">{item.discountPercent}%</p>
                      </div>
                    )}
                    {!isEstimate && item.marginStatus && (
                      <div className="text-right">
                        <p className="text-xs text-[#6B7280] mb-1">Margin</p>
                        <p className="font-medium text-[#111827]">{item.marginStatus}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-[#E2E8F0] pt-3">
                    <button onClick={() => shareWhatsApp(item)} className="flex-1 py-2 border border-[#E2E8F0] text-[#2563EB] rounded-lg text-sm font-medium flex justify-center items-center gap-1 hover:bg-[#EFF6FF]">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    
                    {/* Convert Button for Approved/Accepted ones */}
                    {['APPROVED', 'ACCEPTED'].includes(item.status) && (
                      <button onClick={() => isEstimate ? handleEstimateConvert(id) : handleQuotationConvert(id)} className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg text-sm font-medium flex justify-center items-center gap-1 hover:bg-[#0F766E]">
                        <CheckCircle className="w-4 h-4" /> Convert to Order
                      </button>
                    )}

                    {/* Manager Approval for Estimates */}
                    {isEstimate && isManagement && item.status === 'PENDING_APPROVAL' && (
                      <>
                        <button onClick={() => handleRejectEstimate(id)} className="flex-1 py-2 border border-[#E11D48] text-[#E11D48] rounded-lg text-sm font-medium flex justify-center items-center hover:bg-[#FFF1F2]">
                          Reject
                        </button>
                        <button onClick={() => handleApproveEstimate(id)} className="flex-1 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium flex justify-center items-center hover:bg-[#1E40AF]">
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => setShowModal(true)}
          className="w-14 h-14 bg-[#2563EB] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1E40AF] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#111827]/50 z-40 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#E2E8F0] pb-2">
              <h3 className="font-bold text-[#111827]">Create New</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6B7280] p-1"><XCircle className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/quotations/new')} className="w-full flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#EFF6FF] hover:border-[#2563EB] transition-colors text-left group">
                <div className="bg-[#EFF6FF] p-2 rounded-lg group-hover:bg-[#2563EB] group-hover:text-white text-[#2563EB] transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-[#111827]">New Estimate</h4>
                  <p className="text-xs text-[#6B7280]">Create a rough estimate</p>
                </div>
              </button>
              <button onClick={() => navigate('/quotations/new')} className="w-full flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#EFF6FF] hover:border-[#2563EB] transition-colors text-left group">
                <div className="bg-[#EFF6FF] p-2 rounded-lg group-hover:bg-[#2563EB] group-hover:text-white text-[#2563EB] transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-[#111827]">New Quotation</h4>
                  <p className="text-xs text-[#6B7280]">Create a formal quotation</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateList;
