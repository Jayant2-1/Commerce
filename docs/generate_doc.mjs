import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageBreak, TabStopType, TabStopPosition
} from 'docx';
import fs from 'fs';

// ─── THEME ────────────────────────────────────────────────────────────────────
const BLUE       = "1F4E79";   // heading accent
const LIGHT_BLUE = "D6E4F0";   // table header bg
const DARK_BLUE  = "2E75B6";   // sub-accent
const MID_GRAY   = "E8EAED";   // alternate row bg
const WHITE      = "FFFFFF";
const BLACK      = "000000";

const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const spacer = (space = 120) =>
  new Paragraph({ children: [new TextRun("")], spacing: { after: space } });

const hline = () =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK_BLUE, space: 1 } },
    spacing: { after: 160 },
    children: [new TextRun("")],
  });

const heading1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: WHITE, size: 36 })],
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 160 },
    indent: { left: 200 },
  });

const heading2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: BLUE, size: 28 })],
    border: { left: { style: BorderStyle.THICK, size: 12, color: DARK_BLUE, space: 4 } },
    spacing: { before: 280, after: 100 },
    indent: { left: 120 },
  });

const heading3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, color: DARK_BLUE, size: 24 })],
    spacing: { before: 200, after: 80 },
  });

const body = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22, color: BLACK, ...opts })],
    spacing: { after: 100 },
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 80 },
  });

const labelVal = (label, value) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: DARK_BLUE }),
      new TextRun({ text: value, size: 22, color: BLACK }),
    ],
    spacing: { after: 80 },
  });

const codeBlock = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "CC0000" })],
    spacing: { before: 60, after: 80 },
    indent: { left: 440 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
  });

// ─── TABLE BUILDERS ───────────────────────────────────────────────────────────
const headerCell = (text, width) =>
  new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: BLUE })] })],
  });

const dataCell = (text, width, isAlt = false) =>
  new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: isAlt ? MID_GRAY : WHITE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
  });

// ─── QUESTION / ANSWER ────────────────────────────────────────────────────────
const qaBlock = (num, q, a) => [
  new Paragraph({
    children: [
      new TextRun({ text: `Q${num}. `, bold: true, size: 22, color: DARK_BLUE }),
      new TextRun({ text: q, bold: true, size: 22, color: BLACK }),
    ],
    spacing: { before: 200, after: 80 },
    shading: { fill: "EAF2FB", type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    border: { left: { style: BorderStyle.THICK, size: 12, color: DARK_BLUE, space: 4 } },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Answer: ", bold: true, italic: true, size: 22, color: "27AE60" }),
      new TextRun({ text: a, size: 22 }),
    ],
    spacing: { after: 200 },
    indent: { left: 300 },
  }),
];

// ─── DOCUMENT CONTENT ─────────────────────────────────────────────────────────

