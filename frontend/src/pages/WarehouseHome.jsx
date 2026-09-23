import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, AlertCircle, Search, BarChart3, LogOut, PackageX } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const WarehouseHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products from your API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.products || res.data.data || res.data || []);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = products.length;
  const lowStock = products.filter(p => (p.inventory?.stockCount || 0) <= (p.metrics?.reorderPoint || 10)).length;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 p-6 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black mb-8 text-blue-500 tracking-tighter">WH-CONTROL</h2>
          <nav className="space-y-4">
            <button className="flex items-center gap-3 w-full p-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-bold">
              <Package size={20} /> Inventory
            </button>
            <button onClick={() => navigate('/products/new')} className="flex items-center gap-3 w-full p-3 hover:bg-slate-800 text-slate-400 rounded-xl transition">
              <Plus size={20} /> Add Product
            </button>
            <button onClick={() => navigate('/inventory')} className="flex items-center gap-3 w-full p-3 hover:bg-slate-800 text-slate-400 rounded-xl transition">
              <BarChart3 size={20} /> Stock Reports
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-900/20 text-red-400 rounded-xl transition font-bold">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Inventory Status</h1>
            <p className="text-slate-500 font-medium">Real-time warehouse metrics</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 min-w-[120px]">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Items Managed</p>
              <p className="text-2xl font-black">{totalItems}</p>
            </div>
            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 min-w-[120px]">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Critical Stock</p>
              <p className="text-2xl font-black text-red-500">{lowStock}</p>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="mb-6 flex">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              className="w-full bg-slate-800 border border-slate-700 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 transition text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Scanning warehouse..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-950 rounded-3xl border border-slate-800">
            <PackageX size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No products found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          /* Product Table */
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU / Code</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.brand}</p>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-blue-400">{p.sku}</td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700">
                        {p.inventory?.location?.zone || 'N/A'} - {p.inventory?.location?.rack}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`text-lg font-black ${p.inventory?.stockCount < 10 ? 'text-red-500' : 'text-slate-200'}`}>
                        {p.inventory?.stockCount}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.inventory?.stockCount < 10 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {p.inventory?.stockCount < 10 ? 'REORDER' : 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseHome;