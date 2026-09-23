const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Make sure you installed this: npm install cors
const connectDB = require('./config/db');
const runCreditEngine = require('./utils/creditEngine');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow Frontend to talk to Backend
app.use(express.json());
app.use(require('./middleware/sanitize'));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const managerRoutes = require('./routes/managerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const creditRoutes = require('./routes/creditRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const userRoutes = require('./routes/userRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const estimateRoutes = require('./routes/estimateRoutes');
const projectOrderRoutes = require('./routes/projectOrderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const incentiveRoutes = require('./routes/incentiveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import Error Handler
const { errorHandler } = require('./middleware/errorHandler');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/project-orders', projectOrderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/incentives', incentiveRoutes);
app.use('/api/notifications', notificationRoutes);

// Mount Error Handler (Must be after routes)
app.use(errorHandler);

runCreditEngine();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));