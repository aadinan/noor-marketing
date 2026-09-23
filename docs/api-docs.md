# API Documentation

This document maps out the Node.js/Express backend routes for the Noor Marketing platform. The base URL for all routes in development is typically `http://localhost:5000`.

## Authentication Headers
All protected routes require a JWT token passed in the Authorization header.
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate a user and return a JWT.
- `POST /api/auth/register-admin` - Register a new admin user.
- `GET /api/auth/profile` - Get logged-in user profile (Protected).

---

## 2. Retailers / Shops (`/api/retailers`)
- `GET /api/retailers` - Get all retailers.
- `GET /api/retailers/:id` - Get a single retailer's details.
- `POST /api/retailers` - Add a new shop (Requires Admin/Boss/Manager).
- `POST /api/retailers/quick-add` - Minimal quick-add for shops.

---

## 3. Products & Inventory (`/api/products` & `/api/inventory`)
- `GET /api/products` - List all products.
- `GET /api/products/reorder-report` - Get items below their restock threshold.
- `POST /api/products` - Create a new product.
- `POST /api/products/quick-add` - Quick-add modal route for new items.
- `PUT /api/products/:id` - Update product details.
- `PATCH /api/products/:id/stock` - Manually update stock counts.
- `GET /api/inventory/history/:productId` - Get stock transaction history.
- `GET /api/inventory/alerts` - Get low stock alerts.
- `POST /api/inventory/exceptions` - Report stock discrepancies.

---

## 4. Orders & Quotations (`/api/orders` & `/api/quotations`)
- `GET /api/orders` - List all orders.
- `POST /api/orders` - Create a new order.
- `PATCH /api/orders/:id/status` - Update order logistics status.
- `PUT /api/orders/:id/approve-credit` - Manager approval for credit override.
- `GET /api/quotations` - List all quotations.
- `POST /api/quotations` - Create a new quotation.
- `GET /api/quotations/:id` - Get quotation details.
- `PUT /api/quotations/:id/approve` - Approve a quotation.
- `POST /api/quotations/:id/convert` - Convert an approved quotation into an Order.

---

## 5. Collections & Payments (`/api/collections` & `/api/payments`)
- `GET /api/collections` - List field collections made by salesmen.
- `POST /api/collections` - Record a new collection.
- `GET /api/collections/eod-report` - End of Day tally report.
- `PUT /api/collections/:id/approve-discount` - Manager approval for cash discounts.
- `GET /api/payments` - List all generic payments.
- `POST /api/payments` - Record a general payment.

---

## 6. Suppliers & Purchase Orders (`/api/suppliers` & `/api/purchase-orders`)
- `GET /api/suppliers` - List all suppliers.
- `POST /api/suppliers` - Add a new supplier.
- `GET /api/purchase-orders` - List all POs.
- `POST /api/purchase-orders` - Create a PO for a supplier.
- `PUT /api/purchase-orders/:id/status` - Update PO status.

---

## 7. Dashboards (`/api/dashboard` & `/api/manager`)
- `GET /api/dashboard/boss` - High-level metrics for the Boss dashboard.
- `GET /api/dashboard/manager` - Metrics for Branch Managers.
- `GET /api/dashboard/warehouse` - Logistics and packing metrics.
- `GET /api/dashboard/salesman` - Salesman specific metrics and targets.
- `GET /api/manager/performance` - Salesmen performance report.
- `GET /api/manager/debt-report` - System-wide outstanding debts.

---

## 8. Users & Role Management (`/api/users`)
- `GET /api/users` - List all users (Admin/Boss only).
- `POST /api/users` - Create a new staff account.
- `PUT /api/users/:id` - Edit staff roles.
- `DELETE /api/users/:id` - Remove a user account.
- `GET /api/users/audit-logs` - View system activity logs.
