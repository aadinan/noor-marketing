# Noor Marketing ERP — Database Schema Reference

> **Database:** MongoDB Atlas | **ODM:** Mongoose 9.x | **Collections:** 18

---

## User
**Collection:** `users`

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | String | ✅ | Unique, trimmed |
| `password` | String | ✅ | bcrypt hashed (salt=12) via pre-save hook |
| `role` | String (enum) | ✅ | `Boss` \| `Admin` \| `Manager` \| `Salesman` \| `Warehouse` |
| `email` | String | — | Optional |
| `phone` | String | — | Optional |
| `lastLogin` | Date | — | Updated on login |
| `createdAt` / `updatedAt` | Date | auto | Mongoose timestamps |

---

## Product
**Collection:** `products`

| Field | Type | Required | Notes |
|---|---|---|---|
| `sku` | String | ✅ | Unique |
| `productCode` | String | ✅ | Catalog/supplier code |
| `name` | String | ✅ | |
| `brand` | String | ✅ | e.g. "Wipro", "Teso" |
| `category` | String | ✅ | e.g. "Lighting", "Switchgear" |
| `basePrice` | Number | ✅ | Wholesale / cost price |
| `mrp` | Number | ✅ | Maximum retail price |
| `isActive` | Boolean | — | default: true |
| `inventory.stockCount` | Number | — | default: 0 |
| `inventory.packagingQty` | Number | — | Units per carton |
| `inventory.location.zone` | String | — | Warehouse zone |
| `inventory.location.rack` | String | — | Rack ID |
| `inventory.location.shelf` | String | — | Shelf ID |
| `inventory.location.bin` | String | — | Optional bin |
| `inventory.physicalPath` | String | auto | `Zone > Rack > Shelf [> Bin]` (pre-save) |
| `inventory.alertLevel` | Number | — | Low-stock threshold |
| `inventory.maxCapacity` | Number | — | Overstock threshold |
| `inventory.restockStatus` | String (enum) | auto | `OK` \| `LOW` \| `CRITICAL` \| `OVERSTOCK` (pre-save) |
| `specifications` | Object | — | Brand-specific specs (wattage, lumens, etc.) |
| `metrics.classification` | String (enum) | — | `A` \| `B` \| `C` \| `Dead` |
| `metrics.averageDailySales` | Number | — | For reorder calculation |
| `metrics.leadTimeDays` | Number | — | Supplier lead time |
| `metrics.safetyStock` | Number | — | Buffer stock |
| `metrics.reorderPoint` | Number | — | Trigger for purchase order |

**Pre-save hooks:** Auto-generates `physicalPath`; auto-calculates `restockStatus`.

---

## Retailer
**Collection:** `retailers`

| Field | Type | Required | Notes |
|---|---|---|---|
| `shopName` | String | ✅ | |
| `ownerName` | String | ✅ | |
| `phoneNumber` | String | ✅ | Unique |
| `gstNumber` | String | ✅ | Unique |
| `address.line1` | String | — | |
| `address.city` | String | ✅ | |
| `address.state` | String | — | default: "Karnataka" |
| `address.pincode` | String | — | |
| `assignedSalesman` | ObjectId → User | — | |
| `outstandingBalance` | Number | — | default: 0 |
| `creditLimit` | Number | — | default: 10000 |
| `creditFrozen` | Boolean | — | default: false |
| `freezeReason` | String | — | |
| `isActive` | Boolean | — | default: true |
| `tagName` | String | — | e.g. "High Value", "New" |
| `gpsLocation` | Object | — | `{ lat, lng, accuracy }` |
| `lastVisitDate` | Date | — | |
| `lastOrderDate` | Date | — | |
| `visitCount` | Number | — | |
| `metrics.averagePaymentDays` | Number | — | |
| `metrics.averageMonthlySales` | Number | — | |

---

## Order
**Collection:** `orders`

| Field | Type | Required | Notes |
|---|---|---|---|
| `salesman` | ObjectId → User | ✅ | |
| `retailer` | ObjectId → Retailer | ✅ | |
| `items[]` | Array | ✅ | |
| `items[].product` | ObjectId → Product | ✅ | |
| `items[].quantity` | Number | ✅ | |
| `items[].wholesalePriceAtTime` | Number | ✅ | Snapshot of `basePrice` at order time |
| `items[].subTotal` | Number | ✅ | `quantity × wholesalePriceAtTime` |
| `items[].locationSnap` | String | — | Warehouse path at time of order |
| `totalOrderValue` | Number | ✅ | Sum of all subTotals |
| `discountApplied` | Number | — | default: 0 |
| `netPayable` | Number | ✅ | `totalOrderValue - discountApplied` |
| `staffIncentiveAmount` | Number | — | |
| `status` | String (enum) | — | `Pending` \| `Processing` \| `Packed` \| `Dispatched` \| `Delivered` \| `Cancelled` |
| `approvedBy` | ObjectId → User | — | Manager who approved credit override |
| `geofenceVerified` | Boolean | — | Whether salesman was at retailer location |
| `deliveryInfo` | Object | — | Site delivery details if applicable |

