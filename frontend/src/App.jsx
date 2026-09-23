import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import api from './api/axios';
import 'react-toastify/dist/ReactToastify.css';

// --- 1. LOGIN & SECURITY ---
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// --- 2. THE DASHBOARDS ---
import BossDashboard from './pages/BossDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import WarehouseHome from './pages/WarehouseHome';
import SalesmanHome from './pages/SalesmanHome';

// --- 3. FEATURE PAGES ---
import EODReport from './pages/EODReport';
import QuotationList from './pages/QuotationList';
import CollectionForm from './pages/CollectionForm';
import CreateQuotation from './pages/CreateQuotation';
import NewOrder from './pages/NewOrder';
import OrderList from './pages/OrderList';
import AddRetailer from './pages/AddRetailer';
import RetailerList from './pages/RetailerList';
import AddProduct from './pages/AddProduct';
import ShopProfile from './pages/ShopProfile';
import OrderPipeline from './pages/OrderPipeline';

// NEW IMPORTS
import DeliveryList from './pages/DeliveryList';
import IncentivePage from './pages/IncentivePage';
import ProjectSalesPage from './pages/ProjectSalesPage';
import EstimateList from './pages/EstimateList';
import PurchaseOrderForm from './pages/PurchaseOrderForm';

function App() {

  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine) {
        const offlineData = JSON.parse(localStorage.getItem('offlineCollections') || "[]");
        if (offlineData.length > 0) {
          toast.info(`Syncing ${offlineData.length} offline records...`);
          for (const record of offlineData) {
            try {
              await api.post('/collections', record);
            } catch (e) {
              console.error("Sync failed for record", record);
            }
          }
          localStorage.removeItem('offlineCollections');
          toast.success("Sync Complete!");
        }
      }
    };
    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, []);

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />

        {/* --- DASHBOARDS --- */}
        <Route path="/boss" element={<ProtectedRoute allowedRoles={['Boss', 'Admin']}><BossDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute allowedRoles={['Manager', 'Boss', 'Admin']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute allowedRoles={['Salesman']}><SalesmanHome /></ProtectedRoute>} />

        {/* --- WAREHOUSE & INVENTORY --- */}
        <Route path="/warehouse" element={
          <ProtectedRoute allowedRoles={['Warehouse', 'Boss', 'Manager', 'Admin']}>
            <WarehouseDashboard />
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['Warehouse', 'Boss', 'Manager', 'Salesman', 'Admin']}>
            <WarehouseHome />
          </ProtectedRoute>
        } />

        <Route path="/products/new" element={
          <ProtectedRoute allowedRoles={['Warehouse', 'Boss', 'Manager', 'Admin']}>
            <AddProduct />
          </ProtectedRoute>
        } />

        {/* --- SALES FEATURES --- */}
        <Route path="/collection" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Admin', 'Manager', 'Boss']}>
            <CollectionForm />
          </ProtectedRoute>
        } />

        <Route path="/quotations" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <EstimateList />
          </ProtectedRoute>
        } />

        <Route path="/quotations/new" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss']}>
            <CreateQuotation />
          </ProtectedRoute>
        } />

        <Route path="/orders/new" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Boss', 'Manager', 'Admin']}>
            <NewOrder />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Boss', 'Manager', 'Warehouse', 'Admin']}>
            <OrderList />
          </ProtectedRoute>
        } />

        <Route path="/retailers/new" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <AddRetailer />
          </ProtectedRoute>
        } />

        <Route path="/retailers" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <RetailerList />
          </ProtectedRoute>
        } />

        <Route path="/retailers/:id" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <ShopProfile />
          </ProtectedRoute>
        } />

        <Route path="/order-pipeline" element={
          <ProtectedRoute allowedRoles={['Manager', 'Boss', 'Admin', 'Warehouse']}>
            <OrderPipeline />
          </ProtectedRoute>
        } />

        <Route path="/eod-report" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin', 'Warehouse']}>
            <EODReport />
          </ProtectedRoute>
        } />

        {/* NEW ROUTES */}
        <Route path="/delivery" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin', 'Warehouse']}>
            <DeliveryList />
          </ProtectedRoute>
        } />
        <Route path="/incentives" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <IncentivePage />
          </ProtectedRoute>
        } />
        <Route path="/project-orders" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <ProjectSalesPage />
          </ProtectedRoute>
        } />
        <Route path="/estimates" element={
          <ProtectedRoute allowedRoles={['Salesman', 'Manager', 'Boss', 'Admin']}>
            <EstimateList />
          </ProtectedRoute>
        } />
        <Route path="/purchase-orders/new" element={
          <ProtectedRoute allowedRoles={['Manager', 'Boss', 'Admin', 'Warehouse']}>
            <PurchaseOrderForm />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;