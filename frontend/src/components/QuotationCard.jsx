// frontend/src/components/QuotationCard.jsx
import { FileText, ArrowRightCircle, Share2, User, Home, HardHat } from 'lucide-react';

const QuotationCard = ({ quote, onConvert }) => {
  
  // Get Display Name based on Type
  const displayName = quote.retailer ? quote.retailer.shopName : quote.customerInfo.name;
  const customerPhone = quote.retailer ? quote.retailer.phoneNumber : quote.customerInfo.phone;
  const type = quote.customerInfo?.customerType || 'Retailer';

  const getIcon = () => {
    if (type === 'Contractor') return <HardHat size={16} className="text-orange-500" />;
    if (type === 'Direct Customer') return <User size={16} className="text-green-500" />;
    return <Home size={16} className="text-blue-500" />;
  };

  const handleWhatsAppShare = () => {
    const message = `📄 *QUOTATION: ${quote.quotationNumber}*%0A` +
                    `--------------------------------%0A` +
                    `👤 *Client:* ${displayName}%0A` +
                    `🏷️ *Type:* ${type}%0A%0A` +
                    `${quote.items.map(i => `• ${i.quantity}x ${i.product.name} @ ₹${i.quotedPrice}`).join('%0A')}%0A` +
                    `--------------------------------%0A` +
                    `💰 *Total Estimate: ₹${quote.grandTotal}*%0A` +
                    `⚠️ _Valid until: ${new Date(quote.validUntil).toLocaleDateString()}_`;

    window.open(`https://wa.me/${customerPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="p-3 bg-gray-50 rounded-xl h-fit">
            <FileText className="text-gray-400" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{displayName}</h4>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              {getIcon()} {type} • {quote.quotationNumber}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-blue-600">₹{quote.grandTotal.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Incl. Taxes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 mb-4">
        <div className="text-xs">
          <p className="text-gray-400 mb-1">Items</p>
          <p className="font-bold text-gray-700">{quote.items.length} Products</p>
        </div>
        <div className="text-xs text-right">
          <p className="text-gray-400 mb-1">Expires On</p>
          <p className="font-bold text-red-500">{new Date(quote.validUntil).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleWhatsAppShare}
          className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Share2 size={18} /> Send Quote
        </button>
        
        {quote.status !== 'CONVERTED' && (
          <button 
            onClick={() => onConvert(quote._id)}
            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            Confirm Order <ArrowRightCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotationCard;