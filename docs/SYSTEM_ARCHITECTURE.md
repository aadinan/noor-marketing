# Noor Marketing ERP — System Architecture

> **Version:** 1.0.0 | **Last Updated:** August 2026 | **Status:** Production Ready

## Overview

Noor Marketing is a full-stack ERP system for a B2B electrical goods distributor. It manages the complete order lifecycle — from salesman field visits to warehouse dispatch — with credit enforcement, offline capability, and manager approval workflows.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend API | Node.js + Express 5 | v5.2.x |
| Database | MongoDB Atlas (Cloud) | Mongoose 9.x |
| Web Frontend | React + Vite | React 18, Vite 7 |
| Styling | Tailwind CSS | v4.x |
| Mobile App | Flutter | Dart SDK ^3.8.1 |
| Mobile Storage | SQLite (sqflite) | v2.3.0 |
| Auth | JWT (jsonwebtoken) | 30-day expiry |
| Security | bcryptjs (salt:12), express-mongo-sanitize | — |

---

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                                                                        │
│   ┌─────────────────────────────┐    ┌──────────────────────────────┐ │
│   │    React Web Dashboard       │    │   Flutter Mobile App          │ │
│   │    (Vite + Tailwind CSS)     │    │   (Android/iOS)               │ │
│   │                             │    │                              │ │
│   │  Roles: Boss / Manager /    │    │  Roles: Salesman /           │ │
│   │  Admin / Warehouse          │    │  Warehouse                   │ │
│   │                             │    │                              │ │
│   │  Features:                  │    │  Features:                   │ │
│   │  • Analytics Dashboards     │    │  • Offline-First Orders      │ │
│   │  • Order Pipeline           │    │  • SQLite Queue              │ │
│   │  • Credit Approvals         │    │  • Barcode Scanner           │ │
│   │  • Estimate/Quotation Mgmt  │    │  • Collection Recorder       │ │
│   │  • Warehouse Dashboard      │    │  • Credit Limit Alerts       │ │
│   └──────────────┬──────────────┘    └──────────────┬───────────────┘ │
│                  │ HTTPS REST API                    │ HTTP + JWT       │
└──────────────────┼──────────────────────────────────┼────────────────-┘
                   │                                   │
┌──────────────────▼───────────────────────────────────▼─────────────────┐
│                      EXPRESS 5 REST API SERVER                          │
│                      (Node.js, Port 5000)                               │
│                                                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │  Auth MW    │  │  Sanitize MW │  │  RBAC MW     │  │  Error MW  │  │
│   │  (JWT)      │  │  (NoSQL Inj) │  │  (Role Auth) │  │  (Global)  │  │
│   └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│          └─────────────────┴─────────────────┘                │         │
│                                    │                           │         │
│   ┌────────────────────────────────▼───────────────────────────▼──────┐  │
│   │                         ROUTE LAYER (21 routes)                   │  │
│   │  /auth  /products  /retailers  /orders  /collections  /quotations  │  │
│   │  /estimates  /project-orders  /credit  /manager  /dashboard        │  │
│   │  /payments  /suppliers  /purchase-orders  /deliveries  /incentives │  │
│   │  /notifications  /analytics  /inventory  /users  /integration      │  │
│   └────────────────────────────────┬──────────────────────────────────┘  │
│                                    │                                      │
│   ┌────────────────────────────────▼──────────────────────────────────┐  │
│   │                       CONTROLLER LAYER (20 controllers)            │  │
│   │  Business Logic: Credit Engine, Stock Deduction, Audit Logging,   │  │
│   │  Discount Approval, Incentive Calculation                          │  │
│   └────────────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────-┘
                                     │
┌────────────────────────────────────▼──────────────────────────────────────┐
│                        MONGODB ATLAS (Cloud)                               │
│                        Database: noor_db                                   │
│                                                                             │
│  Collections (18 models):                                                  │
│  users | products | retailers | orders | collections | payments            │
│  quotations | estimates | projectorders | creditrequests | auditlogs       │
│  suppliers | purchaseorders | deliveries | inventorytransactions           │
│  incentives | notifications | stockexceptions                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control (RBAC)

