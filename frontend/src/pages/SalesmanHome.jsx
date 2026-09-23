import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  FileText,
  Store,
  UserPlus,
  Package,
  Clock,
  BarChart2,
  LogOut,
  User,
  List,
  Truck,
  Gift,
  FolderOpen
} from 'lucide-react';

const SalesmanHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'sale' };

  const [stats, setStats] = useState({
    orders: 0,
    collected: 0,
    loading: true
  });
  const [pendingDeliveries, setPendingDeliveries] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/salesman');
        if (res.data && res.data.today) {
          setStats({
            orders: res.data.today.orderCount || 0,
            collected: res.data.today.totalCollectedValue || 0,
            loading: false
          });
        } else {
          setStats({ orders: 0, collected: 0, loading: false });
        }
      } catch (err) {
        setStats({ orders: 0, collected: 0, loading: false });
      }

      try {
        const delRes = await api.get('/deliveries');
        const count = Array.isArray(delRes.data) ? delRes.data.filter(d => d.status === 'Pending').length : 0;
        setPendingDeliveries(count);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 1. HEADER */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[40px] shadow-xl mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center border-2 border-blue-400">
              <User size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Welcome,</p>
              <h2 className="text-xl font-black">{user.username}</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-xl text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 flex divide-x divide-gray-100">
          <div className="flex-1 text-center pr-2">
            <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Today's Deals</p>
            {stats.loading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse mx-auto rounded"></div>
            ) : (
              <p className="text-2xl font-black text-slate-800">{stats.orders}</p>
            )}
          </div>
          <div className="flex-1 text-center pl-2">
            <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Collected ₹</p>
            {stats.loading ? (
              <div className="h-8 w-24 bg-gray-100 animate-pulse mx-auto rounded"></div>
            ) : (
              <p className="text-2xl font-black text-green-600">₹{stats.collected.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mb-8 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => navigate('/delivery')}>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Truck size={24} /></div>
            <p className="font-bold text-gray-800">Pending Deliveries</p>
          </div>
          {pendingDeliveries > 0 ? (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">{pendingDeliveries} Pending</span>
          ) : (
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold">0 Pending</span>
          )}
        </div>
      </div>

      <div className="px-6">

        {/* 2. MAIN ACTION BUTTONS (The Big 3) */}
        <h3 className="text-slate-800 font-black mb-4 text-lg">Core Actions</h3>
        <div className="grid grid-cols-1 gap-4 mb-8">

          <button onClick={() => navigate('/orders/new')} className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between active:scale-95 transition-transform">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl"><ShoppingBag size={28} /></div>
              <div className="text-left">
                <h4 className="text-lg font-bold">New Order</h4>
                <p className="text-xs text-blue-100 opacity-80">Book order for registered shop</p>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-full">➜</div>
          </button>

          <button onClick={() => navigate('/collection')} className="bg-green-600 text-white p-6 rounded-2xl shadow-lg shadow-green-200 flex items-center justify-between active:scale-95 transition-transform">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl"><IndianRupee size={28} /></div>
              <div className="text-left">
                <h4 className="text-lg font-bold">Collection</h4>
                <p className="text-xs text-green-100 opacity-80">Record payment from client</p>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-full">➜</div>
          </button>

          <button onClick={() => navigate('/quotations')} className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-between active:scale-95 transition-transform">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl"><FileText size={28} /></div>
              <div className="text-left">
                <h4 className="text-lg font-bold">Quotation</h4>
                <p className="text-xs text-purple-100 opacity-80">Send proposal to client</p>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-full">➜</div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <button onClick={() => navigate('/delivery')} className="bg-white border border-gray-200 text-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
            <Truck className="text-blue-500" /> <span className="font-bold">My Deliveries</span>
          </button>
          <button onClick={() => navigate('/incentives')} className="bg-white border border-gray-200 text-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
            <Gift className="text-pink-500" /> <span className="font-bold">My Incentives</span>
          </button>
          <button onClick={() => navigate('/project-orders')} className="bg-white border border-gray-200 text-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
            <FolderOpen className="text-indigo-500" /> <span className="font-bold">Project Sales</span>
          </button>
        </div>

        {/* TODAY'S BEAT LIST */}
        <h3 className="text-slate-800 font-black mb-4 text-lg mt-8">Today's Beat</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
          {stats.loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-gray-600">{stats.orders} orders placed today</p>
                <button onClick={() => navigate('/retailers')} className="text-xs text-blue-600 font-bold">See All Shops →</button>
              </div>
              <div className="text-center py-6 text-gray-400">
                <Store size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">GPS Beat Planning</p>
                <p className="text-xs">Coming soon - Beat route optimization</p>
              </div>
            </div>
          )}
        </div>

        {/* 3. SECONDARY ACTIONS (Grid of Tools) */}
        <h3 className="text-slate-800 font-black mb-4 text-lg">Tools & Operations</h3>
        <div className="grid grid-cols-3 gap-3">
          <MenuBtn title="Add Shop" icon={<Store size={20} />} color="bg-orange-100 text-orange-600" onClick={() => navigate('/retailers/new')} />
          <MenuBtn title="New Order" icon={<ShoppingBag size={20} />} color="bg-cyan-100 text-cyan-600" onClick={() => navigate('/orders/new')} />
          <MenuBtn title="View Orders" icon={<Clock size={20} />} color="bg-yellow-100 text-yellow-600" onClick={() => navigate('/orders')} />
          <MenuBtn title="My Shops" icon={<List size={20} />} color="bg-indigo-100 text-indigo-600" onClick={() => navigate('/retailers')} />
          <MenuBtn title="Stock" icon={<Package size={20} />} color="bg-pink-100 text-pink-600" onClick={() => navigate('/inventory')} />
          <MenuBtn title="Reports" icon={<BarChart2 size={20} />} color="bg-gray-200 text-slate-600" onClick={() => navigate('/eod-report')} />
        </div>

      </div>
    </div>
  );
};

const MenuBtn = ({ title, icon, color, onClick }) => (
  <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition min-h-[88px] min-w-[44px]">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{title}</span>
  </button>
);

export default SalesmanHome;