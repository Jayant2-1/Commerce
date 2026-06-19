# 🛒 EEEE E-Commerce Platform — Complete Developer & Interview Guide

> **A comprehensive document with flowcharts, entity relationship diagrams, detailed data flows,  
> architecture decisions explained in simple terms, and 50 interview questions with full answers.**

---

## 📋 Table of Contents

1. [Project Overview (Simple Terms)](#1-project-overview)
2. [Technology Stack — Why These Tools?](#2-technology-stack)
3. [Entity Relationship Diagrams (ERD)](#3-entity-relationship-diagrams)
4. [How Data Flows — Complete Request Lifecycle](#4-how-data-flows)
5. [Authentication Deep Dive — Registration, Login, Tokens](#5-authentication-deep-dive)
6. [Product Flow — Browse, Search, Create](#6-product-flow)
7. [Cart & Inventory Flow — Reserve & Confirm Pattern](#7-cart--inventory-flow)
8. [Order Flow — The Heart of the System](#8-order-flow)
9. [Payment Flow — Razorpay, Mock, Verify](#9-payment-flow)
10. [Review Flow — Verified Purchase & Moderation](#10-review-flow)
11. [Wishlist Flow — Multiple Wishlists](#11-wishlist-flow)
12. [Admin Flow — What Admins Can Do](#12-admin-flow)
13. [Security Features Explained](#13-security-features)
14. [Database Tables & Relationships](#14-database-tables)
15. [50 Interview Questions With Detailed Answers](#15-50-interview-questions-with-detailed-answers)
16. [Architecture Decisions — Why This Not That](#16-architecture-decisions)

---

## 1. Project Overview (Simple Terms)

### What is this project?
This is an **e-commerce website** — like Amazon or Flipkart — but built from scratch. Customers can:
- Browse products and search for items
- Add items to a shopping cart
- Place orders with coupon discounts
- Pay using credit card, UPI, or cash on delivery
- Write reviews for products they bought
- Save items to wishlists
- Track their order status

**Admins** can:
- Add/edit/delete products
- Manage categories
- View all orders and update their status
- Manage users (activate/deactivate)
- Moderate reviews (approve/reject)
- Create coupons
- Manage inventory stock

### Who uses this system?
```
  CUSTOMER (shops)                    ADMIN (manages)
      │                                    │
      ▼                                    ▼
  ┌─────────────────────────────────────────────────┐
  │           EEEE E-Commerce Platform              │
  │  Frontend (React) ←→ Backend (Spring Boot) ←→ DB │
  └─────────────────────────────────────────────────┘
```

---

## 2. Technology Stack — Why These Tools?

| Technology | What it does | Why THIS one? |
|------------|-------------|---------------|
| **Spring Boot** (Java) | Backend server — handles API requests, business logic, database | Industry standard for Java web apps. Auto-configuration saves time. Battle-tested for enterprise. |
| **React** (JavaScript) | Frontend — builds the user interface | Most popular UI library. Fast rendering with Virtual DOM. Large ecosystem. |
| **Vite** | Frontend build tool | Much faster than Create React App. Hot Module Replacement in milliseconds. |
| **MySQL** | Database — stores all data | Reliable, mature, ACID compliant for financial transactions. Free. |
| **Flyway** | Database migration tool | Version controls database schema. Just like Git for your database. |
| **JWT** | Authentication tokens | Stateless — no session to store on server. Scales horizontally easily. |
| **BCrypt** | Password hashing | Built-in salt (random data added to each password). Adaptive — can be made slower as computers get faster. |
| **Razorpay** | Payment gateway | Popular in India. Easy API. Supports UPI, cards, net banking. |
| **Axios** | HTTP client for frontend | Better than fetch() — auto JSON parsing, request/response interceptors, easier error handling. |
| **Lombok** | Reduces boilerplate code | `@Getter`, `@Builder`, `@RequiredArgsConstructor` — saves hundreds of lines. |

### Why NOT other options?

**Why Spring Boot and not Node.js/Express?**
- Spring Boot gives you type safety, built-in transactions, mature ORM (Hibernate/JPA), and enterprise features out of the box
- For an app handling money (orders, payments), Java's strong typing prevents many runtime errors

**Why JWT and not session-based auth?**
- JWT = no server-side session storage. If you have 10 servers, any server can verify any user's token
- Session-based = you need sticky sessions or a shared Redis cache. More infrastructure complexity

**Why UUID for IDs and not auto-increment numbers?**
- UUIDs can't be guessed. User ID `1` means you're the first user — bad for privacy
- UUIDs can be generated offline (before saving to database)
- Downside: UUIDs are larger (16 bytes vs 4 bytes) and slightly slower for indexing

**Why BCrypt and not SHA-256?**
- SHA-256 is FAST — a GPU can try billions of passwords per second
- BCrypt is SLOW by design — it takes ~100ms per check, making brute force impractical
- BCrypt automatically generates a unique random salt per password. SHA-256 needs manual salt handling

---

## 3. Entity Relationship Diagrams (ERD)

### What is an Entity?
An "entity" is just a fancy word for a **table in the database** — like a spreadsheet. Each row is one record (one user, one product, etc.).

### Complete Entity Relationship Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                            │
│                                                                                 │
│  ┌──────────┐     ┌───────────┐     ┌──────────────────┐                       │
│  │  USERS   │     │ CARTS     │     │   CART_ITEMS     │                       │
│  ├──────────┤     ├───────────┤     ├──────────────────┤                       │
│  │ id (PK)  │◄────│ user_id   │────►│ cart_id          │                       │
│  │ email    │  1:1│ id (PK)   │  1:*│ product_id       │◄───────┐               │
│  │ password │     └───────────┘     │ quantity         │        │               │
│  │ role     │                       │ price_at_addition│        │               │
│  │ is_active│                       └──────────────────┘        │               │
│  └────┬─────┘                                                    │               │
│       │                                                          │               │
│       │  ┌──────────────┐     ┌─────────────────┐               │               │
│       ├──│  ADDRESSES   │     │   PRODUCTS      │               │               │
│       │  ├──────────────┤     ├─────────────────┤               │               │
│       │  │ user_id      │     │ id (PK)         │◄──────────────┘               │
│       │  │ full_name    │     │ name            │                              │
│       │  │ phone        │     │ slug (unique)   │                              │
│       │  │ city         │     │ price           │                              │
│       │  │ is_default   │     │ discount_price  │                              │
│       │  └──────────────┘     │ sku (unique)    │                              │
│       │                       │ avg_rating      │                              │
│       │  ┌────────────────┐   │ category_id     │◄────┐                        │
│       ├──│  REFRESH_TOKENS│   └────────┬────────┘     │                        │
│       │  ├────────────────┤            │              │                        │
│       │  │ user_id        │            │              │                        │
│       │  │ token (unique) │            │  ┌──────────────┐                     │
│       │  │ expiry_date    │            ├──│ CATEGORIES    │                     │
│       │  │ revoked        │            │  ├──────────────┤                     │
│       │  └────────────────┘            │  │ id (PK)      │                     │
│       │                                │  │ name         │                     │
│       │  ┌──────────────┐              │  │ slug (unique)│                     │
│       ├──│  WISHLISTS   │              │  │ parent_id ───┤ (self-reference)    │
│       │  ├──────────────┤              │  └──────────────┘                     │
│       │  │ user_id      │     ┌────────┴────────────┐                         │
│       │  │ name         │     │ INVENTORY           │                         │
│       │  └──────┬───────┘     ├─────────────────────┤                         │
│       │         │             │ product_id (unique)  │                         │
│       │         │             │ stock_quantity       │                         │
│       │  ┌──────┴───────┐    │ reserved_quantity    │                         │
│       │  │ WISHLIST_ITEMS│   │ sold_quantity        │                         │
│       │  ├──────────────┤    │ in_stock             │                         │
│       │  │ wishlist_id  │    └──────────────────────┘                         │
│       │  │ product_id   │                                                     │
│       │  │ added_at     │    ┌──────────────────┐                             │
│       │  └──────────────┘    │ PRODUCT_IMAGES    │                            │
│       │                      ├──────────────────┤                             │
│       │  ┌────────────┐      │ product_id       │                             │
│       ├──│  ORDERS    │      │ image_url        │                             │
│       │  ├────────────┤      │ is_primary       │                             │
│       │  │ user_id    │      │ display_order    │                             │
│       │  │ order_number│     └──────────────────┘                             │
│       │  │ total_price│                                                       │
│       │  │ final_price│     ┌──────────────────┐                              │
│       │  │ order_status│    │ ORDER_ITEMS       │                             │
│       │  │ payment_stat│    ├──────────────────┤                              │
│       │  │ coupon_id ──┼──┐ │ order_id         │                              │
│       │  └──────┬──────┘  │ │ product_id       │                              │
│       │         │         │ │ quantity         │                              │
│       │         │  ┌──────┴┴───────┐          │                              │
│       │         │  │ COUPONS      │           │                              │
│       │         │  ├──────────────┤           │                              │
│       │         │  │ id (PK)      │           │                              │
│       │         └──│ code (unique)│           │                              │
│       │            │ discount_type│           │                              │
│       │            │ discount_val │           │                              │
│       │            │ min_order_amt│           │                              │
│       │            │ expiry_date  │           │                              │
│       │            └──────────────┘           │                              │
│       │                                       │                              │
│       │  ┌────────────────────┐               │                              │
│       └──│ REVIEWS            │               │                              │
│          ├────────────────────┤               │                              │
│          │ user_id            │               │                              │
│          │ product_id         │               │                              │
│          │ rating             │               │                              │
│          │ title              │               │                              │
│          │ status (PENDING)   │               │                              │
│          │ is_verified_purch  │               │                              │
│          └────────────────────┘               │                              │
│                                               │                              │
│  ┌────────────────────┐                       │                              │
│  │ PAYMENTS           │                       │                              │
│  ├────────────────────┤                       │                              │
│  │ order_id (unique)  │◄──────────────────────┘                              │
│  │ amount             │                                                      │
│  │ status             │                                                      │
│  │ method             │                                                      │
│  │ razorpay_order_id  │                                                      │
│  │ razorpay_paymnt_id │                                                      │
│  └────────────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

LEGEND:
PK  = Primary Key (unique identifier for each row)
FK  = Foreign Key (links to another table's primary key)
1:1 = One-to-One relationship (exactly one match)
1:* = One-to-Many relationship (one record can have many children)
*:* = Many-to-Many (usually needs a junction table)
```

### Simple Explanation of Each Relationship

| Relationship | Meaning | Example |
|-------------|---------|---------|
| **User → Cart** (1:1) | Each user has exactly ONE shopping cart | John signs up → a cart is automatically created for him |
| **User → Addresses** (1:*) | One user can have MULTIPLE saved addresses | John has Home address + Work address |
| **User → Orders** (1:*) | One user can place MANY orders | John orders today + orders again next week |
| **User → Reviews** (1:*) | One user can write MANY reviews | John reviews Shirt + reviews Shoes |
| **Cart → CartItems** (1:*) | One cart can have MANY items | John's cart has Shirt + Jeans + Shoes |
| **Product → Inventory** (1:1) | Each product has EXACTLY one stock record | One inventory row tracks Shirt's stock |
| **Product → ProductImages** (1:*) | One product can have MANY photos | Shirt has front view + back view + side view |
| **Product → Reviews** (1:*) | One product can have MANY reviews | Shirt has 50 reviews from different users |
| **Product → Category** (*:1) | Many products belong to ONE category | Shirt + Jeans both belong to "Clothing" |
| **Category → Category** (self) | Categories can have PARENT categories | "Clothing" is parent, "Men's Shirts" is child |
| **Order → OrderItems** (1:*) | One order has MULTIPLE items | Order contains Shirt + Jeans |
| **Order → Payment** (1:1) | One order has EXACTLY one payment | Each order has one payment record |
| **Order → Coupon** (*:1) | Many orders can use ONE coupon | 100 orders all used coupon "SAVE20" |
| **User → RefreshToken** (1:*) | One user can have MANY refresh tokens | Old tokens get revoked, new ones issued |

### Why This Architecture? (Key Design Decisions)

**Q: Why is ShippingAddress embedded inside Order instead of being a separate table?**
- **Answer**: Think about it — what if John moves to a new address and updates it? If Order just referenced John's address with a foreign key, the order history would change too! By storing a **snapshot** (copy) of the address inside the order at the time of purchase, the order record is **permanent and accurate forever**, even if John changes his address later.

**Q: Why does CartItem store `priceAtAddition` separately from Product's current price?**
- **Answer**: Imagine you add a shirt to cart at ₹1000. The next day, the price drops to ₹800. When you checkout, which price should you pay? The price AT THE TIME you added it to cart, because that's what you agreed to. `priceAtAddition` is a **snapshot** that preserves the price at that moment.

**Q: Why does Inventory have both `stockQuantity` and `reservedQuantity`?**
- **Answer**: Two-phase locking! When someone adds an item to cart, we **reserve** it (increase reservedQuantity). When they checkout, we **confirm** the sale (decrease stockQuantity and reservedQuantity). This prevents a problem called "overselling" — imagine 10 people all add the last item to their cart simultaneously. Without reservations, all 10 could checkout, but only 1 would actually get it!

---

## 4. How Data Flows — Complete Request Lifecycle

### The Journey of a Single Request — Step by Step

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              COMPLETE JOURNEY: From Button Click to Database and Back              │
│                                                                                    │
│  Let's trace what happens when a user clicks "Add to Cart" button                  │
│                                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: FRONTEND (Browser)                                                │   │
│  │                                                                             │   │
│  │  User clicks "Add to Cart" button on ProductDetail.jsx page                │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  JavaScript function fires:                                                 │   │
│  │    cartApi.addItem({ productId: "abc-123", quantity: 1 })                  │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  api/cart.js → export const cartApi = {                                    │   │
│  │    addItem: (data) => axios.post('/cart/items', data)                       │   │
│  │  }                                                                          │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  Axios Instance (api/axios.js)                                              │   │
│  │    Step 1: REQUEST INTERCEPTOR                                              │   │
│  │      └─ Reads accessToken from localStorage                                │   │
│  │      └─ Adds header: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...        │   │
│  │    Step 2: Sends HTTP Request                                               │   │
│  │      Method: POST                                                          │   │
│  │      URL: http://localhost:8081/api/v1/cart/items                          │   │
│  │      Headers: Content-Type: application/json                               │   │
│  │               Authorization: Bearer <token>                                │   │
│  │      Body: { "productId": "abc-123", "quantity": 1 }                      │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                            │
│  ═══════════════ NETWORK ═════════════╪═══════════════════════════════════════════  │
│                                       ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: SPRING SECURITY FILTERS                                          │   │
│  │                                                                             │   │
│  │  Request arrives at http://localhost:8081                                   │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  CORS Filter (SecurityConfig.java line 87-97)                              │   │
│  │    └─ Checks: Is origin "http://localhost:3001" allowed?                   │   │
│  │    └─ YES → adds CORS headers to response (Access-Control-Allow-Origin)    │   │
│  │    └─ If not allowed → 403 Forbidden (CORS error in browser)               │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  JwtAuthFilter.java                                                         │   │
│  │    └─ Extracts "Bearer <token>" from Authorization header                  │   │
│  │    └─ If no token → passes through (might get 401 later)                   │   │
│  │    └─ If token exists:                                                     │   │
│  │       ├─ Calls JwtService.extractUsername(token)                           │   │
│  │       │  └─ Parses JWT → extracts "sub" claim = "john@email.com"           │   │
│  │       ├─ Calls CustomUserDetailsService.loadUserByUsername("john@email.com")│   │
│  │       │  └─ UserRepository.findByEmailIgnoreCase("john@email.com")          │   │
│  │       │  └─ Returns AppUserPrincipal (id, email, password, active, role)   │   │
│  │       ├─ Calls JwtService.isTokenValid(token, userDetails)                  │   │
│  │       │  └─ Checks: username matches AND token not expired                 │   │
│  │       └─ If valid → Sets SecurityContext with authentication               │   │
│  │          └─ Now Spring knows: "This request is from USER John (id=xxx)"    │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │  Authorization Filter (SecurityConfig.java line 45-64)                     │   │
│  │    └─ Path: POST /api/v1/cart/items                                        │   │
│  │    └─ Check: Does it match any public pattern? NO                          │   │
│  │    └─ Check: Is it /admin/**? NO                                           │   │
│  │    └─ Result: .anyRequest().authenticated() → YES, must be authenticated │   │
│  │    └─ If not authenticated → 401 Unauthorized                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                            │
│                                       ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: CONTROLLER                                                       │   │
│  │                                                                             │   │
│  │  CartController.java                                                        │   │
│  │    @PostMapping("/items")                                                   │   │
│  │    public ResponseEntity<ApiResponse<CartResponse>> addItem(                │   │
│  │        @Valid @RequestBody AddCartItemRequest cartItemRequest,             │   │
│  │        HttpServletRequest servletRequest                                    │   │
│  │    ) {                                                                      │   │
│  │       │                                                                     │   │
│  │       ▼                                                                     │   │
│  │    1. @Valid → Validates AddCartItemRequest:                                │   │
│  │       └─ productId: must not be null                                        │   │
│  │       └─ quantity: must be > 0                                              │   │
│  │       └─ If invalid → 400 Bad Request with error details                   │   │
│  │                                                                             │   │
│  │    2. UUID userId = SecurityUtils.currentUserId();                          │   │
│  │       └─ Gets the authenticated user's ID from SecurityContext              │   │
│  │       └─ This was set by JwtAuthFilter earlier                             │   │
│  │                                                                             │   │
│  │    3. CartResponse response = cartService.addItem(userId, request);         │   │
│  │       └─ Calls the Service Layer                                            │   │
│  │                                                                             │   │
│  │    4. return ResponseEntity.ok(                                             │   │
│  │         ApiResponse.success("Item added", response, uri)                    │   │
│  │       );                                                                    │   │
│  │       └─ Wraps response in standard format:                                │   │
│  │          { "success": true, "message": "...", "data": {...},               │   │
│  │            "errorCode": null, "timestamp": "...", "path": "..." }           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                            │
│                                       ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: SERVICE (Business Logic)                                         │   │
│  │                                                                             │   │
│  │  CartService.java - addItem()                                               │   │
│  │    @Transactional  ← IMPORTANT: This means ALL or NOTHING                   │   │
│  │       │            If any step fails, EVERYTHING rolls back                 │   │
│  │       ▼                                                                     │   │
│  │    Step 1: Validate quantity > 0                                            │   │
│  │    └─ if (request.quantity() <= 0) → throw BadRequestException             │   │
│  │                                                                             │   │
│  │    Step 2: Find or create cart                                              │   │
│  │    └─ cartRepository.findByUserId(userId)                                   │   │
│  │       .orElseGet(() → createCartForUser(userId))                           │   │
│  │                                                                             │   │
│  │    Step 3: Find product by ID                                               │   │
│  │    └─ productRepository.findById(request.productId())                       │   │
│  │       → If not found → throw ResourceNotFoundException (404)                │   │
│  │                                                                             │   │
│  │    Step 4: Check if product is active (not disabled)                        │   │
│  │    └─ if (!product.getActive()) → BusinessException (422)                  │   │
│  │                                                                             │   │
│  │    Step 5: Check stock availability                                         │   │
│  │    └─ Inventory inventory = inventoryRepository.findByProductId(productId) │   │
│  │    └─ if (!inventory.hasStock(quantity)) → BusinessException               │   │
│  │       │  "Insufficient stock for product"                                   │   │
│  │       ▼                                                                     │   │
│  │    Step 6: Find existing cart item or create new                           │   │
│  │    └─ cartItemRepository.findByCartIdAndProductId(cartId, productId)        │   │
│  │       ├─ If found: item.setQuantity(item.getQuantity() + quantity)          │   │
│  │       └─ If not found: Create new CartItem with priceAtAddition            │   │
│  │                                                                             │   │
│  │    Step 7: Reserve inventory quantity                                       │   │
│  │    └─ inventory.reserve(quantity)  → reservedQuantity += quantity           │   │
│  │    └─ inventoryRepository.save(inventory)  → UPDATE database                │   │
│  │                                                                             │   │
│  │    Step 8: Save cart item in database                                       │   │
│  │    └─ cartItemRepository.save(item)                                         │   │
│  │                                                                             │   │
│  │    Step 9: Convert entity to response DTO and return                        │   │
│  │    └─ return cartMapper.toResponse(reloadCart(userId))                      │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                            │
│                                       ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: MAPPER (Entity → DTO)                                           │   │
│  │                                                                             │   │
│  │  CartMapper.toResponse(Cart cart):                                          │   │
│  │    └─ For each CartItem in cart:                                            │   │
│  │       ├─ Calls productMapper.toResponse(item.getProduct())                  │   │
│  │       │  └─ Maps Product → ProductResponse (includes inventory, images)     │   │
│  │       └─ Creates CartItemResponse(id, product, quantity,                    │   │
│  │                              priceAtAddition, total)                        │   │
│  │    └─ Calculates subtotal: SUM of all (price × quantity)                   │   │
│  │    └─ Returns CartResponse(id, userId, items, totalItems,                   │   │
│  │                           subtotal, shipping, totalAmount)                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                            │
│                                       ▼                                            │
│  The response flows back through the same layers in reverse:                       │
│    Service → Controller → Spring Serializes to JSON → HTTP Response → Browser      │
│                                                                                    │
│  Browser receives:                                                                 │
│  {                                                                                 │
│    "success": true,                                                                │
│    "message": "Cart item added",                                                   │
│    "data": {                                                                       │
│      "id": "cart-uuid",                                                            │
│      "userId": "user-uuid",                                                        │
│      "items": [{ "product": {...}, "quantity": 1, "priceAtAddition": 999, ... }], │
│      "totalItems": 1,                                                              │
│      "subtotal": 999,                                                              │
│      "totalAmount": 999                                                            │
│    },                                                                              │
│    "timestamp": "2026-06-19T13:50:00",                                            │
│    "path": "/api/v1/cart/items"                                                   │
│  }                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle Summary Diagram

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌───────────┐
│ FRONTEND │───►│  AXIOS   │───►│  SECURITY    │───►│CONTROLLER │───►│ SERVICE   │
│ (React)  │    │Instance  │    │  Filters     │    │           │    │           │
└──────────┘    └──────────┘    └──────────────┘    └───────────┘    └─────┬─────┘
                                                                          │
                                                                    ┌─────▼─────┐
                                                                    │ MAPPER     │
                                                                    │ (Entity →  │
                                                                    │  DTO)      │
                                                                    └─────┬─────┘
                                                                          │
                                                                    ┌─────▼─────┐
                                                                    │REPOSITORY │
                                                                    │ (JPA)     │
                                                                    └─────┬─────┘
                                                                          │
                                                                    ┌─────▼─────┐
                                                                    │ DATABASE  │
                                                                    │ (MySQL)   │
                                                                    └───────────┘
```

---

## 5. Authentication Deep Dive

### What is Authentication vs Authorization?

- **Authentication** = "Who are you?" (Login with email + password)
- **Authorization** = "What are you allowed to do?" (Admin can delete products, regular users cannot)

### How Registration Works — Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        USER REGISTRATION FLOW DIAGRAM                               │
│                                                                                     │
│  STEP 1: User fills registration form on Register.jsx                               │
│  ┌─────────────────────────────────────────────────────┐                           │
│  │ Full Name: [ John Doe                           ]  │                           │
│  │ Email:    [ john@test.com                       ]  │                           │
│  │ Password: [ ********                            ]  │                           │
│  │ Phone:    [ 9999999999                          ]  │                           │
│  │ [Register]                                        │                           │
│  └─────────────────────────────────────────────────────┘                           │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 2: Frontend sends POST request                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ POST http://localhost:8081/api/v1/auth/register                              │   │
│  │ Body: { "fullName": "John Doe", "email": "john@test.com",                   │   │
│  │         "password": "mypassword", "phone": "9999999999" }                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 3: AuthController receives request                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ @Valid @RequestBody RegisterRequest → Validates:                             │   │
│  │   ✓ email: must be a valid email format                                      │   │
│  │   ✓ password: must be at least 6 characters                                  │   │
│  │   ✓ fullName: must not be blank                                              │   │
│  │ If invalid → 400 Bad Request with details                                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 4: AuthService.register() processes registration                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                             │   │
│  │  a) Normalize email:                                                        │   │
│  │     "John@Test.Com" → "john@test.com"                                       │   │
│  │     Why? Prevent duplicates like John@Test.Com = john@test.com              │   │
│  │                                                                             │   │
│  │  b) Check if email already exists:                                          │   │
│  │     userRepository.existsByEmailIgnoreCase("john@test.com")                 │   │
│  │     → SQL: SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)        │   │
│  │     → If already registered → 409 Conflict Error                            │   │
│  │                                                                             │   │
│  │  c) Hash the password:                                                      │   │
│  │     passwordEncoder.encode("mypassword")                                    │   │
│  │     → BCrypt generates random salt: "$2a$10$RANDOMSALTHERE...HASH"         │   │
│  │     → This is what gets stored in database, NEVER the plain password        │   │
│  │                                                                             │   │
│  │  d) Create User object:                                                     │   │
│  │     User.builder()                                                          │   │
│  │       .fullName("John Doe")                                                 │   │
│  │       .email("john@test.com")                                               │   │
│  │       .password("$2a$10$...")  ← hashed password, not "mypassword"          │   │
│  │       .role(Role.USER)         ← Default role for all new users             │   │
│  │       .isActive(true)          ← User can log in immediately                │   │
│  │       .isEmailVerified(false)  ← Email not verified yet                     │   │
│  │       .phone("9999999999")                                                  │   │
│  │       .build()                                                              │   │
│  │                                                                             │   │
│  │  e) Save user to database:                                                  │   │
│  │     INSERT INTO users (id, full_name, email, password, role,               │   │
│  │                        is_active, is_email_verified, phone,                 │   │
│  │                        created_at, updated_at, version)                     │   │
│  │     VALUES ('uuid', 'John Doe', 'john@test.com', '$2a$10$...', 'USER',      │   │
│  │             true, false, '9999999999', NOW(), NOW(), 0)                     │   │
│  │                                                                             │   │
│  │  f) Auto-create shopping cart:                                              │   │
│  │     INSERT INTO carts (id, user_id) VALUES ('uuid', 'user-uuid')           │   │
│  │     → Every user gets a cart automatically, even if they never use it      │   │
│  │                                                                             │   │
│  │  g) Auto-create default wishlist:                                           │   │
│  │     INSERT INTO wishlists (id, user_id, name)                               │   │
│  │     VALUES ('uuid', 'user-uuid', 'My Wishlist')                            │   │
│  │                                                                             │   │
│  │  h) Issue tokens (see below)                                                │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 5: Generate JWT Tokens                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                             │   │
│  │  ACCESS TOKEN (valid for 15 minutes):                                       │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │   │
│  │  │ JWT Structure: header.payload.signature                            │    │   │
│  │  │                                                                     │    │   │
│  │  │ HEADER: { "alg": "HS256", "typ": "JWT" }                          │    │   │
│  │  │                                                                     │    │   │
│  │  │ PAYLOAD: {                                                          │    │   │
│  │  │   "sub": "john@test.com",         ← Subject (who is this?)          │    │   │
│  │  │   "uid": "550e8400-...",          ← User's UUID ID                  │    │   │
│  │  │   "role": "USER",                 ← User's role                     │    │   │
│  │  │   "iat": 1718781000,              ← Issued at (timestamp)           │    │   │
│  │  │   "exp": 1718781900               ← Expires in 15 min              │    │   │
│  │  }                                                                     │    │   │
│  │  │                                                                     │    │   │
│  │  │ SIGNATURE: HMAC-SHA256(header + "." + payload, secretKey)          │    │   │
│  │  │  → Ensures token wasn't tampered with                               │    │   │
│  │  └────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                             │   │
│  │  REFRESH TOKEN (valid for 7 days, stored in database):                     │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │   │
│  │  │ token = "uuid1.uuid2"  ← Completely random, not a JWT               │    │   │
│  │  │ expiry = NOW + 7 days                                               │    │   │
│  │  │ revoked = false                                                     │    │   │
│  │  │                                                                     │    │   │
│  │  │ Stored in: refresh_tokens table                                     │    │   │
│  │  │ INSERT INTO refresh_tokens (id, token, expiry_date, revoked,        │    │   │
│  │  │                          user_id, created_at, updated_at)           │    │   │
│  │  └────────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 6: Response sent back to frontend                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                           │   │
│  │   "success": true,                                                          │   │
│  │   "data": {                                                                 │   │
│  │     "accessToken": "eyJhbGciOiJIUzI1NiJ9...",  ← Use for API calls          │   │
│  │     "refreshToken": "uuid1.uuid2",              ← Use when token expires    │   │
│  │     "tokenType": "Bearer",                      ← Always "Bearer"           │   │
│  │     "expiresIn": 900000,                         ← 15 minutes in ms         │   │
│  │     "user": {                                   ← User profile info         │   │
│  │       "id": "uuid", "fullName": "John Doe",                                  │   │
│  │       "email": "john@test.com", "role": "USER", ...                          │   │
│  │     }                                                                         │   │
│  │   }                                                                           │   │
│  │ }                                                                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  STEP 7: Frontend stores everything                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiJ9...')             │   │
│  │ localStorage.setItem('refreshToken', 'uuid1.uuid2')                         │   │
│  │ localStorage.setItem('user', JSON.stringify(userObject))                    │   │
│  │                                                                             │   │
│  │ → User is now logged in!                                                    │   │
│  │ → Every subsequent API call will include the access token                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### How Login Works — Simplified

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN FLOW                                             │
│                                                                                     │
│  User types email + password → clicks Login                                        │
│       │                                                                             │
│       ▼                                                                             │
│  POST /auth/login { email: "john@test.com", password: "mypassword" }              │
│       │                                                                             │
│       ▼                                                                             │
│  AuthService.login():                                                               │
│    ┌───────────────────────────────────────────────────────────────────────────┐   │
│    │ 1. Normalize email → "john@test.com"                                      │   │
│    │                                                                           │   │
│    │ 2. authenticationManager.authenticate(...)  ← THIS IS THE KEY STEP       │   │
│    │    ┌────────────────────────────────────────────────────────────────┐     │   │
│    │    │ Spring Security's AuthenticationManager:                       │     │   │
│    │    │                                                               │     │   │
│    │    │ a) Takes email + password                                     │     │   │
│    │    │ b) Calls CustomUserDetailsService.loadUserByUsername(email)   │     │   │
│    │    │    → Queries database: SELECT * FROM users WHERE email=?     │     │   │
│    │    │    → Returns AppUserPrincipal with the STORED hashed password │     │   │
│    │    │                                                               │     │   │
│    │    │ c) BCryptPasswordEncoder.matches(                             │     │   │
│    │    │     "mypassword",  ← what user typed                          │     │   │
│    │    │     "$2a$10$..."  ← what's stored in database                │     │   │
│    │    │   )                                                            │     │   │
│    │    │    → Extracts salt from stored hash                           │     │   │
│    │    │    → Hashes "mypassword" with that same salt                  │     │   │
│    │    │    → Compares hashes                                          │     │   │
│    │    │                                                               │     │   │
│    │    │ d) If match → Authentication SUCCESS                          │     │   │
│    │    │    If no match → BadCredentialsException → 401               │     │   │
│    │    └────────────────────────────────────────────────────────────────┘     │   │
│    │                                                                           │   │
│    │ 3. Update lastLoginAt = NOW()                                            │   │
│    │ 4. Issue tokens (same as registration)                                    │   │
│    └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  Response: Same format as registration — accessToken + refreshToken + user          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Why Two Tokens? Why Not Just One?

```
QUESTION: Why not just give a long-lived access token (like 30 days)?

ANSWER: Security trade-offs:

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  SHORT-LIVED ACCESS TOKEN (15 min) + LONG-LIVED REFRESH TOKEN (7 days)               │
│                                                                                     │
│  Access Token stored in: localStorage or memory                                     │
│  Refresh Token stored in: localStorage                                              │
│                                                                                     │
│  BENEFIT:                                                                           │
│  If someone steals your access token, they can only use it for 15 minutes           │
│  To get a new access token, they also need the refresh token                        │
│  If you notice suspicious activity, you can revoke refresh tokens (logged out)      │
│                                                                                     │
│  DRAWBACK:                                                                          │
│  More complex to implement. Need to handle token refresh logic.                     │
│                                                                                     │
│  ──────────────────────────────────────────────────────────────────────────────     │
│                                                                                     │
│  SINGLE LONG-LIVED TOKEN (30 days)                                                   │
│                                                                                     │
│  BENEFIT:                                                                           │
│  Simple — grab token, use it for 30 days, done.                                     │
│                                                                                     │
│  DRAWBACK:                                                                          │
│  If someone steals your token, they have access for 30 DAYS!                        │
│  You can't revoke it (JWT is stateless — no way to "cancel" a token)               │
│  The only way to "log out" someone is to wait for the token to expire               │
│                                                                                     │
│  CONCLUSION: Two-token system is MORE SECURE, even if slightly more complex.        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### How Token Refresh Works (The "401 Interceptor")

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                  WHAT HAPPENS WHEN ACCESS TOKEN EXPIRES?                             │
│                                                                                     │
│  User is browsing → JavaScript calls API → Axios sends request                      │
│       │                                                                             │
│       ▼                                                                             │
│  Server receives request with expired access token                                  │
│       │                                                                             │
│       ▼                                                                             │
│  JwtAuthFilter validates token → isTokenExpired() = TRUE                            │
│       │                                                                             │
│       ▼                                                                             │
│  SecurityContext is NOT set → Request continues without authentication               │
│       │                                                                             │
│       ▼                                                                             │
│  Authorization check: .anyRequest().authenticated() → FAILS                         │
│       │                                                                             │
│       ▼                                                                             │
│  Server returns: HTTP 401 Unauthorized                                               │
│       │                                                                             │
│       ▼                                                                             │
│  Axios Response Interceptor catches the 401 error:                                   │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ if (error.response?.status === 401 && !orig._retry) {                       │   │
│  │   orig._retry = true;  ← Prevent infinite loop                              │   │
│  │                                                                              │   │
│  │   // Get refresh token from localStorage                                    │   │
│  │   const rt = localStorage.getItem('refreshToken');                          │   │
│  │                                                                              │   │
│  │   // Call refresh endpoint                                                    │   │
│  │   const res = await axios.post(                                              │   │
│  │     'http://localhost:8081/api/v1/auth/refresh',                            │   │
│  │     { refreshToken: rt }                                                     │   │
│  │   );                                                                         │   │
│  │                                                                              │   │
│  │   // Get NEW tokens from response                                            │   │
│  │   const { accessToken, refreshToken: newRt } = res.data.data;               │   │
│  │                                                                              │   │
│  │   // Store new tokens                                                        │   │
│  │   localStorage.setItem('accessToken', accessToken);                         │   │
│  │   localStorage.setItem('refreshToken', newRt);                              │   │
│  │                                                                              │   │
│  │   // Retry the ORIGINAL failed request with new token                       │   │
│  │   orig.headers.Authorization = `Bearer ${accessToken}`;                     │   │
│  │   return axiosInstance(orig);  ← This retries the request                   │   │
│  │ }                                                                            │   │
│  │                                                                              │   │
│  │ If refresh also fails (expired refresh token):                               │   │
│  │   → Clear all localStorage                                                   │   │
│  │   → Redirect user to /login page                                             │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  RESULT: User experiences ZERO interruption — seamless automatic token refresh!      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Refresh Token Rotation — Why Revoke Old Tokens?

```
QUESTION: When user refreshes their token, why revoke the old one?

ANSWER: This prevents a security problem called "Refresh Token Reuse Attack":

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              REFRESH TOKEN ATTACK SCENARIO                          │
│                                                                                     │
│  WITHOUT ROTATION (BAD):                                                            │
│                                                                                     │
│  1. Attacker steals John's refresh token                                           │
│  2. John legitimately refreshes → gets new access token                             │
│  3. Attacker ALSO uses the same (still valid) refresh token → gets ANOTHER token   │
│  4. Both John and attacker have valid sessions — neither knows about the other      │
│                                                                                     │
│  WITH ROTATION (GOOD):                                                              │
│                                                                                     │
│  1. Attacker steals John's refresh token                                           │
│  2. John legitimately refreshes → OLD token is REVOKED → gets NEW token             │
│  3. Attacker tries to use the stolen (now revoked) refresh token                    │
│     → Server checks: token.revoked = TRUE → REJECTED                               │
│     → John knows someone tried to use his old token!                                │
│  4. Attacker gets 401 Unauthorized — no harm done                                   │
│                                                                                     │
│  CONCLUSION: Always rotate refresh tokens! This is called "token rotation"           │
│  and it's a security best practice.                                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Product Flow

### How Products are Stored

```
A Product is stored across MULTIPLE tables:

┌─────────────────────────────────────────────────────────────┐
│                    PRODUCT DATA MODEL                        │
│                                                             │
│  products table:                                            │
│  ├─ id, name, slug, description                             │
│  ├─ price (₹999), discount_price (₹799)                     │
│  ├─ brand, sku (unique product code)                        │
│  ├─ avg_rating (4.5), total_reviews (50)                    │
│  └─ category_id → links to categories table                 │
│                                                             │
│  product_images table:                                      │
│  ├─ product_id → links to the product                      │
│  ├─ image_url (https://example.com/shirt-front.jpg)        │
│  ├─ is_primary (true = main image)                         │
│  └─ display_order (0 = first image)                        │
│                                                             │
│  inventory table:                                           │
│  ├─ product_id → links to the product                      │
│  ├─ stock_quantity (100), reserved_quantity (5)            │
│  ├─ sold_quantity (50)                                      │
│  ├─ low_stock_threshold (10)                                │
│  └─ in_stock (true/false)                                  │
│                                                             │
│  reviews table:                                             │
│  ├─ product_id, user_id                                    │
│  ├─ rating (1-5), title, body                              │
│  ├─ status (PENDING/APPROVED/REJECTED)                     │
│  └─ is_verified_purchase (true/false)                      │
│                                                             │
│  Q: Why split across multiple tables?                       │
│  A: This is called "normalization." If images were stored   │
│     in the same table, a product with 5 images would have   │
│     5 duplicate rows of product data (wasteful).             │
└─────────────────────────────────────────────────────────────┘
```

### Product Search Flow — Dynamic Filtering

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       PRODUCT SEARCH — FULL FLOW                                    │
│                                                                                     │
│  User on Shop.jsx page selects filters:                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ Category: [Clothing ▼]   Brand: [Nike ▼]                                    │   │
│  │ Price: [₹500] to [₹2000]   Search: [shirt]                                  │   │
│  │ Sort By: [Price ▼]   [ASC ▼]                                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  Frontend sends: GET /api/v1/products/search?                                      │
│    keyword=shirt&categoryId=uuid&brand=nike&minPrice=500&maxPrice=2000             │
│    &sortBy=price&sortDir=asc&page=0&size=12                                        │
│       │                                                                             │
│       ▼                                                                             │
│  ProductController.search() → ProductService.searchProducts()                      │
│       │                                                                             │
│       ▼                                                                             │
│  ProductSpecifications.withFilters(request) — builds dynamic WHERE clause:          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │  WHERE 1=1                                                                  │   │
│  │    AND (LOWER(name) LIKE '%shirt%'                                          │   │
│  │         OR LOWER(description) LIKE '%shirt%'                                │   │
│  │         OR LOWER(brand) LIKE '%shirt%'                                      │   │
│  │         OR LOWER(sku) LIKE '%shirt%')                                       │   │
│  │    AND category_id = 'uuid'                                                 │   │
│  │    AND LOWER(brand) = 'nike'                                                │   │
│  │    AND price >= 500                                                          │   │
│  │    AND price <= 2000                                                         │   │
│  │    AND active = true                                                         │   │
│  │  ORDER BY price ASC                                                          │   │
│  │  LIMIT 12 OFFSET 0                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                             │
│       ▼                                                                             │
│  Q: Why use JPA Specifications instead of writing SQL manually?                     │
│  A: Specifications let you BUILD the query dynamically — each filter is optional.   │
│     If user doesn't select a brand, that condition is simply OMITTED.               │
│     Writing SQL manually would require string concatenation (error-prone).          │
│                                                                                     │
│  Q: Why the whitelist for sort fields?                                              │
│  A: In ProductService, only these fields are allowed:                               │
│     ["createdAt", "price", "name", "avgRating", "totalReviews"]                    │
│     If user tries to sort by "password", it defaults to "createdAt".                │
│     This prevents "SQL injection" through ORDER BY clause.                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Product Creation (Admin Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     ADMIN CREATES PRODUCT                                           │
│                                                                                     │
│  AdminProductController.createProduct() → ProductService.createProduct()            │
│       │                                                                             │
│       ▼                                                                             │
│  Step 1: Validate unique slug and SKU                                               │
│    ├─ findBySlug("men-cotton-shirt") → if exists → ConflictException               │
│    └─ findBySku("MCS-001") → if exists → ConflictException                         │
│    Q: Why check uniqueness?                                                         │
│    A: slug is used in URLs (e.g., /products/men-cotton-shirt).                      │
│       sku is a unique product code for inventory tracking.                          │
│       Duplicates would cause confusion.                                             │
│                                                                                     │
│  Step 2: Save Product → INSERT INTO products                                       │
│                                                                                     │
│  Step 3: Create Inventory record (stock tracking)                                   │
│    └─ INSERT INTO inventory (product_id, stock_quantity, reserved_quantity,         │
│                              sold_quantity, sku, in_stock)                          │
│       VALUES (product-uuid, 100, 0, 0, 'MCS-001', true)                            │
│                                                                                     │
│  Step 4: Save product images                                                        │
│    └─ For each image URL → INSERT INTO product_images                              │
│                                                                                     │
│  Q: Why create inventory and product separately?                                    │
│  A: Separation of concerns. Product has name, description, price.                   │
│     Inventory has stock quantity, reserved, sold.                                   │
│     They change at different rates. A product's name rarely changes.                │
│     Inventory changes with every sale. Keeping them separate is cleaner.            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Cart & Inventory Flow

### Two-Phase Inventory System — The Most Important Design Decision

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              TWO-PHASE INVENTORY LOCKING EXPLAINED                                  │
│                                                                                     │
│  PROBLEM: Without this system...                                                    │
│                                                                                     │
│  1. Product "Nike Air Max" has 1 item left in stock                                │
│  2. John adds it to his cart                                                       │
│  3. Sarah also adds it to her cart                                                 │
│  4. Both checkout simultaneously                                                   │
│  5. Both get "Order Confirmed!"                                                     │
│  6. But only 1 shoe exists — one customer will be disappointed                     │
│                                                                                     │
│  THIS IS CALLED "OVERSELLING" — VERY BAD FOR BUSINESS!                             │
│                                                                                     │
│  SOLUTION: Two-Phase Inventory Locking                                              │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  PHASE 1: RESERVE (When item is added to cart)                              │   │
│  │                                                                             │   │
│  │  Product: Nike Air Max — stock: 10                                          │   │
│  │                                                                             │   │
│  │  John adds 1 to cart:                                                       │   │
│  │    ├─ Check: hasStock(1)? → 10 - 0 >= 1? YES                               │   │
│  │    └─ reserve(1) → reserved = 1, available = 9                             │   │
│  │                                                                             │   │
│  │  Sarah adds 2 to cart:                                                      │   │
│  │    ├─ Check: hasStock(2)? → 10 - 1 >= 2? YES                               │   │
│  │    └─ reserve(2) → reserved = 3, available = 7                             │   │
│  │                                                                             │   │
│  │  Bob tries to add 8 to cart:                                                │   │
│  │    └─ hasStock(8)? → 10 - 3 >= 8? NO → "Insufficient stock!"               │   │
│  │                                                                             │   │
│  │  ─────────────────────────────────────────────────────────────────────────  │   │
│  │                                                                             │   │
│  │  PHASE 2: CONFIRM (When order is placed)                                   │   │
│  │                                                                             │   │
│  │  John places order:                                                         │   │
│  │    ├─ confirmSale(1):                                                       │   │
│  │    │  ├─ stock = 10 - 1 = 9                                                 │   │
│  │    │  ├─ reserved = 1 - 1 = 0                                               │   │
│  │    │  └─ sold = 0 + 1 = 1                                                   │   │
│  │    └─ Cart emptied                                                          │   │
│  │                                                                             │   │
│  │  ─────────────────────────────────────────────────────────────────────────  │   │
│  │                                                                             │   │
│  │  WHAT HAPPENS TO RESERVATIONS IF CART IS ABANDONED?                         │   │
│  │  Sarah adds shoes to cart but never checks out → reserved stays at 2       │   │
│  │  Those 2 shoes are "locked" — no one else can buy them!                     │   │
│  │                                                                             │   │
│  │  SOLUTION NEEDED: A scheduled job that releases expired reservations:       │   │
│  │    "If cart item is older than 24 hours and not checked out, release stock" │   │
│  │    This feature is NOT YET IMPLEMENTED in this project.                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Cart Operations Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    CART OPERATIONS DIAGRAM                                          │
│                                                                                     │
│  ┌─────────────────┐     ┌───────────────────┐     ┌──────────────────┐            │
│  │ ADD TO CART      │     │ UPDATE QUANTITY   │     │ REMOVE FROM CART │            │
│  └────────┬────────┘     └────────┬──────────┘     └────────┬─────────┘            │
│           │                      │                         │                       │
│           ▼                      ▼                         ▼                       │
│  ┌─────────────────┐     ┌───────────────────┐     ┌──────────────────┐            │
│  │ 1. Validate qty │     │ 1. Find cart item  │     │ 1. Find cart item│            │
│  │    > 0          │     │ 2. delta = new -   │     │ 2. Release       │            │
│  │ 2. Find product │     │    old qty         │     │    reservation   │            │
│  │ 3. Check active │     │ 3. IF delta > 0:   │     │ 3. DELETE item   │            │
│  │ 4. Check stock  │     │    reserve(delta)  │     └──────────────────┘            │
│  │ 5. Reserve stock│     │    IF delta < 0:   │                                    │
│  │ 6. Save cart item│    │    release(|delta|)│                                    │
│  └─────────────────┘     └───────────────────┘                                      │
│                                                                                     │
│  Important detail:                                                                  │
│  When you add item that's ALREADY in cart (e.g., add 2, then add 3 more):           │
│  └─ It doesn't create a new row — it UPDATES the existing one's quantity to 5      │
│     And reserves the additional 3 units of stock                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Order Flow — The Heart of the System

### Complete Order Placement — 14 Step Process

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                 PLACING AN ORDER — THE MOST COMPLEX OPERATION                        │
│                                                                                     │
│  User clicks "Place Order" on Checkout.jsx                                          │
│       │                                                                             │
│       ▼                                                                             │
│  POST /orders { addressId, couponCode (optional), paymentMethod }                  │
│       │                                                                             │
│       ▼                                                                             │
│  ╔══════════════════════════════════════════════════════════════════════╗            │
│  ║  @Transactional — ENTIRE OPERATION IS ATOMIC                       ║            │
│  ║  If ANY step fails → EVERYTHING rolls back (like it never happened)║            │
│  ╚══════════════════════════════════════════════════════════════════════╝            │
│       │                                                                             │
│       ▼                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ STEP 1: GET CART                                                             │   │
│  │ └─ Cart cart = cartRepository.findByUserId(userId)                           │   │
│  │    └─ SQL: SELECT * FROM carts WHERE user_id = ?                            │   │
│  │    └─ If NOT found → 404 ResourceNotFoundException                          │   │
│  │                                                                             │   │
│  │ STEP 2: VALIDATE CART NOT EMPTY                                              │   │
│  │ └─ if (cart.getItems().isEmpty()) → BusinessException                       │   │
│  │    └─ Response: "Cannot place order with empty cart" + 422 status           │   │
│  │                                                                             │   │
│  │ STEP 3: GET USER                                                            │   │
│  │ └─ userRepository.findById(userId) → 404 if user deleted after login       │   │
│  │                                                                             │   │
│  │ STEP 4: CALCULATE TOTAL                                                     │   │
│  │ └─ SUM of (priceAtAddition × quantity) for all cart items                  │   │
│  │    └─ Uses priceAtAddition (price when added), NOT current product price   │   │
│  │                                                                             │   │
│  │ STEP 5: APPLY COUPON (if provided)                                          │   │
│  │ └─ applyCouponIfPresent(couponCode, totalPrice)                            │   │
│  │    ├─ IF no coupon → discount = ₹0                                         │   │
│  │    ├─ IF coupon provided:                                                   │   │
│  │    │  ├─ Find coupon by code → 404 if not found                           │   │
│  │    │  ├─ Check isValid(): active? not expired? usage limit not reached?    │   │
│  │    │  │  → BusinessException if any check fails                           │   │
│  │    │  ├─ Check min order amount → BusinessException if below              │   │
│  │    │  ├─ Calculate discount:                                              │   │
│  │    │  │  ├─ If PERCENTAGE: total × discountValue% (capped at maxDiscount) │   │
│  │    │  │  └─ If FLAT: discountValue                                        │   │
│  │    │  └─ Increment coupon.usedCount and save                               │   │
│  │    └─ finalPrice = totalPrice - discount                                   │   │
│  │                                                                             │   │
│  │ STEP 6: RESOLVE SHIPPING ADDRESS                                            │   │
│  │ └─ resolveShippingAddress(userId, request)                                 │   │
│  │    ├─ Option A: Use SAVED address (addressId provided)                      │   │
│  │    │  └─ Copy address data into ShippingAddress (EMBEDDED snapshot)        │   │
│  │    ├─ Option B: Use NEW address (shippingAddress object provided)           │   │
│  │    │  └─ Convert ShippingAddressRequest → ShippingAddress (Embedded)       │   │
│  │    └─ Throw error if BOTH null                                              │   │
│  │                                                                             │   │
│  │    Q: Why snapshot instead of reference?                                    │   │
│  │    A: If John updates his address later, old orders should still show       │   │
│  │       the address where the item was DELIVERED, not his new address.        │   │
│  │       The order's shipping address is a HISTORICAL RECORD, frozen in time.  │   │
│  │                                                                             │   │
│  │ STEP 7: BUILD ORDER ENTITY                                                  │   │
│  │ └─ Order.builder()                                                          │   │
│  │    .orderNumber("ORD-20260619-784532")  ← Date + random 6 digits            │   │
│  │    .totalPrice(₹1000).discountAmount(₹200).finalPrice(₹800)                │   │
│  │    .orderStatus(PENDING).paymentStatus(PENDING)                            │   │
│  │    .shippingAddress(snapshot).coupon(if used).user(john)                    │   │
│  │    .build()                                                                  │   │
│  │                                                                             │   │
│  │ STEP 8: SAVE ORDER (initial without items)                                  │   │
│  │ └─ INSERT INTO orders (...)                                                 │   │
│  │                                                                             │   │
│  │ STEP 9: PROCESS EACH CART ITEM — CONFIRM SALE                              │   │
│  │ └─ for each CartItem:                                                       │   │
│  │    ├─ Find Inventory for product                                            │   │
│  │    ├─ Validate: reservedQuantity >= cartItem.quantity                       │   │
│  │    ├─ inventory.confirmSale(cartItem.quantity):                             │   │
│  │    │  ├─ stockQuantity -= quantity                                         │   │
│  │    │  ├─ reservedQuantity -= quantity                                      │   │
│  │    │  └─ soldQuantity += quantity                                           │   │
│  │    ├─ inventoryRepository.save(inventory) → UPDATE inventory               │   │
│  │    └─ Create OrderItem with price snapshot:                                │   │
│  │       OrderItem.builder()                                                    │   │
│  │         .product(product)                                                    │   │
│  │         .quantity(cartItem.getQuantity())                                    │   │
│  │         .purchasePrice(cartItem.getPriceAtAddition())  ← SNAPSHOT           │   │
│  │         .subtotal(price × quantity)                                          │   │
│  │         .build()                                                             │   │
│  │                                                                             │   │
│  │ STEP 10: CREATE PAYMENT RECORD                                             │   │
│  │ └─ Payment.builder().amount(finalPrice).currency("INR")                    │   │
│  │    .status(PENDING).method(UPI/COD/etc).build()                           │   │
│  │                                                                             │   │
│  │ STEP 11: SAVE FINALIZED ORDER (with items + payment via Cascade)            │   │
│  │ └─ INSERT INTO order_items (...)                                            │   │
│  │ └─ INSERT INTO payments (...)                                               │   │
│  │                                                                             │   │
│  │ STEP 12: EMPTY THE CART                                                    │   │
│  │ └─ DELETE FROM cart_items WHERE cart_id = ?                                │   │
│  │    (Cart itself stays — just items are removed)                            │   │
│  │                                                                             │   │
│  │ STEP 13: SEND NOTIFICATION (async)                                         │   │
│  │ └─ @Async → "Order ORD-20260619-784532 confirmed for john@test.com"       │   │
│  │    (Currently just logs — future: email/SMS)                               │   │
│  │                                                                             │   │
│  │ STEP 14: RETURN ORDER RESPONSE                                              │   │
│  │ └─ OrderResponse (orderNumber, items, prices, status, etc.)                 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  Q: Why does @Transactional matter here?                                           │
│  A: Imagine the database crashes AFTER Step 8 (order saved) but                     │
│     BEFORE Step 10 (payment created). Without @Transactional, you'd have           │
│     an order with no payment — inconsistent data. With @Transactional,             │
│     the entire operation rolls back like it never happened.                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Order Status Lifecycle

```
                    ┌──────────┐
                    │ PENDING  │ (Order placed, payment not yet completed)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
              ┌─────│ CONFIRMED│ (Payment completed or mock payment)
              │     └────┬─────┘
              │          │
              │    ┌─────▼──────┐
              │    │ PROCESSING  │ (Admin started preparing order)
              │    └─────┬──────┘
              │          │
              │    ┌─────▼────┐
              │    │ SHIPPED   │ (Order dispatched)
              │    └─────┬────┘
              │          │
              │    ┌─────▼────────┐
              │    │ DELIVERED     │ (Customer received)
              │    └──────┬───────┘
              │           │
              │     ┌─────▼──────┐
              │     │ COMPLETED   │ (End state)
              │     └────────────┘
              │
              │    ┌───────────┐
              └───►│ CANCELLED  │ (Can cancel from PENDING, CONFIRMED, PROCESSING)
                   └─────┬─────┘
                         │
                    ┌────▼─────┐
                    │ RESTOCK   │ (Items returned to inventory)
                    └──────────┘
                        
             ┌───────────┐
             │ RETURNED   │ (After delivery, customer returns)
             └───────────┘
```

### Order Cancellation — What Happens to Inventory?

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     ORDER CANCELLATION — RESTOCKING FLOW                             │
│                                                                                     │
│  User cancels order OR Admin sets status to CANCELLED:                              │
│       │                                                                             │
│       ▼                                                                             │
│  restockItems(order):                                                               │
│    └─ for each OrderItem:                                                           │
│       ├─ Find Inventory for product                                                 │
│       ├─ stockQuantity += item.getQuantity()  ← Add stock back                     │
│       ├─ soldQuantity = max(0, soldQuantity - item.getQuantity())                  │
│       │  └─ Why max(0, ...)? Prevents negative soldQuantity in edge cases          │
│       ├─ inStock = (availableQuantity > 0)                                         │
│       └─ inventoryRepository.save(inventory)                                       │
│                                                                                     │
│  Q: Why restock when cancelled?                                                     │
│  A: When an order is placed, items are permanently removed from stock.              │
│     If the order is cancelled, those items should go BACK to inventory               │
│     so other customers can buy them.                                                │
│                                                                                     │
│  Q: Can user cancel any order?                                                      │
│  A: No — CANCELLED or DELIVERED orders cannot be cancelled.                         │
│     If already DELIVERED, the user needs to request a RETURN instead.              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Payment Flow

### Payment Methods

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT METHODS AVAILABLE                                   │
│                                                                                     │
│  GET /api/v1/payments/methods → Returns:                                           │
│  [                                                                                  │
│    "CREDIT_CARD",    ← Visa, Mastercard                                             │
│    "DEBIT_CARD",     ← Any bank's debit card                                        │
│    "UPI",            ← Google Pay, PhonePe, Paytm                                   │
│    "NET_BANKING",    ← Direct bank login                                            │
│    "WALLET",         ← Paytm Wallet, Amazon Pay                                     │
│    "COD"             ← Cash on Delivery (pay when delivered)                        │
│  ]                                                                                  │
│                                                                                     │
│  This endpoint is PUBLIC — anyone can see available methods without logging in.    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Payment Verification (Razorpay) — HMAC Signature

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                   PAYMENT VERIFICATION — HOW IT WORKS                               │
│                                                                                     │
│  Razorpay Payment Flow:                                                             │
│                                                                                     │
│  1. Frontend calls: POST /payments/initiate { orderId, paymentMethod: "UPI" }      │
│     ├─ Server creates/gets Payment record                                          │
│     └─ Returns: { razorpayOrderId: "rpay_order_uuid", amount: 800 }               │
│                                                                                    │
│  2. Frontend opens Razorpay checkout with razorpayOrderId + amount                │
│     ├─ User enters UPI ID / card details / etc.                                   │
│     └─ Razorpay processes payment                                                 │
│                                                                                    │
│  3. On success, Razorpay returns to frontend:                                     │
│     ├─ razorpayOrderId      (same as before)                                      │
│     ├─ razorpayPaymentId    (Razorpay's payment ID)                               │
│     └─ signature            (Razorpay-signed HMAC)                                │
│                                                                                    │
│  4. Frontend calls: POST /payments/verify {                                       │
│       orderId, razorpayOrderId, razorpayPaymentId, signature                      │
│     }                                                                              │
│       │                                                                             │
│       ▼                                                                             │
│  PaymentService.verifyPayment():                                                    │
│    ┌───────────────────────────────────────────────────────────────────────────┐   │
│    │ Step 1: Find order + payment (user-scoped)                               │   │
│    │ Step 2: Validate razorpayOrderId matches what WE stored                  │   │
│    │         (Prevents someone from submitting a fake order ID)               │   │
│    │                                                                           │   │
│    │ Step 3: Verify HMAC-SHA256 signature:                                    │   │
│    │   ┌────────────────────────────────────────────────────────────────┐     │   │
│    │   │ payload = razorpayOrderId + "|" + razorpayPaymentId            │     │   │
│    │   │         = "rpay_order_xxx|rpay_payment_yyy"                   │     │   │
│    │   │                                                                 │     │   │
│    │   │ computed = HMAC-SHA256(payload, SIGNATURE_SECRET)              │     │   │
│    │   │          = hex string: "a1b2c3d4..."                           │     │   │
│    │   │                                                                 │     │   │
│    │   │ if (computed == request.signature()) → VALID ✅               │     │   │
│    │   │ else → INVALID ❌                                              │     │   │
│    │   └────────────────────────────────────────────────────────────────┘     │   │
│    │                                                                           │   │
│    │    Q: Why verify the signature ourselves?                                 │   │
│    │    A: The frontend could be hacked. Someone could send a fake             │   │
│    │       "payment success" message. The HMAC signature proves that           │   │
│    │       Razorpay itself confirmed the payment, not some JavaScript          │   │
│    │       running in the browser. Only the server knows the signature secret. │   │
│    │                                                                           │   │
│    │ Step 4a: If VALID → Mark payment COMPLETED, order CONFIRMED              │   │
│    │ Step 4b: If INVALID → Mark payment FAILED, order stays PENDING           │   │
│    │ Step 5: Save + notify                                                     │   │
│    └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ⚠ MOCK PAYMENT (for development):                                                 │
│  POST /payments/mock-complete → Simulates success without actual payment           │
│  No signature verification needed — for development testing only                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Review Flow

### Verified Purchase — Why This Check?

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        REVIEW SYSTEM — VERIFIED PURCHASE                            │
│                                                                                     │
│  PROBLEM: On Amazon/Flipkart, anyone can write a review, right?                     │
│  But what prevents:                                                                 │
│    • Competitors posting fake 1-star reviews                                        │
│    • The seller posting fake 5-star reviews                                         │
│                                                                                     │
│  SOLUTION: Only ALLOW reviews from people who actually BOUGHT the product!           │
│                                                                                     │
│  How it works:                                                                      │
│       │                                                                             │
│       ▼                                                                             │
│  POST /reviews { productId: "uuid", rating: 4, title: "Great", body: "..." }       │
│       │                                                                             │
│       ▼                                                                             │
│  ReviewService.upsertReview():                                                      │
│    Step 1: Check verified purchase                                                  │
│    └─ orderService.hasVerifiedPurchase(userId, productId)                          │
│       └─ SQL: SELECT EXISTS (                                                       │
│            SELECT 1 FROM orders o                                                   │
│            JOIN order_items oi ON o.id = oi.order_id                               │
│            WHERE o.user_id = ?                                                      │
│            AND oi.product_id = ?                                                    │
│            AND o.order_status IN (                                                   │
│              'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED'         │
│            )                                                                        │
│          )                                                                          │
│       └─ If FALSE → BusinessException: "Only verified buyers can review"           │
│          → 422 Unprocessable Entity                                                 │
│                                                                                     │
│    Q: Why exclude PENDING and CANCELLED orders?                                     │
│    A: PENDING means payment might fail. CANCELLED means the order was cancelled.    │
│       Neither means the user actually RECEIVED and used the product.                │
│       You shouldn't review a product you never received!                           │
│                                                                                     │
│    Step 2: Find or create review (UPSERT pattern)                                   │
│    └─ reviewRepository.findByUserIdAndProductId(userId, productId)                  │
│       .orElseGet(() → Review.builder().user(user).product(product).build())        │
│       └─ UPSERT = UPdate or inSERT — if review exists, update it; else create new   │
│                                                                                     │
│    Step 3: Set status to PENDING (always resets)                                    │
│    └─ review.setStatus(ReviewStatus.PENDING)                                       │
│    Q: Why reset to PENDING on every update?                                         │
│    A: If a user edits their APPROVED review, the changes should be RE-MODERATED.   │
│       Otherwise, a user could post a great review, get it approved,                │
│       then edit it to say something nasty — bypassing moderation!                   │
│                                                                                     │
│  ───────────────────────────────────────────────────────────────────────────────    │
│                                                                                     │
│  ADMIN MODERATION:                                                                   │
│  PATCH /admin/reviews/{id}/moderate { status: "APPROVED" }                         │
│    → ReviewService.moderateReview(id, status):                                      │
│      ├─ Set status (APPROVED or REJECTED)                                           │
│      └─ recalculateProductRatings(product):                                         │
│         ├─ SQL: SELECT AVG(rating), COUNT(*) FROM reviews                          │
│         │        WHERE product_id = ? AND status = 'APPROVED'                      │
│         └─ Update product.avgRating + product.totalReviews                         │
│                                                                                     │
│  Q: Why recalculate ratings on every moderation?                                    │
│  A: If a review with 1-star is approved, the average goes DOWN.                     │
│     If a review is rejected, the average goes UP.                                   │
│     Ratings must always reflect ONLY APPROVED reviews.                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Wishlist Flow

### Multiple Wishlists — Why This Design?

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         WISHLIST SYSTEM                                             │
│                                                                                     │
│  Unlike some e-commerce sites that only have ONE wishlist,                           │
│  this system allows MULTIPLE wishlists per user:                                    │
│                                                                                     │
│  John's Wishlists:                                                                  │
│  ├── "My Wishlist" (default, auto-created at registration)                          │
│  ├── "Birthday Gifts"                                                               │
│  └── "Home Decor Ideas"                                                             │
│                                                                                     │
│  Each wishlist can have MULTIPLE products.                                          │
│  One product can appear in MULTIPLE wishlists.                                      │
│                                                                                     │
│  ┌─────────────────┐       ┌──────────────────┐       ┌────────────────┐           │
│  │  Wishlist       │       │  WishlistItem    │       │  Product       │           │
│  ├─────────────────┤       ├──────────────────┤       ├────────────────┤           │
│  │ id (PK)         │──1:*──│ wishlist_id      │       │ id (PK)        │           │
│  │ user_id (FK)    │       │ product_id (FK)  │──*:1──│ name           │           │
│  │ name            │       │ added_at         │       │ price          │           │
│  └─────────────────┘       └──────────────────┘       └────────────────┘           │
│                                                                                     │
│  Special feature: "Move to Cart"                                                    │
│  └─ POST /wishlists/{wlId}/items/{itemId}/move-to-cart?quantity=1                  │
│     ├─ Adds product to user's cart (calls CartService.addItem)                     │
│     └─ Removes item from wishlist                                                   │
│        → Effectively: moves item from "saved for later" to "buying now"            │
│                                                                                     │
│  Idempotent add: If you add a product already in wishlist, NO ERROR                 │
│  └─ Silently skips — prevents "Already in wishlist" error messages                  │
│                                                                                     │
│  Q: Why multiple wishlists?                                                         │
│  A: Users organize their shopping differently:                                      │
│     • "Gifts for Mom" vs "Things for my apartment"                                  │
│     • One-click adding for different occasions                                      │
│     • Better UX = more engagement = more sales                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Admin Flow

### Admin Powers

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        WHAT ADMINS CAN DO                                           │
│                                                                                     │
│  ADMIN ROLE is checked at the SECURITY level:                                       │
│  SecurityConfig: .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")              │
│                                                                                     │
│  If a regular USER tries to access /api/v1/admin/*:                                 │
│  └─ JwtAuthFilter sets auth with role ROLE_USER                                    │
│  └─ Authorization check: does ROLE_USER have ROLE_ADMIN? NO                        │
│  └→ 403 Forbidden                                                                  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ PRODUCT MANAGEMENT:                                                         │   │
│  │ ├─ POST /admin/products → Create product (with inventory + images)           │   │
│  │ ├─ PUT /admin/products/{id} → Update product                                │   │
│  │ └─ DELETE /admin/products/{id} → Delete product                             │   │
│  │                                                                             │   │
│  │ CATEGORY MANAGEMENT:                                                        │   │
│  │ ├─ POST /admin/categories → Create category                                 │   │
│  │ ├─ PUT /admin/categories/{id} → Update category                            │   │
│  │ └─ DELETE /admin/categories/{id} → Delete category                         │   │
│  │                                                                             │   │
│  │ ORDER MANAGEMENT:                                                           │   │
│  │ ├─ GET /admin/orders → List ALL orders (not just user's)                    │   │
│  │ ├─ GET /admin/orders/{id} → Get order WITH customer details                │   │
│  │ └─ PATCH /admin/orders/{id}/status → Update order status                   │   │
│  │    ├─ If DELIVERED + payment PENDING → auto-complete payment               │   │
│  │    └─ If CANCELLED → restock items                                          │   │
│  │                                                                             │   │
│  │ USER MANAGEMENT:                                                            │   │
│  │ ├─ GET /admin/users → List all users                                        │   │
│  │ ├─ PATCH /admin/users/{id}/status → Activate/deactivate user              │   │
│  │ └─ DELETE /admin/users/{id} → Delete user                                  │   │
│  │                                                                             │   │
│  │ COUPON MANAGEMENT:                                                          │   │
│  │ ├─ POST /admin/coupons → Create discount coupon                            │   │
│  │ ├─ PUT /admin/coupons/{id} → Update coupon                                │   │
│  │ ├─ DELETE /admin/coupons/{id} → Deactivate coupon                          │   │
│  │ └─ GET /admin/coupons → List all coupons                                   │   │
│  │                                                                             │   │
│  │ INVENTORY MANAGEMENT:                                                       │   │
│  │ ├─ GET /admin/inventory/product/{id} → View stock                          │   │
│  │ └─ PUT /admin/inventory → Update stock quantity                            │   │
│  │                                                                             │   │
│  │ REVIEW MODERATION:                                                          │   │
│  │ └─ PATCH /admin/reviews/{id}/moderate → Approve or reject review           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Admin Registration — Protected by Bootstrap Key

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    SECURING ADMIN REGISTRATION                                      │
│                                                                                     │
│  POST /auth/register-admin → This endpoint is SPECIAL                               │
│       │                                                                             │
│       ▼                                                                             │
│  Requires header: X-Admin-Setup-Key: change-this-admin-bootstrap-key               │
│       │                                                                             │
│       ▼                                                                             │
│  AuthService.registerAdmin():                                                       │
│    if (setupKey == null || !setupKey.equals(adminBootstrapConfig.getBootstrapKey()))│
│      → throw ForbiddenException("Invalid admin setup key")                          │
│                                                                                     │
│  Q: Why a bootstrap key instead of just creating admin directly?                    │
│  A: This is a DEVELOPMENT security measure. In production:                          │
│     • The bootstrap key is set in application.properties:                           │
│       app.admin.bootstrap-key=some-secret-value                                    │
│     • Only someone who knows this key can create the first admin                    │
│     • In production, you'd create admins directly in the database                   │
│       or through a secured internal tool — not via API                              │
│                                                                                     │
│  The bootstrap key prevents random internet users from:                             │
│  POST /auth/register-admin { fullName: "Hacker", email: "...", password: "..." }   │
│  and becoming admin of your site!                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Security Features Explained

### Complete Security Checklist

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       SECURITY FEATURES — EXPLAINED                                  │
│                                                                                     │
│  1. ✅ PASSWORD HASHING (BCrypt)                                                    │
│     └─ What: Passwords are NEVER stored in plain text                               │
│     └─ How: BCrypt adds random "salt" and hashes ~100 times (takes 100ms)           │
│     └─ Why: Even if database is hacked, passwords can't be recovered                │
│                                                                                     │
│  2. ✅ JWT ACCESS TOKENS (15 min expiry)                                            │
│     └─ What: Short-lived tokens that prove identity                                 │
│     └─ How: Signed with HMAC-SHA256 — if tampered with, signature invalidates       │
│     └─ Why: Short expiry limits damage if token is stolen                           │
│                                                                                     │
│  3. ✅ REFRESH TOKEN ROTATION                                                       │
│     └─ What: Old refresh token is revoked when new one is issued                    │
│     └─ Why: Prevents replay attacks — stolen old tokens are useless                 │
│                                                                                     │
│  4. ✅ CORS RESTRICTION                                                             │
│     └─ What: Only http://localhost:* and http://127.0.0.1:* are allowed             │
│     └─ Why: Prevents other websites from making API calls from your browser         │
│                                                                                     │
│  5. ✅ STATELESS SESSIONS                                                           │
│     └─ What: No HTTP sessions, no cookies — each request is independent             │
│     └─ Why: Scales better (any server can handle any request), no CSRF risk         │
│                                                                                     │
│  6. ✅ INPUT VALIDATION                                                             │
│     └─ What: @Valid on all request bodies + field constraints                      │
│     └─ Why: Prevents malformed data, injection attacks, buffer overflows            │
│                                                                                     │
│  7. ✅ ROLE-BASED ACCESS CONTROL                                                    │
│     └─ What: URL patterns checked for ADMIN role                                    │
│     └─ Why: Users can't access admin features even if they know the URLs            │
│                                                                                     │
│  8. ✅ USER-SCOPED QUERIES                                                          │
│     └─ What: Orders, cart, addresses all check userId matches authenticated user   │
│     └─ Why: John can't view Sarah's orders by guessing order IDs                    │
│                                                                                     │
│  9. ✅ OPTIMISTIC LOCKING (@Version)                                                │
│     └─ What: Every entity has a version number                                      │
│     └─ Why: Prevents lost updates — if two admins edit same product,                │
│              the second one gets an error instead of silently overwriting           │
│                                                                                     │
│ 10. ✅ STANDARD ERROR RESPONSE                                                      │
│     └─ What: All errors return JSON with errorCode instead of stack traces          │
│     └─ Why: Doesn't leak internal implementation details to attackers               │
│                                                                                     │
│  ⚠ GAPS (Things to improve):                                                       │
│                                                                                     │
│  ❌ RATE LIMITING — No protection against brute force login attacks                 │
│     └─ Attackers could try 1 million passwords per minute                           │
│     └─ Fix: Add Spring Boot Rate Limiting or use a service like Cloudflare          │
│                                                                                     │
│  ❌ EMAIL VERIFICATION — isEmailVerified field exists but never used                │
│     └─ Users can register with any email, even fake ones                            │
│     └─ Fix: Send verification email with link on registration                       │
│                                                                                     │
│  ❌ HTTPS — Not enforced (development only)                                         │
│     └─ Passwords sent in plain text over network                                    │
│     └─ Fix: Always use HTTPS in production                                          │
│                                                                                     │
│  ❌ INFO LEAKAGE — Error messages like "User not found with email: X"               │
│     └─ Tells attacker whether an email is registered or not                         │
│     └─ Fix: Always return generic "Invalid credentials" regardless of the issue    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Database Tables

### Complete Column Reference

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE TABLES — COLUMN BREAKDOWN                               │
│                                                                                     │
│  TABLE: users                                                                       │
│  ├─ id               BINARY(16) PK    │ UUID primary key                           │
│  ├─ full_name        VARCHAR(100)     │ NOT NULL — User's display name             │
│  ├─ email            VARCHAR(255)     │ NOT NULL, UNIQUE — Login identifier        │
│  ├─ password         VARCHAR(255)     │ NOT NULL — BCrypt hashed password          │
│  ├─ role             VARCHAR(20)      │ NOT NULL, DEFAULT 'USER' — USER or ADMIN   │
│  ├─ is_active        BOOLEAN          │ NOT NULL — Can user log in?                │
│  ├─ is_email_verified BOOLEAN         │ NOT NULL — Email verified? (not used)      │
│  ├─ phone            VARCHAR(20)      │ NULLABLE — Contact number                  │
│  ├─ profile_image_url VARCHAR(500)    │ NULLABLE — Avatar URL                      │
│  ├─ last_login_at    TIMESTAMP NULL   │ When user last logged in                   │
│  ├─ created_at       TIMESTAMP        │ When record was created                    │
│  ├─ updated_at       TIMESTAMP        │ When record was last modified              │
│  └─ version          BIGINT           │ Optimistic lock counter                    │
│                                                                                     │
│  TABLE: addresses                                                                   │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ full_name        VARCHAR(100)     │ Recipient name                             │
│  ├─ phone            VARCHAR(20)      │ Recipient phone                            │
│  ├─ address_line1    VARCHAR(255)     │ Street address                             │
│  ├─ address_line2    VARCHAR(255)     │ Apartment, suite, etc. (nullable)          │
│  ├─ city             VARCHAR(100)     │                                            │
│  ├─ state            VARCHAR(100)     │                                            │
│  ├─ postal_code      VARCHAR(20)      │                                            │
│  ├─ country          VARCHAR(100)     │ DEFAULT 'India'                            │
│  ├─ address_type     VARCHAR(20)      │ HOME, WORK, or OTHER                       │
│  ├─ is_default       BOOLEAN          │ Is this the default address?               │
│  ├─ user_id          BINARY(16) FK    │ → references users(id) ON DELETE CASCADE   │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: refresh_tokens                                                              │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ token            VARCHAR(500)     │ UNIQUE — The refresh token string           │
│  ├─ expiry_date      TIMESTAMP        │ When this token expires                     │
│  ├─ revoked          BOOLEAN          │ Is this token revoked?                      │
│  ├─ user_id          BINARY(16) FK    │ → references users(id) ON DELETE CASCADE    │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: categories                                                                  │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ name             VARCHAR(100)     │ Category name                              │
│  ├─ slug             VARCHAR(120)     │ UNIQUE — URL-friendly name                  │
│  ├─ description      TEXT             │ Nullable category description               │
│  ├─ image_url        VARCHAR(500)     │ Nullable category image                     │
│  ├─ parent_id        BINARY(16) FK    │ → references categories(id) — self join    │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: products                                                                    │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ name             VARCHAR(255)     │ Product name                               │
│  ├─ slug             VARCHAR(300)     │ UNIQUE — URL-friendly identifier            │
│  ├─ description      TEXT             │ Detailed product description                │
│  ├─ price            DECIMAL(12,2)    │ Regular price                               │
│  ├─ discount_price   DECIMAL(12,2)    │ Discounted price (nullable)                │
│  ├─ active           BOOLEAN          │ Is product visible for sale?                │
│  ├─ brand            VARCHAR(100)     │ Brand name (nullable)                      │
│  ├─ sku              VARCHAR(50)      │ UNIQUE — Stock Keeping Unit code            │
│  ├─ avg_rating       DOUBLE           │ Average of all APPROVED reviews (0.0)      │
│  ├─ total_reviews    INT              │ Count of APPROVED reviews (0)              │
│  ├─ category_id      BINARY(16) FK    │ → references categories(id)                │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: product_images                                                              │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ image_url        VARCHAR(500)     │ URL to image file                          │
│  ├─ alt_text         VARCHAR(255)     │ Alt text for accessibility (nullable)      │
│  ├─ is_primary       BOOLEAN          │ Is this the main product image?            │
│  ├─ display_order    INT              │ Sort order (0 = first)                     │
│  ├─ product_id       BINARY(16) FK    │ → references products(id)                   │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: inventory                                                                   │
│  ├─ id                BINARY(16) PK   │                                            │
│  ├─ stock_quantity    INT             │ Total units in stock                       │
│  ├─ reserved_quantity INT             │ Units reserved in carts                    │
│  ├─ sold_quantity     INT             │ Units sold to date                         │
│  ├─ sku               VARCHAR(50)     │ UNIQUE — Same as product SKU               │
│  ├─ low_stock_threshold INT           │ Alert when stock goes below this           │
│  ├─ in_stock          BOOLEAN         │ Computed: (stock - reserved) > 0           │
│  ├─ product_id        BINARY(16) FK   │ UNIQUE → references products(id)            │
│  ├─ created_at        TIMESTAMP       │                                            │
│  ├─ updated_at        TIMESTAMP       │                                            │
│  └─ version           BIGINT          │                                            │
│                                                                                     │
│  TABLE: carts                                                                       │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ user_id          BINARY(16) FK    │ UNIQUE → references users(id)              │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: cart_items                                                                  │
│  ├─ id                BINARY(16) PK   │                                            │
│  ├─ quantity          INT             │ Number of this product in cart             │
│  ├─ price_at_addition DECIMAL(12,2)   │ Price SNAPSHOT when added to cart          │
│  ├─ cart_id           BINARY(16) FK   │ → references carts(id)                     │
│  ├─ product_id        BINARY(16) FK   │ → references products(id)                  │
│  ├─ created_at        TIMESTAMP       │                                            │
│  ├─ updated_at        TIMESTAMP       │                                            │
│  └─ version           BIGINT          │                                            │
│                                                                                     │
│  TABLE: orders                                                                      │
│  ├─ id                   BINARY(16) PK  │                                           │
│  ├─ order_number         VARCHAR(30)    │ UNIQUE — "ORD-20260619-784532"            │
│  ├─ total_price          DECIMAL(12,2)  │ Before discount                          │
│  ├─ discount_amount      DECIMAL(12,2)  │ Discount from coupon (0 if none)         │
│  ├─ final_price          DECIMAL(12,2)  │ After discount = total - discount        │
│  ├─ order_status         VARCHAR(30)    │ PENDING→CONFIRMED→...→DELIVERED          │
│  ├─ payment_status       VARCHAR(30)    │ PENDING/COMPLETED/FAILED/REFUNDED        │
│  ├─ [EMBEDDED] ShippingAddress          │ SNAPSHOT of delivery address             │
│  │  ├─ shipping_full_name  VARCHAR(100) │                                           │
│  │  ├─ shipping_phone      VARCHAR(20)  │                                           │
│  │  ├─ shipping_address_line1 VARCHAR(255)                                         │
│  │  ├─ shipping_address_line2 VARCHAR(255)                                         │
│  │  ├─ shipping_city       VARCHAR(100) │                                           │
│  │  ├─ shipping_state      VARCHAR(100) │                                           │
│  │  ├─ shipping_postal_code VARCHAR(20)  │                                          │
│  │  └─ shipping_country    VARCHAR(100) │                                           │
│  ├─ coupon_id          BINARY(16) FK    │ → references coupons(id), nullable       │
│  ├─ user_id            BINARY(16) FK    │ → references users(id)                    │
│  ├─ created_at         TIMESTAMP        │                                           │
│  ├─ updated_at         TIMESTAMP        │                                           │
│  └─ version            BIGINT           │                                           │
│                                                                                     │
│  TABLE: order_items                                                                 │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ quantity         INT              │ Quantity purchased                         │
│  ├─ purchase_price   DECIMAL(12,2)    │ Price per unit at time of purchase         │
│  ├─ subtotal         DECIMAL(12,2)    │ quantity × purchase_price                  │
│  ├─ product_id       BINARY(16) FK    │ → references products(id)                  │
│  ├─ order_id         BINARY(16) FK    │ → references orders(id) ON DELETE CASCADE   │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: reviews                                                                     │
│  ├─ id                BINARY(16) PK   │                                            │
│  ├─ rating            INT             │ 1-5 star rating                            │
│  ├─ title             VARCHAR(200)    │ Review title (nullable)                     │
│  ├─ body              TEXT            │ Full review text (nullable)                 │
│  ├─ status            VARCHAR(20)     │ PENDING, APPROVED, or REJECTED             │
│  ├─ is_verified_purchase BOOLEAN     │ Was this from a verified purchase?          │
│  ├─ user_id           BINARY(16) FK   │ → references users(id)                     │
│  ├─ product_id        BINARY(16) FK   │ → references products(id)                  │
│  ├─ created_at        TIMESTAMP       │                                            │
│  ├─ updated_at        TIMESTAMP       │                                            │
│  └─ version           BIGINT          │                                            │
│  ┆ UNIQUE(user_id, product_id)        │ One review per user per product            │
│                                                                                     │
│  TABLE: wishlists                                                                   │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ user_id          BINARY(16) FK    │ → references users(id)                      │
│  ├─ name             VARCHAR(100)     │ "My Wishlist", "Birthday Gifts", etc.       │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: wishlist_items                                                              │
│  ├─ id               BINARY(16) PK    │                                            │
│  ├─ wishlist_id      BINARY(16) FK    │ → references wishlists(id)                 │
│  ├─ product_id       BINARY(16) FK    │ → references products(id)                  │
│  ├─ added_at         TIMESTAMP        │ When item was saved to wishlist            │
│  ├─ created_at       TIMESTAMP        │                                            │
│  ├─ updated_at       TIMESTAMP        │                                            │
│  └─ version          BIGINT           │                                            │
│                                                                                     │
│  TABLE: coupons                                                                     │
│  ├─ id                BINARY(16) PK   │                                            │
│  ├─ code              VARCHAR(50)     │ UNIQUE — "SAVE20", "WELCOME10"              │
│  ├─ discount_type     VARCHAR(20)     │ PERCENTAGE or FLAT                          │
│  ├─ discount_value    DECIMAL(12,2)   │ 20 (for 20%) or 500 (for ₹500 off)         │
│  ├─ min_order_amount  DECIMAL(12,2)   │ Minimum order to apply coupon              │
│  ├─ max_discount_amount DECIMAL(12,2) │ Max discount for percentage (nullable)     │
│  ├─ usage_limit       INT             │ Max times coupon can be used (0=unlimited)  │
│  ├─ used_count        INT             │ How many times coupon has been used         │
│  ├─ active            BOOLEAN         │ Is coupon active?                          │
│  ├─ expiry_date       TIMESTAMP       │ Coupon valid until this date               │
│  ├─ created_at        TIMESTAMP       │                                            │
│  ├─ updated_at        TIMESTAMP       │                                            │
│  └─ version           BIGINT          │                                            │
│                                                                                     │
│  TABLE: payments                                                                     │
│  ├─ id                BINARY(16) PK   │                                            │
│  ├─ razorpay_order_id VARCHAR(100)    │ Razorpay's order ID (nullable)              │
│  ├─ razorpay_payment_id VARCHAR(100)  │ Razorpay's payment ID (nullable)            │
│  ├─ amount            DECIMAL(12,2)   │ Payment amount                             │
│  ├─ currency          VARCHAR(10)     │ INR (default)                              │
│  ├─ status            VARCHAR(20)     │ PENDING/COMPLETED/FAILED/REFUNDED          │
│  ├─ method            VARCHAR(30)     │ CREDIT_CARD/UPI/COD etc. (nullable)         │
│  ├─ paid_at           TIMESTAMP NULL  │ When payment was completed                  │
│  ├─ order_id          BINARY(16) FK   │ UNIQUE → references orders(id)              │
│  ├─ created_at        TIMESTAMP       │                                            │
│  ├─ updated_at        TIMESTAMP       │                                            │
│  └─ version           BIGINT          │                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. 50 Interview Questions With Detailed Answers

### Section A: Architecture & Design (Q1-Q10)

**Q1: Why use two tokens (access + refresh) instead of one long-lived access token?**

**Answer**: 
This is about balancing security with user experience.

A single long-lived access token (say 30 days) is simpler but has a major flaw: if stolen, the attacker has 30 days of unrestricted access. You can't revoke a JWT — it's stateless. You'd have to maintain a blocklist, defeating the purpose of JWT.

The two-token system solves this:
- **Access token** (15 min): Short-lived so theft window is tiny. Sent on every API call.
- **Refresh token** (7 days): Long-lived but stored in DB so it CAN be revoked. Only sent to one endpoint (`/auth/refresh`).

**The flow**: When access token expires, the frontend's Axios interceptor automatically uses the refresh token to get a new pair. The old refresh token is **revoked** (rotation). If someone steals the refresh token and uses it after you've already refreshed, it fails (rotation detects theft).

**Real-world analogy**: Think of the access token like a hotel room key card that expires every 15 minutes. The refresh token is like your ID at the front desk — you show it to get a new key card. If someone steals your ID, the front desk can invalidate it.

**Q2: Why embed ShippingAddress in Order instead of a foreign key to Address table?**

**Answer**:
This is about **historical accuracy** vs **referential integrity**.

If Order had `address_id` pointing to the `addresses` table:
- User John has address "123 Main St" saved
- John orders a product → order points to address ID
- John moves → updates his address to "456 Oak Ave"
- The OLD order now shows "456 Oak Ave" — WRONG! The package was delivered to "123 Main St"

By **embedding** a snapshot (copy of all address fields directly in the orders table), the order becomes an immutable historical record. No matter what John does to his address later, the order will always show the correct delivery address.

**The cost**: Data duplication. If 10,000 orders all ship to the same address, that address is stored 10,000 times. But this is acceptable because:
1. Orders are append-only (rarely updated)
2. Storage is cheap
3. Historical accuracy is priceless for customer service, disputes, and legal compliance

**Q3: Explain the two-phase inventory system. What happens to abandoned cart reservations?**

**Answer**:
The two phases are:

**Phase 1 — Reserve**: When a user adds an item to cart, we don't just check stock — we **reserve** it. This means `reservedQuantity` increases, reducing `availableQuantity = stockQuantity - reservedQuantity`. Other users see reduced available stock and cannot reserve more than what's left.

**Phase 2 — Confirm**: When the order is placed successfully, `confirmSale()` is called: `stockQuantity` decreases, `reservedQuantity` decreases, `soldQuantity` increases. The item is permanently removed from available stock.

**What happens to abandoned carts?**
Currently, reservations persist indefinitely. If John adds 5 items to cart and never checks out, those 5 items are "locked" — no one else can buy them. This is a **known gap** in the system.

**Solutions**:
1. **Scheduled job** (cron): Run a daily task that finds cart items older than 24 hours and releases their reservations
2. **When session expires**: If using session-based carts, release on timeout
3. **Checkout timeout**: Give users 30 minutes to complete checkout, then release

```
Pseudo-code for fix:
@Scheduled(cron = "0 0 */6 * * *")  // Every 6 hours
public void releaseAbandonedReservations() {
    LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
    List<Cart> oldCarts = cartRepository.findByUpdatedAtBefore(cutoff);
    for (Cart cart : oldCarts) {
        for (CartItem item : cart.getItems()) {
            Inventory inv = inventoryRepository.findByProductId(item.getProduct().getId());
            inv.releaseReservation(item.getQuantity());
            inventoryRepository.save(inv);
        }
        cartItemRepository.deleteAll(cart.getItems());
    }
}
```

**Q4: Why UUIDs vs auto-increment IDs?**

**Answer**:

| Aspect | UUID | Auto-increment |
|--------|------|----------------|
| Size | 16 bytes (BINARY) | 4 bytes (INT) |
| Index performance | Slower (random, less cache-friendly) | Faster (sequential) |
| Guessable? | No (user ID "abc-123" vs "1") | Yes (user ID 1 = first user) |
| Offline generation | Yes (can create IDs without DB) | No (needs database sequence) |
| Merge conflicts | None (globally unique) | Would need reindexing |
| URL exposure | Safe (/orders/abc-123) | Predictable (/orders/1, /orders/2) |

**Why we chose UUIDs**: 
1. **Security**: User ID 1 means you're the first user. ID 2 is the second. Competitors could estimate user count. With UUIDs, no pattern.
2. **Scalability**: In a distributed system (multiple app servers), generating IDs without database calls is a big advantage.
3. **No collisions**: When merging databases (e.g., from a backup + live), auto-increment IDs WILL collide. UUIDs won't.
4. **Modern databases handle it well**: MySQL 8+ with BINARY(16) storage and proper UUID_TO_BIN() functions mitigate performance concerns.

**The trade-off**: Slightly slower inserts due to random index distribution. For 99% of applications, this is negligible.

**Q5: How does @Version optimistic locking work?**

**Answer**:
Optimistic locking solves the "lost update" problem without actually locking rows in the database.

**Scenario without optimistic locking**:
1. Admin A loads product "Nike Shoes" (version = 0)
2. Admin B loads product "Nike Shoes" (version = 0)
3. Admin A changes price to ₹2000, saves
4. Admin B changes stock to 50, saves
5. Admin B's save **overwrites** Admin A's price change! Admin A's change is lost.

**With @Version**:
1. Admin A loads product (version = 0)
2. Admin B loads product (version = 0)
3. Admin A saves → Hibernate runs: `UPDATE products SET price=2000, version=1 WHERE id=? AND version=0` → Success (1 row affected)
4. Admin B saves → `UPDATE products SET stock=50, version=1 WHERE id=? AND version=0` → **Failure** (0 rows affected, because version is now 1)
5. Hibernate throws `OptimisticLockException` → Admin B must reload and retry

**Implementation**: In `BaseEntity.java`:
```java
@Version
@Column(nullable = false)
private Long version = 0L;
```

Every entity inherits this. On every update, Hibernate automatically increments version and checks it in the WHERE clause.

**Downside**: If conflicts are frequent (e.g., multiple admins editing the same product constantly), users get many errors. In that case, pessimistic locking (row-level database locks) might be better.

**Q6: What does @JsonInclude(Include.NON_NULL) do?**

**Answer**:
When Jackson serializes a Java object to JSON, by default it includes ALL fields — even null ones.

Without `@JsonInclude(NON_NULL)`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... },
  "errorCode": null,    ← Pointless! This is a success response
  "timestamp": "...",
  "path": "/api/v1/auth/login"
}
```

With `@JsonInclude(NON_NULL)`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... },
  "timestamp": "...",
  "path": "/api/v1/auth/login"
  // errorCode is OMITTED because it's null
}
```

**Why it matters**:
1. **Cleaner responses**: No unnecessary null fields
2. **Smaller payload**: Less bandwidth, faster parsing
3. **Client-friendly**: Frontend doesn't need to check for null errorCode on success

For error responses, `errorCode` is NOT null so it appears:
```json
{
  "success": false,
  "message": "Email already registered",
  "errorCode": "CONFLICT",    ← Present because it has a value
  "timestamp": "...",
  "path": "/api/v1/auth/register"
}
```

**Q7: Is the order number generator collision-proof?**

**Answer**:
Let's analyze `OrderNumberGenerator.nextOrderNumber()`:
```java
return "ORD-" + LocalDate.now().format(BASIC_ISO_DATE) + "-" + random(100000, 999999);
```

Format: `ORD-20260619-784532` (date + 6 random digits)

There are 900,000 possible random values per day (100000 to 999999). 

**Collision probability**: If 1000 orders are placed on the same day, the probability of collision is approximately:
- First order: 0%
- 1000th order: ~0.055% (using birthday paradox math)

**Is this acceptable?** The `order_number` column has a UNIQUE constraint, so any collision would throw a database constraint violation exception, and the entire order placement would roll back (due to @Transactional). The user would get an error and need to retry.

**Improvement**: For production, the generator should retry on collision:
```java
public static String nextOrderNumber() {
    // Not ideal — use database sequence or distributed ID generator
}
```

**Better alternatives**:
1. **Database sequence**: Use MySQL `AUTO_INCREMENT` just for order numbers
2. **Snowflake ID**: Twitter's distributed ID generator (used by many companies)
3. **UUID without dashes**: Shorter and collision-proof

**Q8: Why normalize email (trim + lowercase)?**

**Answer**:
In the `AuthService`:
```java
private String normalizedEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
}
```

This prevents two attacks/confusions:

**1. Duplicate account confusion**:
- User registers as "John@Test.Com"
- Later tries to login as "john@test.com"
- Without normalization: these are different strings! User would get "Account not found"
- With normalization: both become "john@test.com" — consistent matching

**2. Email case variations in database**:
- Without normalization: `John@Test.Com` and `john@test.com` could be two different accounts
- Attackers create accounts with deliberate case variations
- With normalization: unique constraint on lowered email prevents this

**3. Trailing spaces**:
- "john@test.com " (with space) vs "john@test.com"
- Without trim: different! User copy-pastes with a space → login fails
- With trim: problem solved

**Is this sufficient?** No, it's just a basic safeguard. Real email normalization also handles:
- Gmail ignores dots: `john.doe@gmail.com` = `johndoe@gmail.com`
- Gmail ignores + suffix: `john+shopping@gmail.com` = `john@gmail.com`
- These require additional logic specific to each email provider

**Q9: How does the Axios 401 interceptor handle multiple simultaneous requests?**

**Answer**:
This is a known race condition. Consider this scenario:

1. User opens page → 3 API calls happen simultaneously (getCart, getWishlists, getOrders)
2. All 3 return 401 (token expired)
3. The **interceptor fires 3 times simultaneously** — all 3 try to refresh the token
4. This causes:
   - Multiple refresh requests to the server
   - The first refresh revokes the old refresh token (rotation)
   - The other 2 refreshes fail because the old token is now revoked
   - All 3 requests fail, user gets logged out

**Fix**: Add a "refreshing" promise queue:

```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(null, async (error) => {
  const orig = error.config;
  if (error.response?.status === 401 && !orig._retry) {
    if (isRefreshing) {
      // Queue this request — wait for the ongoing refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        orig.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(orig);
      });
    }
    
    orig._retry = true;
    isRefreshing = true;
    
    try {
      const rt = localStorage.getItem('refreshToken');
      const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: rt });
      const { accessToken, refreshToken: newRt } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRt);
      
      // Process queued requests with new token
      processQueue(null, accessToken);
      
      orig.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(orig);
    } catch (err) {
      processQueue(err, null);
      // Logout...
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(error);
});
```

The key insight: Only ONE refresh request is sent. Subsequent 401s wait in a queue until the refresh completes, then retry with the new token.

**Q10: Why layered architecture (Controller → Service → Repository)?**

**Answer**:
Each layer has a distinct responsibility:

| Layer | Job | What it does | What it does NOT do |
|-------|-----|-------------|---------------------|
| **Controller** | HTTP handling | Parse request, validate input, return response | Business logic, database calls |
| **Service** | Business logic | Validate business rules, orchestrate operations, manage transactions | HTTP details, database queries directly |
| **Repository** | Data access | Query database, return entities | Business logic, HTTP |
| **Mapper** | Object conversion | Convert Entity → DTO, DTO → Entity | Any other logic |

**Why separate them?**

1. **Testability**: You can unit-test services by mocking repositories. You can't easily test a controller that has database queries inline.

2. **Maintainability**: Need to change from MySQL to MongoDB? Only change Repository layer. Need to add authentication? Only change Controller/Security layer.

3. **Reusability**: `OrderService.placeOrder()` can be called from Controller, from a scheduled job, from a test — same business logic everywhere.

4. **Transaction management**: `@Transactional` at service layer ensures all repository calls within a service method are atomic. If you put `@Transactional` on controllers, you'd get incomplete transactions when services call each other.

**What NOT to do**: Business logic in controllers is a common anti-pattern:
```java
// BAD — business logic in controller
@PostMapping
public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest r) {
    Cart c = cartRepo.findById(userId).get();  // No null check!
    if (c.getItems().isEmpty()) { /* ... */ }  // Logic in controller!
    return ResponseEntity.ok(/* ... */);
}
```

This makes the code impossible to test, reuse, or debug properly.

### Section B: Security (Q11-Q20)

**Q11: Walk through the JwtAuthFilter request lifecycle.**

**Answer**:
```
1. REQUEST ARRIVES (e.g., GET /api/v1/orders)
2. └─ HTTP header: "Authorization: Bearer eyJhbGci..."
3.    │
4.    ▼
5. JwtAuthFilter.doFilterInternal():
6. ├─ authHeader = request.getHeader("Authorization")
7. ├─ if null or !startsWith("Bearer ") → skip filter (continue chain)
8. ├─ token = authHeader.substring(7)  // Remove "Bearer "
9. │
10. ├─ TRY:
11. │  ├─ username = jwtService.extractUsername(token)
12. │  │  └─ Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
13. │  │     → Verify HMAC-SHA256 signature with secret key
14. │  │     → Extract payload claims
15. │  │     → Return "sub" claim (email)
16. │  │
17. │  ├─ if (username != null && SecurityContext.getAuthentication() == null)
18. │  │  ├─ UserDetails = userDetailsService.loadUserByUsername(username)
19. │  │  │  └─ Database lookup: SELECT * FROM users WHERE email = ?
20. │  │  │  └─ Returns AppUserPrincipal(id, email, password, active, role)
21. │  │  │
22. │  │  ├─ if (jwtService.isTokenValid(token, userDetails))
23. │  │  │  └─ token username == userDetails username AND !token expired
24. │  │  │
25. │  │  ├─ Create Authentication object:
26. │  │  │  UsernamePasswordAuthenticationToken(
27. │  │  │    principal = userDetails,    // Who is this user
28. │  │  │    credentials = null,          // No password needed
29. │  │  │    authorities = ["ROLE_USER"]  // What they can do
30. │  │  │  )
31. │  │  │
32. │  │  └─ SecurityContextHolder.getContext().setAuthentication(auth)
33. │  │     → Now Spring knows: "This request is from JOHN, role=USER"
34. │  │
35. │  CATCH (JwtException | IllegalArgumentException):
36. │  └─ SecurityContextHolder.clearContext()  // Invalid token → no auth
37. │
38. └─ filterChain.doFilter(request, response)  // Continue to next filter
39.    │
40.    ▼
41. AuthorizationFilter (from SecurityConfig):
42. ├─ Is /api/v1/orders in permitAll paths? No
43. ├─ Is it /admin/**? No
44. ├─ .anyRequest().authenticated()? YES
45. │
46. ├─ if (SecurityContext.getAuthentication() == null || !authenticated)
47. │  └─ → 401 Unauthorized (via RestAuthenticationEntryPoint)
48. │
49. └─ if (authenticated && authorized)
50.    └─ → Continue to Controller
51.       │
52.       ▼
53. Controller:
54. UUID userId = SecurityUtils.currentUserId()
55. └─ SecurityContext.getAuthentication().getPrincipal()
56.    └─ Cast to AppUserPrincipal
57.    └─ Return user ID
```

**Q12: Why disable CSRF when using JWT?**

**Answer**:
CSRF (Cross-Site Request Forgery) attacks work like this:
1. User is logged into `bank.com` (session cookie automatically sent with requests)
2. User visits `evil.com`
3. `evil.com` has: `<img src="https://bank.com/transfer?to=hacker&amount=1000">`
4. Browser automatically sends the session cookie → transfer happens!

CSRF protection is NEEDED when authentication is cookie-based because cookies are automatically attached by the browser.

**JWT is different**: JWTs are stored in `localStorage` (not cookies) and must be EXPLICITLY added to the `Authorization` header by JavaScript. An `<img>` tag on `evil.com` cannot read `localStorage` on `bank.com` (same-origin policy), so it cannot forge requests.

**Exception**: If you store JWT in a cookie (not localStorage), you still need CSRF protection.

**Another exception**: If your API also accepts session-based auth (cookies), CSRF is needed.

Since this project uses JWT in localStorage with Authorization header:
```
✓ JwtAuthFilter expects: "Authorization: Bearer <token>"
✓ Browser auto-sends cookies but NOT Authorization headers
✓ CSRF attack impossible → CSRF protection disabled safely
```

**Q13: Security implication of allowing all localhost ports?**

**Answer**:
The CORS config:
```java
configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
```

This allows requests from ANY port on localhost. In development, this is fine — you run one app on port 3001.

**But what if...?**
- A malicious script on your machine runs a server on `http://localhost:9999`
- That script could make API calls to `http://localhost:8081`
- CORS would ALLOW it because `localhost:*` matches

**Real risk?** Very low. The attacker would need to already have code execution on your machine. If they do, CORS is the least of your worries.

**Production fix**: Change to explicit origins:
```java
setAllowedOriginPatterns(List.of("https://myecommercestore.com"));
```

**Q14: What security problem does refresh token rotation solve?**

**Answer**:
**The Problem**: Refresh tokens are long-lived (7 days). If stolen, the attacker has 7 days of access.

**Without rotation**: Alice and attacker both have valid refresh tokens. Neither knows the other exists. Both can continue refreshing indefinitely.

**With rotation** (what we implement):
1. Alice has refresh token `RT1`
2. Attacker steals `RT1`
3. Alice refreshes → `RT1` is revoked → Alice gets `RT2`
4. Attacker tries to use `RT1` → Server check: `RT1.revoked = true` → REJECTED
5. Alice knows something's wrong (she'll get logged out when `RT2` expires)

**Even better**: If the attacker refreshes FIRST:
1. Attacker uses `RT1` → `RT1` revoked → attacker gets `RT2`
2. Alice tries to refresh → Server: `RT1.revoked = true` → REJECTED
3. Alice is logged out immediately — she knows her session was compromised!

**Implementation note**: The service doesn't currently notify Alice when this happens. A security enhancement would be:
```java
if (refreshToken.getRevoked()) {
    // Notify user: "Your session may have been compromised"
    notificationService.sendSecurityAlert(refreshToken.getUser());
    throw new UnauthorizedException("Session expired");
}
```

**Q15: How does admin bootstrap key work? Can it be bypassed?**

**Answer**:
The bootstrap key is a simple security-through-secrecy mechanism:

```
application.properties:
app.admin.bootstrap-key=change-this-admin-bootstrap-key

AdminBootstrapConfig.java:
@ConfigurationProperties(prefix = "app.admin")
public class AdminBootstrapConfig {
    private String bootstrapKey;
}

AuthService.registerAdmin():
if (!setupKey.equals(adminBootstrapConfig.getBootstrapKey())) {
    throw new ForbiddenException("Invalid admin setup key");
}
```

**How to bypass**: 
1. If someone has access to `application.properties` → they know the key
2. If the key is committed to GitHub → it's exposed
3. The current key `change-this-admin-bootstrap-key` is a PLACEHOLDER — obvious to anyone

**Security improvements**:
1. **Use environment variables**: `app.admin.bootstrap-key=${ADMIN_BOOTSTRAP_KEY}` — never store in code
2. **One-time use**: Generate a unique key for each admin creation, then disable the endpoint
3. **IP restriction**: Only allow admin registration from specific IPs (VPN/internal network)
4. **Multi-factor**: Require additional verification (OAuth, admin approval)

In production, you'd typically create the first admin directly in the database, then use that admin to create more admins through the admin panel.

**Q16: Why JSON 401 instead of Spring's default HTML redirect?**

**Answer**:
Spring Security's default behavior for unauthenticated requests is to REDIRECT to a login page. This makes sense for server-rendered web apps (like JSP/Thymeleaf) but breaks REST APIs.

**Problem with default**:
```
Request: GET /api/v1/orders (no token)
Response: 302 FOUND → Location: /login (redirect to login page)
Body: <html>Redirecting...</html>
```

The frontend JavaScript would receive a 302 (or follow the redirect automatically), then try to parse an HTML page as JSON → parsing error → confusing bug.

**Our implementation**:
```
Response: 401 UNAUTHORIZED
Body: {
  "success": false,
  "message": "Authentication required",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "...",
  "path": "/api/v1/orders"
}
```

The frontend's Axios interceptor:
1. Receives 401
2. Recognizes it as an authentication error
3. Automatically tries token refresh
4. If refresh fails → redirects to `/login` React page (not server redirect)

**Q17: How does SecurityUtils.currentUserId() work?**

**Answer**:
```java
public static UUID currentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    
    if (authentication == null || !authentication.isAuthenticated() 
        || authentication instanceof AnonymousAuthenticationToken) {
        throw new UnauthorizedException("User is not authenticated");
    }
    
    Object principal = authentication.getPrincipal();
    if (principal instanceof AppUserPrincipal appUserPrincipal) {
        return appUserPrincipal.getId();
    }
    
    throw new UnauthorizedException("Unable to resolve authenticated user");
}
```

**How SecurityContext is populated**: Earlier in the request lifecycle, `JwtAuthFilter.doFilterInternal()` extracts the JWT, validates it, and calls `SecurityContextHolder.getContext().setAuthentication(auth)`. This auth object contains the `AppUserPrincipal` which has the user's UUID.

**What happens if unauthenticated?**: The method throws `UnauthorizedException` which maps to 401 via `GlobalExceptionHandler`. The caller (controller) never continues — the exception is thrown before it can access any data.

**Security boundary**: Every controller method that needs the current user calls this static method. If authentication isn't set up properly (e.g., developer forgets to add auth to a new endpoint), this method immediately throws, preventing accidental access.

**Q18: Why exclude PENDING and CANCELLED orders from verified purchase check?**

**Answer**:
The check is:
```java
private static final List<OrderStatus> PURCHASED_STATUSES = List.of(
    OrderStatus.CONFIRMED, OrderStatus.PROCESSING, 
    OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.RETURNED
);
```

**PENDING is excluded because**:
- PENDING means payment hasn't completed
- The user might not actually pay
- They shouldn't be able to review a product they haven't bought yet
- In high-traffic scenarios, a PENDING order might fail payment, and we don't want fake reviews from failed transactions

**CANCELLED is excluded because**:
- The order was cancelled, meaning the user never received the product
- They can't legitimately review a product they don't own
- Prevents: "I ordered it, cancelled it, but still want to leave a 1-star review" abuse

**RETURNED is INCLUDED** (interesting choice):
- Even if a product was returned, the user DID receive and use it
- Their review is still valid — they experienced the product
- This prevents: "I returned it so I can't review it" which would remove legitimate feedback

**Q19: How does @EnableMethodSecurity work? Could you use @PreAuthorize instead of URL rules?**

**Answer**:
`@EnableMethodSecurity` enables Spring Security annotations on methods:

```java
@EnableMethodSecurity  // Enables @PreAuthorize, @PostAuthorize, etc.
public class SecurityConfig { ... }

// Usage on a controller or service:
@PreAuthorize("hasRole('ADMIN')")
public void deleteProduct(UUID productId) { ... }
```

**URL-based vs Method-based**:

Our approach uses URL-based in `SecurityConfig`:
```java
.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
```

**Advantages of URL-based**:
- All security rules in ONE place — easy to audit
- Can't forget to annotate a new admin controller
- Security is independent of implementation

**Advantages of Method-based (@PreAuthorize)**:
- More granular — can secure individual methods differently
- Can use SpEL expressions: `@PreAuthorize("authentication.name == #userId")`
- Works on service layer too (not just controllers)

**Can we use both?** Yes! They're complementary:
```java
// URL level: Only ADMINS can reach /api/v1/admin/products/{id}
// Method level: Admin A can delete, but Admin B (different permissions) cannot
@PreAuthorize("hasPermission(#id, 'PRODUCT', 'DELETE')")
public void deleteProduct(UUID productId) { ... }
```

**Q20: What is BCrypt salt? Why not SHA-256?**

**Answer**:

**What is a salt?**: A salt is a random string added to each password before hashing. If two users have the same password ("password123"), without salt they'd have the same hash. With salt, they have different hashes.

**BCrypt flow**:
```
Password "mypassword" + RandomSalt "R2dX9kQp" → BCrypt → "$2a$10$R2dX9kQp...HASH"
```

The salt is stored as part of the hash string (first 22 characters after the algorithm identifier). When verifying:
```
Extract salt from "$2a$10$R2dX9kQp...HASH" → it's "R2dX9kQp"
Hash user input + extracted salt → compare
```

**Why NOT SHA-256**:
```
SHA-256("password123") = "ef92b778bafe771f89e4b80c9c82c5e1c23d56a3e18e6b80f1e4e8b1c1c3e5e7"
SHA-256("password123") = "ef92b778bafe771f89e4b80c9c82c5e1c23d56a3e18e6b80f1e4e8b1c1c3e5e7"
// Same input → SAME output. Every time. Every user.
```

Without salt, attackers pre-compute hashes for common passwords (rainbow tables) and instantly match stolen hashes.

**But SHA-256 with salt is still bad because**: SHA-256 is DESIGNED to be fast. A GPU can compute BILLIONS of SHA-256 hashes per second. Even with salt, attackers can try 10 billion passwords per hour.

**BCrypt is SLOW by design**:
- BCrypt has a "cost factor" (currently 10 = 2^10 iterations = 1024 rounds)
- This takes ~100ms per hash
- 10 passwords/second vs 10 billion/second = huge difference
- As computers get faster, the cost factor can increase (11, 12, etc.)

**Conclusion**: SHA-256 is for data integrity (checksums, signatures). BCrypt is for password storage. Never use SHA-256 for passwords.

### Section C: Spring Boot & JPA (Q21-Q30)

**Q21: What does spring.jpa.open-in-view=false do?**

**Answer**:
By default, Spring Boot enables `spring.jpa.open-in-view=true` (OSIV — Open Session In View). This means the Hibernate session stays open during view rendering (or in our case, JSON serialization).

**Problem with OSIV (true)**:
```java
@Service
public ProductService {
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id).orElseThrow();
        // At this point, the transaction ENDS (read-only)
        // But the Hibernate session stays OPEN
        return productMapper.toResponse(product);
        // productMapper accesses: product.getImages() ← LAZY LOADING!
        // This works because session is still open... but it:
        // 1. Executes ANOTHER SQL query (N+1 hiding)
        // 2. Happens OUTSIDE transaction boundary
    }
}
```

With OSIV on, lazy loading works even outside transactions. This hides N+1 problems and can cause lazy loading exceptions in unexpected places.

**What we set**: `spring.jpa.open-in-view=false`

This means:
1. When the service method returns (transaction ends), the Hibernate session CLOSES
2. Any lazy-loaded properties accessed after this point throw `LazyInitializationException`
3. **This forces us to use JOIN FETCH queries** (like `findWithDetailsById`) to eagerly load everything needed

**Why this is better**:
- N+1 problems are caught during DEVELOPMENT, not in production under load
- You KNOW exactly when and where queries are executed
- Performance is predictable and testable

**Q22: How does JPA Specification differ from @Query?**

**Answer**:

**@Query**: Static SQL defined at compile time:
```java
@Query("SELECT p FROM Product p WHERE p.category.id = :categoryId")
List<Product> findByCategoryId(@Param("categoryId") UUID categoryId);
```
**Problem**: For every combination of filters (category only? brand only? both? price range?), you'd need a DIFFERENT query method. That's 16+ methods for 4 optional filters!

**JPA Specification**: Build queries dynamically at runtime:
```java
public static Specification<Product> withFilters(ProductSearchRequest r) {
    return (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
        if (r.keyword() != null) predicates.add(cb.like(..., keyword));
        if (r.categoryId() != null) predicates.add(cb.equal(..., categoryId));
        if (r.minPrice() != null) predicates.add(cb.greaterThanOrEqualTo(..., minPrice));
        // ... more optional filters
        return cb.and(predicates.toArray(Predicate[]::new));
    };
}
```

**Comparisons**:
| Aspect | @Query | Specification |
|--------|--------|---------------|
| Dynamic filters | Manual concatenation (error-prone) | Automatic (add/remove predicates) |
| Type safety | String-based JPQL | Type-safe criteria API |
| Complexity | Simple for fixed queries | More complex but flexible |
| Reusability | Each query method is separate | One specification can be combined with others |

**Why we chose Specifications**: Search needs to handle any combination of: keyword, category, brand, price range, active status. With @Query, we'd need a combinatorial explosion of methods. With Specifications, it's one method that dynamically builds the WHERE clause.

**Q23: Why CustomerSummaryResponse instead of UserResponse in AdminOrderResponse?**

**Answer**:
When admin views orders, they see customer info. But should they see EVERYTHING about the user?

```
UserResponse includes: id, fullName, email, role, isActive, isEmailVerified, phone, profileImageUrl, createdAt
CustomerSummaryResponse includes: id, fullName, email ONLY
```

**Why limit the data?**:
1. **Principle of Least Privilege**: Admin needs to know who ordered (name + email to contact), but doesn't need to know if the user verified their email or when they joined
2. **Privacy**: `isEmailVerified`, `phone`, `profileImageUrl` are personal — exposed only when necessary
3. **Separation of concerns**: The order view is about ORDER details, not full user profiles

**The pattern**: Always expose the MINIMUM data needed for the use case.

```
Good: CustomerSummaryResponse(id, name, email)  // Just enough to identify the customer
Bad:  UserResponse(all fields)                   // Exposes unnecessary user data
```

**Q24: How does @Transactional work with the placeOrder method?**

**Answer**:
`@Transactional` on `placeOrder()` means:

1. **BEGIN TRANSACTION** when method starts
2. All repository operations (saves, updates, deletes) happen within this transaction
3. **COMMIT** if method returns normally
4. **ROLLBACK** if ANY RuntimeException escapes the method

**What happens if step 9 (inventory confirm) fails after step 8 (order saved)?**
```
Transaction started
  Step 8: INSERT INTO orders → SUCCESS
  Step 9: inventory.confirmSale(5) → FAILS (constraint violation)
  RuntimeException thrown
TRANSACTION ROLLBACK
```

**Result**: The `INSERT INTO orders` is UNDONE. The database is in the exact state as before `placeOrder()` was called. No orphaned orders, no missing inventory.

**What does NOT roll back?**: If `NotificationService.sendOrderPlacedNotification()` is called (step 13), that's an `@Async` method — it runs in a SEPARATE thread with its own transaction. Even if the main transaction rolls back, the notification is already sent (this is actually wrong — you'd want to send notification only after confirming the transaction committed).

**Fix**: Use `TransactionSynchronizationManager.registerSynchronization()` to send notification only after commit:
```java
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            notificationService.sendOrderPlacedNotification(order);
        }
    }
);
```

**Q25: What concurrency issue exists in review upsert? How would you fix it?**

**Answer**:
The `upsertReview()` method:
```java
Review review = reviewRepository.findByUserIdAndProductId(userId, productId)
    .orElseGet(() -> Review.builder().user(user).product(product).build());

review.setRating(request.rating());
// ... more fields

reviewRepository.save(review);  // INSERT or UPDATE
```

**Race condition**: Two simultaneous requests from the same user for the same product:

1. Request A: `findByUserIdAndProductId()` → not found → creates new review builder
2. Request B: `findByUserIdAndProductId()` → not found → creates new review builder
3. Request A: `save(reviewA)` → INSERT succeeds
4. Request B: `save(reviewB)` → INSERT fails with `DuplicateKeyException` (unique constraint on user_id + product_id)

**Result**: User gets an error even though the operation should have succeeded.

**Fix with REPEATABLE_READ isolation**:
```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public ReviewResponse upsertReview(...) {
```
This would make find() calls repeatable — if A inserts, B would see the existing row and update instead of insert.

**Better fix — Database-native upsert**:
```java
// Use MySQL INSERT ... ON DUPLICATE KEY UPDATE
@Query(value = """
    INSERT INTO reviews (id, user_id, product_id, rating, title, body, status, ...)
    VALUES (UUID(), :userId, :productId, :rating, :title, :body, 'PENDING', ...)
    ON DUPLICATE KEY UPDATE rating = :rating, title = :title, body = :body, status = 'PENDING'
    """, nativeQuery = true)
void upsertReviewNative(...);
```

This ensures atomicity at the database level.

**Q26: What does spring.flyway.baseline-on-migrate=true do?**

**Answer**:
Flyway is a database migration tool — it version-controls your database schema.

When you run `mvn flyway:migrate`:
1. Flyway checks a table called `flyway_schema_history`
2. It checks which migrations have already been applied (by filename)
3. It applies only NEW migrations in order

**Problem**: If you already have a database (maybe created manually), Flyway's first migration (V1) would fail because the tables already exist!

**Solution — baseline-on-migrate=true**:
- Tells Flyway: "Don't run migrations that are older than the current state"
- It creates a baseline entry: "V1 already applied" (or whatever version you specify)
- Only migrations AFTER the baseline are executed

**Example scenario**:
1. You manually create schema in production
2. You add Flyway later with V1, V2, V3 migrations
3. With `baseline-on-migrate=true`: Flyway marks V1 as "baseline" (already applied)
4. Starts applying V2, V3 — which add new tables/columns to existing schema

**What if a migration fails midway?**
Flyway marks the failed migration as "failed" in `flyway_schema_history`. The database is left in an inconsistent state (some changes from the migration applied, some not). You must:
1. Manually fix the issue
2. Run `flyway repair` to clean the failed entry
3. Re-run the migrations

**Q27: How do you identify which columns need indexes?**

**Answer**:
Indexes speed up SELECT queries but slow down INSERT/UPDATE (because indexes must be updated too). The key is finding the right balance.

**How to identify (using MySQL EXPLAIN)**:
```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 'uuid' ORDER BY created_at DESC;
```

Output shows:
- `type`: `ALL` (full table scan — BAD), `ref` (index lookup — GOOD), `const` (unique lookup — BEST)
- `rows`: How many rows MySQL had to scan
- `possible_keys`: Which indexes could be used
- `key`: Which index was actually used
- `Extra`: `Using filesort` (BAD — sorting without index)

**Rules of thumb**:
1. Columns in WHERE clauses → index
2. Columns in JOIN conditions → index (especially foreign keys)
3. Columns in ORDER BY → index (prevents filesort)
4. High-cardinality columns (many unique values) → good for indexing
5. Low-cardinality columns (few values like boolean) → poor for indexing alone

**Our indexes (in V8__add_indexes.sql)**:
- `idx_products_category` → category_id (JOIN)
- `idx_products_active` → active (WHERE clause)
- `idx_products_price` → price (WHERE + ORDER BY)
- `idx_orders_user` → user_id (JOIN + WHERE)
- `idx_orders_status` → order_status (WHERE)
- `idx_reviews_product` → product_id (JOIN)

**Q28: What N+1 problem does JOIN FETCH solve?**

**Answer**:
**The N+1 problem**:
```java
// This looks innocent — just getting products
List<Product> products = productRepository.findAll();

// But this loops triggers N additional queries
for (Product p : products) {  // 1 query to get products
    p.getImages().size();      // N queries to get images for EACH product
    p.getInventory().getStockQuantity();  // N more queries
}
```

Total: 1 (products) + N (images) + N (inventory) = 2N+1 queries!

**JOIN FETCH solution**:
```java
@Query("SELECT p FROM Product p " +
       "LEFT JOIN FETCH p.images " +     // Eagerly load images in one query
       "LEFT JOIN FETCH p.inventory " +   // Eagerly load inventory in one query
       "LEFT JOIN FETCH p.category " +    // Eagerly load category
       "WHERE p.id = :id")
Product findWithDetailsById(@Param("id") UUID id);
```

Generated SQL:
```sql
SELECT p.*, img.*, inv.*, cat.*
FROM products p
LEFT JOIN product_images img ON img.product_id = p.id
LEFT JOIN inventory inv ON inv.product_id = p.id
LEFT JOIN categories cat ON cat.id = p.category_id
WHERE p.id = ?
```

**Result**: 1 query instead of 3 — images and inventory are fetched in the SAME query via LEFT JOIN.

**How to verify N+1**: Enable SQL logging:
```properties
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.show-sql=true
```
If you see alternating SELECT statements (product, images, product, images), you have N+1.

**Q29: How does Spring Data JPA derive queries from method names?**

**Answer**:
Spring Data JPA parses method names and generates the query automatically:

```java
List<Order> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
```

Parsing:
```
findAllBy    → SELECT (return multiple)
UserId       → WHERE user_id = ?  
OrderBy      → ORDER BY
CreatedAt    → created_at column
Desc         → DESCENDING
```

```java
boolean existsByUserIdAndItemsProductIdAndOrderStatusIn(UUID userId, UUID productId, List<OrderStatus> statuses);
```

Parsing:
```
existsBy         → SELECT EXISTS (return boolean)
UserId           → o.user_id = ?
And              → AND
ItemsProductId   → oi.product_id = ? (traverses through items relationship)
And              → AND
OrderStatusIn    → o.order_status IN (?)
```

**What if misspelled?** Spring Data JPA throws an error at STARTUP (not runtime):
```
Caused by: org.springframework.data.mapping.PropertyReferenceException: 
No property 'orderStatuz' found for type 'Order'
```

This is GOOD — you catch the error immediately when the application starts, not when a user tries to place an order.

**Q30: Why return Object[] from aggregate query instead of a typed DTO?**

**Answer**:
The query:
```java
@Query("SELECT AVG(r.rating), COUNT(r) FROM Review r " +
       "WHERE r.product.id = :productId AND r.status = :status")
Object[] findRatingStats(@Param("productId") UUID productId, @Param("status") ReviewStatus status);
```

Returns `Object[]` where `[0]` = AVG (Double) and `[1]` = COUNT (Long).

**Why not a custom class?**: 
- Less code — no need to create a `RatingStats` DTO class
- Simpler for a two-field result
- Only used in one place

**Trade-offs**:
| Approach | Pros | Cons |
|----------|------|------|
| `Object[]` | Quick, no extra class | Type-unsafe, fragile (wrong index = runtime error) |
| `interface` projection | Type-safe, no implementation | Extra interface |
| `class` DTO | Type-safe, reusable | Extra class, constructor needed |

**Improvement** — Interface projection:
```java
public interface RatingStats {
    Double getAvgRating();
    Long getTotalReviews();
}

@Query("SELECT AVG(r.rating) as avgRating, COUNT(r) as totalReviews FROM Review r ...")
RatingStats findRatingStats(...);
```

### Section D: Business Logic (Q31-Q40)

**Q31: Walk through complete placeOrder flow with all validations.**

**Answer**:
(Already covered in detail in [Section 8](#8-order-flow). The key validations are:)

1. **Cart exists** → 404 if user has no cart
2. **Cart not empty** → 422 if empty
3. **User exists** → 404 if user deleted (edge case)
4. **Coupon valid** (if provided) → 404 if not found, 422 if expired/inactive/below minimum
5. **Address exists** (if addressId provided) → 404 if not found
6. **Stock availability** → 422 for each item if insufficient (double-check at order time)
7. **Inventory consistency** → 422 if reserved < required (shouldn't happen, but safeguard)

**When cancelled**:
1. Validate not already CANCELLED or DELIVERED (422)
2. Update status to CANCELLED
3. If payment was COMPLETED, set to REFUNDED
4. Restock all items (add back to stock, adjust sold count)

**Q32: How would you implement "Buy X Get Y Free" coupon?**

**Answer**:
The current Coupon.calculateDiscount() only handles PERCENTAGE and FLAT:
```java
public BigDecimal calculateDiscount(BigDecimal orderTotal) {
    if (discountType == DiscountType.PERCENTAGE) {
        BigDecimal discount = orderTotal.multiply(discountValue).divide(100);
        if (maxDiscountAmount != null && discount > maxDiscountAmount) cap at max;
        return discount;
    }
    return discountValue;  // FLAT
}
```

**For "Buy 2 Get 1 Free"**:
```java
public enum DiscountType {
    PERCENTAGE, FLAT, BUY_X_GET_Y_FREE  // New enum value
}

// New fields on Coupon entity:
private Integer buyQuantity;    // X = 2
private Integer freeQuantity;   // Y = 1
private UUID freeProductId;     // Specific product or null (cheapest item)

public BigDecimal calculateDiscount(BigDecimal orderTotal, List<OrderItem> items) {
    if (discountType == DiscountType.BUY_X_GET_Y_FREE) {
        // Find the cheapest item in the order
        OrderItem cheapest = items.stream()
            .min(Comparator.comparing(OrderItem::getPurchasePrice))
            .orElseThrow();
        
        // Count how many of that item the user bought
        long count = items.stream()
            .filter(i -> i.getProduct().getId().equals(freeProductId))
            .count();
        
        // For every buyQuantity items, give freeQuantity free
        int freeUnits = (int)(count / buyQuantity) * freeQuantity;
        
        // Discount = cheapest item's price × free units
        return cheapest.getPurchasePrice().multiply(BigDecimal.valueOf(freeUnits));
    }
    // ... existing logic
}
```

**Q33: Why store price snapshots at cart addition AND purchase time?**

**Answer**:
There are TWO snapshots:

1. **CartItem.priceAtAddition** — Price when user added to cart
2. **OrderItem.purchasePrice** — Price at final purchase

**Why both? Consider this scenario**:
1. Product "Shirt" costs ₹1000
2. User adds to cart → `priceAtAddition = 1000`
3. User doesn't checkout immediately
4. Next day, price drops to ₹800 (Flash Sale!)
5. User checks out

**Question**: Should user pay ₹1000 (cart price) or ₹800 (current price)?

**Current implementation**: OrderService uses CART ITEM price:
```java
item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity()))
```

This means user pays ₹1000 — the price when they added to cart. This is good because:
- User agreed to ₹1000 when adding to cart
- Price changes shouldn't affect existing carts
- Prevents "add to cart when cheap, checkout when expensive" abuse

**Alternative (not implemented)**: Use current product price:
```java
product.getEffectivePrice()  // Current price
```

This means user pays ₹800 — the current price. This is good because:
- User might not notice price increase
- More fair for flash sales

**Storing BOTH** snapshots allows either approach. Currently `OrderItem.purchasePrice` = `CartItem.priceAtAddition`, but could be different.

**Q34: Why reset review status to PENDING on every update?**

**Answer**:
This is a moderation security measure.

**Attack scenario without reset**:
1. User writes review: "Great product!" → Admin APPROVES → status = APPROVED
2. User edits review: "THIS PRODUCT IS TERRIBLE SCAM!!!" → status stays APPROVED
3. Review is immediately visible without moderation

**With reset**:
1. User writes review → PENDING → Admin APPROVES
2. User edits review → Status resets to PENDING → ADMIN must approve again
3. No way to bypass moderation

**This means**:
- Every edit triggers re-moderation
- Moderators must re-review changes
- Users can't sneak in inappropriate content after getting approved

**Is this annoying for users?** Yes, but it's necessary. Real platforms like Amazon and Google Reviews also re-moderate edited reviews.

**Q35: Why Math.max(0, soldQuantity - item.getQuantity()) when restocking?**

**Answer**:
In `restockItems()`:
```java
inventory.setSoldQuantity(Math.max(0, inventory.getSoldQuantity() - item.getQuantity()));
```

**Why max with 0?** Consider:
- `soldQuantity = 2` (2 units have been sold)
- Order item has quantity = 5
- Without max: `soldQuantity = 2 - 5 = -3` (negative sold count!)

**How could sold < item quantity?** This shouldn't happen in normal flow, but edge cases:
1. Admin manually adjusted inventory (decreased sold quantity)
2. Database was partially restored
3. Bug caused incorrect sold tracking

The `max(0, ...)` prevents negative `soldQuantity`, which would make no sense (you can't have sold -3 units).

**Defensive programming**: Even though this case shouldn't occur, handling it prevents weird data that would break reports and statistics.

**Q36: What happens if deleteAllByCartId fails? How does @Transactional handle it?**

**Answer**:
```java
@Transactional
public OrderResponse placeOrder() {
    // ... many operations ...
    cartItemRepository.deleteAllByCartId(cart.getId());  // Step 12
    // ... return response
}
```

**If delete fails** (e.g., database connection timeout, constraint violation):

1. The `RuntimeException` (or its subclass) propagates up
2. Spring's transaction manager detects the exception
3. **ROLLBACK** is triggered for the ENTIRE transaction
4. Everything is undone:
   - Order creation → reversed
   - Order items → reversed
   - Payment → reversed
   - Inventory changes → reversed (but not automatically!)

**Wait — inventory changes?** Inventory is updated in the same transaction. When rollback happens:
- `inventory.confirmSale()` → UPDATE inventory SET stock=9, reserved=0, sold=1
- Rollback reverses this: stock=10, reserved=0, sold=0 again

**Result**: The system is in the exact same state as before the order was attempted. The user can retry.

**Implication**: The frontend should handle this gracefully — show "Order failed, please try again" rather than "Your card was charged but order wasn't placed."

**Q37: How does Razorpay signature verification work in detail?**

**Answer**:
```java
private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
    try {
        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec key = new SecretKeySpec(
            paymentConfig.getSignatureSecret().getBytes(StandardCharsets.UTF_8), 
            "HmacSHA256"
        );
        hmac.init(key);
        byte[] hash = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String computed = HexFormat.of().formatHex(hash);
        return computed.equals(signature);
    } catch (Exception ex) {
        throw new BadRequestException("Unable to verify payment signature");
    }
}
```

**Step-by-step**:
1. **Build payload**: `"rpay_order_uuid|rpay_payment_uuid"` (concatenate with pipe)
2. **Initialize HMAC**: Use HmacSHA256 algorithm with the secret key (known only to our server and Razorpay)
3. **Compute hash**: HMAC produces a deterministic output for the same (payload, key) pair
4. **Convert to hex**: Binary → readable hex string like `"a1b2c3d4e5f6..."`
5. **Compare**: Does computed hash match the signature from Razorpay?

**Why HMAC and not simple comparison?**:
- HMAC is a KEYED hash — only the server and Razorpay know the key
- Without the key, an attacker can't forge a valid signature
- Even if they know the order ID and payment ID (public data), they can't create the matching signature

**What if secret doesn't match?**:
- Computed hash ≠ received signature
- Payment verification FAILS
- Payment status set to FAILED
- Order stays PENDING
- No goods shipped, no money collected

**Q38: Is wishlist idempotent add the right behavior?**

**Answer**:
Current implementation:
```java
boolean exists = wishlistItemRepository.findByWishlistIdAndProductId(wlId, prodId).isPresent();
if (!exists) {
    wishlistItemRepository.save(WishlistItem.builder()...build());
}
// If exists → SILENTLY SKIP (no error)
```

**Arguments for idempotent (current)**:
- User clicks "Add to Wishlist" twice quickly → no error, no duplicate
- User already has this in wishlist → "You already have this" error is annoying
- Frontend doesn't need to check before adding — just call and it works

**Arguments against (throw error)**:
- User might want to know: "Hey, this is already in your wishlist!"
- Prevents accidental double-doing (if there side effects)
- Frontend can show a toast: "Already in your wishlist!"

**Verdict**: Idempotent is fine for wishlists because:
- There's no side effect to worry about (unlike payments!)
- Users often click buttons twice quickly
- Better UX: item appears in wishlist silently vs getting an error

**Q39: Performance issue with clearDefaultAddress? How to fix?**

**Answer**:
```java
private void clearDefaultAddress(UUID userId) {
    addressRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
        .forEach(address -> {
            if (Boolean.TRUE.equals(address.getIsDefault())) {
                address.setIsDefault(false);
                addressRepository.save(address);  // N updates!
            }
        });
}
```

**Problem**: For a user with 100 addresses, this:
1. Loads all 100 addresses
2. Iterates through all 100
3. Saves 1 (the default) + still touches all 100 in memory

**Better approach**: Direct database query:
```java
@Modifying
@Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.isDefault = true")
int clearDefaultAddress(@Param("userId") UUID userId);
```

This executes ONE UPDATE query instead of iterating in Java:
```sql
UPDATE addresses SET is_default = false WHERE user_id = ? AND is_default = true
```

**Even better — handled in database without extra query**: Use `UPDATE ... WHERE is_default = true` only if needed. If the new address is not default, skip the clear entirely (which the current code does — it only clears if `request.isDefault()` is true).

**Q40: Why sort users in Java instead of SQL?**

**Answer**:
```java
// Current (Java sort):
userRepository.findAll().stream()
    .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
    .toList();

// Alternative (SQL sort):
// userRepository.findAllByOrderByCreatedAtDesc()
```

**Why Java sort?**: Probably an oversight or last-minute change. SQL sort is better:
- Database is optimized for sorting (uses indexes)
- Less data transferred (if sorted in DB, LIMIT/OFFSET works correctly)
- Less memory used on application server

**When Java sort is acceptable**:
- Very small datasets (< 100 rows)
- Complex sorting logic that's hard to express in JPQL
- Sorting computed fields not stored in database

**For production**: Change to repository method:
```java
List<User> findAllByOrderByCreatedAtDesc();
```

### Section E: Frontend & Integration (Q41-Q45)

**Q41: Fix the Axios 401 race condition?**

**Answer**:
(See detailed fix in Q9 above). The core problem: multiple simultaneous 401s each try to refresh independently. Solution: queue-and-single-refresh pattern.

**Q42: What happens if token is expired when page loads?**

**Answer**:
When `AuthContext` initializes:
```javascript
useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        authApi.getMe()  // This will fail if token expired!
            .then((res) => { /* set user */ })
            .catch(() => {
                // Clear everything → user sees login page
            });
    }
}, []);
```

**Problem**: The Axios 401 interceptor tries to refresh, but this happens during initial app load. If refresh also fails, user is redirected to `/login`. But the redirect uses `window.location.href = '/login'` which DOES cause a full page reload!

**Better approach**: 
1. Check token expiry BEFORE calling `/auth/me`:
```javascript
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch { return true; }
}

useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isTokenExpired(token)) {
        authApi.getMe()...
    } else {
        // Try to refresh immediately
        const rt = localStorage.getItem('refreshToken');
        if (rt) { refreshAndRetry(); }
        else { setLoading(false); }
    }
}, []);
```

**Q43: localStorage vs httpOnly cookies for JWT storage?**

**Answer**:

| Aspect | localStorage | httpOnly Cookie |
|--------|-------------|-----------------|
| XSS vulnerability | Yes — JS can read token | No — JS cannot read cookie |
| CSRF vulnerability | No — JS must add header manually | Yes — cookie auto-sent |
| Token refresh | Needs JS implementation | Can use refresh token cookie |
| API requests | JS must add Authorization header | Cookie auto-attached |
| Subdomain sharing | No (origin-specific) | Yes (with domain config) |

**Why localStorage is OK here**:
- XSS (Cross-Site Scripting) is the concern — if an attacker injects JS into your page, they can read localStorage and steal tokens
- BUT: if an attacker has XSS, they can also make API calls directly — they don't need your token
- For an e-commerce app without user-generated content (no comments, no rich text), XSS risk is low
- Storing in localStorage is simpler and more portable

**Best practice**: Use httpOnly cookies for the refresh token (prevents XSS theft) and memory (not localStorage) for the access token (retrieved from refresh). This is called the "BFF" (Backend For Frontend) pattern.

**Q44: Why check for both 'ROLE_ADMIN' and 'ADMIN'?**

**Answer**:
```javascript
const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
```

**Why two checks?**: Spring Security adds `ROLE_` prefix when using `hasRole("ADMIN")`. The `@PreAuthorize("hasRole('ADMIN')")` check expects `ROLE_ADMIN` in authorities.

But the JWT token stores the raw role name: `"role": "ADMIN"` (no prefix). When the frontend gets the user from `/auth/me`, the `UserResponse` might have `role: "ADMIN"` or `role: "ROLE_ADMIN"` depending on serialization.

**The fix**: Normalize in one place. Better approach:
```javascript
const isAdmin = user?.role?.replace('ROLE_', '') === 'ADMIN';
```

**Q45: Why wrap Axios calls in API modules instead of calling axios directly?**

**Answer**:
```javascript
// api/products.js — THIN WRAPPER
export const productApi = {
    getById: (id) => axios.get(`/products/${id}`),
    search: (params) => axios.get('/products/search', { params }),
};
```

**Benefits**:
1. **Centralized URL management**: If `/products/search` moves to `/search/products`, change ONE file, not every component
2. **Consistent error handling**: Each module can add specific error handling
3. **Easier testing**: Mock `productApi` in tests instead of mocking axios
4. **IDE autocomplete**: `productApi.getById(id)` vs remembering `/products/${id}`
5. **No URL strings in components**: Components focus on UI, not URL construction

**Without wrappers**:
```javascript
// In ProductDetail.jsx — BAD: URL scattered in components
const res = await axios.get(`http://localhost:8081/api/v1/products/${id}`);
```

**With wrappers**:
```javascript
// In ProductDetail.jsx — GOOD: clean, readable
const res = await productApi.getById(id);
```

### Section F: Advanced & System Design (Q46-Q50)

**Q46: Scaling to 10,000 concurrent users — identify bottlenecks?**

**Answer**:
```
Bottleneck 1: DATABASE
└─ Problem: MySQL on a single server can handle ~500 concurrent connections
   └─ Solutions:
      ├─ Connection pooling (HikariCP) — already used, but tune pool size
      ├─ Read replicas — product browsing (SELECT) goes to replicas
      ├─ Caching — Redis for product data, reduce DB reads by 90%
      └─ Sharding — Split data across multiple MySQL instances by user_id

