import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Get user data from LocalStorage (saved during login)
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    // 1. Clear memory
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 2. Kick back to login screen
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Noor Marketing</h1>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm opacity-80 italic">Scientific Inventory System</span>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.username || 'Boss'}! 
          </h2>
          <p className="text-gray-600 mb-6">
            User Role: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">{user?.role || 'Admin'}</span>
          </p>
          
          {/* Data Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h3 className="text-lg font-bold text-blue-800">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
              <h3 className="text-lg font-bold text-green-800">Total Sales</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹0</p>
            </div>
            <div className="bg-red-50 p-4 rounded border border-red-100">
              <h3 className="text-lg font-bold text-red-800">Pending Debt</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹0</p>
            </div>
          </div>

          {/* Action Grid Section */}
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* New Daily Collections Button */}
            <button 
              onClick={() => navigate('/eod-report')}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500 hover:bg-purple-50 transition text-left group"
            >
              <h3 className="font-bold text-purple-800 group-hover:text-purple-600 transition">Daily Collections</h3>
              <p className="text-sm text-gray-500">View today's cash & cheque handover</p>
            </button>

            {/* Inventory Management Button */}
            <button 
              onClick={() => navigate('/inventory')}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 hover:bg-yellow-50 transition text-left group"
            >
              <h3 className="font-bold text-yellow-800 group-hover:text-yellow-600 transition">Warehouse Stock</h3>
              <p className="text-sm text-gray-500">Check Wipro/Tiso stock health</p>
            </button>

            {/* Client Directory Button */}
            <button 
              onClick={() => navigate('/retailers')}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:bg-blue-50 transition text-left group"
            >
              <h3 className="font-bold text-blue-800 group-hover:text-blue-600 transition">Retailer List</h3>
              <p className="text-sm text-gray-500">Manage shop debt and credit limits</p>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;