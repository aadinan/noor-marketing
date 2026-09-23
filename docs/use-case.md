# Use Case Diagram

```mermaid
usecaseDiagram
    ... (usecaseDiagram
    actor "Administrator" as Admin
    actor "Inventory Manager" as IM
    actor "Warehouse Staff" as WS
    actor "Sales Staff" as SS

    package "noor-marketing Management System" {
        usecase "Login" as UC_Login
        usecase "Manage Users" as UC_Users
        usecase "Manage Products" as UC_Prod
        usecase "Manage Suppliers" as UC_Supp
        usecase "Create/Update PO" as UC_PO
        usecase "Receive Stock" as UC_Rec
        usecase "Create Sales Order" as UC_SO
        usecase "Fulfill Order" as UC_Ful
        usecase "Generate Reports" as UC_Rep
        usecase "Collection Book (Money)" as UC_Fund
        usecase "Sync Offline Data" as UC_Sync
        usecase "Create Quotation" as UC_Quote
        usecase "Convert Quote to Order" as UC_Conv
        usecase "Audit Logs" as UC_Audit
        usecase "Update Stock Count" as UC_Count
        usecase "Sales Discount" as UC_Disc
    }

    %% Admin: Super User permissions
    Admin --> UC_Users
    Admin --> UC_Prod
    Admin --> UC_Supp
    Admin --> UC_PO
    Admin --> UC_Rec
    Admin --> UC_SO
    Admin --> UC_Ful
    Admin --> UC_Rep
    Admin --> UC_Fund
    Admin --> UC_Sync
    Admin --> UC_Quote
    Admin --> UC_Conv
    Admin --> UC_Audit
    Admin --> UC_Count
    Admin --> UC_Disc

    %% Inventory Manager
    IM --> UC_Prod
    IM --> UC_Supp
    IM --> UC_PO
    IM --> UC_Rep
    IM --> UC_Count
    IM --> UC_SO
    IM --> UC_Quote
    IM --> UC_Disc

    %% Warehouse Staff
    WS --> UC_Rec
    WS --> UC_Ful
    WS --> UC_Count

    %% Sales Staff: Field operations + Order Fulfillment
    SS --> UC_SO
    SS --> UC_Quote
    SS --> UC_Conv
    SS --> UC_Sync
    SS --> UC_Fund
    SS --> UC_Ful

    %% Mandatory Login Authentication
    UC_Users ..> UC_Login : <<include>>
    UC_Prod ..> UC_Login : <<include>>
    UC_SO ..> UC_Login : <<include>>
    UC_Quote ..> UC_Login : <<include>>) ...