| Role | Access Level | Primary Responsibilities |
|---|---|---|
| **Boss** | Full (all routes) | View all analytics, approve credit, override discounts |
| **Admin** | Full (all routes) | User management, system configuration, audit review |
| **Manager** | High | Approve quotations, credit requests, spot discounts |
| **Warehouse** | Inventory + Orders | Pick list, stock management, purchase orders |
| **Salesman** | Sales-only | Place orders, collect payments, create estimates |

---

## Database Schema Mappings

### User → Retailer (1-to-Many)
```
User (Salesman) --[assignedSalesman]--> Retailer (many shops)
```

### Order Relationships
```
Order --[salesman]--> User
Order --[retailer]--> Retailer
Order --[items.product]--> Product (many)
Order --[approvedBy]--> User (Manager/Boss)
```

### Collection (Payment Collection)
```
Collection --[salesman]--> User
Collection --[retailer]--> Retailer
Collection.discountStatus: 'None' | 'Auto-Approved' | 'Pending_Approval' | 'Manager_Approved'
```

### Credit Workflow
```
CreditRequest --[requestedBy]--> User (Salesman)
CreditRequest --[retailer]--> Retailer
CreditRequest --[reviewedBy]--> User (Manager/Boss)
AuditLog records every approval/rejection
```

### Inventory Pipeline
```
Product --[inventory.location]--> {zone, rack, shelf, bin}
InventoryTransaction --[productId]--> Product
InventoryTransaction.type: INWARD | OUTWARD | TRANSFER | ADJUSTMENT | RETURN
StockException --[product]--> Product (discrepancy tracking)
```

### Project Order → Delivery
```
ProjectOrder --[salesman]--> User
ProjectOrder --[retailer]--> Retailer (optional)
ProjectOrder.quotationStatus: DRAFT | PENDING_REVIEW | APPROVED | REJECTED
Order --[linked via estimate]--> Delivery --[order]--> Order
```

---

## Key Business Logic

### Credit Check (Order Creation)
```
IF (retailer.outstandingBalance + orderTotal) > retailer.creditLimit:
    order.status = 'Pending'   → Requires Manager Approval
ELSE:
    order.status = 'Processing' → Stock immediately decremented
    retailer.outstandingBalance += netPayable
```

### Discount Approval Engine
```
IF discount <= ₹50 (MAX_AUTO_DISCOUNT):
    discountStatus = 'Auto-Approved'
    retailer.outstandingBalance -= (amount + discount)
ELSE:
    discountStatus = 'Pending_Approval'
    → Notification sent to Manager
    → AuditLog written upon approval
```

### Stock Lifecycle
```
Order Placed (Processing) → Product.inventory.stockCount -= quantity
Order Cancelled (from Processing) → Product.inventory.stockCount += quantity
Purchase Order Received → InventoryTransaction(INWARD) → stockCount += receivedQty
```

---

## Integration Points

### Flutter ↔ Backend
- Base URL: `http://10.0.2.2:5000/api` (Android Emulator) / `http://[device-ip]:5000/api` (Physical device)
- Auth: JWT stored in `flutter_secure_storage`
- Offline: SQLite queue (orders + collections) sync on reconnect via `OfflineSyncService`

### Frontend ↔ Backend
- Base URL: `http://localhost:5000/api` (development)
- Auth: JWT stored in `localStorage`, sent as `Authorization: Bearer <token>`
- Offline sync: `localStorage` key `offlineCollections`, synced on `window.online` event

---

## Security Architecture

| Concern | Mitigation |
|---|---|
| NoSQL Injection | Custom sanitizer strips `$` and `.` from req.body and req.params |
| JWT Forgery | HS256 signed with strong secret (`JWT_SECRET` from env) |
| Password Storage | bcrypt with salt rounds = 12 |
| RBAC Enforcement | `authorize(...roles)` middleware on every sensitive route |
| Sensitive Env | `.env` for backend, `flutter_secure_storage` for mobile tokens |
| Audit Trail | `AuditLog` collection records every approval/credit override |
| Credit Exposure | Retailer `creditFrozen` field blocks all new orders |
