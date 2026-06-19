# EEEE E-Commerce Platform — Complete Architecture & Analysis

> **Project**: Spring Boot (Backend) + React/Vite (Frontend) E-Commerce Platform  
> **Database**: MySQL with Flyway Migrations  
> **Auth**: JWT (Access + Refresh Token) with Role-Based Access Control  
> **Payment**: Razorpay Integration + Mock Payment Mode  

---

## Table of Contents

1. [BACKEND FILE-BY-FILE ANALYSIS](#1-backend-file-by-file-analysis)
2. [ENTITY CARDINALITIES](#2-entity-cardinalities)
3. [AUTH DATA FLOW — REGISTRATION & LOGIN](#3-auth-data-flow)
4. [SECURITY FEATURES](#4-security-features)
5. [FRONTEND ANALYSIS](#5-frontend-analysis)
6. [ALL API ENDPOINTS](#6-all-api-endpoints)
7. [50 INTERVIEW QUESTIONS](#7-50-interview-questions)

---

## 1. BACKEND FILE-BY-FILE ANALYSIS

### 1.1 Security Layer (7 files)

#### `security/SecurityConfig.java`
- **Purpose**: Central Spring Security configuration. Defines which endpoints are public, which require authentication, which require ADMIN role. Configures stateless sessions, CORS, CSRF disable, and registers the JWT filter.
- **Key Rules**:
  - `POST /api/v1/auth/**` → permitAll (register, login, refresh, logout)
  - `GET /api/v1/products/**`, `/categories/**`, `/search/**`, `/reviews/**`, `/payments/methods`, `/meta/**` → permitAll
  - `/api/v1/demo/**` → permitAll (bootstrap/demo data)
  - `/api/v1/admin/**` → `hasRole("ADMIN")`
  - All other requests → authenticated
  - CORS allows `http://localhost:*` and `http://127.0.0.1:*` with credentials
  - CSRF disabled (stateless JWT auth doesn't need it)

#### `security/JwtConfig.java`
- **Purpose**: Configuration properties holder for JWT settings (`app.jwt.*`). Validated with `@Validated`.
- **Properties**: `secret` (Base64 HMAC-SHA256 key), `expiration` (15 min/900000ms), `refreshExpiration` (7 days/604800000ms).

#### `security/JwtService.java`
- **Purpose**: Core JWT operations — generate access tokens, extract claims (username, userId), validate tokens.
- **Claims in Access Token**: `sub` = email, `uid` = user UUID, `role` = Role enum name, `iat`, `exp`.
- **Signing**: HMAC-SHA256 with Base64-decoded secret key from `JwtConfig`.
- **Key Methods**: `generateAccessToken(AppUserPrincipal)`, `extractUsername(token)`, `extractUserId(token)`, `isTokenValid(token, userDetails)`.

#### `security/JwtAuthFilter.java`
- **Purpose**: `OncePerRequestFilter` that intercepts every request, extracts Bearer token from `Authorization` header, validates it, and sets Spring Security `Authentication` in `SecurityContextHolder`.
- **Error Handling**: On `JwtException` or `IllegalArgumentException`, clears security context but continues the filter chain (doesn't block the request — public endpoints will pass through anyway).

#### `security/CustomUserDetailsService.java`
- **Purpose**: Implements `UserDetailsService`. Loads user by email (case-insensitive lookup). Returns `AppUserPrincipal` or throws `ResourceNotFoundException`.

#### `security/AppUserPrincipal.java`
- **Purpose**: Custom `UserDetails` implementation carrying `id` (UUID), `email`, `password`, `active`, `role`. `getAuthorities()` returns `ROLE_USER` or `ROLE_ADMIN`. `isEnabled()` maps to `isActive`.

#### `security/RestAuthenticationEntryPoint.java`
- **Purpose**: Custom `AuthenticationEntryPoint` that returns 401 JSON response in the standard `ApiResponse` format with `UNAUTHORIZED` error code, instead of Spring's default HTML error page.

---

### 1.2 Entities (Domain Model — 17 files)

#### `entity/BaseEntity.java`
- **Purpose**: Abstract base class for all entities. Provides `id` (UUID, auto-generated), `createdAt`, `updatedAt` (timestamps), and `version` (`@Version` for optimistic locking).
- **Key**: UUID strategy with `GenerationType.UUID`. Optimistic locking prevents concurrent modification conflicts.

#### `entity/User.java`
- **Purpose**: Core user entity. Has `fullName`, `email` (unique), `password` (BCrypt), `role` (USER/ADMIN), `isActive`, `isEmailVerified`, `phone`, `profileImageUrl`, `lastLoginAt`.
- **Relationships**: 1→* addresses, 1→1 cart, 1→1 wishlist, 1→* orders, 1→* reviews.

#### `entity/Address.java`
- **Purpose**: User shipping/billing addresses. Has full address fields, `addressType` (HOME/WORK/OTHER), `isDefault`.
- **Relationship**: *→1 User.

#### `entity/Cart.java`
- **Purpose**: Shopping cart — one per user. Has no own fields beyond FKs.
- **Relationships**: 1→1 User, 1→* CartItems.

#### `entity/CartItem.java`
- **Purpose**: Individual item in a cart. Has `quantity`, `priceAtAddition` (snapshot of product's effective price when added to cart — protects against price changes).
- **Relationships**: *→1 Cart, *→1 Product.

#### `entity/Product.java`
- **Purpose**: Core product entity. Fields: `name`, `slug` (unique), `description`, `price`, `discountPrice`, `active`, `brand`, `sku` (unique), `avgRating`, `totalReviews`.
- **Business Logic**: `getEffectivePrice()` — returns `discountPrice` if set and > 0, else returns `price`.
- **Relationships**: *→1 Category, 1→* ProductImages, 1→1 Inventory, 1→* Reviews.

#### `entity/ProductImage.java`
- **Purpose**: Product image URLs with display ordering. `isPrimary` flag for the main image.
- **Relationship**: *→1 Product.

#### `entity/Category.java`
- **Purpose**: Product categories with self-referential hierarchy (parent/child). Fields: `name`, `slug` (unique), `description`, `imageUrl`.
- **Relationships**: Self-referential *→1 parentCategory, 1→* subCategories, 1→* Products.

#### `entity/Inventory.java`
- **Purpose**: Stock tracking for each product. Fields: `stockQuantity`, `reservedQuantity`, `soldQuantity`, `sku`, `lowStockThreshold`, `inStock`.
- **Business Logic**:
  - `getAvailableQuantity()` = `stockQuantity - reservedQuantity`
  - `hasStock(qty)` = `availableQuantity >= qty`
  - `reserve(qty)` = increases `reservedQuantity`
  - `releaseReservation(qty)` = decreases `reservedQuantity` (min 0)
  - `confirmSale(qty)` = decreases `stockQuantity`, decreases `reservedQuantity`, increases `soldQuantity`
- **Key Design**: Two-phase inventory management — reserve on cart add, confirm on order placement. Prevents overselling.

#### `entity/Order.java`
- **Purpose**: Customer order. Fields: `orderNumber` (unique, format: `ORD-YYYYMMDD-######`), `totalPrice`, `discountAmount`, `finalPrice`, `orderStatus` (PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED), `paymentStatus`. Embeds `ShippingAddress`.
- **Relationships**: *→1 User, 1→* OrderItems, *→1 Coupon, 1→1 Payment.

#### `entity/OrderItem.java`
- **Purpose**: Individual item within an order. Fields: `quantity`, `purchasePrice`, `subtotal`. Snapshot at time of purchase.
- **Relationships**: *→1 Order, *→1 Product.

#### `entity/ShippingAddress.java`
- **Purpose**: **Embeddable** value object stored directly in the Order table as columns (`shipping_full_name`, `shipping_phone`, etc.). This is a **snapshot** — ensures order history accuracy even if user modifies/deletes their original address later.
- **Key Design**: Not an entity, no PK. Embedded directly in Order.

#### `entity/Payment.java`
- **Purpose**: Payment transaction record. Fields: `razorpayOrderId`, `razorpayPaymentId`, `amount`, `currency` (INR), `status` (PENDING/COMPLETED/FAILED/REFUNDED), `method`, `paidAt`.
- **Relationship**: 1→1 Order.

#### `entity/RefreshToken.java`
- **Purpose**: JWT refresh token stored in DB. Fields: `token` (unique, format: UUID.UUID), `expiryDate`, `revoked` (boolean). Allows token revocation (logout).
- **Relationship**: *→1 User.
- **Business Logic**: `isExpired()` checks if current time is past `expiryDate`.

#### `entity/Review.java`
- **Purpose**: Product review by user. Fields: `rating`, `title`, `body`, `status` (PENDING/APPROVED/REJECTED), `isVerifiedPurchase`.
- **Unique Constraint**: `(user_id, product_id)` — one review per user per product.
- **Relationships**: *→1 User, *→1 Product.

#### `entity/Wishlist.java`
- **Purpose**: User's product wishlist. Users can have multiple wishlists with different names. Fields: `name` (default: "My Wishlist").
- **Relationships**: *→1 User, 1→* WishlistItems.

#### `entity/WishlistItem.java`
- **Purpose**: Product saved to a wishlist. Tracks `addedAt` timestamp.
- **Relationships**: *→1 Wishlist, *→1 Product.

---

### 1.3 Enums (7 files)

| Enum | Values | Usage |
|------|--------|-------|
| `Role` | `USER`, `ADMIN` | User roles for RBAC |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED` | Order lifecycle states |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` | Payment lifecycle |
| `PaymentMethod` | `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING`, `WALLET`, `COD` | Supported payment methods |
| `DiscountType` | `PERCENTAGE`, `FLAT` | Coupon discount types |
| `ReviewStatus` | `PENDING`, `APPROVED`, `REJECTED` | Review moderation states |
| `AddressType` | `HOME`, `WORK`, `OTHER` | Address classification |

---

### 1.4 DTO Layer (Request & Response)

**Request DTOs** (under `dto/request/`):

| DTO | Key Fields | Validation | Used In |
|-----|-----------|------------|---------|
| `RegisterRequest` | `fullName`, `email`, `password`, `phone` | `@Valid`, `@Email`, `@NotBlank` | AuthController.register |
| `LoginRequest` | `email`, `password` | `@Valid`, `@NotBlank` | AuthController.login |
| `RefreshTokenRequest` | `refreshToken` | `@NotBlank` | AuthController.refresh/logout |
| `AdminRegisterRequest` | `fullName`, `email`, `password` | `@Valid` | AuthController.registerAdmin |
| `ProductRequest` | `name`, `slug`, `description`, `price`, `sku`, `categoryId`, `imageUrls`, `stockQuantity`, etc. | `@Valid` | AdminProductController |
| `CategoryRequest` | `name`, `slug`, `description`, `imageUrl`, `parentId` | `@Valid` | AdminCategoryController |
| `AddCartItemRequest` | `productId`, `quantity` | `@Valid` | CartController |
| `UpdateCartItemRequest` | `quantity` | `@Valid` | CartController |
| `PlaceOrderRequest` | `addressId` OR `shippingAddress`, `couponCode` (optional), `paymentMethod` | `@Valid` | OrderController |
| `AddressRequest` | `fullName`, `phone`, `addressLine1`, `city`, `state`, `postalCode`, `country`, `addressType`, `isDefault` | `@Valid` | AddressController |
| `ReviewRequest` | `productId`, `rating`, `title`, `body` | `@Valid` | ReviewController |
| `CouponRequest` | `code`, `discountType`, `discountValue`, `minOrderAmount`, `maxDiscountAmount`, `usageLimit`, `active`, `expiryDate` | `@Valid` | AdminCouponController |
| `ApplyCouponRequest` | `code`, `orderAmount` | `@Valid` | CouponController |
| `InventoryUpdateRequest` | `productId`, `stockQuantity`, `lowStockThreshold` | `@Valid` | AdminInventoryController |
| `PaymentInitiateRequest` | `orderId`, `paymentMethod` | `@Valid` | PaymentController |
| `PaymentVerifyRequest` | `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `signature` | `@Valid` | PaymentController |
| `ProductSearchRequest` | `keyword`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `active`, `page`, `size`, `sortBy`, `sortDir` | `@Valid` | ProductController/SearchController |
| `UpdateOrderStatusRequest` | `orderStatus` | — | AdminOrderController |
| `UpdateUserStatusRequest` | `active` | — | AdminUserController |
| `ModerateReviewRequest` | `status` | — | AdminReviewController |
| `ShippingAddressRequest` | `fullName`, `phone`, `addressLine1-2`, `city`, `state`, `postalCode`, `country` | — | Cart/Order (embedded) |

**Response DTOs** (under `dto/response/`): Mirror the entity structure but flattened, with nested DTOs instead of entity references. Key ones: `AuthResponse` (accessToken, refreshToken, tokenType, expiresIn, user), `ProductResponse`, `CartResponse`, `OrderResponse`, `AdminOrderResponse` (adds `CustomerSummaryResponse`), `UserResponse`, `AddressResponse`, `ReviewResponse`, `WishlistResponse`, `PaymentResponse`, `CouponResponse`, `CouponValidationResponse`, `InventoryResponse`.

---

### 1.5 Mappers (7 files)

| Mapper | Purpose | Key Mappings |
|--------|---------|-------------|
| `UserMapper` | User → UserResponse | Simple field mapping |
| `ProductMapper` | Product → ProductResponse | Also handles ProductImage→ProductImageResponse, Inventory→InventoryResponse. Calls `getEffectivePrice()` |
| `CartMapper` | Cart → CartResponse | Calculates subtotal (sum of `priceAtAddition * quantity`). Calculates subtotal + shipping (currently zero). Maps CartItem→CartItemResponse with nested ProductResponse |
| `OrderMapper` | Order → OrderResponse + AdminOrderResponse | Maps items, payment, shipping address, coupon code. Admin version adds `CustomerSummaryResponse` with user id/name/email |
| `AddressMapper` | Address → AddressResponse, Address→ShippingAddress (Embeddable), ShippingAddressRequest→ShippingAddress | Bi-directional address mapping |
| `ReviewMapper` | Review → ReviewResponse | Includes user id/name and product id |
| `WishlistMapper` | Wishlist → WishlistResponse, WishlistItem→WishlistItemResponse | Nested ProductResponse via ProductMapper |

---

### 1.6 Repositories (17 files)

Standard Spring Data JPA repositories extending `JpaRepository<Entity, UUID>`. Notable custom queries:

| Repository | Custom Methods |
|------------|---------------|
| `UserRepository` | `findByEmailIgnoreCase(email)` — case-insensitive unique lookup. `existsByEmailIgnoreCase(email)` |
| `CartRepository` | `findByUserId(userId)` |
| `CartItemRepository` | `findByCartIdAndProductId(cartId, productId)`, `findByIdAndCartId(id, cartId)`, `deleteAllByCartId(cartId)` |
| `OrderRepository` | `findByIdAndUserId(id, userId)` (user-scoped). `findAllWithDetailsOrderByCreatedAtDesc()` (admin fetch with items). `findAllByUserIdOrderByCreatedAtDesc(userId)`. `existsByUserIdAndItemsProductIdAndOrderStatusIn(userId, productId, statuses)` (verified purchase check) |
| `InventoryRepository` | `findByProductId(productId)` — unique inventory per product |
| `ReviewRepository` | `findByUserIdAndProductId(userId, productId)`. `findAllByProductIdAndStatus(productId, status, pageable)`. `findRatingStats(productId, status)` — returns [avg_rating, total_reviews] as Object[] (aggregation query) |
| `RefreshTokenRepository` | `findByToken(token)` |
| `WishlistRepository` | `findByUserId(userId)`, `findByIdAndUserId(id, userId)`, `existsByUserIdAndNameIgnoreCase(userId, name)`, `existsByUserIdAndNameIgnoreCaseAndIdNot(userId, name, id)` |
| `WishlistItemRepository` | `findByWishlistIdAndProductId(wishlistId, productId)`, `findByIdAndWishlistId(id, wishlistId)` |
| `CouponRepository` | `findByCodeIgnoreCase(code)`, `existsByCodeIgnoreCase(code)` |
| `CategoryRepository` | `findAllByParentCategoryIsNullOrderByNameAsc()` (root categories). `findAllByParentCategoryIdOrderByNameAsc(parentId)` (subcategories). `existsBySlug(slug)` |
| `ProductRepository` | `findBySlug(slug)`, `findBySku(sku)`, `findWithDetailsById(id)` (JOIN FETCH for images). Extends `JpaSpecificationExecutor<Product>` for dynamic filtering |

---

### 1.7 Service Layer — Business Logic (13 files)

#### `AuthService.java`
- **Purpose**: User registration, login, token refresh, logout.
- **Business Logic**:
  - **Register**: Normalizes email (trim + lowercase). Checks uniqueness. Creates user with `Role.USER`. Auto-creates default Cart and Wishlist ("My Wishlist"). Issues tokens via `issueTokens()`.
  - **Register Admin**: Requires `X-Admin-Setup-Key` header matching `admin.bootstrap-key` from config. Same flow but `Role.ADMIN` and `isEmailVerified=true`.
  - **Login**: Authenticates via `AuthenticationManager`. Updates `lastLoginAt`. Issues tokens.
  - **Refresh Token**: Validates refresh token exists, not revoked, not expired. Revokes old token, issues new pair (token rotation).
  - **Logout**: Revokes the refresh token (if found).
  - **Issue Tokens**: Creates `AppUserPrincipal` from entity, generates JWT access token, creates persistent `RefreshToken` with UUID.UUID format and 7-day expiry.

#### `ProductService.java`
- **Purpose**: CRUD for products with inventory management and search.
- **Business Logic**:
  - **Create**: Validates unique slug + sku. Creates Product + Inventory. Applies images. Returns full response with details.
  - **Update**: Validates uniqueness excluding current product. Updates fields. Validates stock >= reserved quantity before updating stock. Updates inventory `inStock` flag based on `availableQuantity > 0`.
  - **Delete**: Hard delete (orphanRemoval cascades images/inventory).
  - **Search**: Uses `ProductSpecifications.withFilters()` for dynamic query building with JPA Criteria API. Supports keyword (name/desc/brand/sku), category, brand, price range, active status. Pagination and sorting with whitelist validation (`createdAt`, `price`, `name`, `avgRating`, `totalReviews`).
  - **Featured**: Returns active products sorted by `createdAt` desc, capped at 50.

#### `CartService.java`
- **Purpose**: Cart management — get, add, update, remove items.
- **Business Logic**:
  - **Add Item**: Validates product active, checks stock via `inventory.hasStock()`. Creates new CartItem or updates existing one (increments quantity). **Reserves inventory** on add (`inventory.reserve()`).
  - **Update Item**: Calculates delta. If increasing quantity, checks stock first (reserves delta). If decreasing, releases reservation. Rejects negative quantities.
  - **Remove Item**: Releases reservation for the removed quantity. Deletes CartItem.
  - **Cart Creation**: Lazily creates cart on first access if not exists.

#### `OrderService.java`
- **Purpose**: Order placement, user/admin order retrieval, cancellation, status updates.
- **Business Logic**:
  - **Place Order**: 
    1. Validates cart not empty
    2. Calculates total price from cart items
    3. Validates and applies coupon (checks active, not expired, min order, within usage limit)
    4. Resolves shipping address (from saved address by ID or inline request)
    5. Creates Order with unique order number (`ORD-YYYYMMDD-######` with random 6-digit suffix)
    6. For each cart item: validates reserved quantity >= required, confirms sale via `inventory.confirmSale()` (decrements stock, decrements reserved, increments sold)
    7. Creates Payment record
    8. **Empties cart** (`deleteAllByCartId`)
    9. Sends async notification via `NotificationService`
  - **Cancel Order (User)**: Only if not already CANCELLED or DELIVERED. Refunds payment if COMPLETED. Restocks items (adds back to stock, decrements sold).
  - **Update Status (Admin)**: If DELIVERED and payment PENDING → auto-completes payment. If CANCELLED → restocks.
  - **Verified Purchase Check**: `existsByUserIdAndItemsProductIdAndOrderStatusIn` — checks if user has purchased product with status in [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, RETURNED].

#### `PaymentService.java`
- **Purpose**: Payment initiation, mock payment, Razorpay verification.
- **Business Logic**:
  - **Initiate**: Creates/updates Payment record linked to order. Generates mock `razorpayOrderId` if not exists.
  - **Mock Complete**: Simulates successful payment — generates mock IDs, sets COMPLETED status, sets `paidAt`, transitions order from PENDING→CONFIRMED.
  - **Verify Payment**: Validates `razorpayOrderId` matches stored. Verifies HMAC-SHA256 signature: `HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, secret)`. On success: marks payment COMPLETED, order CONFIRMED. On failure: marks FAILED.
  - **Get Payment**: Retrieves payment for given order (user-scoped).

#### `ReviewService.java`
- **Purpose**: User review upsert, admin moderation, rating recalculation.
- **Business Logic**:
  - **Upsert**: Only verified buyers (checked via `OrderService.hasVerifiedPurchase()`). Uses `findByUserIdAndProductId` for upsert pattern — creates new or updates existing review. Sets status to PENDING on every write.
  - **Moderate**: Admin approves/rejects. Recalculates product's `avgRating` and `totalReviews` via aggregate query `SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id=? AND status=APPROVED`.
  - **Get Approved**: Paginated fetch of only APPROVED reviews for public display.

#### `CouponService.java`
- **Purpose**: Coupon CRUD, validation, deactivation.
- **Business Logic**:
  - **Create/Update**: Normalizes code to uppercase. Validates uniqueness.
  - **Validate**: Checks coupon exists, is active, not expired, within usage limit, order amount >= min order. Calculates discount with `maxDiscountAmount` cap for percentage coupons.
  - **Deactivate**: Sets `active=false` (soft delete).

#### `WishlistService.java`
- **Purpose**: Multiple wishlist management per user.
- **Business Logic**:
  - **Get All**: Returns all user wishlists or creates default "My Wishlist".
  - **Create**: Validates name (1-100 chars, unique per user).
  - **Add Item**: Validates product active. Idempotent — silently skips if already in wishlist.
  - **Move to Cart**: Calls `CartService.addItem()` then removes from wishlist.
  - **Delete/Rename**: User-scoped operations.

#### `AddressService.java`
- **Purpose**: User address CRUD.
- **Business Logic**: Setting a new address as default clears default flag from other addresses first.

#### `InventoryService.java`
- **Purpose**: Admin inventory management — get stock, update, manual reserve/release.
- **Business Logic**: Validates `stockQuantity >= reservedQuantity` on update to prevent data inconsistency.

#### `AdminUserService.java`
- **Purpose**: Admin user management — list, activate/deactivate, delete.

#### `CategoryService.java`
- **Purpose**: Category CRUD with hierarchical tree building.
- **Business Logic**: Tree is built recursively — root categories fetched first, then children fetched per parent. Prevents self-referencing parent.

#### `NotificationService.java`
- **Purpose**: Async notification placeholder. Currently logs order confirmation and status change messages. `@Async` annotation makes these execute on a separate thread — non-blocking.

---

### 1.8 Controller Layer — REST API (19 files)

**Public Controllers** (under `controller/`):

| Controller | Base Path | Key Endpoints | Auth Required |
|-----------|-----------|---------------|--------------|
| `AuthController` | `/api/v1/auth` | POST register, POST login, POST refresh, POST logout, GET me (authenticated) | Mixed |
| `ProductController` | `/api/v1/products` | GET by id, GET by slug, GET search, GET featured | Public (GET) |
| `CategoryController` | `/api/v1/categories` | GET tree, GET by id | Public |
| `SearchController` | `/api/v1/search` | GET products (alias for product search) | Public |
| `CartController` | `/api/v1/cart` | GET cart, POST items, PUT items/{id}, DELETE items/{id} | Authenticated |
| `OrderController` | `/api/v1/orders` | POST (place), GET list, GET {id}, POST {id}/cancel | Authenticated |
| `AddressController` | `/api/v1/addresses` | GET list, POST, PUT {id}, DELETE {id} | Authenticated |
| `ReviewController` | `/api/v1/reviews` | POST (upsert), GET product/{id} | Mixed (POST auth, GET public) |
| `CouponController` | `/api/v1/coupons` | POST validate | Authenticated |
| `PaymentController` | `/api/v1/payments` | GET methods, POST initiate, POST mock-complete, POST verify, GET order/{id} | Authenticated (GET methods public) |
| `WishlistController` | `/api/v1/wishlists` | GET all, GET {id}, POST (create), PUT {id} (rename), DELETE {id}, POST {wishlistId}/items/{productId}, DELETE items/{itemId}, POST items/{itemId}/move-to-cart | Authenticated |
| `MetaController` | `/api/v1/meta` | App metadata (public) | Public |

**Admin Controllers** (under `controller/admin/`):

| Controller | Base Path | Key Endpoints |
|-----------|-----------|---------------|
| `AdminProductController` | `/api/v1/admin/products` | POST (create), PUT {id}, DELETE {id}, GET search |
| `AdminCategoryController` | `/api/v1/admin/categories` | GET list, POST, PUT {id}, DELETE {id} |
| `AdminOrderController` | `/api/v1/admin/orders` | GET all, GET {id}, PATCH {id}/status |
| `AdminUserController` | `/api/v1/admin/users` | GET list, PATCH {id}/status, DELETE {id} |
| `AdminCouponController` | `/api/v1/admin/coupons` | GET list, POST, PUT {id}, DELETE {id} |
| `AdminInventoryController` | `/api/v1/admin/inventory` | GET product/{id}, PUT (update stock) |
| `AdminReviewController` | `/api/v1/admin/reviews` | PATCH {id}/moderate |

---

### 1.9 Exception Handling & Error Codes

#### `GlobalExceptionHandler.java`
- `@RestControllerAdvice` — centralized exception handling.
- Handles: `ApiException` (custom status + error code), `MethodArgumentNotValidException` (validation errors → 400), `ConstraintViolationException` (400), generic `Exception` (500).
- All responses use the standard `ApiResponse` format with `errorCode` enum.

#### Exception Hierarchy:
```
ApiException (abstract, holds HttpStatus + ErrorCode + message)
├── BadRequestException (400, BAD_REQUEST)
├── UnauthorizedException (401, UNAUTHORIZED)
├── ForbiddenException (403, FORBIDDEN)
├── ResourceNotFoundException (404, RESOURCE_NOT_FOUND)
├── ConflictException (409, CONFLICT)
└── BusinessException (422, BUSINESS_RULE_VIOLATION)
```

#### `ErrorCode` Enum: `BAD_REQUEST`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE_VIOLATION`, `INTERNAL_SERVER_ERROR`.

---

### 1.10 Config & Bootstrap

| File | Purpose |
|------|---------|
| `AdminBootstrapConfig.java` | Holds `app.admin.bootstrap-key` — used to secure admin registration endpoint |
| `PaymentConfig.java` | Holds `app.payment.signature-secret` — used to verify Razorpay HMAC signatures |
| `OpenApiConfig.java` | Swagger/OpenAPI configuration at `/api-docs` |
| `application.properties` | Main config — DB URL (env vars with defaults), JWT settings, Flyway, server port 8081 |

---

### 1.11 Utils & Specifications

| File | Purpose |
|------|---------|
| `SecurityUtils.java` | Static helper `currentUserId()` — extracts user UUID from SecurityContext. Throws `UnauthorizedException` if not authenticated or anonymous |
| `OrderNumberGenerator.java` | Generates order numbers: `ORD-YYYYMMDD-######` using `ThreadLocalRandom` for concurrent safety |
| `PageUtils.java` | Helper to build Spring `Pageable` from page/size/sort params with validation |
| `ProductSpecifications.java` | JPA Criteria API `Specification<Product>` — builds dynamic WHERE clause for product search (keyword, category, brand, price range, active status) |

---

### 1.12 Database Migrations (Flyway)

| Migration | Tables Created | Key Details |
|-----------|---------------|-------------|
| `V1__create_users.sql` | `users`, `addresses`, `refresh_tokens` | Users with email unique, addresses FK→users CASCADE DELETE, refresh_tokens FK→users CASCADE DELETE |
| `V2__create_categories_products.sql` | `categories`, `products`, `product_images` | Categories with self-referencing parent_id. Products FK→categories. Product images FK→products CASCADE |
| `V3__create_inventory.sql` | `inventory` | One-to-one with products. sku unique |
| `V4__create_cart.sql` | `carts`, `cart_items` | One-to-one cart→user. Cart items with price snapshot |
| `V5__create_orders.sql` | `orders`, `order_items` | Orders with embedded shipping address snapshot. Coupon optional FK |
| `V6__create_reviews_wishlist.sql` | `reviews`, `wishlists`, `wishlist_items` | Reviews unique(user,product). Wishlists one-to-many user |
| `V7__create_coupons_payments.sql` | `coupons`, `payments` | Payments one-to-one with orders |
| `V8__add_indexes.sql` | (indexes only) | Indexes on category_id, active, brand, price, user_id, order_status, created_at, product_id, status, cart_id, in_stock, order_id, wishlist_id |
| `V10__fashion_data.sql` | (seed data) | Fashion category/product seed data |

---

## 2. ENTITY CARDINALITIES

```
User (1) ──────────── (1) Cart
User (1) ─────────── (0..*) Address
User (1) ─────────── (0..*) Wishlist
User (1) ─────────── (0..*) Order
User (1) ─────────── (0..*) Review
User (1) ─────────── (0..*) RefreshToken

Cart (1) ─────────── (1..*) CartItem
CartItem (*) ───────── (1) Product

Category (1) ─────── (0..*) Product
Category (0..1) ──── (0..*) Category (self-referencing parent)

Product (1) ───────── (1) Inventory
Product (1) ───────── (0..*) ProductImage
Product (1) ───────── (0..*) Review
Product (1) ───────── (0..*) CartItem
Product (1) ───────── (0..*) OrderItem
Product (1) ───────── (0..*) WishlistItem

Order (1) ─────────── (1..*) OrderItem
Order (1) ─────────── (1) Payment
Order (*) ─────────── (0..1) Coupon
Order (1) ─────────── (1) ShippingAddress (Embedded, not a separate table)

Wishlist (1) ──────── (0..*) WishlistItem
WishlistItem (*) ───── (1) Product
```

---

## 3. AUTH DATA FLOW

### Registration Flow:
```
Frontend → POST /api/v1/auth/register { email, password, fullName, phone }
  ↓
AuthController.register() → AuthService.register()
  ↓
1. Normalize email (trim + lowercase)
2. Check existsByEmailIgnoreCase → ConflictException(409) if duplicate
3. BCrypt.encode(password)
4. Create User (role=USER, isActive=true, isEmailVerified=false)
5. Save User → userRepository.save(user)
6. Create Cart + Wishlist (auto-created for every user)
7. issueTokens(user):
   a. Create AppUserPrincipal(user)
   b. jwtService.generateAccessToken(principal) → JWT with claims: {sub: email, uid: UUID, role: USER}
   c. Create RefreshToken (UUID.UUID format, 7-day expiry) → save to DB
   d. Return AuthResponse { accessToken, refreshToken, tokenType: "Bearer", expiresIn, user }
  ↓
Frontend stores: localStorage.setItem('accessToken'), localStorage.setItem('refreshToken'), localStorage.setItem('user')
  ↓
User is logged in automatically
```

### Login Flow:
```
Frontend → POST /api/v1/auth/login { email, password }
  ↓
AuthController.login() → AuthService.login()
  ↓
1. Normalize email
2. authenticationManager.authenticate(UsernamePasswordAuthenticationToken)
   → CustomUserDetailsService.loadUserByUsername(email)
   → BCryptPasswordEncoder.matches(password, storedHash)
3. Find user by email → UnauthorizedException(401) if not found
4. Update lastLoginAt
5. issueTokens(user) — same flow as registration
  ↓
Frontend stores tokens in localStorage
```

### Token Refresh Flow:
```
Frontend detects 401 → Axios interceptor captures it
  ↓
POST /api/v1/auth/refresh { refreshToken }
  ↓
AuthService.refreshToken():
1. Find RefreshToken by token → UnauthorizedException if not found
2. Check revoked OR expired → UnauthorizedException if invalid
3. Revoke old refresh token (set revoked=true)
4. Issue NEW token pair (token rotation — prevents replay attacks)
  ↓
Frontend updates localStorage and retries original request
```

### Logout Flow:
```
Frontend → POST /api/v1/auth/logout { refreshToken }
  ↓
AuthService.logout():
1. Find RefreshToken by token (if exists)
2. Set revoked=true
  ↓
Frontend clears localStorage: accessToken, refreshToken, user
```

---

## 4. SECURITY FEATURES

### Implemented:
1. **Password Hashing**: BCrypt via `BCryptPasswordEncoder` (Spring Security default strength)
2. **JWT Access Tokens**: HMAC-SHA256 signed, 15-min expiry, carries user ID + role
3. **Refresh Token Rotation**: Old refresh token is revoked when a new pair is issued — prevents replay attacks
4. **Refresh Token Expiry**: 7-day expiry, checked on every refresh
5. **Refresh Token Revocation**: Logout and refresh both revoke old tokens
6. **Email Normalization**: Trim + lowercase on registration/login — prevents duplicate accounts with case variations
7. **Input Validation**: `@Valid` on all request DTOs, field-level constraints, global validation exception handler
8. **Role-Based Access Control**: `@EnableMethodSecurity` + URL-based rules — admin endpoints require `ROLE_ADMIN`
9. **Stateless Sessions**: No HTTP session — `SessionCreationPolicy.STATELESS`
10. **CSRF Protection Disabled**: Intentionally — JWT tokens are immune to CSRF (not cookie-based)
11. **CORS Restriction**: Only allows `http://localhost:*` and `http://127.0.0.1:*`
12. **CORS Credentials**: `allowCredentials(true)` — allows sending Authorization header
13. **Authentication Entry Point**: Returns consistent JSON 401 instead of HTML redirect
14. **Optimistic Locking**: `@Version` on BaseEntity prevents concurrent modification
15. **Inventory Two-Phase Locking**: Reserve on cart add, confirm on order — prevents overselling
16. **Verified Purchase Check**: Only users who purchased the product can review it
17. **Admin Registration Protected**: Requires `X-Admin-Setup-Key` header matching bootstrap key
18. **Payment Signature Verification**: HMAC-SHA256 verification for Razorpay callbacks
19. **Error Code Separation**: Different HTTP status codes + error codes for different failure types
20. **Async Notifications**: Non-blocking notification sending via `@Async`

### Notable Gaps / Considerations:
- **Rate Limiting**: Not implemented — no protection against brute force login attempts
- **Email Verification**: `isEmailVerified` field exists but verification email flow not implemented
- **HTTPS**: Not enforced (development only)
- **Audit Logging**: Only `createdAt`/`updatedAt` timestamps — no detailed audit trail
- **Sensitive Data Exposure**: Error messages sometimes leak specific reasons (e.g., "User not found with email: X" could be used for enumeration)

---

## 5. FRONTEND ANALYSIS

### 5.1 Project Structure
```
frontend/
├── .env                           # VITE_API_BASE_URL=http://localhost:8081/api/v1
├── vite.config.js                 # Dev server at port 3001
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Router + Layout + AuthProvider
│   ├── api/
│   │   ├── axios.js               # Axios instance with interceptors
│   │   ├── auth.js                # Auth API calls
│   │   ├── products.js            # Product API calls
│   │   ├── categories.js          # Category API calls
│   │   ├── cart.js                # Cart API calls
│   │   ├── orders.js              # Order API calls
│   │   ├── addresses.js           # Address API calls
│   │   ├── reviews.js             # Review API calls
│   │   ├── wishlist.js            # Wishlist API calls
│   │   ├── coupons.js             # Coupon API calls
│   │   └── admin.js               # Admin API calls
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state management
│   ├── components/
│   │   └── Navbar.jsx             # Navigation bar with auth-aware rendering
│   └── pages/
│       ├── auth/                  # Login, Register
│       ├── user/                  # Home, Shop, ProductDetail, Cart, Checkout, Orders, OrderDetail, Profile, Wishlists
│       └── admin/                 # Dashboard, AdminProducts, AdminCategories, AdminOrders, AdminUsers, AdminInventory, AdminReviews, AdminCoupons
```

### 5.2 Axios Instance & Interceptors (`api/axios.js`)

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

**Request Interceptor**: Attaches `Authorization: Bearer <token>` header from `localStorage.getItem('accessToken')` on every request.

**Response Interceptor (401 Handling)**:
1. If response is `401` and not already retried (`_retry` flag):
2. Fetches refresh token from localStorage
3. Calls `POST /auth/refresh` with the refresh token
4. Updates `accessToken` and `refreshToken` in localStorage
5. Retries the original failed request with new token
6. If refresh fails: clears all localStorage and redirects to `/login`

### 5.3 Auth Context (`context/AuthContext.jsx`)

**State**: `user` (from localStorage or fetched), `loading` (initial auth check)
**On Mount**: If `accessToken` exists in localStorage:
1. Call `GET /auth/me` to validate token and get user
2. On success: set user state, store in localStorage
3. On failure: clear all auth data from localStorage
**Provided Methods**:
- `login(credentials)`: POST login → store tokens + user → set user state
- `register(data)`: POST register → store tokens + user → set user state
- `logout()`: POST logout (with refresh token) → clear localStorage → set user null
- `isAdmin`: Derived flag — checks `user.role === 'ROLE_ADMIN' || user.role === 'ADMIN'`

### 5.4 How Frontend Talks to Backend

**Security Flow**:
1. User logs in → receives `accessToken` + `refreshToken`
2. All subsequent API calls include `Authorization: Bearer <accessToken>` via Axios interceptor
3. If token expires (401 response), interceptor automatically refreshes
4. On refresh failure, user is logged out and redirected

**CORS**:
- Frontend runs at `http://localhost:3001` (Vite dev server)
- Backend at `http://localhost:8081`
- CORS configured to allow `http://localhost:*` and `http://127.0.0.1:*`
- Credentials enabled (`allowCredentials: true`)

**Request/Response Format**:
- All requests send JSON with `Content-Type: application/json`
- All responses follow `ApiResponse` wrapper: `{ success, message, data, errorCode, timestamp, path }`
- Error responses are parsed and handled in components

### 5.5 API Modules Summary

| Module | Base URL | Auth Required | Key Methods |
|--------|----------|---------------|-------------|
| `auth.js` | `/auth` | No (register/login), Yes (me/logout) | `login`, `register`, `refresh`, `logout`, `getMe` |
| `products.js` | `/products`, `/search` | No | `getAll(params)`, `getById(id)`, `getBySlug(slug)`, `search(params)`, `getFeatured(limit)` |
| `categories.js` | `/categories` | No | `getTree()`, `getById(id)` |
| `cart.js` | `/cart` | Yes | `getCart()`, `addItem(data)`, `updateItem(id, data)`, `removeItem(id)` |
| `orders.js` | `/orders` | Yes | `placeOrder(data)`, `getMyOrders()`, `getById(id)`, `cancelOrder(id)` |
| `addresses.js` | `/addresses` | Yes | `list()`, `add(data)`, `update(id, data)`, `delete(id)` |
| `reviews.js` | `/reviews` | Yes (POST), No (GET) | `upsert(data)`, `getByProduct(productId, params)` |
| `wishlist.js` | `/wishlists` | Yes | `getAll()`, `getById(id)`, `create(name)`, `rename(id, name)`, `delete(id)`, `addItem(wlId, prodId)`, `removeItem(wlId, itemId)`, `moveToCart(wlId, itemId, qty)` |
| `coupons.js` | `/coupons` | Yes | `validate(data)` |
| `admin.js` | `/admin/*` | Yes (ADMIN role) | `createProduct`, `updateProduct`, `deleteProduct`, `createCategory`, `listCategories`, `getAllOrders`, `updateOrderStatus`, `listUsers`, `updateUserStatus`, `createCoupon`, `updateCoupon`, `deactivateCoupon`, `listCoupons`, `getInventory`, `updateInventory`, `moderateReview` |

### 5.6 CORS Configuration on Backend

```java
CorsConfiguration configuration = new CorsConfiguration();
configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true);
```

---

## 6. ALL API ENDPOINTS

### Public Endpoints (No Auth Required)

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) |
| POST | `/api/v1/auth/register-admin` | Register admin (requires X-Admin-Setup-Key header) |
| GET | `/api/v1/products/{id}` | Get product by ID |
| GET | `/api/v1/products/slug/{slug}` | Get product by slug |
| GET | `/api/v1/products/search` | Search products (with filters, pagination) |
| GET | `/api/v1/products/featured` | Get featured products |
| GET | `/api/v1/categories/tree` | Get category tree |
| GET | `/api/v1/categories/{id}` | Get category by ID |
| GET | `/api/v1/search/products` | Search products (alias) |
| GET | `/api/v1/reviews/product/{productId}` | Get approved reviews for product |
| GET | `/api/v1/payments/methods` | List payment methods |
| GET | `/api/v1/meta/**` | App metadata |
| GET | `/swagger-ui.html` | Swagger UI |
| GET | `/api-docs/**` | OpenAPI docs |

### Authenticated User Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/auth/me` | Get current user profile |
| GET | `/api/v1/cart` | Get user's cart |
| POST | `/api/v1/cart/items` | Add item to cart |
| PUT | `/api/v1/cart/items/{cartItemId}` | Update cart item quantity |
| DELETE | `/api/v1/cart/items/{cartItemId}` | Remove item from cart |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders` | Get user's orders |
| GET | `/api/v1/orders/{orderId}` | Get order by ID |
| POST | `/api/v1/orders/{orderId}/cancel` | Cancel order |
| GET | `/api/v1/addresses` | List user's addresses |
| POST | `/api/v1/addresses` | Add address |
| PUT | `/api/v1/addresses/{id}` | Update address |
| DELETE | `/api/v1/addresses/{id}` | Delete address |
| POST | `/api/v1/reviews` | Upsert review (must be verified buyer) |
| POST | `/api/v1/coupons/validate` | Validate coupon |
| POST | `/api/v1/payments/initiate` | Initiate payment |
| POST | `/api/v1/payments/mock-complete` | Complete mock payment |
| POST | `/api/v1/payments/verify` | Verify Razorpay payment |
| GET | `/api/v1/payments/order/{orderId}` | Get payment for order |
| GET | `/api/v1/wishlists` | List user's wishlists |
| GET | `/api/v1/wishlists/{id}` | Get wishlist by ID |
| POST | `/api/v1/wishlists` | Create wishlist |
| PUT | `/api/v1/wishlists/{id}` | Rename wishlist |
| DELETE | `/api/v1/wishlists/{id}` | Delete wishlist |
| POST | `/api/v1/wishlists/{wlId}/items/{productId}` | Add product to wishlist |
| DELETE | `/api/v1/wishlists/{wlId}/items/{itemId}` | Remove item from wishlist |
| POST | `/api/v1/wishlists/{wlId}/items/{itemId}/move-to-cart` | Move wishlist item to cart |

### Admin Endpoints (Requires ROLE_ADMIN)

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/v1/admin/products` | Create product |
| PUT | `/api/v1/admin/products/{id}` | Update product |
| DELETE | `/api/v1/admin/products/{id}` | Delete product |
| GET | `/api/v1/admin/products/search` | Admin product search |
| GET | `/api/v1/admin/categories` | List all categories |
| POST | `/api/v1/admin/categories` | Create category |
| PUT | `/api/v1/admin/categories/{id}` | Update category |
| DELETE | `/api/v1/admin/categories/{id}` | Delete category |
| GET | `/api/v1/admin/orders` | List all orders |
| GET | `/api/v1/admin/orders/{id}` | Get order details |
| PATCH | `/api/v1/admin/orders/{id}/status` | Update order status |
| GET | `/api/v1/admin/users` | List all users |
| PATCH | `/api/v1/admin/users/{id}/status` | Activate/deactivate user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/coupons` | List all coupons |
| POST | `/api/v1/admin/coupons` | Create coupon |
| PUT | `/api/v1/admin/coupons/{id}` | Update coupon |
| DELETE | `/api/v1/admin/coupons/{id}` | Deactivate coupon |
| GET | `/api/v1/admin/inventory/product/{productId}` | Get inventory for product |
| PUT | `/api/v1/admin/inventory` | Update inventory |
| PATCH | `/api/v1/admin/reviews/{id}/moderate` | Moderate review (approve/reject) |

---

## 7. 50 INTERVIEW QUESTIONS (Medium-Hard)

### Architecture & Design (Q1-Q10)

**Q1**: The project uses both JWT access tokens (15-min expiry) and refresh tokens (7-day expiry stored in DB). Why two tokens instead of one long-lived access token? What security benefit does this provide?

**Q2**: The `ShippingAddress` is an `@Embeddable` value object stored directly in the `orders` table, not referenced via foreign key to the `addresses` table. Why was this design chosen? What problem does it solve?

**Q3**: Inventory management uses a two-phase approach — items are "reserved" when added to cart and "confirmed" when the order is placed. What happens if a user adds items to cart but never checks out? How could you handle abandoned cart inventory release?

**Q4**: The project uses UUIDs as primary keys instead of auto-increment integers. What are the trade-offs? Consider performance, indexing, security, and distributed system implications.

**Q5**: Explain the role of `@Version` in `BaseEntity` and how optimistic locking works here. What would happen if two admin users tried to update the same product's inventory simultaneously?

**Q6**: The `ApiResponse` record uses `@JsonInclude(Include.NON_NULL)`. Why is this important? What would the response look like for success vs error without it?

**Q7**: The `OrderNumberGenerator` uses `ThreadLocalRandom` and date-based formatting. What happens if two orders are placed at the exact same millisecond? Is there a risk of collision?

**Q8**: Why does the `AuthService.normalizedEmail()` method trim and lowercase the email? What attacks does this prevent?

**Q9**: The frontend has an Axios response interceptor that retries failed 401 requests with a new token. What happens if multiple API calls fail simultaneously (e.g., two parallel requests get 401)? How could this cause a problem, and how might you fix it?

**Q10**: Explain the layered architecture of this Spring Boot application. Why are controllers separated from services, and services from repositories? What would be the downside of having business logic in controllers?

### Security (Q11-Q20)

**Q11**: How does the `JwtAuthFilter` work? Walk through the request lifecycle from the moment a request hits the server to the moment it reaches a controller with `@PreAuthorize`.

**Q12**: The CSRF protection is disabled in `SecurityConfig`. Why is it safe to disable CSRF when using JWT-based authentication? When would you NOT disable CSRF?

**Q13**: The CORS configuration uses `allowedOriginPatterns` with wildcards (`http://localhost:*`). What is the security implication of allowing all localhost ports? Could this be exploited?

**Q14**: The refresh token uses a "rotation" strategy — when a refresh token is used, the old one is revoked and a new one is issued. What security problem does this solve? What happens if a stolen refresh token is used after the legitimate user has already refreshed?

**Q15**: Explain the admin bootstrap key protection. How could an attacker bypass it? What additional security measures would you add to admin registration?

**Q16**: The `RestAuthenticationEntryPoint` returns a JSON response with status 401. Why is this important for a REST API compared to Spring's default behavior?

**Q17**: The `SecurityUtils.currentUserId()` method extracts the user ID from the `SecurityContext`. How does Spring Security populate this context? What would happen if an unauthenticated request tries to call this method?

**Q18**: The `hasVerifiedPurchase` check in `ReviewService` queries for order statuses [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, RETURNED]. Why are PENDING and CANCELLED orders excluded?

**Q19**: How does the `@EnableMethodSecurity` annotation work with Spring Security? Could you use `@PreAuthorize("hasRole('ADMIN')")` on a service method instead of URL-based configuration in `SecurityConfig`?

**Q20**: The application uses BCrypt for password hashing. What is a salt, and how does BCrypt incorporate it? Why is BCrypt preferred over simpler hashing algorithms like SHA-256 for passwords?

### Spring Boot & JPA (Q21-Q30)

**Q21**: Explain the purpose of `spring.jpa.open-in-view=false` in the application properties. What problem does this setting address? What alternative pattern must be used for lazy loading?

**Q22**: The `ProductRepository` extends both `JpaRepository` AND `JpaSpecificationExecutor`. Explain how `ProductSpecifications.withFilters()` builds dynamic queries using the JPA Criteria API. How is this different from using `@Query` with JPQL?

**Q23**: The `OrderMapper.toAdminResponse()` method creates a `CustomerSummaryResponse` with the user's ID, name, and email. Why not return the full `UserResponse`? What information disclosure concern does this address?

**Q24**: Explain how `@Transactional` works in this application. The `placeOrder()` method in `OrderService` is `@Transactional`. What happens if a runtime exception occurs after saving the order but before deleting cart items?

**Q25**: The `ReviewService.upsertReview()` uses `findByUserIdAndProductId()` first, then either creates a new review or updates the existing one. What concurrency issue could arise if two simultaneous requests try to upsert a review for the same user+product? How would `@Transactional(REPEATABLE_READ)` isolation help?

**Q26**: Flyway migrations are used for schema management. Why is `spring.flyway.baseline-on-migrate=true` set? What happens if a migration fails midway?

**Q27**: The `V8__add_indexes.sql` migration adds indexes on frequently queried columns. How would you identify which columns need indexing? Explain using `EXPLAIN` in MySQL.

**Q28**: The `findWithDetailsById()` method in ProductRepository uses `JOIN FETCH`. What N+1 query problem does this solve? How would you verify if N+1 queries are happening?

**Q29**: How does Spring Data JPA derive the query from `existsByUserIdAndItemsProductIdAndOrderStatusIn` method name in `OrderRepository`? What would happen if the method name is misspelled?

**Q30**: The `findRatingStats` method in ReviewRepository returns `Object[]` from an aggregate query. Why not use `TypedQuery<RatingStats>` or a custom DTO projection? What are the trade-offs?

### Business Logic (Q31-Q40)

**Q31**: Walk through the complete `placeOrder` flow in `OrderService`. What validations happen at each step? What happens to the inventory when an order is placed? What happens when it's cancelled?

**Q32**: The `Coupon.calculateDiscount()` method handles both PERCENTAGE and FLAT discount types. For percentage coupons, it caps at `maxDiscountAmount`. How would you implement a "buy X get Y free" coupon type?

**Q33**: Explain the price snapshot pattern used in `CartItem.priceAtAddition` and `OrderItem.purchasePrice`. Why is it important to store the price at the time of cart addition AND at purchase time separately?

**Q34**: The `reviewUpsert` method in `ReviewService` always sets status to `PENDING` on every update. Why? What would happen if a previously APPROVED review was updated and status wasn't reset?

**Q35**: When an order is cancelled, `restockItems()` is called. Why does it do `Math.max(0, soldQuantity - item.getQuantity())` when decrementing sold quantity? What edge case does this handle?

**Q36**: The `CartItemRepository.deleteAllByCartId()` is called after successful order placement. What would happen if this deletion fails (e.g., database constraint)? How does `@Transactional` handle this?

**Q37**: The `PaymentService.verifyPayment()` uses HMAC-SHA256 to verify Razorpay signature. Walk through the verification process. What would happen if the signature secret on the server doesn't match what's configured in Razorpay dashboard?

**Q38**: The `WishlistService.addItem()` is idempotent — it silently skips if product already exists in wishlist. Is this the right behavior? When would you want to throw an error instead?

**Q39**: The `AddressService.clearDefaultAddress()` iterates through all user addresses to clear the default flag. What performance issue could this cause for users with hundreds of addresses? How would you optimize this?

**Q40**: Why does `AdminUserService` sort users by `createdAt` descending in Java instead of using `OrderBy` in the repository query? What's the trade-off?

### Frontend & Integration (Q41-Q45)

**Q41**: The Axios response interceptor implements automatic token refresh. If two API calls fail with 401 simultaneously, both will attempt to refresh the token. How would this race condition be resolved? What improvements would you suggest?

**Q42**: The `AuthContext` initializes by calling `GET /auth/me` if a token exists in localStorage. What happens if the token is expired when the page loads? How does the application handle this gracefully?

**Q43**: The frontend stores `accessToken` and `refreshToken` in `localStorage`. What are the security implications compared to using httpOnly cookies? When would localStorage be acceptable?

**Q44**: How does the frontend determine if a user is an admin? Why is the check `user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN'` checking for both `ROLE_ADMIN` and `ADMIN`?

**Q45**: The frontend API modules (e.g., `products.js`, `cart.js`) are thin wrappers around Axios calls. What's the benefit of this pattern over calling `axios.get()` directly in components?

### Advanced & System Design (Q46-Q50)

**Q46**: This application is deployed on a single server. If you were to scale this to handle 10,000 concurrent users, what bottlenecks would you identify? Consider the database, JWT validation, inventory management, and session handling.

**Q47**: The refresh token is stored in a relational database. As the user base grows, the `refresh_tokens` table will accumulate revoked/expired tokens. Design a cleanup strategy. How would you safely delete expired tokens without affecting active users?

**Q48**: The `NotificationService` is currently a simple logger with `@Async`. Design a real notification system that sends emails and push notifications when orders are placed. How would you handle notification failures and retries?

**Q49**: The inventory reservation system ("reserve on cart add, confirm on order") can cause "ghost reservations" — items reserved in abandoned carts. Design an automated release mechanism. How would you identify and release abandoned reservations?

**Q50**: The application uses Flyway for schema migrations. If you needed to rename a column (e.g., `is_active` to `enabled`) in production, how would you write the migration to ensure zero downtime? What steps would you follow (lazy migration technique)?

---

> **Generated by: Cline AI Assistant**  
> **Date**: June 18, 2026  
> **Purpose**: Comprehensive analysis of the EEEE e-commerce platform for interview preparation and system understanding