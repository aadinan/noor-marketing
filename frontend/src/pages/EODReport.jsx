import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

const EODReport = () => {
  const navigate = useNavigate();
  // ✅ 1. Hooks MUST be inside the function
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user data from local storage
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Salesman', _id: '000' };
  const highlightName = new URLSearchParams(window.location.search).get('highlightName');

  useEffect(() => {
    const fetchEOD = async () => {
      try {
        const res = await api.get('/collections/eod-report');
        setReportData(res.data);
      } catch (err) {
        console.error("Failed to load EOD report", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEOD();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Report...</div>;
  if (!reportData) return <div className="p-10 text-center text-red-500">No data found for today.</div>;

  // ✅ 2. Extract data from the reportData state
  const payments = reportData.summary || [];
  const grandTotal = reportData.grandTotal || 0;

  // Quick helper to get totals for the top boxes
  const getGroupTotal = (method) => {
    const group = payments.find(p => p._id === method);
    return group ? group.totalAmount : 0;
  };

  const cashTotal = getGroupTotal('Cash');
  const onlineTotal = getGroupTotal('UPI') + getGroupTotal('Bank Transfer') + getGroupTotal('NEFT');
  const chequeTotal = getGroupTotal('Cheque');

  return (
    <div className="bg-white p-6 max-w-md mx-auto rounded-xl shadow-lg border border-gray-200 mt-10 print:shadow-none print:border-none print:mt-0 print:p-0">
      <div className="text-center border-b pb-4 mb-4 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 text-gray-400 hover:text-gray-800 print:hidden text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-800 print:hidden"
          title="Print Report"
        >
          🖨️
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Daily Closing Report</h2>
        <p className="text-gray-500">{new Date().toDateString()}</p>
        <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block text-sm font-bold">
          {user.username}
        </div>
      </div>

      {/* 1. The Big Numbers */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <p className="text-xs text-green-600 font-bold uppercase">Cash</p>
          <p className="text-lg font-bold text-gray-800">₹{cashTotal}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-600 font-bold uppercase">Online</p>
          <p className="text-lg font-bold text-gray-800">₹{onlineTotal}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
          <p className="text-xs text-orange-600 font-bold uppercase">Cheques</p>
          <p className="text-lg font-bold text-gray-800">₹{chequeTotal}</p>
        </div>
      </div>

      {/* 2. Detailed List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Transaction Breakdown</h3>

        {payments.map((group) => (
          <div key={group._id} className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase">{group._id}</p>
            {group.transactions.map((t, idx) => {
              const isHighlighted = highlightName === t.shopName;
              return (
                <div key={idx} className={`flex justify-between items-center text-sm border-b border-gray-50 p-2 rounded transition-all duration-500 ${isHighlighted ? 'bg-green-100 border-green-200' : ''}`}>
                  <span className={`text-gray-700 ${isHighlighted ? 'font-bold text-green-800' : ''}`}>{t.shopName || 'Retailer'}</span>
                  <span className={`font-mono font-bold text-slate-900 ${isHighlighted ? 'text-green-900' : ''}`}>₹{t.amount}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. The Footer */}
      <div className="mt-8 pt-4 border-t border-dashed border-gray-300">
        <div className="flex justify-between items-center text-xl font-black text-gray-900 bg-yellow-200 p-2 rounded-lg">
          <span>TOTAL HANDOVER:</span>
          <span>₹{grandTotal}</span>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-4 font-mono">
          REF: {user._id}-{Date.now()}
        </p>
      </div>
    </div>
  );
};

export default EODReport;