Bottleneck 2: JWT VALIDATION
└─ Problem: Each request requires token parsing + HMAC verification
   └─ Solutions:
      ├─ Stateless — actually SCALES well (no server-side session)
      └─ RSA instead of HMAC — public key for verification (no shared secret)

Bottleneck 3: INVENTORY
└─ Problem: Every cart add and order placement locks inventory rows
   └─ Solutions:
      ├─ Optimistic locking (already using @Version) — retry on conflict
      ├─ Queue orders — use message queue (RabbitMQ/Kafka) for order processing
      └─ Batch inventory updates — reduce DB writes

Bottleneck 4: IMAGE SERVING
└─ Problem: Product images served by the same server
   └─ Solution: CDN (CloudFront, Cloudflare) — serve images from edge locations

Bottleneck 5: SESSION / AFFINITY
└─ Problem: None! JWT is stateless — ANY server can handle ANY request
   └─ Add more servers behind a load balancer — horizontal scaling
```

**Q47: Design a refresh token cleanup strategy.**

**Answer**:
**Problem**: `refresh_tokens` table accumulates millions of expired/revoked records.

**Strategy 1: Scheduled deletion**
```java
@Scheduled(cron = "0 0 3 * * ?")  // 3 AM daily
@Transactional
public void cleanExpiredTokens() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(30);  // Keep 30 days for audit
    int deleted = refreshTokenRepository.deleteByExpiryDateBefore(cutoff);
    log.info("Cleaned {} expired refresh tokens", deleted);
}
```

**Strategy 2: TTL-based (MySQL event)**
```sql
CREATE EVENT clean_expired_tokens
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM refresh_tokens WHERE expiry_date < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

