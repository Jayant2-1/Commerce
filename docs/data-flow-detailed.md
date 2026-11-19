# EEEE E-Commerce — Complete Data Flow Documentation

---

## Table of Contents
1. [Add Product to Cart](#1-add-product-to-cart)
2. [Checkout & Place Order](#2-checkout--place-order)
3. [Payment Processing](#3-payment-processing)
4. [Admin Order Status Management](#4-admin-order-status-management)
5. [Complete Flow Diagram](#5-complete-flow-diagram)
6. [Database Interaction Summary](#6-database-interaction-summary)

---

## 1. Add Product to Cart

### Flow Diagram
```
User clicks "Add to Cart" on Product Detail page
           │
           ▼
  ┌─────────────────────┐
  │  Frontend:          │
  │  ProductDetail.jsx  │
  │  handleAddToCart()  │
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │  GET /cart          │ ← Check if item already exists
  └─────────┬───────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
  EXISTS?      NOT EXISTS?
     │             │
     ▼             ▼
  PUT /cart/    POST /cart/
  items/{id}    items
  {quantity}    {productId,
  : newQty      quantity: 1}
     │             │
     └──────┬──────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  Backend: CartController    │
  │  → CartService.addItem()    │
  └─────────┬───────────────────┘
            │
            ▼
  ┌──────────────────────────────────────┐
  │  1. Validate product exists & active │
  │  2. Check Inventory.hasStock(qty)    │
  │     → availableQuantity =            │
  │       stockQuantity - reservedQty    │
  │  3. Find existing CartItem or create │
  │     new one                          │
  │  4. Update quantity                  │
  │  5. Inventory.reserve(qty)           │
  │     → reservedQuantity += qty        │
  │  6. Save CartItem + Inventory        │
  └──────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  Response: Updated Cart     │
  │  (all items with prices)    │
  └─────────────────────────────┘
```

### Key Code Paths

**Frontend:** `frontend/src/pages/user/ProductDetail.jsx` → `handleAddToCart()`
```js
const handleAddToCart = async () => {
  const cartRes = await cartApi.getCart();
  const existingItem = cartRes.data.data?.items?.find(
    i => i.product?.id === product.id || i.productId === product.id
  );
  if (existingItem) {
    await cartApi.updateItem(existingItem.id, { quantity: existingItem.quantity + quantity });
  } else {
    await cartApi.addItem({ productId: product.id, quantity });
  }
};
```

**Backend:** `backend/src/main/java/com/ecommerce/service/CartService.java` → `addItem()`
```java
public CartResponse addItem(UUID userId, AddCartItemRequest request) {
    // 1. Find or create cart
    Cart cart = findOrCreateCart(userId);
    Product product = productRepository.findById(request.productId())...;
    
    // 2. Check stock
    Inventory inventory = findInventory(product.getId());
    if (!inventory.hasStock(request.quantity())) throw...
    
    // 3. Find existing cart item or create new
    CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
        .orElseGet(() -> CartItem.builder()...quantity(0)...build());
    
    // 4. Update quantity & reserve inventory
    item.setQuantity(item.getQuantity() + request.quantity());
    inventory.reserve(request.quantity());
    
    // 5. Save
    cartItemRepository.save(item);
    inventoryRepository.save(inventory);
}
```

### Database Tables Affected
| Table | Operation | Columns Changed |
|-------|-----------|-----------------|
| `cart_items` | INSERT or UPDATE | `quantity`, `price_at_addition` |
| `inventory` | UPDATE | `reserved_quantity += qty`, `in_stock` recalculated |

---

## 2. Checkout & Place Order

### Flow Diagram
```
User clicks "Place Order" on Checkout page
           │
           ▼
  ┌─────────────────────────────┐
  │  Frontend Validation:        │
  │  - Address selected?        │
  │  - Card fields valid?       │
  │    (if card payment)        │
  │  - UPI ID valid?            │
  │    (if UPI payment)         │
  └─────────┬───────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  POST /api/v1/orders        │
  │  { addressId, paymentMethod,│
  │    couponCode? }            │
  └─────────┬───────────────────┘
            │
            ▼
  ┌──────────────────────────────────────┐
  │  Backend: OrderController            │
  │  → OrderService.placeOrder()         │
  └─────────┬────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────────────────────┐
  │  1. Fetch user's cart                                │
  │  2. Validate cart is not empty                       │
  │  3. Calculate totalPrice from cart items             │
  │  4. Apply coupon if present:                         │
  │     → Validate coupon code exists                    │
  │     → Check coupon.isValid() (active, not expired,   │
  │       usage limit not reached)                       │
  │     → Check minOrderAmount                           │
  │     → Calculate discount                             │
  │     → Increment usedCount                            │
  │  5. Resolve shipping address from addressId          │
  │     or shippingAddress object (snapshot)             │
  │  6. Create Order with:                               │
  │     → orderNumber (generated)                        │
  │     → totalPrice, discountAmount, finalPrice         │
  │     → orderStatus: PENDING                           │
  │     → paymentStatus: PENDING                         │
  │     → shippingAddress (embedded snapshot)            │
  │  7. For each cart item:                              │
  │     → Confirm inventory sale (reduce stock)          │
  │     → Create OrderItem                               │
  │  8. Create Payment record (PENDING)                  │
  │  9. Clear cart items                                 │
  │  10. Send notification (async)                       │
  └─────────────────────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  Response: Order with       │
  │  orderNumber, items, status │
  └─────────┬───────────────────┘
            │
            ▼
  ┌──────────────────────────────────────┐
  │  Frontend (Checkout.jsx):             │
  │  Based on paymentMethod:              │
  │                                      │
  │  COD → POST /payments/mock-complete  │
  │        → Order CONFIRMED             │
  │        → Payment stays PENDING       │
  │                                      │
  │  CREDIT_CARD / DEBIT_CARD →          │
  │        POST /payments/process-card   │
  │        with cardNumber, expiry, CVV  │
  │        → Order CONFIRMED             │
  │        → Payment COMPLETED           │
  │                                      │
  │  UPI → POST /payments/process-upi    │
  │        with upiId                    │
  │        → Order CONFIRMED             │
  │        → Payment COMPLETED           │
  └──────────────────────────────────────┘
```

### Key Code Paths

**Frontend:** `frontend/src/pages/user/Checkout.jsx` → `placeOrder()`
```js
const placeOrder = async () => {
  // Validate fields
  if (paymentMethod === 'CREDIT_CARD' && !validateCardFields()) return;
  if (paymentMethod === 'UPI' && (!upiId || !upiId.includes('@'))) return;
  
  // Place order
  const res = await orderApi.placeOrder({ addressId: selectedAddress, paymentMethod });
  const order = res.data.data;
  
  // Payment processing based on method
  if (paymentMethod === 'COD') {
    await paymentApi.mockComplete({ orderId: order.id, paymentMethod });
  } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
    await paymentApi.processCard(order.id, paymentMethod, cardDetails);
  } else if (paymentMethod === 'UPI') {
    await paymentApi.processUPI(order.id, paymentMethod, upiId);
  }
};
```

**Backend:** `backend/src/main/java/com/ecommerce/service/OrderService.java` → `placeOrder()`
```java
public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
    Cart cart = cartRepository.findByUserId(userId)...;
    // Calculate totals, apply coupon, resolve address
    
    Order order = Order.builder()
        .orderNumber(OrderNumberGenerator.nextOrderNumber())
        .totalPrice(totalPrice)
        .discountAmount(couponContext.discountAmount())
        .finalPrice(totalPrice.subtract(couponContext.discountAmount()))
        .orderStatus(OrderStatus.PENDING)
        .paymentStatus(PaymentStatus.PENDING)
        .shippingAddress(shippingAddress)
        .user(user)
        .build();
    
    // Process each cart item → confirm inventory
    // Create payment record
    // Clear cart
}
```

### Database Tables Affected
| Table | Operation | Key Columns |
|-------|-----------|-------------|
| `orders` | INSERT | All order details |
| `order_items` | INSERT (×N) | quantity, purchase_price, subtotal |
| `inventory` | UPDATE | `stock_quantity -= qty`, `reserved_quantity -= qty`, `sold_quantity += qty` |
| `payments` | INSERT | amount, currency, status=PENDING, method |
| `coupons` | UPDATE | `used_count += 1` (if coupon used) |
| `cart_items` | DELETE ALL | Cart cleared after order |

---

## 3. Payment Processing

### COD (Cash on Delivery)
```
POST /payments/mock-complete { orderId, paymentMethod: "COD" }
         │
         ▼
  ┌──────────────────────────────────────┐
  │  PaymentService.completeMockPayment  │
  │                                      │
  │  1. Validate: method == COD only     │
  │     (throws BadRequestException      │
  │      for CREDIT_CARD, UPI, etc.)     │
  │                                      │
  │  2. Create/find Payment record       │
  │     → method: COD                    │
  │     → status: PENDING (not paid yet) │
  │     → paidAt: null                   │
  │                                      │
  │  3. Update Order:                    │
  │     → orderStatus: CONFIRMED         │
  │     → paymentStatus: PENDING         │
  │                                      │
  │  4. Send notification (async)        │
  └──────────────────────────────────────┘
```

### Credit Card / Debit Card
```
POST /payments/process-card { orderId, paymentMethod,
  cardNumber, cardHolderName, expiryDate, cvv }
         │
         ▼
  ┌──────────────────────────────────────┐
  │  PaymentService.processCardPayment   │
  │                                      │
  │  1. Validate: method is CREDIT_CARD  │
  │     or DEBIT_CARD                    │
  │                                      │
  │  2. Validate card details:           │
  │     → cardNumber: 16 digits          │
  │     → cardHolderName: not empty      │
  │     → expiryDate: MM/YY format       │
  │     → cvv: 3 or 4 digits            │
  │                                      │
  │  3. Process payment (simulated):     │
  │     → Generate mock transaction IDs  │
  │     → status: COMPLETED              │
  │     → paidAt: now                    │
  │                                      │
  │  4. Update Order:                    │
  │     → paymentStatus: COMPLETED       │
  │     → orderStatus: CONFIRMED         │
  │                                      │
  │  5. Log masked card info             │
  └──────────────────────────────────────┘
```

### UPI
```
POST /payments/process-upi { orderId, paymentMethod, upiId }
         │
         ▼
  ┌──────────────────────────────────────┐
  │  PaymentService.processUPIPayment    │
  │                                      │
  │  1. Validate: method == UPI          │
  │                                      │
  │  2. Validate UPI ID:                 │
  │     → Must contain "@"               │
  │     → Must not be empty              │
  │                                      │
  │  3. Process payment (simulated):     │
  │     → Generate mock transaction IDs  │
  │     → status: COMPLETED              │
  │     → paidAt: now                    │
  │                                      │
  │  4. Update Order:                    │
  │     → paymentStatus: COMPLETED       │
  │     → orderStatus: CONFIRMED         │
  └──────────────────────────────────────┘
```

### Payment Status Lifecycle
```
PENDING ──→ COMPLETED (card/UPI success, or COD delivered)
    │
    ├──→ FAILED (card declined, verification failed)
    │
    └──→ REFUNDED (order cancelled after payment completed)
```

---

## 4. Admin Order Status Management

### Flow Diagram
```
Admin navigates to Admin Orders page
           │
           ▼
  ┌─────────────────────────────┐
  │  GET /api/v1/admin/orders   │
  │  → Returns ALL orders       │
  │    with admin details       │
  └─────────┬───────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  Admin selects an order &   │
  │  changes status via dropdown│
  └─────────┬───────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  PATCH /api/v1/admin/orders │
  │  /{orderId}/status          │
  │  { orderStatus }            │
  └─────────┬───────────────────┘
            │
            ▼
  ┌──────────────────────────────────────┐
  │  Backend: AdminOrderController       │
  │  → OrderService.updateOrderStatus()  │
  └─────────┬────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────────────────────┐
  │  1. Find order by ID                                │
  │                                                     │
  │  2. Update orderStatus                              │
  │                                                     │
  │  3. Special Logic:                                  │
  │     ┌─────────────────────────────────────┐         │
  │     │ If status → DELIVERED:              │         │
  │     │   AND paymentStatus is PENDING:     │         │
  │     │   → Set paymentStatus = COMPLETED   │         │
  │     │   (COD orders get paid on delivery) │         │
  │     └─────────────────────────────────────┘         │
  │                                                     │
  │     ┌─────────────────────────────────────┐         │
  │     │ If status → CANCELLED:              │         │
  │     │   1. restockItems(order):           │         │
  │     │      For each order item:           │         │
  │     │      → stockQuantity += qty         │         │
  │     │      → soldQuantity -= qty          │         │
  │     │      → inStock recalculated         │         │
  │     │   2. If payment was COMPLETED:      │         │
  │     │      → paymentStatus = REFUNDED     │         │
  │     └─────────────────────────────────────┘         │
  │                                                     │
  │  4. Save order                                      │
  │  5. Send notification (async)                       │
  └─────────────────────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │  Response: Updated Order    │
  │  with new status & timestamp│
  └─────────────────────────────┘
```

### Allowed Status Transitions
```
                    ┌──────────┐
                    │ PENDING  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
              ┌─────│ CONFIRMED│─────┐
              │     └────┬─────┘     │
              │          │           │
         ┌────▼────┐ ┌──▼──────┐    │
         │CANCELLED│ │PROCESSING│    │
         └─────────┘ └──┬──────┘    │
                        │           │
                   ┌────▼─────┐     │
                   │ SHIPPED  │     │
                   └────┬─────┘     │
                        │           │
                   ┌────▼──────┐    │
                   │ DELIVERED │    │
                   └────┬──────┘    │
                        │           │
                   ┌────▼─────┐     │
                   │ RETURNED │     │
                   └──────────┘     │
                              ┌─────▼─────┐
                              │ CANCELLED │
                              └───────────┘
```

### Key Code Paths

**Backend:** `backend/src/main/java/com/ecommerce/service/OrderService.java` → `updateOrderStatus()`
```java
public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status) {
    Order order = orderRepository.findWithDetailsById(orderId)...;
    
    order.setOrderStatus(status);
    
    // If delivered with pending payment (COD), mark as completed
    if (status == OrderStatus.DELIVERED && order.getPaymentStatus() == PaymentStatus.PENDING) {
        order.setPaymentStatus(PaymentStatus.COMPLETED);
    }
    
    // If cancelled, restock items
    if (status == OrderStatus.CANCELLED) {
        restockItems(order);
    }
    
    Order saved = orderRepository.save(order);
    notificationService.sendOrderStatusChangedNotification(saved);
}
```

**Backend:** `restockItems()` method
```java
private void restockItems(Order order) {
    for (OrderItem item : order.getItems()) {
        Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId())...;
        inventory.setStockQuantity(inventory.getStockQuantity() + item.getQuantity());
        inventory.setSoldQuantity(Math.max(0, inventory.getSoldQuantity() - item.getQuantity()));
        inventory.setInStock(inventory.getAvailableQuantity() > 0);
        inventoryRepository.save(inventory);
    }
}
```

---

## 5. Complete Flow Diagram

```
                         COMPLETE ORDER-TO-DELIVERY FLOW
                         ═══════════════════════════════

  USER                        FRONTEND                      BACKEND                      DATABASE
  ────                        ────────                      ───────                      ────────
   │                             │                             │                            │
   ├── Browse Products ─────────→ GET /search/products ──────→ ProductController ──────────→ products
   │                             │                             │                            │
   ├── Add to Cart ────────────→ POST /cart/items ──────────→ CartService.addItem() ───────→ cart_items (+)
   │                             │                             │                            inventory (reserve)
   │                             │                             │                            │
   ├── View Cart ──────────────→ GET /cart ──────────────────→ CartService.getCart() ──────→ cart_items
   │                             │                             │                            │
   ├── Apply Coupon ───────────→ POST /coupons/validate ─────→ CouponService.validate() ───→ coupons
   │                             │                             │                            │
   ├── Proceed to Checkout ────→ Navigate to /checkout ──────→ GET /addresses ────────────→ addresses
   │                             │                             │                            │
   ├── Select Address ─────────→ (local state)                 │                            │
   │                             │                             │                            │
   ├── Select Payment Method ──→ (local state)                 │                            │
   │                             │                             │                            │
   ├── Enter Card/UPI Details ─→ (local state, validated)      │                            │
   │                             │                             │                            │
   ├── Place Order ────────────→ POST /orders ───────────────→ OrderService.placeOrder() ──→ orders (INSERT)
   │                             │                             │                            order_items (INSERT)
   │                             │                             │                            inventory (confirm sale)
   │                             │                             │                            coupons (used_count++)
   │                             │                             │                            cart_items (DELETE)
   │                             │                             │                            payments (INSERT)
   │                             │                             │                            │
   ├── [If COD] ───────────────→ POST /payments/mock-complete → PaymentService.             payments (status)
   │                             │                             completeMockPayment()         orders (confirmed)
   │                             │                             │                            │
   ├── [If Card] ──────────────→ POST /payments/process-card  → PaymentService.             payments (completed)
   │                             │                             processCardPayment()          orders (confirmed)
   │                             │                             │                            │
   ├── [If UPI] ───────────────→ POST /payments/process-upi   → PaymentService.             payments (completed)
   │                             │                             processUPIPayment()           orders (confirmed)
   │                             │                             │                            │
   │                             │                             │                            │
  ADMIN                         FRONTEND (ADMIN)               BACKEND                      DATABASE
  ─────                         ────────────────               ───────                      ───────
   │                             │                             │                            │
   ├── View All Orders ────────→ GET /admin/orders ──────────→ AdminOrderController ───────→ orders (+items)
   │                             │                             │                            │
   ├── Change Status ──────────→ PATCH /admin/orders/{id}/    → OrderService.               orders (status)
   │                             │ status                      updateOrderStatus()          inventory (restock)
   │                             │                             │                            payments (refund)
   │                             │                             │                            │
   │    PENDING → CONFIRMED ────→ (select in dropdown) ───────→ status updated              │
   │    CONFIRMED → PROCESSING ──→ (select in dropdown) ───────→ status updated              │
   │    PROCESSING → SHIPPED ────→ (select in dropdown) ───────→ status updated              │
   │    SHIPPED → DELIVERED ─────→ (select in dropdown) ───────→ status + payment update     │
   │    ANY → CANCELLED ─────────→ (select in dropdown) ───────→ status + restock + refund   │
   │                             │                             │                            │
```

---

## 6. Database Interaction Summary

### Tables Read/Written per Operation

| Operation | Tables Read | Tables Written |
|-----------|-------------|----------------|
| **Browse Products** | `products`, `categories`, `inventory`, `product_images` | — |
| **Add to Cart** | `carts`, `products`, `inventory` | `cart_items` (I/U), `inventory` (U) |
| **View Cart** | `carts`, `cart_items`, `products` | — |
| **Apply Coupon** | `coupons` | — (read-only validation) |
| **Place Order** | `carts`, `cart_items`, `products`, `inventory`, `addresses`, `users`, `coupons` | `orders` (I), `order_items` (I), `inventory` (U), `coupons` (U), `payments` (I), `cart_items` (D) |
| **Process Payment** | `orders`, `payments` | `payments` (U), `orders` (U) |
| **Admin List Orders** | `orders`, `order_items`, `users`, `payments` | — |
| **Admin Update Status** | `orders`, `order_items`, `inventory` | `orders` (U), `inventory` (U), `payments` (U) |

### Legend
- **(I)** = INSERT
- **(U)** = UPDATE
- **(D)** = DELETE
- **—** = No write

---

## Inventory State Changes Summary

```
                    ┌──────────────┐
                    │  Available = │
                    │  stock -     │
                    │  reserved    │
                    └──────┬───────┘
                           │
    Add to Cart            │   Place Order         Cancel Order
    ───────────            │   ───────────         ────────────
    reserved  += qty       │   stock    -= qty     stock     += qty
    available -= qty       │   reserved -= qty     sold     -= qty
                           │   sold     += qty     in_stock  = calc
                           │
                    ┌──────▼───────┐
                    │  Remove from  │
                    │  Cart         │
                    │  reserved -=  │
                    │  available += │
                    └──────────────┘
```

---

*Document generated from complete source code analysis of backend and frontend. All flows verified against actual implementation.*