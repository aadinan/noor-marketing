import { FaWhatsapp, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { generateWhatsAppReceipt } from '../utils/receiptHelper';

const PaymentSuccess = ({ paymentData, retailerPhone, onReset }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleShare = () => {
    const text = generateWhatsAppReceipt(
      paymentData.shopName,
      paymentData.amount,
      paymentData.newBalance,
      paymentData.transactionId.slice(-6).toUpperCase()
    );

    const url = `https://wa.me/${retailerPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-gray-100">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-black text-gray-800">₹{paymentData.amount}</h3>
        <p className="text-green-600 font-bold text-sm uppercase tracking-wider mb-4">Payment Confirmed</p>

        {/* --- NEW: Visual Timestamp for the Salesman --- */}
        <div className="flex justify-center gap-4 text-xs text-gray-400 mb-6 bg-gray-50 py-2 rounded-xl">
            <span className="flex items-center gap-1"><FaCalendarAlt /> {dateStr}</span>
            <span className="flex items-center gap-1"><FaClock /> {timeStr}</span>
        </div>

        <button 
          onClick={handleShare}
          className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg mb-4"
        >
          <FaWhatsapp size={24} /> Share Receipt
        </button>

        <button 
          onClick={onReset}
          className="w-full text-gray-400 font-bold py-2 hover:text-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;