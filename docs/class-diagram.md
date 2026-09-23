classDiagram
    class User {
        +String username 
        -String passwordHash
        +String role 
        +login()
        +hashPassword()
        +verifyToken()
        +logout()
    }

    class Brand {
        +int brandID
        +String brandName
    }

    class Product {
        +String sku
        +String name
        +int productID
        +double basePrice
        +JSON specifications
        +getTaxedRate()
    }

    class Customer {
        +int customerID
        +String shopName
        +String gstNo
        +double creditLimit
    }

    class Quotation {
        +String quoteID
        +Date expiry
        +String status
        +convertOrders() 
        +applyDiscount()
    }

    class SalesOrder {
        +String orderID
        +DateTime date
        +double totalAmount
        +String orderStatus
        +calculateTotal()
    }

    class CollectionBook {
        +double amountCollected
        +double balanceRemaining
        +String paymentMethod
        +syncOfflineData()
        +recordPayment()
    }

    class InventoryStock {
        +String binLocation
        +int quantity 
        +reserveStock()
    } 

    %% Relationships
    Brand "1" -- "*" Product : manufactures
    User "1" -- "*" SalesOrder : processes
    User "1" -- "*" Quotation : creates
    Customer "1" -- "*" SalesOrder : places
    Customer "1" -- "*" Quotation : receives
    Customer "1" -- "*" CollectionBook : pays
    SalesOrder "1" -- "*" Product : includes
    Product "1" -- "*" InventoryStock : stored_at
    SalesOrder "1" -- "0..1" CollectionBook : cleared_by