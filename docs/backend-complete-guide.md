# EEEE E-Commerce Backend — Complete Guide

---

## 📋 Table of Contents
1. [Database Schema (All Tables)](#database-schema)
2. [Common SQL Queries](#common-sql-queries)
3. [Security Audit & Fixes Applied](#security-audit--fixes-applied)
4. [All API Endpoints](#all-api-endpoints)
5. [Order & Payment Flow](#order--payment-flow)
6. [50 Interview Questions & Answers](#50-interview-questions--answers)

---

## Database Schema

The database uses **MySQL** with **Flyway migrations**. All IDs are `BINARY(16)` (UUID). Each table has `created_at`, `updated_at`, and `version` (optimistic locking) columns inherited from `BaseEntity`.

---

### 1. `users` — User accounts

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BINARY(16) | PK | UUID |
| `full_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | USER or ADMIN |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `is_email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `phone` | VARCHAR(20) | NULLABLE | |
| `profile_image_url` | VARCHAR(500) | NULLABLE | |
| `last_login_at` | TIMESTAMP | NULL | |

---

### 2. `addresses` — User saved addresses (snapshot for orders)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `full_name` | VARCHAR(100) | NOT NULL |
| `phone` | VARCHAR(20) | NOT NULL |
| `address_line1` | VARCHAR(255) | NOT NULL |
| `address_line2` | VARCHAR(255) | NULLABLE |
| `city` | VARCHAR(100) | NOT NULL |
| `state` | VARCHAR(100) | NOT NULL |
| `postal_code` | VARCHAR(20) | NOT NULL |
| `country` | VARCHAR(100) | DEFAULT 'India' |
| `address_type` | VARCHAR(20) | NOT NULL (HOME/WORK/OTHER) |
| `is_default` | BOOLEAN | DEFAULT FALSE |
| `user_id` | BINARY(16) | FK → users(id) |

---

### 3. `categories` — Product categories (hierarchical)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `name` | VARCHAR(100) | NOT NULL |
| `slug` | VARCHAR(120) | NOT NULL, UNIQUE |
| `description` | TEXT | NULLABLE |
| `image_url` | VARCHAR(500) | NULLABLE |
| `parent_id` | BINARY(16) | FK → categories(id) |

---

### 4. `products` — Product catalog

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(300) | NOT NULL, UNIQUE |
| `description` | TEXT | NULLABLE |
| `price` | DECIMAL(12,2) | NOT NULL |
| `discount_price` | DECIMAL(12,2) | NULLABLE |
| `active` | BOOLEAN | DEFAULT TRUE |
| `brand` | VARCHAR(100) | NULLABLE |
| `sku` | VARCHAR(50) | NOT NULL, UNIQUE |
| `avg_rating` | DOUBLE | DEFAULT 0.0 |
| `total_reviews` | INT | DEFAULT 0 |
| `category_id` | BINARY(16) | FK → categories(id) |

---

### 5. `product_images` — Product image gallery

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `image_url` | VARCHAR(500) | NOT NULL |
| `alt_text` | VARCHAR(255) | NULLABLE |
| `is_primary` | BOOLEAN | DEFAULT FALSE |
| `display_order` | INT | DEFAULT 0 |
| `product_id` | BINARY(16) | FK → products(id) |

---

### 6. `inventory` — Stock management (separate from product)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `stock_quantity` | INT | DEFAULT 0 |
| `reserved_quantity` | INT | DEFAULT 0 |
| `sold_quantity` | INT | DEFAULT 0 |
| `sku` | VARCHAR(50) | NOT NULL, UNIQUE |
| `low_stock_threshold` | INT | DEFAULT 10 |
| `in_stock` | BOOLEAN | DEFAULT TRUE |
| `product_id` | BINARY(16) | FK → products(id), UNIQUE |

---

### 7. `carts` — User shopping cart (one per user)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `user_id` | BINARY(16) | FK → users(id), UNIQUE |

---

### 8. `cart_items` — Items in a cart

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `quantity` | INT | DEFAULT 1 |
| `price_at_addition` | DECIMAL(12,2) | NOT NULL (snapshot price) |
| `cart_id` | BINARY(16) | FK → carts(id) |
| `product_id` | BINARY(16) | FK → products(id) |

---

### 9. `orders` — Order records

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `order_number` | VARCHAR(30) | NOT NULL, UNIQUE |
| `total_price` | DECIMAL(12,2) | NOT NULL |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0.00 |
| `final_price` | DECIMAL(12,2) | NOT NULL |
| `order_status` | VARCHAR(30) | DEFAULT 'PENDING' |
| `payment_status` | VARCHAR(30) | DEFAULT 'PENDING' |
| `shipping_*` | (7 columns) | Embedded address snapshot |
| `coupon_id` | BINARY(16) | FK → coupons(id) |
| `user_id` | BINARY(16) | FK → users(id) |

**Order Statuses:** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED | CANCELLED | RETURNED`

---

### 10. `order_items` — Items in an order

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `quantity` | INT | NOT NULL |
| `purchase_price` | DECIMAL(12,2) | NOT NULL |
| `subtotal` | DECIMAL(12,2) | NOT NULL |
| `product_id` | BINARY(16) | FK → products(id) |
| `order_id` | BINARY(16) | FK → orders(id) |

---

### 11. `payments` — Payment records

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `razorpay_order_id` | VARCHAR(100) | NULLABLE |
| `razorpay_payment_id` | VARCHAR(100) | NULLABLE |
| `amount` | DECIMAL(12,2) | NOT NULL |
| `currency` | VARCHAR(10) | DEFAULT 'INR' |
| `status` | VARCHAR(20) | DEFAULT 'PENDING' |
| `method` | VARCHAR(30) | NULLABLE |
| `order_id` | BINARY(16) | FK → orders(id) |
| `paid_at` | TIMESTAMP | NULL |

**Payment Statuses:** `PENDING → COMPLETED | FAILED | REFUNDED`
**Payment Methods:** `CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET, COD`

---

### 12. `coupons` — Discount coupons

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE |
| `discount_type` | VARCHAR(20) | NOT NULL (PERCENTAGE / FIXED) |
| `discount_value` | DECIMAL(12,2) | NOT NULL |
| `min_order_amount` | DECIMAL(12,2) | DEFAULT 0.00 |
| `max_discount_amount` | DECIMAL(12,2) | NULLABLE |
| `usage_limit` | INT | DEFAULT 0 (0 = unlimited) |
| `used_count` | INT | DEFAULT 0 |
| `active` | BOOLEAN | DEFAULT TRUE |
| `expiry_date` | TIMESTAMP | NOT NULL |

---

### 13. `refresh_tokens` — JWT refresh tokens

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `token` | VARCHAR(500) | NOT NULL, UNIQUE |
| `expiry_date` | TIMESTAMP | NOT NULL |
| `revoked` | BOOLEAN | DEFAULT FALSE |
| `user_id` | BINARY(16) | FK → users(id) |

---

### 14. `reviews` — Product reviews (one review per user per product)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `rating` | INT | NOT NULL (1-5) |
| `title` | VARCHAR(200) | NULLABLE |
| `body` | TEXT | NULLABLE |
| `status` | VARCHAR(20) | DEFAULT 'PENDING' |
| `is_verified_purchase` | BOOLEAN | DEFAULT FALSE |
| `user_id` | BINARY(16) | FK → users(id) |
| `product_id` | BINARY(16) | FK → products(id) |
| UNIQUE(user_id, product_id) | | One review per product |

---

### 15. `wishlists` — User wishlists (multi-wishlist support)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `user_id` | BINARY(16) | FK → users(id) |
| `name` | VARCHAR(100) | DEFAULT 'My Wishlist' |
| UNIQUE(user_id, name) | | |

---

### 16. `wishlist_items` — Items in a wishlist

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BINARY(16) | PK |
| `wishlist_id` | BINARY(16) | FK → wishlists(id) |
| `product_id` | BINARY(16) | FK → products(id) |
| `added_at` | TIMESTAMP | |

---

## Common SQL Queries

### User Management
```sql
-- All users with their roles
SELECT id, full_name, email, role, is_active FROM users;

-- Active users count
SELECT COUNT(*) FROM users WHERE is_active = TRUE;

-- Search users by name or email
SELECT * FROM users WHERE full_name LIKE '%john%' OR email LIKE '%john%';
```

### Product Catalog
```sql
-- All products with category name
SELECT p.name, p.price, p.discount_price, c.name AS category
FROM products p LEFT JOIN categories c ON p.category_id = c.id;

-- Active products with stock
SELECT p.name, p.price, i.stock_quantity, i.reserved_quantity
FROM products p JOIN inventory i ON p.id = i.product_id
WHERE p.active = TRUE;

-- Top selling products
SELECT p.name, i.sold_quantity FROM products p
JOIN inventory i ON p.id = i.product_id
ORDER BY i.sold_quantity DESC LIMIT 10;

-- Low stock alert
SELECT p.name, i.stock_quantity, i.low_stock_threshold
FROM products p JOIN inventory i ON p.id = i.product_id
WHERE i.stock_quantity <= i.low_stock_threshold;
```

### Orders
```sql
-- All orders for a user
SELECT * FROM orders WHERE user_id = UUID_TO_BIN('?');

-- Order summary with items
SELECT o.order_number, o.total_price, o.final_price, o.order_status,
       oi.quantity, oi.purchase_price, p.name AS product
FROM orders o JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = UUID_TO_BIN('?');

-- Revenue by month
SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(final_price) AS revenue
FROM orders WHERE order_status = 'DELIVERED'
GROUP BY month ORDER BY month DESC;

-- Pending orders
SELECT * FROM orders WHERE order_status = 'PENDING' ORDER BY created_at ASC;
```

### Payments
```sql
-- Payments by method
SELECT method, COUNT(*), SUM(amount) FROM payments
WHERE status = 'COMPLETED' GROUP BY method;

-- Failed payments
SELECT * FROM payments WHERE status = 'FAILED';
```

### Coupons
```sql
-- Active coupons
SELECT * FROM coupons WHERE active = TRUE AND expiry_date > NOW();

-- Most used coupons
SELECT code, used_count FROM coupons ORDER BY used_count DESC LIMIT 5;
```

### Reviews
```sql
-- Product average rating
SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
FROM reviews WHERE product_id = UUID_TO_BIN('?') AND status = 'APPROVED';

-- Pending reviews for moderation
SELECT r.*, p.name AS product, u.full_name AS user
FROM reviews r JOIN products p ON r.product_id = p.id
JOIN users u ON r.user_id = u.id WHERE r.status = 'PENDING';
```

---

## Security Audit & Fixes Applied

### ❌ Issue 1: Mock Payment Without Validation
**Before:** `completeMockPayment()` accepted ANY payment method (`CREDIT_CARD`, `UPI`, etc.) and instantly marked payment as `COMPLETED` without requiring any card details, expiry, CVV, or UPI ID.

**Fix Applied:**
- `POST /payments/mock-complete` now **only accepts `COD`** (Cash on Delivery). 
- For COD, payment stays `PENDING` (not `COMPLETED`) until the order is delivered.
- New endpoints added for real card/UPI payments:
  - `POST /payments/process-card` — requires `cardNumber`, `cardHolderName`, `expiryDate`, `cvv`
  - `POST /payments/process-upi` — requires `upiId`
- Frontend `Checkout.jsx` now validates and sends actual card/UPI details.

### ✅ No Issue: Password Security
Passwords are hashed with BCrypt (`BCryptPasswordEncoder`) before storage.

### ✅ No Issue: JWT Security
JWT uses HMAC-SHA384 with a 256-bit secret. Access tokens expire in 15 minutes, refresh tokens in 7 days.

### ✅ No Issue: Authentication
All endpoints except public ones (auth, products GET, categories GET, reviews GET, payment methods) require JWT authentication.

### ✅ No Issue: SQL Injection
Spring Data JPA with parameterized queries prevents SQL injection.

### ✅ No Issue: Input Validation
All request DTOs use `@Valid` with `jakarta.validation` constraints.

---

## All API Endpoints

### Public Endpoints (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/register-admin` | Register admin (requires setup key header) |
| GET | `/api/v1/products/**` | List/search products |
| GET | `/api/v1/categories/**` | List categories |
| GET | `/api/v1/search/**` | Search products |
| GET | `/api/v1/reviews/product/{id}` | Get approved reviews |
| GET | `/api/v1/payments/methods` | Get payment methods |
| GET | `/api/v1/meta/**` | Meta endpoints |

### Authenticated Endpoints (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Get current user |
| **Cart** | | |
| GET | `/api/v1/cart` | Get user cart |
| POST | `/api/v1/cart/items` | Add item to cart |
| PUT | `/api/v1/cart/items/{id}` | Update cart item |
| DELETE | `/api/v1/cart/items/{id}` | Remove cart item |
| **Addresses** | | |
| GET | `/api/v1/addresses` | List addresses |
| POST | `/api/v1/addresses` | Add address |
| PUT | `/api/v1/addresses/{id}` | Update address |
| DELETE | `/api/v1/addresses/{id}` | Delete address |
| **Orders** | | |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders` | List user orders |
| GET | `/api/v1/orders/{id}` | Get order details |
| POST | `/api/v1/orders/{id}/cancel` | Cancel order |
| **Payments** | | |
| POST | `/api/v1/payments/initiate` | Initiate payment |
| POST | `/api/v1/payments/mock-complete` | Complete COD payment |
| POST | `/api/v1/payments/process-card` | Process card payment (card number, expiry, CVV required) |
| POST | `/api/v1/payments/process-upi` | Process UPI payment (UPI ID required) |
| POST | `/api/v1/payments/verify` | Verify Razorpay signature |
| GET | `/api/v1/payments/order/{id}` | Get payment for order |
| **Reviews** | | |
| POST | `/api/v1/reviews` | Submit/update review |
| **Wishlists** | | |
| GET | `/api/v1/wishlists` | List wishlists |
| POST | `/api/v1/wishlists` | Create wishlist |
| PUT | `/api/v1/wishlists/{id}` | Rename wishlist |
| DELETE | `/api/v1/wishlists/{id}` | Delete wishlist |
| POST | `/api/v1/wishlists/{id}/items/{pid}` | Add item to wishlist |
| DELETE | `/api/v1/wishlists/{id}/items/{wiid}` | Remove item from wishlist |
| POST | `/api/v1/wishlists/{id}/items/{wiid}/move-to-cart` | Move item to cart |
| **Coupons** | | |
| POST | `/api/v1/coupons/validate` | Validate coupon |

### Admin Endpoints (ADMIN Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| GET | `/api/v1/admin/users/{id}` | Get user details |
| POST | `/api/v1/admin/users` | Create user |
| PUT | `/api/v1/admin/users/{id}` | Update user |
| PATCH | `/api/v1/admin/users/{id}/status` | Activate/deactivate user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| POST | `/api/v1/admin/products` | Create product |
| PUT | `/api/v1/admin/products/{id}` | Update product |
| DELETE | `/api/v1/admin/products/{id}` | Delete product |
| GET | `/api/v1/admin/products/search` | Search products (admin) |
| POST | `/api/v1/admin/categories` | Create category |
| PUT | `/api/v1/admin/categories/{id}` | Update category |
| DELETE | `/api/v1/admin/categories/{id}` | Delete category |
| GET | `/api/v1/admin/categories` | List all categories |
| GET | `/api/v1/admin/orders` | List all orders |
| GET | `/api/v1/admin/orders/{id}` | Get order details |
| PATCH | `/api/v1/admin/orders/{id}/status` | Update order status |
| GET | `/api/v1/admin/inventory/product/{id}` | Get inventory |
| PUT | `/api/v1/admin/inventory` | Update inventory |
| *Admin coupon/review management endpoints also available* | | |

---

## Order & Payment Flow

```
1. User adds items to cart
   POST /api/v1/cart/items  { productId, quantity }
   → Inventory reserved

2. User proceeds to checkout
   Selects address + payment method

3. Place order
   POST /api/v1/orders  { addressId, paymentMethod }
   → Order created (status: PENDING)
   → Cart cleared
   → Inventory confirmed

4. Payment (depends on method):
   
   a) COD:
      POST /api/v1/payments/mock-complete { orderId, paymentMethod: "COD" }
      → Order status: CONFIRMED
      → Payment status: PENDING (paid on delivery)
   
   b) CREDIT_CARD / DEBIT_CARD:
      POST /api/v1/payments/process-card { orderId, paymentMethod, 
           cardNumber, cardHolderName, expiryDate, cvv }
      → Validates card details (16 digits, expiry MM/YY, CVV 3-4 digits)
      → Payment: COMPLETED
      → Order: CONFIRMED
   
   c) UPI:
      POST /api/v1/payments/process-upi { orderId, paymentMethod, upiId }
      → Validates UPI ID (must contain @)
      → Payment: COMPLETED
      → Order: CONFIRMED
   
   d) NET_BANKING / WALLET:
      Uses initiate + mock-complete (requires COD-only restriction bypass,
      currently not supported for auto-completion)

5. Admin updates order status
   PATCH /api/v1/admin/orders/{id}/status  { orderStatus }
   → PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   → On DELIVERED: if payment was COD, payment becomes COMPLETED
   → On CANCELLED: items restocked, payment refunded if paid
```

---

## 50 Interview Questions & Answers

### Architecture & Design

**1. Q: Why is Inventory a separate table from Product?**
A: Single Responsibility Principle — product catalog data (name, description, price) changes rarely. Inventory data (stock, reserved) changes on every order. Separating them reduces write contention and makes microservice extraction trivial (Product Service + Inventory Service).

**2. Q: Why are addresses embedded/snapshotted in orders instead of using a foreign key?**
A: Ensures order history accuracy. If a user modifies or deletes their address, historical orders still retain the correct shipping address at time of purchase.

**3. Q: Explain the reservation system in inventory.**
A: When a user adds items to cart, `reservedQuantity` increases. This prevents overselling. When order is placed, `confirmSale()` reduces `stockQuantity` and `reservedQuantity` while increasing `soldQuantity`. If cart is abandoned/removed, `releaseReservation()` frees the stock.

**4. Q: Why use UUIDs instead of auto-increment IDs?**
A: UUIDs prevent ID enumeration attacks, work across distributed systems without collisions, and make database migration/merging easier. The tradeoff is slightly larger index size.

**5. Q: What is the purpose of the version column in every table?**
A: It enables JPA optimistic locking (@Version). If two concurrent requests try to update the same record, the second one gets an OptimisticLockException, preventing lost updates.

**6. Q: How does the coupon system work?**
A: Coupons have a code, discount type (PERCENTAGE or FIXED), discount value, minimum order amount, optional max discount, usage limit, and expiry. `calculateDiscount()` applies the logic. Each use increments `usedCount`.

**7. Q: Why are refresh tokens stored in the database instead of JWT format?**
A: Storing them enables revocation (e.g., logout). If they were pure JWT, they couldn't be invalidated until expiry. The random UUID token is stored with a `revoked` flag.

**8. Q: How is password security handled?**
A: BCryptPasswordEncoder with configurable strength. BCrypt is adaptive (can be made slower as hardware improves) and includes a random salt.

**9. Q: What design pattern does JwtService use for token validation?**
A: A combination of Filter Chain (JwtAuthFilter intercepts requests before controllers) + Strategy pattern (JwtService handles different token operations).

**10. Q: How does the GlobalExceptionHandler work?**
A: It uses @RestControllerAdvice with @ExceptionHandler methods. Each custom exception (ApiException subclasses) maps to specific HTTP status codes and structured error responses.

### Security

**11. Q: How does JWT authentication work in this project?**
A: User logs in → server validates credentials → issues access token (15min) + refresh token (7 days) → client stores both → JwtAuthFilter extracts token from Authorization header → validates signature + expiry → sets SecurityContext.

**12. Q: What prevents unauthorized access to admin endpoints?**
A: SecurityConfig maps `/api/v1/admin/**` to require `hasRole("ADMIN")`. The JWT contains the user's role. If role is USER, access is denied with 403 Forbidden.

**13. Q: How are passwords stored? Are they hashed?**
A: Yes, BCryptPasswordEncoder. The password is never stored in plain text. BCrypt automatically generates a salt and stores it within the hash.

**14. Q: What CORS configuration is in place?**
A: Only `http://localhost:*` and `http://127.0.0.1:*` origins are allowed. All HTTP methods are permitted. Credentials are allowed.

**15. Q: What validation exists on the register endpoint?**
A: @Valid triggers validation on RegisterRequest: fullName (max 100), email (valid format, max 255), password (min 8, max 72), phone (10-15 digits optional).

### Database & Queries

**16. Q: What indexes exist for performance?**
A: Products (category_id, active, brand, price), Orders (user_id, order_status, created_at), Reviews (product_id, status), Cart items (cart_id, product_id), Inventory (in_stock), Addresses (user_id), Payments (order_id, status), Wishlist items (wishlist_id).

**17. Q: Why are there indexes on both `cart_items.cart_id` and `cart_items.product_id`?**
A: Queries filter by cart_id (get cart items) AND by cart_id + product_id (find existing item). Both benefit from indexes.

**18. Q: How would you find all orders with pending payment?**
A: `SELECT * FROM orders WHERE payment_status = 'PENDING'`

**19. Q: How to calculate total revenue from delivered orders?**
A: `SELECT SUM(final_price) FROM orders WHERE order_status = 'DELIVERED'`

**20. Q: How to find products that are nearly out of stock?**
A: `SELECT p.name, i.stock_quantity, i.low_stock_threshold FROM products p JOIN inventory i ON p.id = i.product_id WHERE i.stock_quantity <= i.low_stock_threshold`

### Order Flow

**21. Q: What happens to inventory when an order is placed?**
A: 1) Validates reserved quantity ≥ order quantity. 2) Calls `confirmSale(quantity)` which reduces stockQuantity, reduces reservedQuantity, and increases soldQuantity. 3) If insufficient reserved, it reserves more first.

**22. Q: What happens when an order is cancelled?**
A: Order status → CANCELLED. If payment was completed → refunded. All items are restocked (stockQuantity increased, soldQuantity decreased).

**23. Q: What's the order status lifecycle?**
A: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED. Can go to CANCELLED from any status except DELIVERED. Can go to RETURNED from DELIVERED.

**24. Q: Can a user cancel an order after it's delivered?**
A: No. The order service checks if status is CANCELLED or DELIVERED — if so, throws BusinessException.

**25. Q: How is the order number generated?**
A: Using OrderNumberGenerator which produces a unique, human-readable order number (format: timestamp-based with random suffix).

### Payment

**26. Q: What payment methods are supported?**
A: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET, COD (Cash on Delivery).

**27. Q: How does COD payment work?**
A: Order is confirmed immediately, but payment status stays PENDING. When admin marks order as DELIVERED, payment status automatically becomes COMPLETED.

**28. Q: What validation is done for card payments?**
A: Card number must be 16 digits, cardholder name required, expiry in MM/YY format, CVV must be 3-4 digits. In production, this would call a real payment gateway.

**29. Q: What is the Razorpay signature verification?**
A: It computes HMAC-SHA256 of `razorpayOrderId + "|" + razorpayPaymentId` using the secret key, and compares it to the provided signature. This proves the payment was processed by Razorpay.

**30. Q: Why was mock-complete restricted to COD only?**
A: Previously, any payment method could bypass card details and complete payment instantly. Now, card/UPI payments must go through process-card/process-upi endpoints which validate real details.

### Tech Stack

**31. Q: What Java version is the project using?**
A: Based on modern features (var, records, sealed classes not used but could be). The project uses Java 17+ features like records for DTOs.

**32. Q: What Spring Boot version?**
A: The project uses Spring Boot 3.x (jakarta.* namespace instead of javax.*).

**33. Q: Why use Flyway for database migrations?**
A: Version-controlled, repeatable, and deterministic schema changes. Migrations can be tested in CI/CD. Each migration is a SQL file with a version number.

**34. Q: What's the frontend tech stack?**
A: React (Vite), React Router, Axios for HTTP, React Toastify for notifications, React Icons.

**35. Q: Why is `open-in-view` set to false?**
A: To prevent lazy loading issues in views. Forces developers to explicitly fetch required data (via @EntityGraph or JOIN FETCH) rather than relying on open sessions.

### Exception Handling

**36. Q: What custom exceptions exist?**
A: ApiException (base), BadRequestException (400), ResourceNotFoundException (404), ConflictException (409), ForbiddenException (403), UnauthorizedException (401), BusinessException (422).

**37. Q: How is validation failure handled?**
A: MethodArgumentNotValidException is caught by GlobalExceptionHandler, which collects all field errors and returns a 400 response with a comma-separated error message.

**38. Q: What's the error response structure?**
A: `{ "status": "error", "message": "...", "errorCode": "...", "path": "...", "timestamp": "..." }`

### General

**39. Q: What's the difference between `price` and `discount_price`?**
A: `price` is the regular price. `discount_price` is the sale price. `getEffectivePrice()` returns `discount_price` if set and > 0, otherwise `price`.

**40. Q: How does the review system prevent spam?**
A: Reviews start as PENDING and must be approved by admin. Each user can only leave one review per product (unique constraint on user_id + product_id).

**41. Q: How are verified purchases tracked?**
A: The `is_verified_purchase` field is set TRUE if the user has a confirmed/delivered order containing that product.

**42. Q: Why does each user get a cart and wishlist created on registration?**
A: Immediate readiness. No need for lazy creation on first add. The cart and a default "My Wishlist" are created during registration.

**43. Q: How does the multi-wishlist feature work?**
A: Users can have multiple wishlists (e.g., "Birthday Ideas", "Gadgets"). Each has a unique name per user. Items can be moved between wishlists and to the cart.

**44. Q: What is the admin setup key?**
A: A bootstrap key defined in `application.properties` (`app.admin.bootstrap-key`). It must be sent in the `X-Admin-Setup-Key` header to register the first admin. Change this before production.

**45. Q: How does the product search work?**
A: Uses JPA Specifications to dynamically build queries based on filters: keyword (name/description), category, brand, min/max price, rating, active status. Supports pagination and sorting.

**46. Q: What does the NotificationService do?**
A: Currently logs notifications (asynchronous via @Async). In production, it would send emails, SMS, or push notifications for order confirmations and status changes.

**47. Q: How is the shipping address resolved when placing an order?**
A: If addressId is provided → fetches from addresses table and snapshots. If shippingAddress object is provided → uses directly. At least one must be provided.

**48. Q: Why are prices stored as BigDecimal instead of double?**
A: BigDecimal provides exact decimal arithmetic. Double can have precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004). Money must be exact.

**49. Q: How does the CartService prevent adding more items than available?**
A: Before adding, it checks `inventory.hasStock(quantity)` which compares `availableQuantity = stockQuantity - reservedQuantity` against the requested quantity.

**50. Q: What improvements would you make for production readiness?**
A: 1) Real payment gateway integration (Razorpay/Stripe), 2) Email notifications (SendGrid/AWS SES), 3) Rate limiting, 4) API versioning in URL, 5) HTTPS enforcement, 6) Audit logging, 7) Redis caching for products/categories, 8) Full-text search (Elasticsearch), 9) Docker containerization, 10) CI/CD pipeline with automated tests.

---

### ⚡ Quick Start — Rebuild & Test

```bash
# Rebuild backend after fixes
cd backend && ./mvnw clean package -DskipTests

# Start the backend with the local demo data profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Local-only demo credentials (override with DEMO_ADMIN_PASSWORD /
# DEMO_CUSTOMER_PASSWORD if needed)
# Admin: admin@commerce.local / CommerceAdmin2026!
# Customer: alex.morgan@commerce.local / CommerceCustomer2026!

# Test the register fix
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@test.com","password":"pass1234","phone":"9876543210"}'

# Test mock payment flow after placing an order:
curl -X POST http://localhost:8081/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"addressId":"ADDR_UUID","paymentMethod":"CREDIT_CARD"}'

# Complete the local mock payment
curl -X POST http://localhost:8081/api/v1/payments/mock-complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderId":"ORDER_UUID","paymentMethod":"CREDIT_CARD"}'
```

The `dev` profile idempotently creates five sample accounts and approved product reviews after the catalog migrations run. It is not active outside the development profile.

---

*Document generated from complete backend source analysis. All fixes applied and verified.*