---

## Collection
**Collection:** `collections`

| Field | Type | Required | Notes |
|---|---|---|---|
| `salesman` | ObjectId → User | ✅ | |
| `clientType` | String (enum) | ✅ | `Shop` \| `Contractor` \| `Project` |
| `retailer` | ObjectId → Retailer | — | Required if clientType = Shop |
| `amountCollected` | Number | ✅ | |
| `paymentMode` | String (enum) | ✅ | `Cash` \| `Cheque` \| `UPI` \| `NEFT` \| `RTGS` |
| `referenceNumber` | String | — | UTR/cheque number |
| `discountAsked` | Number | — | default: 0 |
| `discountStatus` | String (enum) | — | `None` \| `Auto-Approved` \| `Pending_Approval` \| `Manager_Approved` \| `Rejected` |
| `note` | String | — | |
| `isOfflineEntry` | Boolean | — | Synced from Flutter SQLite |

---

## Payment
**Collection:** `payments`

| Field | Type | Required | Notes |
|---|---|---|---|
| `retailer` | ObjectId → Retailer | ✅ | |
| `collectedBy` | ObjectId → User | ✅ | Salesman |
| `amount` | Number | ✅ | |
| `method` | String (enum) | ✅ | `CASH` \| `CHEQUE` \| `UPI` \| `NEFT` \| `RTGS` |
| `transactionReference` | String | — | |
| `status` | String (enum) | — | `COLLECTED` \| `VERIFIED` \| `DISPUTED` |
| `orderId` | ObjectId → Order | — | Linked order |
| `location` | Object | — | `{ lat, lng }` GPS at time of collection |

---

## Quotation
**Collection:** `quotations`

| Field | Type | Required | Notes |
|---|---|---|---|
| `quotationNumber` | String | ✅ | Unique, auto-generated |
| `salesman` | ObjectId → User | ✅ | |
| `retailer` | ObjectId → Retailer | — | Optional (can be for non-registered customer) |
| `customerInfo` | Object | ✅ | `{ name, phone, address, customerType }` |
| `items[]` | Array | ✅ | `{ product, quantity, quotedPrice, basePrice, subTotal }` |
| `totalAmount` | Number | ✅ | |
| `grandTotal` | Number | ✅ | After GST |
| `marginStatus` | String (enum) | — | `Healthy` \| `Low_Margin` \| `Negative` |
| `status` | String (enum) | — | `DRAFT` \| `SENT` \| `PENDING_APPROVAL` \| `APPROVED` \| `REJECTED` \| `CONVERTED` |
| `validUntil` | Date | — | |
| `terms` | String | — | |

---

## Estimate
**Collection:** `estimates`

| Field | Type | Required | Notes |
|---|---|---|---|
| `estimateNumber` | String | ✅ | Unique |
| `salesman` | ObjectId → User | ✅ | |
| `retailer` | ObjectId → Retailer | — | |
| `customerInfo` | Object | ✅ | |
| `items[]` | Array | ✅ | `{ product, quantity, price, subTotal }` |
| `totalAmount` | Number | ✅ | |
| `discountPercent` | Number | — | default: 0 |
| `discountAmount` | Number | — | |
| `finalAmount` | Number | ✅ | After discount |
| `status` | String (enum) | — | `DRAFT` \| `SENT` \| `APPROVED` \| `REJECTED` |
| `validUntil` | Date | — | |

---

## ProjectOrder
**Collection:** `projectorders`

| Field | Type | Required | Notes |
|---|---|---|---|
| `projectName` | String | ✅ | |
| `clientName` | String | ✅ | |
| `clientType` | String (enum) | ✅ | `Retailer` \| `Contractor` \| `Direct` |
| `siteAddress` | String | ✅ | |
| `estimatedValue` | Number | ✅ | |
| `salesman` | ObjectId → User | ✅ | |
| `items[]` | Array | ✅ | `{ productName, product, quantity, unit, price, subTotal }` |
| `discountPercent` | Number | — | |
| `totalAmount` | Number | ✅ | |
| `requiresSiteDelivery` | Boolean | — | |
| `staggeredDelivery` | Boolean | — | Phase-wise delivery |
| `milestones[]` | Array | — | `{ description, targetDate, status }` |
| `quotationStatus` | String (enum) | — | `DRAFT` \| `PENDING_REVIEW` \| `APPROVED` \| `REJECTED` |
| `orderStatus` | String (enum) | — | `NOT_STARTED` \| `ACTIVE` \| `COMPLETED` \| `ON_HOLD` |
| `approvedBy` | ObjectId → User | — | |

---

## CreditRequest
**Collection:** `creditrequests`

