import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
  Store,
  User,
  Banknote,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AddShopModal from '../components/AddShopModal';

const CollectionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Flowchart State Nodes
  const [clientType, setClientType] = useState('Shop'); // Node: ClientType
  const [retailers, setRetailers] = useState([]);
  const [selectedId, setSelectedId] = useState('');     // Node: SelectShop
  const [amount, setAmount] = useState('');             // Node: CollectAmt
  const [mode, setMode] = useState('Cash');             // Node: PaymentType
  const [refNum, setRefNum] = useState('');             // Node: VerifyRef
  const [discountPercent, setDiscountPercent] = useState(''); // Node: SpotDisc
  const [discountAmount, setDiscountAmount] = useState('');
  const [shopModalOpen, setShopModalOpen] = useState(false);

  // Offline Handling
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for network changes
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Load Shops
    const loadShops = async () => {
      try {
        const res = await api.get('/retailers');
        // ✅ FIX: Check if res.data is an array. If it's an object, target the array inside it.
        const retailerData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setRetailers(retailerData);

        // Pre-select retailer from URL query param
        const preSelected = searchParams.get('retailer');
        if (preSelected) setSelectedId(preSelected);
      } catch (err) {
        console.error("Using offline cache if available");
        setRetailers([]); // Fallback to empty array to prevent crash
      }
    };
    loadShops();
  }, []);

  const handleDiscountPercentChange = (e) => {
    setDiscountPercent(e.target.value);
    setDiscountAmount('');
  };

  const handleDiscountAmountChange = (e) => {
    setDiscountAmount(e.target.value);
    setDiscountPercent('');
  };

  const calculateDiscount = () => {
    const amt = parseFloat(amount) || 0;
    if (discountAmount) return parseFloat(discountAmount);
    if (discountPercent) return (amt * parseFloat(discountPercent)) / 100;
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculatedDiscount = calculateDiscount();

    const payload = {
      clientType,
      clientId: selectedId,
      amount: parseFloat(amount),
      mode,
      refNum,
      discount: calculatedDiscount,
      isOffline: !isOnline
    };

    // LOGIC NODE: NetCheck
    if (!isOnline) {
      // Node: SQLite (Simulation using LocalStorage)
      const offlineQueue = JSON.parse(localStorage.getItem('offlineCollections') || "[]");
      offlineQueue.push(payload);
      localStorage.setItem('offlineCollections', JSON.stringify(offlineQueue));
      toast.warning("Saved Offline! Will sync when internet returns.");
      resetForm();
    } else {
      // Node: SyncAPI
      try {
        const res = await api.post('/collections', payload);

        // Node: CheckLimit & RemoteAppr Alerts
        if (res.data.message && res.data.message.includes("Approval")) {
          toast.info("Payment saved. Discount is pending Manager Approval.");
        } else {
          toast.success("Collection Recorded Successfully!");
        }

        const shop = retailers.find(r => r._id === selectedId);
        
        // Share WhatsApp
        const dateStr = new Date().toLocaleDateString();
        const msg = `Receipt from Noor Marketing%0A-------------------%0AShop: ${shop?.shopName}%0AAmount Received: ₹${amount}%0AMode: ${mode}%0ADate: ${dateStr}%0AThank you for your payment!`;
        const confirmShare = window.confirm("Collection saved! Open WhatsApp to share receipt?");
        if (confirmShare) {
            window.open(`https://wa.me/?text=${msg}`, '_blank');
        }

        resetForm();
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role || 'Salesman';
        const ROLE_HOME = { Boss: '/boss', Admin: '/admin', Manager: '/manager', Salesman: '/sales', Warehouse: '/warehouse' };
        navigate(ROLE_HOME[role] || '/');
      } catch (err) {
        toast.error("Transaction Failed");
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setRefNum('');
    setDiscountPercent('');
    setDiscountAmount('');
  };

  const currentDiscount = calculateDiscount();

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">New Collection</h1>
        {!isOnline && <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><WifiOff size={14} /> OFFLINE MODE</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Client Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setClientType('Shop')}
            className={`p-4 rounded-xl flex flex-col items-center gap-2 border-2 ${clientType === 'Shop' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white'}`}
          >
            <Store /> <span className="font-bold">Retail Shop</span>
          </button>
          <button
            type="button"
            onClick={() => setClientType('Contractor')}
            className={`p-4 rounded-xl flex flex-col items-center gap-2 border-2 ${clientType === 'Contractor' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white'}`}
          >
            <User /> <span className="font-bold">Contractor</span>
          </button>
        </div>

        {/* 2. Select Shop/Contractor */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Select Client</label>
            <button type="button" onClick={() => setShopModalOpen(true)} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
              <Plus size={12} /> Add Shop
            </button>
          </div>
          <select
            className="w-full p-3 bg-slate-50 rounded-lg outline-none"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            <option value="">-- Choose Name --</option>
            {retailers.map(r => <option key={r._id} value={r._id}>{r.shopName}</option>)}
          </select>
        </div>

        {/* 3. Enter Amount & Mode */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Collected Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                className="w-full pl-10 p-3 bg-slate-50 rounded-lg outline-none font-bold text-lg text-slate-800"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Payment Mode</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Cash', 'UPI', 'Cheque'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${mode === m ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode !== 'Cash' && (
            <input
              type="text"
              placeholder="Enter Reference / Cheque No."
              className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm"
              value={refNum}
              onChange={(e) => setRefNum(e.target.value)}
              required
            />
          )}
        </div>

        {/* 4. Spot Discount (Logic: CheckLimit) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Spot Discount?</label>
            {currentDiscount > 50 && (
              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> Needs Approval
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Discount (%)"
              className="w-full p-3 bg-slate-50 rounded-lg outline-none"
              value={discountPercent}
              onChange={handleDiscountPercentChange}
            />
            <input
              type="number"
              placeholder="Discount (₹)"
              className="w-full p-3 bg-slate-50 rounded-lg outline-none"
              value={discountAmount}
              onChange={handleDiscountAmountChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2">
          <CheckCircle /> Save Collection
        </button>

      </form>

      <AddShopModal
        isOpen={shopModalOpen}
        onClose={() => setShopModalOpen(false)}
        onSuccess={(shop) => { setRetailers([...retailers, shop]); setSelectedId(shop._id); }}
      />
    </div>
  );
};

export default CollectionForm;