// ── TITLE PAGE ────────────────────────────────────────────────────────────────
const titlePage = [
  spacer(1200),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "EEEE E-Commerce Platform", bold: true, size: 64, color: BLUE })],
    spacing: { after: 200 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Complete Data Flow & Architecture Analysis", size: 36, color: DARK_BLUE, italic: true })],
    spacing: { after: 160 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Spring Boot + React/Vite Full-Stack Application", size: 28, color: "555555" })],
    spacing: { after: 800 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "──────────────────────────────────", color: DARK_BLUE, size: 24 })],
    spacing: { after: 300 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Includes: Architecture Analysis  •  Complete Data Flows  •  50 Interview Q&As", size: 22, color: "444444" })],
    spacing: { after: 200 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Generated: June 2026", size: 20, color: "888888" })],
    spacing: { after: 400 },
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECTION 1: ARCHITECTURE OVERVIEW ─────────────────────────────────────────
const sec1 = [
  heading1("SECTION 1 — ARCHITECTURE OVERVIEW"),
  spacer(),

  heading2("1.1  Technology Stack"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: [
      new TableRow({ children: [headerCell("Layer", 2800), headerCell("Technology", 6560)] }),
      ...[
        ["Backend Framework", "Spring Boot 3.x, Java 17"],
        ["Security", "Spring Security 6, JWT (Access + Refresh Tokens)"],
        ["Database", "MySQL 8, Flyway Migrations (V1–V10)"],
        ["ORM", "Spring Data JPA / Hibernate"],
        ["Payment", "Razorpay Integration + Mock Payment Mode"],
        ["Frontend", "React 18, Vite (port 3001), React Router v6"],
        ["HTTP Client", "Axios with interceptors for auto token refresh"],
        ["API Docs", "Swagger/OpenAPI at /api-docs"],
        ["Async", "@Async for non-blocking notifications"],
      ].map(([k, v], i) =>
        new TableRow({ children: [dataCell(k, 2800, i % 2 === 0), dataCell(v, 6560, i % 2 === 0)] })
      ),
    ],
  }),
  spacer(200),

  heading2("1.2  Security Layer (7 Files)"),
  body("The entire backend is protected by a layered security architecture:"),
  labelVal("SecurityConfig.java", "Central config — defines public vs authenticated vs ADMIN-only URL rules, stateless sessions, CORS, CSRF-disabled"),
  labelVal("JwtConfig.java", "Properties holder — JWT secret (Base64 HMAC-SHA256), 15-min access expiry, 7-day refresh expiry"),
  labelVal("JwtService.java", "Core JWT ops — generates access tokens with claims {sub: email, uid: UUID, role}, validates, extracts claims"),
  labelVal("JwtAuthFilter.java", "OncePerRequestFilter — extracts Bearer token, validates, sets Authentication in SecurityContextHolder"),
  labelVal("CustomUserDetailsService.java", "Loads user by email (case-insensitive), returns AppUserPrincipal"),
  labelVal("AppUserPrincipal.java", "Custom UserDetails — carries id, email, password, active, role; getAuthorities() returns ROLE_USER or ROLE_ADMIN"),
  labelVal("RestAuthenticationEntryPoint.java", "Returns 401 JSON (ApiResponse format) instead of Spring's default HTML redirect"),
  spacer(),

  heading2("1.3  Domain Model — Entity Cardinalities"),
  body("The platform has 17 entities organized in a well-structured relational schema:"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3200, 6160],
    rows: [
      new TableRow({ children: [headerCell("Relationship", 3200), headerCell("Cardinality", 6160)] }),
      ...[
        ["User ↔ Cart", "1-to-1 (auto-created on registration)"],
        ["User ↔ Address", "1-to-many"],
        ["User ↔ Wishlist", "1-to-many (default 'My Wishlist' on register)"],
        ["User ↔ Order", "1-to-many"],
        ["User ↔ Review", "1-to-many"],
        ["User ↔ RefreshToken", "1-to-many (multiple device sessions)"],
        ["Cart ↔ CartItem", "1-to-many"],
        ["CartItem ↔ Product", "many-to-1"],
        ["Category ↔ Category", "Self-referential (parent/child hierarchy)"],
        ["Category ↔ Product", "1-to-many"],
        ["Product ↔ Inventory", "1-to-1"],
        ["Product ↔ ProductImage", "1-to-many"],
        ["Order ↔ OrderItem", "1-to-many"],
        ["Order ↔ Payment", "1-to-1"],
        ["Order ↔ Coupon", "many-to-1 (optional)"],
        ["Order ↔ ShippingAddress", "Embedded (snapshot, not FK)"],
      ].map(([k, v], i) =>
        new TableRow({ children: [dataCell(k, 3200, i % 2 === 0), dataCell(v, 6160, i % 2 === 0)] })
      ),
    ],
  }),
  spacer(200),

  heading2("1.4  Key Design Patterns"),
  heading3("Price Snapshot Pattern"),
  body("CartItem.priceAtAddition and OrderItem.purchasePrice store the product price at time of action. This protects against price changes — a user who added ₹999 item to cart still pays ₹999 even if admin updates price to ₹1299 later."),
  heading3("Two-Phase Inventory Management"),
  body("Stock is reserved when added to cart (reserve()) and confirmed when order is placed (confirmSale()). Releasing happens on remove-from-cart or order cancellation. This prevents overselling without pessimistic locks."),
  heading3("Shipping Address Snapshot"),
  body("ShippingAddress is an @Embeddable value object stored directly inside the orders table. Even if a user deletes or modifies their saved address, past order history remains accurate."),
  heading3("Upsert Pattern for Reviews"),
  body("ReviewService uses findByUserIdAndProductId first — if found, updates; if not, creates. Enforced uniqueness via DB constraint (user_id, product_id). Status always reset to PENDING on every write to force re-moderation."),
  heading3("Token Rotation"),
  body("On every token refresh, the old refresh token is revoked and a new pair is issued. Prevents replay attacks — a stolen token used after the legitimate user refreshes will be rejected."),
  spacer(),

  heading2("1.5  API Endpoints Summary"),
  body("The platform exposes 3 tiers of endpoints:"),
  bullet("Public (no auth): Register, Login, Product browse, Category tree, Reviews read, Payment methods"),
  bullet("Authenticated (USER role): Cart, Orders, Addresses, Reviews write, Wishlist, Coupons, Payments"),
  bullet("Admin only (ROLE_ADMIN): Product CRUD, Category CRUD, Order management, User management, Inventory, Coupon CRUD, Review moderation"),
  body("Total: 16 public + 22 authenticated + 21 admin = 59 endpoints"),
  spacer(),

  heading2("1.6  Exception Handling"),
  body("All exceptions funnel through GlobalExceptionHandler (@RestControllerAdvice) and return standardized ApiResponse JSON:"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 1500, 4860],
    rows: [
      new TableRow({ children: [headerCell("Exception", 3000), headerCell("HTTP", 1500), headerCell("Error Code", 4860)] }),
      ...[
        ["BadRequestException", "400", "BAD_REQUEST"],
        ["MethodArgumentNotValidException", "400", "VALIDATION_ERROR"],
        ["UnauthorizedException", "401", "UNAUTHORIZED"],
        ["ForbiddenException", "403", "FORBIDDEN"],
        ["ResourceNotFoundException", "404", "RESOURCE_NOT_FOUND"],
        ["ConflictException", "409", "CONFLICT"],
        ["BusinessException", "422", "BUSINESS_RULE_VIOLATION"],
        ["Generic Exception", "500", "INTERNAL_SERVER_ERROR"],
      ].map(([e, h, c], i) =>
        new TableRow({ children: [dataCell(e, 3000, i%2===0), dataCell(h, 1500, i%2===0), dataCell(c, 4860, i%2===0)] })
      ),
    ],
  }),
  spacer(400),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECTION 2: DATA FLOWS ─────────────────────────────────────────────────────