| Field | Type | Required | Notes |
|---|---|---|---|
| `retailer` | ObjectId → Retailer | ✅ | |
| `requestedBy` | ObjectId → User | ✅ | Salesman |
| `requestedAmount` | Number | ✅ | Proposed new credit limit |
| `currentLimit` | Number | ✅ | Snapshot of limit at request time |
| `reason` | String | ✅ | |
| `status` | String (enum) | — | `PENDING` \| `APPROVED` \| `REJECTED` |
| `adminComment` | String | — | Reviewer's note |
| `reviewedBy` | ObjectId → User | — | Manager/Boss |
| `reviewedAt` | Date | — | |

---

## AuditLog
**Collection:** `auditlogs`

| Field | Type | Required | Notes |
|---|---|---|---|
| `action` | String | ✅ | e.g. `CREDIT_LIMIT_OVERRIDE`, `APPROVED_SPOT_DISCOUNT_COLLECTION` |
| `performedBy` | ObjectId → User | ✅ | |
| `targetId` | String | — | ID of affected document |
| `details` | Object | — | Arbitrary context data |
| `ipAddress` | String | — | |

---

## Supplier
**Collection:** `suppliers`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | ✅ | Unique |
| `contactPerson` | String | ✅ | |
| `email` | String | — | |
| `phone` | String | ✅ | |
| `gstNumber` | String | ✅ | |
| `address` | String | — | |
| `creditPeriodDays` | Number | — | |
| `activeProducts` | Number | — | |
| `totalPurchasedValue` | Number | — | |

---

## PurchaseOrder
**Collection:** `purchaseorders`

| Field | Type | Required | Notes |
|---|---|---|---|
| `poNumber` | String | ✅ | Unique |
| `supplier` | ObjectId → Supplier | ✅ | |
| `createdBy` | ObjectId → User | ✅ | |
| `items[]` | Array | ✅ | `{ product, orderedQty, receivedQty, unitCost, totalCost }` |
| `totalAmount` | Number | ✅ | |
| `status` | String (enum) | — | `DRAFT` \| `SENT` \| `PARTIALLY_RECEIVED` \| `COMPLETED` \| `CANCELLED` |
| `expectedDelivery` | Date | — | |
| `receivedDate` | Date | — | |

---

## Delivery
**Collection:** `deliveries`

| Field | Type | Required | Notes |
|---|---|---|---|
| `order` | ObjectId → Order | ✅ | |
| `salesman` | ObjectId → User | ✅ | |
| `retailer` | ObjectId → Retailer | — | |
| `status` | String (enum) | — | `PENDING` \| `OUT_FOR_DELIVERY` \| `DELIVERED` \| `FAILED` |
| `deliveredAt` | Date | — | |
| `paymentCollected` | Number | — | Cash on delivery amount |
| `paymentMode` | String | — | |
| `driverNotes` | String | — | |
| `proofDescription` | String | — | Photo description |

---

## InventoryTransaction
**Collection:** `inventorytransactions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `productId` | ObjectId → Product | ✅ | |
| `user` | ObjectId → User | ✅ | Who performed the action |
| `type` | String (enum) | ✅ | `INWARD` \| `OUTWARD` \| `TRANSFER` \| `ADJUSTMENT` \| `RETURN` |
| `quantity` | Number | ✅ | Positive or negative |
| `fromLocation` | String | — | |
| `toLocation` | String | — | |
| `reason` | String | — | |
| `referenceId` | String | — | Order/PO ID this transaction relates to |

---

## Incentive
**Collection:** `incentives`

| Field | Type | Required | Notes |
|---|---|---|---|
| `salesman` | ObjectId → User | ✅ | |
| `order` | ObjectId → Order | — | Linked order if commission-based |
| `amount` | Number | ✅ | |
| `percentage` | Number | — | Commission % |
| `type` | String | ✅ | e.g. `Order Commission`, `Monthly Target` |
| `paidStatus` | String (enum) | — | `Unpaid` \| `Paid` |
| `month` | Number | — | 1-12 |
| `year` | Number | — | |
| `notes` | String | — | |

---

## Notification
**Collection:** `notifications`

| Field | Type | Required | Notes |
|---|---|---|---|
| `recipientRole` | String | — | Target role (e.g. "Manager") |
| `recipientId` | ObjectId → User | — | Specific user if targeted |
| `type` | String (enum) | ✅ | `CREDIT_APPROVAL` \| `DISCOUNT_APPROVAL` \| `LOW_STOCK_ALERT` \| `ORDER_STATUS` \| `GENERAL` |
| `title` | String | ✅ | |
| `message` | String | ✅ | |
| `relatedId` | String | — | ID of related document |
| `relatedModel` | String | — | e.g. "CreditRequest" |
| `isRead` | Boolean | — | default: false |

---

## StockException
**Collection:** `stockexceptions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `product` | ObjectId → Product | ✅ | |
| `reportedBy` | ObjectId → User | ✅ | Warehouse staff |
| `systemCount` | Number | ✅ | What the system shows |
| `actualCount` | Number | ✅ | Physical count |
| `discrepancy` | Number | ✅ | `actualCount - systemCount` |
| `notes` | String | — | Reason for discrepancy |
| `status` | String (enum) | — | `PENDING_REVIEW` \| `RESOLVED` \| `ESCALATED` |
