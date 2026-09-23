import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TrendingUp, IndianRupee, Star, ArrowLeft, Filter } from 'lucide-react';
import api from '../api/axios';

const IncentivePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [month, setMonth] = useState('current');
  const [role, setRole] = useState('Salesman'); // Should be pulled from context/auth

  useEffect(() => {
    // Attempt to determine role from local storage or assume Salesman
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setRole(parsed.role);
      } catch (e) {}
    }
    
    fetchIncentives();
  }, [month, role]);

  const fetchIncentives = async () => {
    try {
      setLoading(true);
      const endpoint = role === 'Manager' || role === 'Boss' ? '/incentives/all' : '/incentives/me';
      const response = await api.get(`${endpoint}?month=${month}`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load incentives');
      // Dummy data for fallback if API fails
      if (role === 'Manager' || role === 'Boss') {
        setData({
          grandTotal: 15400,
          summary: [
            { id: 1, name: 'Rahul Kumar', totalEarned: 5200, totalPaid: 5200 },
            { id: 2, name: 'Amit Singh', totalEarned: 4800, totalPaid: 2000 },
            { id: 3, name: 'Vikram Das', totalEarned: 5400, totalPaid: 0 }
          ]
        });
      } else {
        setData({
          grandTotal: 5200,
          incentives: [
            { id: 1, orderRef: 'ORD-1023', amount: 1200, status: 'Paid', date: '2023-10-01' },
            { id: 2, orderRef: 'ORD-1045', amount: 2500, status: 'Paid', date: '2023-10-15' },
            { id: 3, orderRef: 'ORD-1089', amount: 1500, status: 'Unpaid', date: '2023-10-28' }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isManagement = role === 'Manager' || role === 'Boss';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#6B7280]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#111827]">Incentives</h1>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-[#111827] outline-none"
            >
              <option value="current">This Month</option>
              <option value="last">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Grand Total Card */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1 flex items-center gap-1">
              <Star className="w-4 h-4" /> Grand Total Earned
            </p>
            <div className="text-3xl font-bold font-mono flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {data?.grandTotal || 0}
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        {loading ? (
          <p className="text-center text-[#6B7280] py-10">Loading incentives...</p>
        ) : isManagement ? (
          /* Management View: Summary Table */
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <h2 className="font-bold text-[#111827]">Staff Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-[#6B7280]">
                <thead className="text-xs text-[#111827] uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Salesman</th>
                    <th className="px-4 py-3 text-right">Earned</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.summary?.map((staff) => {
                    const balance = staff.totalEarned - staff.totalPaid;
                    return (
                      <tr key={staff.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 font-medium text-[#111827]">{staff.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#0D9488]">₹{staff.totalEarned}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#2563EB]">₹{staff.totalPaid}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#E11D48] font-medium">₹{balance}</td>
                      </tr>
                    );
                  })}
                  {(!data?.summary || data.summary.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center">No data found for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Salesman View: List of Cards */
          <div className="space-y-3">
            <h2 className="font-bold text-[#111827] mb-4">Incentive History</h2>
            {data?.incentives?.map((inc) => (
              <div key={inc.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#111827] font-mono">{inc.orderRef}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{inc.date || 'Recent'}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0D9488] font-mono text-lg mb-1">+ ₹{inc.amount}</div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    inc.status === 'Paid' 
                      ? 'bg-[#F0FDF4] text-[#0D9488]' 
                      : 'bg-[#FFF7ED] text-[#EA580C]'
                  }`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.incentives || data.incentives.length === 0) && (
              <div className="text-center py-10 bg-white border border-[#E2E8F0] rounded-xl text-[#6B7280]">
                No incentives found for this period.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncentivePage;
