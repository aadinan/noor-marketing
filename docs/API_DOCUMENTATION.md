# Noor Marketing ERP — API Documentation

> **Base URL (Development):** `http://localhost:5000/api`  
> **Base URL (Mobile/Emulator):** `http://10.0.2.2:5000/api`  
> **Authentication:** All endpoints (except `/auth/login`) require `Authorization: Bearer <JWT_TOKEN>` header.

---

## Authentication

### POST `/auth/login`
Login and receive a JWT token.

**Access:** Public

**Request Body:**
```json
{ "username": "sale", "password": "pass123" }
```

**Response 200:**
```json
{
  "_id": "...",
  "username": "sale",
  "role": "Salesman",
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Response 401:** `{ "message": "Invalid credentials" }`

---

## Products

### GET `/products`
Get all products with optional search and pagination.

**Access:** All authenticated roles  
**Query Params:** `?keyword=wipro&page=1&limit=50`

**Response 200:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "products": [ { "sku": "WP-LED-9W", "name": "...", "basePrice": 68, "mrp": 149, ... } ]
}
```

### POST `/products`
Create a new product.

**Access:** Warehouse, Manager, Boss, Admin

**Request Body:** Full product schema (see database-schema.md)

### POST `/products/quick-add`
Create a minimal product with just name, SKU, brand, price, category.

**Access:** Warehouse, Manager, Boss, Admin

### PUT `/products/:id`
Update a product's details.

**Access:** Admin, Warehouse, Manager

### PATCH `/products/:id/stock`
Update stock count and log an inventory transaction.

**Access:** Admin, Warehouse, Manager

**Request Body:**
```json
{ "quantity": 100, "type": "INWARD", "reason": "New stock from supplier", "newLocation": { "zone": "Zone 2" } }
```

### GET `/products/reorder-report`
Get list of products at or below their reorder point.

**Access:** Manager, Boss, Admin

---

## Retailers

### GET `/retailers`
Get all retailers (Boss/Admin/Manager see all; Salesman sees only their assigned shops).

**Access:** All authenticated roles

**Query Params:** `?search=mangalore&page=1`

### POST `/retailers`
Register a new retailer/shop.

**Access:** Salesman, Manager, Boss, Admin

**Required Fields:** `shopName`, `ownerName`, `phoneNumber`, `gstNumber`, `address.city`, `assignedSalesman`

### PUT `/retailers/:id`
Update retailer details.

**Access:** Manager, Boss, Admin

### POST `/retailers/:id/freeze`
Freeze a retailer's credit (block all new orders).

**Access:** Manager, Boss, Admin

---

## Orders

### GET `/orders`
Get orders (Boss/Manager/Admin see all; Salesman sees own; Warehouse sees processing/packed).

**Access:** All authenticated roles

### POST `/orders`
Create a new order. Automatically applies credit check:
- If `outstandingBalance + orderTotal > creditLimit` → `status: "Pending"` (manager approval queue)
- Else → `status: "Processing"` (stock deducted immediately)

**Access:** Salesman, Manager, Boss, Admin

**Request Body:**
```json
{
  "retailerId": "...",
  "items": [{ "productId": "...", "quantity": 100 }],
  "discountApplied": 0,
  "deliveryInfo": { "isSiteDelivery": false }
}
```

### PUT `/orders/:id/status`
Update order status (Pending → Processing → Packed → Dispatched → Delivered → Cancelled).

**Access:** Manager, Admin, Warehouse (role-specific transitions)

### GET `/orders/:id`
Get a single order with full population.

**Access:** All authenticated roles (ownership enforced for Salesman)

---

## Collections (Payment Collection)

### GET `/collections`
Get all collections (Boss/Admin/Manager see all; Salesman sees own).

**Access:** All authenticated roles

### POST `/collections`
Record a payment collection from a retailer.

**Access:** Salesman, Manager, Boss, Admin

**Request Body:**
```json
{
  "retailerId": "...",
  "amountCollected": 5000,
  "paymentMode": "Cash",
  "referenceNumber": "",
  "discountAsked": 0,
  "note": "Festival advance"
}
```

**Business Logic:**
- `discountAsked <= 50` → Auto-approved, retailer balance updated immediately
- `discountAsked > 50` → `discountStatus: "Pending_Approval"` → Manager notification created

### PUT `/collections/:id/approve-discount`
Manager approves a pending spot discount.

**Access:** Manager, Boss, Admin

---

## Quotations

### GET `/quotations`
Get all quotations.

**Access:** All authenticated roles

### POST `/quotations`
Create a quotation for a customer.

**Access:** Salesman, Manager, Boss

**Business Logic:**
- If `quotedPrice < basePrice * 0.9` → `marginStatus: "Low_Margin"`, `status: "PENDING_APPROVAL"`
- Else → `marginStatus: "Healthy"`, `status: "SENT"`