const sec2 = [
  heading1("SECTION 2 — COMPLETE DATA FLOWS"),
  spacer(),

  heading2("2.1  Universal Request Lifecycle"),
  body("Every HTTP request passes through the following layers in order:"),
  bullet("Browser/App → HTTP Request (Method, URL, Headers, Body)"),
  bullet("Vite Dev Server (port 3001) → CORS preflight or direct"),
  bullet("Spring Security Filter Chain: CorsFilter → JwtAuthFilter → FilterSecurityInterceptor"),
  bullet("JwtAuthFilter: Extracts Bearer token, validates signature + expiry, sets SecurityContextHolder"),
  bullet("DispatcherServlet → RequestMappingHandlerMapping → Routes to Controller"),
  bullet("Controller: @Valid validation → SecurityUtils.currentUserId() → Calls Service"),
  bullet("Service (@Transactional): Business logic → Repository → Mapper → Entity→DTO"),
  bullet("Repository (Spring Data JPA): Query derivation or @Query → Hibernate → SQL → MySQL"),
  bullet("Response: Entity → Mapper → DTO → Controller → ApiResponse wrapper → JSON"),
  bullet("HTTP Response: { success, message, data, errorCode, timestamp, path }"),
  spacer(160),

  heading2("2.2  Authentication Flow"),
  heading3("Registration — POST /api/v1/auth/register"),
  body("Step 1: Frontend (Register.jsx) collects { fullName, email, password, phone } and calls authApi.register(data)."),
  body("Step 2: Axios sends POST with Content-Type: application/json. No Authorization header (first request)."),
  body("Step 3: Spring Security — requestMatchers('/api/v1/auth/**').permitAll() — passes through without JWT check."),
  body("Step 4: AuthController deserializes JSON into RegisterRequest record (Bean Validation fires here)."),
  body("Step 5: AuthService.register() is called (@Transactional boundary starts):"),
  bullet("Email normalized: trim() + toLowerCase(Locale.ROOT) — prevents case-variant duplicates"),
  bullet("existsByEmailIgnoreCase(email) — ConflictException(409) if duplicate"),
  bullet("BCryptPasswordEncoder.encode(password) — $2a$10$... with random salt, 10 rounds"),
  bullet("User entity built with role=USER, isActive=true, isEmailVerified=false"),
  bullet("userRepository.save(user) — INSERT INTO users (UUID, email, bcrypt_hash, ...)"),
  bullet("Auto-create Cart — INSERT INTO carts (UUID, user_id, ...)"),
  bullet("Auto-create Wishlist('My Wishlist') — INSERT INTO wishlists (UUID, user_id, ...)"),
  body("Step 6: issueTokens(user):"),
  bullet("AppUserPrincipal created from User entity"),
  bullet("JwtService generates access token: HMAC-SHA256 signed, claims {sub: email, uid: UUID, role: USER}, 15-min expiry"),
  bullet("RefreshToken created: UUID.UUID format, stored in refresh_tokens table, 7-day expiry"),
  body("Step 7: AuthResponse returned: { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900000, user: UserResponse }"),
  body("Step 8: Frontend stores accessToken, refreshToken, user in localStorage. React state updated. User is now logged in."),
  spacer(120),

  heading3("Login — POST /api/v1/auth/login"),
  body("Step 1: authenticationManager.authenticate(UsernamePasswordAuthenticationToken) is called."),
  body("Step 2: CustomUserDetailsService.loadUserByUsername(email) → DB query → AppUserPrincipal returned."),
  body("Step 3: BCryptPasswordEncoder.matches(rawPassword, storedHash) — fails with 401 if wrong."),
  body("Step 4: user.lastLoginAt updated → userRepository.save(user)."),
  body("Step 5: issueTokens(user) — same as registration. Frontend receives and stores tokens."),
  spacer(120),

  heading3("Token Refresh Flow"),
  body("Trigger: Axios response interceptor catches 401. Sets _retry flag to prevent infinite loop."),
  body("Calls POST /auth/refresh with { refreshToken } from localStorage."),
  body("AuthService.refreshToken(): Finds token in DB → checks revoked flag AND expiryDate → throws 401 if invalid."),
  body("Old token revoked (revoked=true). New token pair issued. Frontend updates localStorage and retries original request."),
  spacer(120),

  heading3("Logout Flow"),
  body("Frontend calls POST /auth/logout with { refreshToken }."),
  body("AuthService.logout(): Finds RefreshToken → sets revoked=true → saves. Frontend clears localStorage (accessToken, refreshToken, user)."),
  spacer(200),

  heading2("2.3  Product Flow"),
  heading3("Search Products — GET /api/v1/products/search"),
  body("Frontend sends query params: { keyword, categoryId, brand, minPrice, maxPrice, page, size, sortBy, sortDir }."),
  body("ProductController calls productService.searchProducts(request, pageable)."),
  body("ProductSpecifications.withFilters() builds a JPA Criteria API Specification<Product> dynamically:"),
  bullet("keyword → LIKE %keyword% on name, description, brand, sku"),
  bullet("categoryId → WHERE category_id = ?"),
  bullet("brand → WHERE brand = ?"),
  bullet("minPrice/maxPrice → WHERE effective_price BETWEEN ? AND ?"),
  bullet("active → WHERE active = true"),
  body("ProductRepository.findAll(spec, pageable) → Hibernate generates WHERE clause SQL → MySQL executes."),
  body("Results mapped via ProductMapper: Product → ProductResponse (includes ProductImages, Inventory, effective price via getEffectivePrice())."),
  body("Returns Page<ProductResponse> with pagination metadata."),
  spacer(120),

  heading3("Get Product by Slug — GET /api/v1/products/slug/{slug}"),
  body("productRepository.findBySlug(slug) → JOIN FETCH for images (avoids N+1). Returns full ProductResponse."),
  spacer(200),

  heading2("2.4  Cart Flow"),
  heading3("Add Item to Cart — POST /api/v1/cart/items"),
  body("Step 1: CartController extracts userId from SecurityContext via SecurityUtils.currentUserId()."),
  body("Step 2: CartService.addItem() validates quantity > 0."),
  body("Step 3: findOrCreateCart(userId) — lazily creates cart if first add."),
  body("Step 4: productRepository.findById(productId) → 404 if missing."),
  body("Step 5: Validates product.isActive() — throws BusinessException if inactive."),
  body("Step 6: inventory.hasStock(quantity) — checks availableQuantity = stockQuantity - reservedQuantity."),
  body("Step 7: cartItemRepository.findByCartIdAndProductId() — if exists, increments quantity; if new, creates CartItem with priceAtAddition = product.getEffectivePrice() (snapshot!)."),
  body("Step 8 (CRITICAL): inventory.reserve(quantity) → reservedQuantity += quantity → inventoryRepository.save(). Stock is RESERVED immediately, not at checkout."),
  body("Step 9: Returns updated CartResponse with all items, subtotal, shipping, total."),
  spacer(120),

  heading3("Update Cart Item — PUT /api/v1/cart/items/{cartItemId}"),
  body("delta = newQuantity - oldQuantity. If delta > 0: check stock + reserve delta. If delta < 0: releaseReservation(|delta|). Always updates cartItem.quantity."),
  spacer(120),

  heading3("Remove Cart Item — DELETE /api/v1/cart/items/{cartItemId}"),
  body("inventory.releaseReservation(item.quantity) → reservedQuantity decremented. CartItem deleted from DB."),
  spacer(200),

  heading2("2.5  Order Flow — Place Order (Most Complex Operation)"),
  body("placeOrder() in OrderService spans CartService, InventoryService, CouponService, PaymentService, NotificationService. Entire method is @Transactional — any failure rolls back everything."),
  body("Step 1: Fetch cart → BusinessException if empty."),
  body("Step 2: Calculate totalPrice = SUM(item.priceAtAddition × item.quantity)."),
  body("Step 3: Coupon validation (if provided):"),
  bullet("couponRepository.findByCodeIgnoreCase(code) — case-insensitive lookup"),
  bullet("coupon.isValid() — checks active, not expired, usedCount < usageLimit"),
  bullet("totalPrice >= coupon.minOrderAmount — minimum order check"),
  bullet("calculateDiscount() — PERCENTAGE: totalPrice × rate / 100, capped at maxDiscountAmount. FLAT: flat amount"),
  bullet("coupon.usedCount++ → couponRepository.save()"),
  body("Step 4: Resolve shipping address — from saved addressId (user-scoped DB lookup) or inline ShippingAddressRequest."),
  body("Step 5: Build Order entity with PENDING status, generate order number (ORD-YYYYMMDD-######)."),
  body("Step 6: For each cart item:"),
  bullet("Validate inventory.reservedQuantity >= item.quantity"),
  bullet("inventory.confirmSale(qty) → stockQuantity--, reservedQuantity--, soldQuantity++"),
  bullet("Build OrderItem with purchasePrice snapshot (priceAtAddition becomes permanent record)"),
  body("Step 7: orderRepository.save(order) → INSERT INTO orders + order_items (all in same transaction)."),
  body("Step 8: Create Payment record (status=PENDING) linked to order."),
  body("Step 9: cartItemRepository.deleteAllByCartId(cart.id) — cart emptied."),
  body("Step 10: notificationService.sendOrderConfirmation(order) — @Async, non-blocking, separate thread."),
  body("Step 11: Returns OrderResponse with full order details."),
  spacer(120),

  heading3("Cancel Order — POST /api/v1/orders/{orderId}/cancel"),
  body("Validates order is not already CANCELLED or DELIVERED. If paymentStatus=COMPLETED, marks payment as REFUNDED. Calls restockItems(): inventory.stockQuantity++, soldQuantity = max(0, soldQuantity - qty). Order status → CANCELLED."),
  spacer(200),

  heading2("2.6  Payment Flow"),
  heading3("Initiate Payment — POST /api/v1/payments/initiate"),
  body("Creates or finds existing Payment record for the order. Generates mock razorpayOrderId if not set. Returns PaymentResponse for frontend to open Razorpay checkout widget."),
  spacer(120),

  heading3("Verify Payment — POST /api/v1/payments/verify"),
  body("Razorpay sends back razorpayOrderId + razorpayPaymentId + signature after user pays."),
  body("Server verifies: HMAC-SHA256(razorpayOrderId + '|' + razorpayPaymentId, signatureSecret) must equal provided signature."),
  body("If valid: payment → COMPLETED, order → CONFIRMED, paidAt set."),
  body("If invalid: payment → FAILED, order payment status → FAILED."),
  spacer(120),

  heading3("Mock Payment — POST /api/v1/payments/mock-complete"),
  body("Development only. Skips signature verification. Generates mock IDs, marks payment COMPLETED, order CONFIRMED."),
  spacer(200),

  heading2("2.7  Review Flow"),
  heading3("Upsert Review — POST /api/v1/reviews"),
  body("Step 1: hasVerifiedPurchase(userId, productId) — queries orderRepository for orders with status IN [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, RETURNED]. Must have purchased the product."),
  body("Step 2: findByUserIdAndProductId() — if found, updates existing; if not, creates new. One review per user per product (DB unique constraint)."),
  body("Step 3: Status always set to PENDING (re-moderation required on every update)."),
  heading3("Review Moderation — PATCH /api/v1/admin/reviews/{id}/moderate"),
  body("Admin sets status to APPROVED or REJECTED. On APPROVED: recalculates product.avgRating and product.totalReviews via aggregate query."),
  spacer(200),

  heading2("2.8  Other Flows"),
  heading3("Wishlist"),
  body("Multiple wishlists per user. addItem() is idempotent — silently skips if product already present. moveToCart() calls CartService.addItem() then removes from wishlist."),
  heading3("Coupon Validate"),
  body("POST /api/v1/coupons/validate — validates coupon against order amount, returns calculated discount amount. Does NOT increment usedCount (that only happens on actual order placement)."),
  heading3("Category Tree"),
  body("GET /api/v1/categories/tree — fetches root categories (parentCategory IS NULL), then fetches subcategories per parent. Recursive tree building in service layer."),
  heading3("Inventory Management (Admin)"),
  body("PUT /api/v1/admin/inventory — validates stockQuantity >= reservedQuantity before updating. Updates inStock flag based on availableQuantity > 0."),
  spacer(400),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECTION 3: SECURITY FEATURES ─────────────────────────────────────────────
const sec3 = [
  heading1("SECTION 3 — SECURITY FEATURES"),
  spacer(),

  heading2("3.1  Implemented Security Measures"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [300, 2800, 6260],
    rows: [
      new TableRow({ children: [headerCell("#", 300), headerCell("Feature", 2800), headerCell("Implementation Detail", 6260)] }),
      ...[
        ["1", "Password Hashing", "BCryptPasswordEncoder, 10 rounds, random salt per user"],
        ["2", "JWT Access Tokens", "HMAC-SHA256, 15-min expiry, claims: sub/uid/role"],
        ["3", "Refresh Token Rotation", "Old token revoked on use — prevents replay attacks"],
        ["4", "Refresh Token Storage", "Stored in DB — allows server-side revocation on logout"],
        ["5", "Email Normalization", "trim + toLowerCase on register/login — prevents case duplicates"],
        ["6", "Input Validation", "@Valid + @NotBlank/@Email/@Size on all DTOs"],
        ["7", "RBAC", "@EnableMethodSecurity + URL rules — admin endpoints require ROLE_ADMIN"],
        ["8", "Stateless Sessions", "SessionCreationPolicy.STATELESS — no HTTP session"],
        ["9", "CSRF Disabled", "Safe because JWT is not cookie-based; not vulnerable to CSRF"],
        ["10", "CORS Restriction", "Allows only http://localhost:* and http://127.0.0.1:*"],
        ["11", "JSON 401 Response", "RestAuthenticationEntryPoint — consistent error format"],
        ["12", "Optimistic Locking", "@Version on BaseEntity — prevents concurrent modification conflicts"],
        ["13", "Two-Phase Inventory", "Reserve on add, confirm on order — prevents overselling"],
        ["14", "Verified Purchase Check", "Only buyers can review products (order status validation)"],
        ["15", "Admin Key Protection", "X-Admin-Setup-Key header required for admin registration"],
        ["16", "Payment HMAC Verification", "HMAC-SHA256 signature check for all Razorpay callbacks"],
        ["17", "Price Snapshots", "Cart and order prices stored at time of action"],
        ["18", "Async Notifications", "@Async — notification failures don't affect order placement"],
        ["19", "Error Code Separation", "Distinct HTTP codes + ErrorCode enum for each failure type"],
        ["20", "User-Scoped Queries", "All user data access uses userId in queries — no horizontal privilege escalation"],
      ].map(([n, f, d], i) =>
        new TableRow({ children: [dataCell(n, 300, i%2===0), dataCell(f, 2800, i%2===0), dataCell(d, 6260, i%2===0)] })
      ),
    ],
  }),
  spacer(200),

  heading2("3.2  Known Gaps (Interview-Ready)"),
  bullet("Rate Limiting — no protection against brute force login attempts"),
  bullet("Email Verification — isEmailVerified field exists but flow not implemented"),
  bullet("HTTPS — not enforced (development only)"),
  bullet("Audit Logging — only createdAt/updatedAt; no detailed change trail"),
  bullet("User Enumeration — 'User not found with email: X' leaks account existence"),
  bullet("Refresh Token Cleanup — revoked/expired tokens accumulate; no scheduled deletion"),
  spacer(400),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECTION 4: 50 INTERVIEW Q&As ─────────────────────────────────────────────
const sec4 = [
  heading1("SECTION 4 — 50 INTERVIEW QUESTIONS & ANSWERS"),
  spacer(),
  body("Questions are organized by domain. Difficulty: Medium to Hard. Covers architecture, security, Spring Boot, JPA, and system design."),
  spacer(200),

  heading2("Architecture & Design (Q1–Q10)"),
  spacer(80),

  ...qaBlock(1,
    "Why does the app use two tokens (15-min access + 7-day refresh) instead of one long-lived access token?",
    "Short-lived access tokens limit the damage window if stolen — they expire in 15 minutes automatically. If access tokens lasted 7 days and were compromised, an attacker has a week. Refresh tokens are stored in the DB allowing server-side revocation, but they're only sent once to a secure endpoint. Access tokens are stateless and can't be revoked mid-flight — so keeping them short-lived is the defense."
  ),

  ...qaBlock(2,
    "Why is ShippingAddress an @Embeddable stored in the orders table instead of a FK to addresses?",
    "Order history must be immutable — it's a legal and financial record. If ShippingAddress were a FK and the user later edits or deletes their address, the order would show wrong or null data. Embedding a snapshot at order time means the delivery address is preserved permanently inside the order record, regardless of what happens to the source address."
  ),

  ...qaBlock(3,
    "The inventory uses reserve-on-add and confirm-on-order. What happens if a user adds to cart but never checks out?",
    "Items remain reserved indefinitely, blocking other buyers — this is a 'ghost reservation'. The fix: a scheduled job (e.g., Spring @Scheduled every 30 minutes) scans cart_items where updated_at < NOW() - 24 hours, calls releaseReservation() for each, and optionally deletes those items. Alternatively, reserve expiry timestamps on CartItem trigger release."
  ),

  ...qaBlock(4,
    "Why use UUIDs as primary keys instead of auto-increment integers?",
    "UUIDs allow IDs to be generated client-side or in distributed systems without coordination. They prevent enumeration attacks (attacker can't guess /orders/1, /orders/2...). Trade-offs: UUID indexes are larger (16 bytes vs 4-8 bytes), random UUIDs cause B-tree index fragmentation. Mitigation: use UUID v7 (time-ordered) or keep a separate created_at sort column."
  ),

  ...qaBlock(5,
    "Explain @Version in BaseEntity and how optimistic locking works.",
    "@Version adds a version column incremented on every UPDATE. If two transactions read version=5 and both try to UPDATE, the first succeeds (version becomes 6). The second's WHERE version=5 finds no rows — Hibernate throws OptimisticLockException. This is non-blocking: reads are fast, only concurrent writes conflict. Useful for inventory updates where two admins might update stock simultaneously."
  ),

  ...qaBlock(6,
    "@JsonInclude(Include.NON_NULL) on ApiResponse — why important?",
    "Without it, every response includes null fields like 'errorCode: null' on success and 'data: null' on error. This wastes bandwidth and confuses API consumers who might check for null vs missing. With NON_NULL, success responses omit errorCode, error responses omit data — clean, minimal JSON."
  ),

  ...qaBlock(7,
    "OrderNumberGenerator uses ThreadLocalRandom and date-based formatting. Is there a collision risk?",
    "Yes. Two orders placed at the same millisecond with the same random 6-digit suffix would collide. ThreadLocalRandom gives 1-in-1,000,000 chance per millisecond. At low traffic this is acceptable. At scale, use a DB sequence, Redis INCR, or a distributed ID generator (Snowflake). The current approach relies on the DB unique constraint as the safety net — a collision causes a constraint violation and order fails."
  ),

  ...qaBlock(8,
    "Why does AuthService.normalizedEmail() trim and lowercase the email?",
    "Prevents duplicate accounts via case variations — 'User@Test.com' and 'user@test.com' should be the same account. Also prevents whitespace typos (' john@test.com') from creating phantom accounts. Without normalization, existsByEmailIgnoreCase wouldn't be sufficient because the stored email might be 'User@Test.com' while login sends 'user@test.com', causing password lookups to fail."
  ),

  ...qaBlock(9,
    "What happens if multiple API calls fail simultaneously with 401? Explain the race condition in the Axios interceptor.",
    "Both requests detect 401 and both attempt POST /auth/refresh. First one succeeds and rotates the token. Second one uses the OLD (now revoked) refresh token — server returns 401, interceptor clears localStorage, user is logged out unexpectedly. Fix: use a refreshing flag + a promise queue. While refreshing, queue additional failed requests. When refresh completes, resolve all queued requests with the new token."
  ),

  ...qaBlock(10,
    "Explain the layered architecture. Why separate Controllers, Services, Repositories?",
    "Controllers handle HTTP concerns only (request parsing, response formatting, validation). Services hold business logic (@Transactional, rules). Repositories handle data persistence. Separation: each layer is independently testable, swappable (change DB from MySQL to PostgreSQL without touching controllers), and maintainable. Business logic in controllers would couple it to HTTP, making unit testing impossible without a web context."
  ),

  spacer(200),
  heading2("Security (Q11–Q20)"),
  spacer(80),

  ...qaBlock(11,
    "Walk through the complete request lifecycle from HTTP hit to a controller with @PreAuthorize.",
    "Request arrives → CorsFilter validates origin → JwtAuthFilter: extracts 'Authorization: Bearer <token>', calls JwtService.isTokenValid(), wraps in UsernamePasswordAuthenticationToken, sets SecurityContextHolder → FilterSecurityInterceptor checks URL rules (authenticated/ADMIN) → DispatcherServlet routes to controller → @PreAuthorize runs method-level check using SecurityContext → Controller executes."
  ),

  ...qaBlock(12,
    "CSRF is disabled. Why is it safe with JWT? When would you NOT disable it?",
    "CSRF exploits cookie-based auth — a malicious page can trigger requests that browsers auto-send with cookies. JWT tokens must be explicitly attached in the Authorization header, which JavaScript can't do cross-origin (blocked by CORS). So CSRF attacks don't apply. You would NOT disable CSRF if using cookie-based sessions (traditional Spring MVC apps with form login)."
  ),

  ...qaBlock(13,
    "allowedOriginPatterns with 'http://localhost:*' — what's the security implication?",
    "Any local port can make credentialed cross-origin requests. An attacker running a malicious server on localhost:9999 could make requests on behalf of a logged-in user. In development this is acceptable. In production, restrict to exact origins: 'https://yourdomain.com'. The wildcard port is a dev convenience, not a production pattern."
  ),

  ...qaBlock(14,
    "What security problem does refresh token rotation solve?",
    "Token theft detection. If an attacker steals a refresh token and uses it, the server revokes it and issues new tokens. When the legitimate user next tries to refresh with their (now revoked) old token, the server rejects it — this signals the admin that a token was used twice (possible theft). Without rotation, a stolen refresh token is valid for 7 days even after the real user refreshes."
  ),

  ...qaBlock(15,
    "How could an attacker bypass the admin bootstrap key protection?",
    "If the key is weak (e.g., 'admin123'), brute-forceable. If logged in plain text in requests, interceptable. Better measures: one-time use (burn the key after first admin created), time-limited key, rate limiting on /register-admin, require HTTPS, store key in environment variables not config files committed to Git."
  ),

  ...qaBlock(16,
    "Why does RestAuthenticationEntryPoint return JSON instead of Spring's default?",
    "Spring's default AuthenticationEntryPoint sends a 302 redirect to /login — useless for a REST API where there's no login HTML page. API clients expect JSON error responses. The custom entry point returns { success: false, errorCode: 'UNAUTHORIZED', message: '...' } with HTTP 401, consistent with all other API errors."
  ),

  ...qaBlock(17,
    "How does SecurityUtils.currentUserId() work? What happens on unauthenticated access?",
    "SecurityContextHolder.getContext().getAuthentication() returns the current Authentication set by JwtAuthFilter. The principal is cast to AppUserPrincipal and getId() is called. If the request is unauthenticated (no valid token), Authentication is null or anonymous — the method throws UnauthorizedException(401). Spring Security's URL rules should catch it first, but this is a service-layer safety net."
  ),

  ...qaBlock(18,
    "Why are PENDING and CANCELLED orders excluded from the verified purchase check?",
    "PENDING orders haven't been paid — the user could abandon them. CANCELLED orders mean the user returned or cancelled — they never received the product. Allowing reviews on these would let users review products they never actually received. Only orders that progressed to CONFIRMED or beyond (PROCESSING, SHIPPED, DELIVERED, RETURNED) indicate a real purchase commitment."
  ),

  ...qaBlock(19,
    "@EnableMethodSecurity and @PreAuthorize — can you put this on service methods?",
    "Yes. @PreAuthorize('hasRole(\"ADMIN\")') on a service method works if the service is called through a Spring-proxied bean. But it only fires when called from outside the class — self-invocation bypasses AOP. URL-based rules in SecurityConfig are evaluated before the request reaches the controller, providing defense-in-depth. Using both gives layered protection."
  ),

  ...qaBlock(20,
    "What is a salt in BCrypt and why is it preferred over SHA-256 for passwords?",
    "A salt is random bytes added to the password before hashing, unique per user. BCrypt generates a random salt automatically and stores it in the hash string. This prevents rainbow table attacks — two users with the same password get different hashes. BCrypt is also intentionally slow (configurable cost factor) making brute force impractical. SHA-256 is fast (designed for speed), making it trivial to brute force billions of guesses per second."
  ),

  spacer(200),
  heading2("Spring Boot & JPA (Q21–Q30)"),
  spacer(80),

  ...qaBlock(21,
    "What does spring.jpa.open-in-view=false do and what pattern must be used instead?",
    "open-in-view=true (default) keeps the Hibernate session open across the entire HTTP request including view rendering, allowing lazy loading anywhere. This is dangerous — N+1 queries can silently fire during serialization. Setting false forces eager loading or explicit fetching within the @Transactional service method. Alternatives: use DTOs (avoid lazy loading entirely), use JOIN FETCH in JPQL, or use EntityGraph annotations."
  ),

  ...qaBlock(22,
    "Explain ProductSpecifications.withFilters() and JPA Criteria API vs @Query.",
    "JPA Criteria API builds a type-safe, composable WHERE clause at runtime. Each filter is a Predicate; only non-null filters are added. This avoids writing 2^n @Query methods for every combination of optional filters. Compared to @Query with JPQL: @Query is static (can't conditionally add clauses), readable but inflexible. Criteria API is verbose but programmatically composable. Spring Specifications wrap Criteria API cleanly."
  ),

  ...qaBlock(23,
    "Why does AdminOrderResponse use CustomerSummaryResponse instead of full UserResponse?",
    "Principle of least privilege in API responses. Admins viewing orders need customer ID, name, and email — not password hash (excluded by UserResponse anyway), profile image, or internal flags. Returning a minimal DTO prevents accidental data exposure and reduces response payload size. It also decouples the admin order view from user entity changes."
  ),

  ...qaBlock(24,
    "How does @Transactional work in placeOrder()? What happens if an exception occurs mid-method?",
    "Spring AOP wraps the method in a transaction. If any RuntimeException is thrown (unchecked), Spring rolls back all DB operations in that transaction — the order, order items, inventory confirmations, coupon increment, cart deletion all revert. Checked exceptions do NOT auto-rollback (must specify rollbackFor). The @Async notification is on a separate thread and not in the same transaction, so it doesn't affect rollback."
  ),

  ...qaBlock(25,
    "Concurrency issue in reviewUpsert — two simultaneous requests for same user+product?",
    "Both transactions call findByUserIdAndProductId, both find null, both try to INSERT — one will succeed, one will hit the DB unique constraint (user_id, product_id) and throw a ConstraintViolationException. The fix: REPEATABLE_READ isolation prevents the second transaction from seeing the first's commit during its read, but still hits the insert conflict. Better: use INSERT IGNORE or ON DUPLICATE KEY UPDATE at SQL level, or catch the constraint exception and retry as an update."
  ),

  ...qaBlock(26,
    "Why is spring.flyway.baseline-on-migrate=true set? What happens on migration failure?",
    "baseline-on-migrate allows Flyway to run on a database that already has tables (created before Flyway was introduced). Without it, Flyway would refuse to migrate a non-empty schema. On migration failure: Flyway marks the migration as FAILED in the schema_version table and stops. The DB is left in a partial state — subsequent runs fail until the migration is fixed or manually resolved (flyway repair)."
  ),

  ...qaBlock(27,
    "How would you identify which columns need indexing? Explain EXPLAIN in MySQL.",
    "Look for columns in WHERE clauses, JOIN conditions, and ORDER BY. Run EXPLAIN SELECT ... to see query execution plan. Key fields: 'type' (ALL = full table scan, bad), 'key' (which index used), 'rows' (rows examined). If type=ALL and rows is large, add an index. The V8 migration adds indexes on category_id, user_id, product_id, order_status, created_at based on common query patterns."
  ),

  ...qaBlock(28,
    "What N+1 problem does JOIN FETCH in findWithDetailsById() solve?",
    "Without JOIN FETCH, loading a Product triggers 1 query. Then accessing product.getImages() triggers another query per product. With 100 products, that's 101 queries. JOIN FETCH tells Hibernate to load Product and ProductImages in a single SQL JOIN query. You can verify N+1 by enabling spring.jpa.show-sql=true and counting queries in logs, or using p6spy/datasource-proxy to log all SQL."
  ),

  ...qaBlock(29,
    "How does Spring Data JPA derive a query from existsByUserIdAndItemsProductIdAndOrderStatusIn?",
    "Spring Data parses the method name: existsBy (existence check) + UserId (WHERE user_id=?) + And + ItemsProductId (JOIN order_items WHERE product_id=?) + And + OrderStatusIn (WHERE order_status IN (...)). This generates a JOIN query across orders and order_items tables. Misspelling (e.g., 'Satuts' instead of 'Status') causes a PropertyReferenceException at application startup — fail-fast detection."
  ),

  ...qaBlock(30,
    "findRatingStats returns Object[] from an aggregate query. Why not a DTO projection?",
    "For a two-field aggregate (avg rating, count), Object[] is simpler — creating a RatingStats interface or class adds overhead for minimal gain. Trade-off: Object[] is fragile (index-based access, no type safety). DTO projection interfaces (Spring's Projections) or a record would be cleaner but require more setup. At small scale, Object[] is acceptable; at larger scale, typed projections improve maintainability."
  ),

  spacer(200),
  heading2("Business Logic (Q31–Q40)"),
  spacer(80),

  ...qaBlock(31,
    "Walk through the complete placeOrder flow and inventory transitions.",
    "Cart fetched → total calculated from priceAtAddition snapshots → coupon validated and usedCount++ → shipping address resolved → Order built (PENDING) → for each cart item: validate reservedQty >= needed → confirmSale() (stockQty--, reservedQty--, soldQty++) → OrderItem created → Payment(PENDING) created → cart cleared → @Async notification sent. On cancellation: stockQty++, soldQty = max(0, soldQty - qty), payment→REFUNDED."
  ),

  ...qaBlock(32,
    "How would you implement a 'buy X get Y free' coupon type?",
    "Add a new DiscountType enum value (BUY_X_GET_Y). Add fields buyQuantity and getQuantity to Coupon. Modify calculateDiscount() to inspect cart items, find eligible products, and calculate the price of Y free items. This requires changing the Coupon.calculateDiscount() signature to accept the cart items list, not just the order total — a more complex but feasible extension."
  ),

  ...qaBlock(33,
    "Why store prices at both cart-add time AND purchase time?",
    "priceAtAddition in CartItem protects against price changes while browsing — the cart total stays consistent. purchasePrice in OrderItem is the final legal record at checkout time — needed because the admin might change price between cart-add and checkout. Two separate snapshots allow the system to detect and handle price drift between cart and checkout (could warn the user if price changed significantly)."
  ),

  ...qaBlock(34,
    "Why does reviewUpsert always reset status to PENDING even on update?",
    "If a review was APPROVED and the user edits it (changes rating from 5 to 1, or edits body with harmful content), it would stay APPROVED without re-review. Resetting to PENDING forces admin moderation on every write. The avgRating recalculation only includes APPROVED reviews, so an updated review is effectively removed from the public rating until re-approved — preventing rating manipulation."
  ),

  ...qaBlock(35,
    "Why does restockItems() use Math.max(0, soldQuantity - qty)?",
    "Edge case: if soldQuantity was incorrectly 0 or lower than cancelled quantity (data inconsistency from bugs or manual DB edits), subtracting would produce a negative soldQuantity. Math.max(0, ...) floors at zero — keeps inventory data non-negative and valid even if underlying data is inconsistent."
  ),

  ...qaBlock(36,
    "What happens if CartItemRepository.deleteAllByCartId() fails after order is saved?",
    "@Transactional covers the entire placeOrder() method. A RuntimeException from deleteAllByCartId() would roll back: the saved Order, OrderItems, Payment record, inventory confirmSale() changes, and coupon usedCount++. All changes revert atomically. The user's cart is intact and they can try again. The @Async notification is on a separate thread — if the notification fires before the rollback, it would incorrectly notify. This is a known design gap."
  ),

  ...qaBlock(37,
    "Walk through Razorpay HMAC-SHA256 signature verification.",
    "Razorpay sends: razorpayOrderId, razorpayPaymentId, signature. Server constructs payload = razorpayOrderId + '|' + razorpayPaymentId. Computes expectedSignature = HMAC-SHA256(payload, paymentConfig.signatureSecret), converts to lowercase hex. Compares with request.signature() using MessageDigest.isEqual() (constant-time comparison prevents timing attacks). Mismatch means the callback was tampered or not from Razorpay."
  ),

  ...qaBlock(38,
    "WishlistService.addItem() silently skips duplicates — is this right?",
    "Depends on UX contract. Idempotent behavior (silently skip) is friendly for mobile apps that might retry requests, and avoids confusing error messages when a user tries to add an already-wishlisted item. Alternative: return 409 Conflict so the frontend can show 'Already in wishlist' message. Neither is universally correct — it's a product decision. For a shopping app, idempotent is usually preferred."
  ),

  ...qaBlock(39,
    "Performance issue in AddressService.clearDefaultAddress() — how to optimize?",
    "Current: loads all user addresses into memory, iterates, sets isDefault=false for non-selected ones, saves each. For a user with 100 addresses: 100 UPDATE queries. Optimized: single bulk UPDATE query — 'UPDATE addresses SET is_default=false WHERE user_id=? AND id != ?'. One SQL call instead of N. Add this as a custom @Modifying @Query in AddressRepository."
  ),

  ...qaBlock(40,
    "Why does AdminUserService sort by createdAt descending in Java instead of SQL OrderBy?",
    "Likely a laziness shortcut or because the query uses a custom JPQL without OrderBy clause. Trade-off: loading all users into memory to sort is O(n log n) Java sort vs O(n log n) DB sort, but DB sort uses the index and scales better — sorting 1 million users in Java means loading 1 million entities. The correct fix: add OrderByCreatedAtDesc to the repository method name or use a Pageable with sort parameter."
  ),

  spacer(200),
  heading2("Frontend & Integration (Q41–Q45)"),
  spacer(80),

  ...qaBlock(41,
    "Two parallel 401 failures — how to fix the Axios interceptor race condition?",
    "Use an isRefreshing flag and a request queue. When first 401 is detected: set isRefreshing=true, push subsequent 401s into a queue with resolve/reject callbacks. When refresh completes: set isRefreshing=false, dequeue all pending requests and retry them with new token. If refresh fails: reject all queued requests, clear auth. This ensures only one refresh call goes out regardless of how many requests fail simultaneously."
  ),

  ...qaBlock(42,
    "Token is expired when page loads — what happens?",
    "AuthContext.useEffect() detects accessToken in localStorage → calls GET /auth/me. Server's JwtAuthFilter validates token → expired → clears SecurityContext → request hits /auth/me which requires auth → 401 returned. Axios interceptor catches 401 → attempts refresh with refreshToken → if refresh succeeds, retries GET /auth/me → user loaded normally. If refresh token also expired → localStorage cleared → user null → app shows login page."
  ),

  ...qaBlock(43,
    "Storing tokens in localStorage — security implications vs httpOnly cookies?",
    "localStorage is accessible by JavaScript — XSS attacks can steal tokens. httpOnly cookies cannot be read by JavaScript — more secure against XSS. However, cookies are vulnerable to CSRF (mitigated with SameSite=Strict/Lax). For this app (JWT, no cookie auth), localStorage is acceptable if XSS is prevented via proper input sanitization and CSP headers. In high-security contexts (banking), httpOnly cookies with short-lived access tokens are preferred."
  ),

  ...qaBlock(44,
    "Why check both 'ROLE_ADMIN' and 'ADMIN' for the admin role?",
    "Spring Security prefixes roles with 'ROLE_' internally — hasRole('ADMIN') checks for authority 'ROLE_ADMIN'. The JWT claim stores the raw Role enum name ('ADMIN'). When the frontend parses the user object from the API response, it gets 'ROLE_ADMIN' (from getAuthorities()) or 'ADMIN' (from the role field). The dual check handles both possible values depending on which field was serialized into the user object."
  ),

  ...qaBlock(45,
    "Why wrap Axios calls in API module files instead of calling axios.get() directly in components?",
    "Single responsibility: components handle UI, API modules handle data fetching. Benefits: centralized base URL, consistent error handling, easy to mock in tests (mock the module, not Axios), easily swap HTTP libraries later, prevents URL strings scattered across codebase. If a URL changes, update one file not twenty components."
  ),

  spacer(200),
  heading2("Advanced & System Design (Q46–Q50)"),
  spacer(80),

  ...qaBlock(46,
    "Scale to 10,000 concurrent users — what are the bottlenecks?",
    "Database: single MySQL instance becomes write bottleneck — add read replicas for product/review reads, connection pooling (HikariCP). JWT validation: stateless, scales horizontally — no bottleneck. Inventory: concurrent reservations cause lock contention — use Redis for atomic inventory operations (DECRBY). Session handling: stateless JWT means no session server needed — horizontal scaling easy. Add load balancer, CDN for static assets, Redis cache for product data."
  ),

  ...qaBlock(47,
    "Design a cleanup strategy for the refresh_tokens table.",
    "Scheduled job: @Scheduled(cron='0 0 * * * *') — every hour, DELETE FROM refresh_tokens WHERE (revoked=true OR expiry_date < NOW()) AND created_at < NOW() - 30 days. Batch delete to avoid lock contention. Add index on expiry_date and revoked columns. Use soft expiry: mark expired but keep for 30 days for audit. Monitor table size; partition by month if it grows large."
  ),

  ...qaBlock(48,
    "Design a real notification system for orders.",
    "Replace @Async logger with a message queue (RabbitMQ/Kafka). OrderService publishes OrderPlacedEvent to queue. Separate NotificationWorker service consumes events, sends email (JavaMailSender/SendGrid) and push notifications (Firebase FCM). Retry with exponential backoff on failure. Dead letter queue for persistent failures. Store notification status in DB. Benefits: decoupled, resilient, independently scalable."
  ),

  ...qaBlock(49,
    "Ghost reservations from abandoned carts — design an automated release mechanism.",
    "Add updatedAt to CartItem (already in BaseEntity). Scheduler: every 30 minutes, query CartItems where updatedAt < NOW() - 24 hours. For each: call inventory.releaseReservation(quantity), inventoryRepository.save(). Delete the CartItem. Optionally send 'Your cart is expiring' email 1 hour before release. Edge case: if user is actively browsing, touch updatedAt on page visit to reset the timer."
  ),

  ...qaBlock(50,
    "How to rename a column (is_active → enabled) in production with zero downtime?",
    "Lazy migration (expand-contract pattern): Step 1 (V11): ADD COLUMN enabled BOOLEAN AS (is_active) (computed alias) or add the real column and backfill. Step 2: Deploy new code that writes to BOTH columns. Step 3 (V12): Once all reads use new column, remove the old one. Step 4: Deploy code reading from enabled only. This avoids a single migration that requires downtime. Flyway versions each step independently, allowing incremental rollout."
  ),

  spacer(400),
];

// ─── ASSEMBLE DOCUMENT ────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children: [
      ...titlePage,
      ...sec1,
      ...sec2,
      ...sec3,
      ...sec4,
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("./EEEE_Ecommerce_Analysis.docx", buffer);
console.log('Done! File written.');
