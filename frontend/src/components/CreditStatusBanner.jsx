import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const CreditStatusBanner = ({ shop }) => {
  if (!shop) return null;
  
  const outstanding = shop.outstandingBalance || 0;
  const limit = shop.creditLimit || 10000;
  const ratio = outstanding / limit;
  const isFrozen = shop.creditFrozen;
  const isOverLimit = outstanding >= limit;
  const isWarning = ratio >= 0.7;
  
  if (isFrozen) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle size={18} />
          <div>
            <p className="font-bold text-sm">CREDIT FROZEN</p>
            <p className="text-xs">{shop.freezeReason || 'Contact manager for details'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 rounded-xl mb-4 border-l-4 ${
      isOverLimit ? 'bg-red-50 border-red-500' :
      isWarning ? 'bg-orange-50 border-orange-400' :
      'bg-green-50 border-green-400'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">Credit Status</p>
          <p className="font-bold text-gray-800">{shop.shopName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Outstanding / Limit</p>
          <p className={`font-black text-sm ${
            isOverLimit ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'
          }`}>
            ₹{outstanding.toLocaleString()} / ₹{limit.toLocaleString()}
          </p>
        </div>
      </div>
      {isOverLimit && (
        <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
          <AlertTriangle size={12} /> Over credit limit — manager approval required
        </p>
      )}
      {!isOverLimit && (
        <div className="mt-2 bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isWarning ? 'bg-orange-400' : 'bg-green-400'
            }`}
            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CreditStatusBanner;