**Strategy 3: Batch delete (avoids long locks)**
```sql
-- Delete in batches to avoid table locks
DELETE FROM refresh_tokens 
WHERE expiry_date < '2026-01-01' 
LIMIT 1000;
-- Repeat until no rows affected
```

**Important considerations**:
1. Don't delete tokens that are still valid! (Obviously)
2. Keep tokens for a while after expiry for audit/security forensics
3. Run cleanup during low-traffic hours
4. Use LIMIT to avoid table lock timeouts

**Q48: Design a real notification system.**

**Answer**:
Current `NotificationService` just logs. A real system would:

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Order Placed    │────►│ Message Queue     │────►│ Email Service    │
│ (Application)   │     │ (RabbitMQ/Redis)  │     │ (SendGrid/SES)    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                               │                           │
                               │                    ┌──────┴──────┐
                               │                    │ SMS Service │
                               │                    │ (Twilio)     │
                               │                    └─────────────┘
                               │                           │
                               │                    ┌──────┴──────┐
                               │                    │ Push Service │
                               │                    │ (Firebase)   │
                               │                    └─────────────┘
```

**Implementation**:
```java
public interface NotificationChannel {
    void send(NotificationMessage message);
}

@Component
@ConditionalOnProperty("notifications.email.enabled")
public class EmailNotificationChannel implements NotificationChannel {
    @Override
    public void send(NotificationMessage message) {
        // Send via Amazon SES / SendGrid
    }
}

