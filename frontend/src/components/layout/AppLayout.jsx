import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package,
  BarChart2, Settings, ChevronLeft, ChevronRight, Bell,
  Search, Plus, LogOut, ChevronDown, User, Menu, X, Truck
} from 'lucide-react';
import api from '../../api/axios';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, roles: ['Boss', 'Admin', 'Manager', 'Salesman', 'Warehouse'], href: null },
  { label: 'Orders', icon: ShoppingCart, roles: ['Boss', 'Admin', 'Manager', 'Salesman', 'Warehouse'], href: '/orders' },
  { label: 'Estimates & Quotes', icon: FileText, roles: ['Boss', 'Admin', 'Manager', 'Salesman'], href: '/estimates' },
  { label: 'Retailers', icon: Users, roles: ['Boss', 'Admin', 'Manager', 'Salesman'], href: '/retailers' },
  { label: 'Inventory', icon: Package, roles: ['Boss', 'Admin', 'Manager', 'Warehouse'], href: '/inventory' },
  { label: 'Deliveries', icon: Truck, roles: ['Boss', 'Admin', 'Manager', 'Salesman'], href: '/delivery' },
  { label: 'Analytics', icon: BarChart2, roles: ['Boss', 'Admin', 'Manager'], href: '/eod-report' },
  { label: 'Settings', icon: Settings, roles: ['Boss', 'Admin'], href: '/admin' },
];

const ROLE_HOME = {
  Boss: '/boss', Admin: '/admin', Manager: '/manager',
  Salesman: '/sales', Warehouse: '/warehouse'
};

export default function AppLayout({ children, title = '', breadcrumb = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'Salesman';
  const homeHref = ROLE_HOME[role] || '/';

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setNotifCount(res.data.count || 0);
      } catch { setNotifCount(0); }
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/retailers?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  const getNavHref = (item) => {
    if (item.href) return item.href;
    return homeHref;
  };

  const isActive = (item) => {
    const href = getNavHref(item);
    if (href === homeHref && location.pathname === homeHref) return true;
    if (href !== homeHref && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`relative flex-shrink-0 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-60'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 h-16">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">N</span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">Noor Marketing</p>
              <p className="text-[10px] text-slate-400 font-medium">ERP Platform</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={getNavHref(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={18} className={`flex-shrink-0 ${active ? 'text-blue-600' : ''}`} />
                {!collapsed && (
                  <span className={`text-sm font-medium ${
                    active ? 'font-semibold text-blue-700' : ''
                  }`}>{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User size={14} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.username || 'User'}</p>
                <p className="text-[10px] text-slate-400">{role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 transition z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            {breadcrumb.length > 0 ? (
              <div className="flex items-center gap-1.5 text-sm">
                <Link to={homeHref} className="text-slate-400 hover:text-blue-600 transition">Home</Link>
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <span className="text-slate-300">/</span>
                    {i === breadcrumb.length - 1 ? (
                      <span className="text-slate-900 font-semibold">{crumb}</span>
                    ) : (
                      <span className="text-slate-400">{crumb}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <h1 className="font-semibold text-slate-900 truncate">{title || 'Dashboard'}</h1>
            )}
          </div>

          {/* Search Bar */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 hover:border-blue-300 transition"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd className="ml-2 text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 font-mono">⌘K</kbd>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/orders/new')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={14} />
              <span>New Order</span>
            </button>
            <button
              onClick={() => navigate('/estimates?tab=new')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
            >
              <Plus size={14} />
              <span>Estimate</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications' in window ? '/notifications' : homeHref)}
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 text-sm">{user.username}</p>
                    <span className="badge-info text-[10px] mt-0.5 inline-block">{role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center px-4 py-3 border-b border-slate-100">
                <Search size={16} className="text-slate-400 mr-3 flex-shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search retailers, orders, SKUs..."
                  className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X size={16} className="text-slate-400" />
                </button>
              </form>
              <div className="px-4 py-3 text-xs text-slate-400">
                Press <kbd className="bg-slate-100 px-1 rounded">Enter</kbd> to search retailers · <kbd className="bg-slate-100 px-1 rounded">Esc</kbd> to close
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
