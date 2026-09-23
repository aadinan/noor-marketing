import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Users, UserPlus, Shield, LogOut, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [activeView, setActiveView] = useState('users'); // 'users' | 'audit' | 'sync'

  const [formData, setFormData] = useState({
    username: '', password: '', role: 'salesman', email: '', phone: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    api.get('/dashboard/admin').then(res => setKpis(res.data.today)).catch(() => {});
    api.get('/users/audit-logs').then(res => setAuditLogs(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const getSyncStatusBadge = (user) => {
    if (!user.lastLogin) return { color: 'bg-slate-700 border-slate-600', dot: 'bg-slate-500', label: 'Never Logged In', text: 'text-slate-400' };
    const lastSync = new Date(user.lastLogin);
    const today = new Date();
    const isToday = lastSync.toDateString() === today.toDateString();
    const hoursDiff = (today - lastSync) / (1000 * 60 * 60);
    if (isToday) return { color: 'bg-emerald-900/30 border-emerald-700/50', dot: 'bg-emerald-400', label: 'Active Today', text: 'text-emerald-400' };
    if (hoursDiff < 48) return { color: 'bg-yellow-900/20 border-yellow-700/30', dot: 'bg-yellow-400', label: 'Yesterday', text: 'text-yellow-400' };
    return { color: 'bg-red-900/20 border-red-700/30', dot: 'bg-red-500', label: `${Math.floor(hoursDiff/24)}d ago`, text: 'text-red-400' };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success("User created successfully");
      setShowForm(false);
      setFormData({ username: '', password: '', role: 'salesman', email: '', phone: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Remove this user from the system?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User removed');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-2xl font-black mb-8 text-indigo-500 tracking-tighter flex items-center gap-2">
            <Shield size={24} /> ROOT
          </h2>
          <nav className="space-y-4">
            <button onClick={() => setActiveView('users')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeView === 'users' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Users size={20} /> User Management
            </button>
            <button onClick={() => setActiveView('audit')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeView === 'audit' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Shield size={20} /> Security Logs
            </button>
            <button onClick={() => setActiveView('sync')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeView === 'sync' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Users size={20} /> Staff Sync Map
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-900/20 text-red-500 rounded-xl transition font-bold">
          <LogOut size={20} /> Secure Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">

        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">System Access Control</h1>
            <p className="text-slate-400">Manage organizational roles and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-900/50"
          >
            <UserPlus size={20} /> Provision User
          </button>
        </header>

        {/* KPI CARDS */}
        {kpis && !showAudit && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Today Revenue</p>
              <p className="text-2xl font-black text-white">₹{kpis.revenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Collected</p>
              <p className="text-2xl font-black text-green-400">₹{kpis.collected?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-xs text-red-400 uppercase font-bold mb-1">Outstanding</p>
              <p className="text-2xl font-black text-red-400">₹{kpis.outstandingDebts?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {/* Staff Sync Map View */}
        {activeView === 'sync' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">📡 Staff Sync Status — Live View</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {users.filter(u => u.role !== 'Boss').map(u => {
                const badge = getSyncStatusBadge(u);
                return (
                  <div key={u._id} className={`flex items-start gap-3 p-4 rounded-2xl border ${badge.color} transition-all`}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${badge.dot} ring-2 ring-offset-2 ring-offset-slate-900 ring-current`} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{u.username}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{u.role}</p>
                      <p className={`text-xs font-medium mt-1 ${badge.text}`}>{badge.label}</p>
                      {u.lastLogin && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(u.lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {users.filter(u => u.role !== 'Boss').length === 0 && (
                <div className="col-span-4 text-center py-12 text-slate-500">No staff members found</div>
              )}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Yesterday</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Inactive 2+ Days</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Never Logged In</span>
            </div>
          </div>
        )}

        {/* User Table / Audit Logs */}
        {activeView === 'audit' ? (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan="3" className="p-6 text-center text-slate-500">No logs found</td></tr>
                ) : auditLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 text-slate-400 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-white">{log.user?.username || 'Unknown'}</td>
                    <td className="px-6 py-4 text-emerald-400 text-sm">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeView === 'users' ? (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-bold text-white">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'boss' ? 'bg-amber-500/20 text-amber-400' :
                            u.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Registration Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">Create New User</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition"
                    value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                  <input required type="password" minLength="6" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Role</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition"
                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} >
                    <option value="salesman">Salesman</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="manager">Manager</option>
                    <option value="boss">Boss</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                    <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-4 rounded-lg mt-4 disabled:opacity-50 transition">
                  {submitting ? 'Provisioning...' : 'Provision Access'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Vyapar Sync Placeholder */}
        <div className="mt-8 p-6 bg-slate-800 border border-dashed border-indigo-500/30 rounded-2xl">
          <div className="flex items-center gap-3 text-indigo-400">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">📊</div>
            <div>
              <h4 className="font-bold text-white">Vyapar Billing Sync</h4>
              <p className="text-xs text-slate-400">// Coming Soon - Vyapar Sync</p>
              <p className="text-xs text-indigo-400 mt-1">Automatic billing data sync from Vyapar will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;