@Service
public class NotificationService {
    private final List<NotificationChannel> channels;
    
    @Async
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void sendOrderConfirmation(Order order) {
        NotificationMessage msg = new NotificationMessage(
            order.getUser().getEmail(),
            "Order Confirmed!",
            "Your order " + order.getOrderNumber() + " has been placed."
        );
        channels.forEach(ch -> ch.send(msg));
    }
    
    @Recover  // Called when all retries fail
    public void handleFailure(Exception e, Order order) {
        // Log to dead letter queue for manual processing
        log.error("Failed to send notification for order {}", order.getOrderNumber(), e);
    }
}
```

**Q49: Design an abandoned cart reservation release mechanism.**

**Answer**:
**Goal**: Release inventory reserved by carts that haven't checked out within 24 hours.

**Solution 1: Scheduled Task (simple)**:
```java
@Component
public class AbandonedCartCleanupJob {
    
    @Scheduled(fixedRate = 3600000)  // Every hour
    @Transactional
    public void releaseAbandonedCarts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Cart> oldCarts = cartRepository.findCartsWithItemsOlderThan(cutoff);
        
        for (Cart cart : oldCarts) {
            for (CartItem item : cart.getItems()) {
                Inventory inv = inventoryRepository.findByProductId(
                    item.getProduct().getId()
                ).orElseThrow();
                
                // Release the reserved stock
                inv.releaseReservation(item.getQuantity());
                inventoryRepository.save(inv);
            }
            
            // Option 1: Notify user before clearing
            // notificationService.sendCartAbandonedWarning(cart);
            
            // Option 2: Clear items immediately
            cartItemRepository.deleteAllByCartId(cart.getId());
        }
    }
}
```

**Solution 2: Event-driven (better)**:
```javascript
// When user adds to cart, schedule a delayed task:
// cartService.addItem() → redis.setex("cart:userId", 86400, cartId)
// When cart is checked out → redis.del("cart:userId")
// When the Redis key expires → release reservation
```

**Solution 3: Checkpoint-based (most robust)**:
- Track `updatedAt` on cart
- During ORDER PLACEMENT, verify all items are still in stock (already done!)
- If item sold out since added to cart → inform user, skip that item

**Q50: How to rename a column with zero downtime (lazy migration)?**

**Answer**:
**Problem**: Renaming `is_active` to `enabled` in production. The old code uses `is_active`, new code uses `enabled`. Both must work during deployment.

**The Lazy Migration Technique (3 Phases)**:

**Phase 1: Add new column (deploy 1)**:
```sql
-- V9__add_enabled_column.sql
ALTER TABLE users ADD COLUMN enabled BOOLEAN DEFAULT NULL;
-- Create trigger to sync: UPDATE users SET enabled = is_active WHERE enabled IS NULL;
```

Code still uses `is_active`. New column exists but is null. A background job backfills `enabled = is_active`.

**Phase 2: Dual-write, read from new (deploy 2)**:
- Deploy code that:
  - WRITES to BOTH `is_active` and `enabled`
  - READS from `enabled`
  - Falls back to `is_active` if `enabled` is null
- Monitor for issues

**Phase 3: Drop old column (deploy 3)**:
```sql
-- V10__drop_is_active.sql
ALTER TABLE users DROP COLUMN is_active;
```

- Code now only uses `enabled`
- Old column removed

**Total: 3 deployments, zero downtime at each step.**

**Why not just ALTER TABLE RENAME COLUMN?**: In MySQL 8+, `RENAME COLUMN` is instant (metadata only). But the OLD code deployed on other servers still references the old column name. The rename would break those servers immediately. Lazy migration ensures both old and new code work simultaneously during rolling deployment.

---

## 16. Architecture Decisions Summary

### Question → Answer Quick Reference

| Decision | Why We Did It | Trade-off |
|----------|---------------|-----------|
| Two tokens (access + refresh) | Better security, revocable access | More complex frontend logic |
| Embedded ShippingAddress | Historical accuracy forever | Data duplication |
| Two-phase inventory | Prevents overselling | Abandoned cart reservations leak |
| UUID primary keys | Security + distributed-friendly | Slightly slower inserts |
| @Version optimistic locking | Prevents lost updates | Retry logic needed on conflict |
| BCrypt passwords | Adaptive slowness prevents brute force | ~100ms per hash (acceptable) |
| Flyway migrations | Version control for database | Learning curve |
| JPA Specifications | Dynamic queries without SQL injection | More complex than @Query |
| Factory method (no `new`) | Cleaner null-safe object creation | Must remember to use builder |
| React + Vite | Fast dev experience, large ecosystem | Client-side rendering SEO |
| Axios with interceptors | Automatic token refresh | Race condition with parallel 401s |
| ApiResponse wrapper | Consistent API responses | Extra nesting in frontend |
| Stateless JWT | Horizontal scaling | Can't revoke individual access tokens |
| Refresh token rotation | Detect token theft | More DB writes on each refresh |

---

> **Generated by: Cline AI Assistant**  
> **Date**: June 19, 2026  
> **Purpose**: Comprehensive, beginner-friendly guide to the EEEE e-commerce platform  
> **Includes**: Flowcharts, ER diagrams, detailed data flows, security analysis, 50 interview Q&A