### PUT `/quotations/:id/approve`
Manager approves a low-margin quotation.

**Access:** Manager, Boss, Admin

### PUT `/quotations/:id/convert-to-order`
Convert an approved quotation into a live order.

**Access:** Salesman, Manager, Boss

---

## Estimates

### GET `/estimates`
Get all estimates.

**Access:** All authenticated roles

### POST `/estimates`
Create a bulk estimate.

**Access:** Salesman, Manager, Boss

### PUT `/estimates/:id/approve`
Approve an estimate.

**Access:** Manager, Boss, Admin

---

## Project Orders

### GET `/project-orders`
Get all project orders.

**Access:** All authenticated roles

### POST `/project-orders`
Create a project order (large construction/contractor order).

**Access:** Salesman, Manager, Boss

**Fields:** `projectName`, `clientName`, `clientType`, `siteAddress`, `estimatedValue`, `items[]`, `milestones[]`, `requiresSiteDelivery`

### PUT `/project-orders/:id`
Update project order status or add milestones.

**Access:** Manager, Boss, Admin

---

## Credit Requests

### POST `/credit/request`
Salesman requests a credit limit increase for a retailer.

**Access:** Salesman, Manager, Boss

### GET `/credit/pending`
Get all pending credit limit increase requests.

**Access:** Manager, Boss, Admin

### PUT `/credit/:id/approve`
Approve a credit request and update the retailer's limit.

**Access:** Manager, Boss, Admin

### PUT `/credit/:id/reject`
Reject a credit request.

**Access:** Manager, Boss, Admin

---

## Manager Routes

### GET `/manager/performance`
Get salesman performance metrics.

**Access:** Manager, Admin

### PUT `/manager/order-status/:id`
Update order processing status.

**Access:** Manager, Admin, Warehouse

### PUT `/manager/reassign-retailer/:id`
Reassign a retailer to a different salesman.

**Access:** Manager, Admin

### GET `/manager/debt-report`
Get outstanding debt aging report across all retailers.

**Access:** Manager, Admin

---

## Dashboard

### GET `/dashboard/boss`
Boss dashboard — daily revenue, collections, brand stats, 7-day trend graph, aging ledger.

**Access:** Boss, Admin

### GET `/dashboard/manager`
Manager dashboard — pending quotations, credit requests, orders needing approval, spot discounts.

**Access:** Manager, Admin, Boss

### GET `/dashboard/warehouse`
Warehouse dashboard — pending orders queue sorted by creation time.

**Access:** Warehouse, Admin, Boss

### GET `/dashboard/salesman`
Salesman personal dashboard — today's orders and collections.

**Access:** Salesman only

---

## Suppliers

### GET `/suppliers`
Get all suppliers.

**Access:** Manager, Boss, Admin, Warehouse

### POST `/suppliers`
Create a new supplier.

**Access:** Manager, Boss, Admin

### PUT `/suppliers/:id`
Update supplier details.

**Access:** Manager, Boss, Admin

---

## Purchase Orders

### GET `/purchase-orders`
Get all purchase orders.

**Access:** Manager, Boss, Admin, Warehouse

### POST `/purchase-orders`
Create a purchase order to a supplier.

**Access:** Warehouse, Manager, Boss, Admin

### PUT `/purchase-orders/:id/receive`
Mark a purchase order as received and update stock.

**Access:** Warehouse, Manager, Boss, Admin

---

## Deliveries

### GET `/deliveries`
Get delivery queue.

**Access:** All authenticated roles (scoped by role)

### POST `/deliveries`
Create a delivery record from an order.

**Access:** Warehouse, Salesman

### PUT `/deliveries/:id/complete`
Mark delivery as complete with proof.

**Access:** Salesman, Warehouse

---

## Notifications

### GET `/notifications`
Get notifications for the current user (scoped by `recipientId` and `recipientRole`).

**Access:** All authenticated roles

### PUT `/notifications/:id/read`
Mark a notification as read.

**Access:** All authenticated roles

---

## Incentives

### GET `/incentives`
Get incentive records (Boss/Admin see all; Salesman sees own).

**Access:** All authenticated roles

### POST `/incentives`
Create an incentive entry for a salesman.

**Access:** Manager, Boss, Admin

### PUT `/incentives/:id/pay`
Mark an incentive as paid.

**Access:** Manager, Boss, Admin

---

## Analytics

### GET `/analytics/overview`
Platform-wide analytics overview.

**Access:** Boss, Admin

---

## Error Responses

All errors follow this format:
```json
{ "success": false, "message": "Human-readable error description" }
```

| Status | Meaning |
|---|---|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no token or expired) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate SKU, etc.) |
| 500 | Internal Server Error |
