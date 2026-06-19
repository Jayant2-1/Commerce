# EEEE E-Commerce Platform — Complete Data Flow Analysis

> **A file-by-file, layer-by-layer trace of how data flows through every endpoint**  
> Covers: Frontend → API Module → Axios → Controller → Service → Mapper → Repository → Entity → Database → Response back

---

## Table of Contents

1. [AUTHENTICATION FLOW](#1-authentication-flow)
2. [PRODUCT FLOW](#2-product-flow)
3. [CART FLOW](#3-cart-flow)
4. [ORDER FLOW](#4-order-flow)
5. [PAYMENT FLOW](#5-payment-flow)
6. [REVIEW FLOW](#6-review-flow)
7. [WISHLIST FLOW](#7-wishlist-flow)
8. [ADDRESS FLOW](#8-address-flow)
9. [COUPON FLOW](#9-coupon-flow)
10. [ADMIN FLOW](#10-admin-flow)
11. [CATEGORY FLOW](#11-category-flow)
12. [INVENTORY FLOW](#12-inventory-flow)

---

## 1. AUTHENTICATION FLOW

### 1.1 User Registration (`POST /api/v1/auth/register`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  Register.jsx                                                                       │
│  └─ Collects: fullName, email, password, phone from form                            │
│     └─ Calls: authApi.register({ fullName, email, password, phone })                │
│                                                                                     │
│  api/auth.js                                                                        │
│  └─ export const authApi = {                                                        │
│       register: (data) => axios.post('/auth/register', data)                        │
│     }                                                                               │
│                                                                                     │
│  api/axios.js (Axios Instance with Interceptors)                                    │
│  └─ baseURL: http://localhost:8081/api/v1                                           │
│     └─ REQUEST INTERCEPTOR: No token yet (first request), so no Authorization header│
│        └─ Final URL: POST http://localhost:8081/api/v1/auth/register                │
│           Body: { "fullName": "John", "email": "john@test.com",                     │
│                   "password": "secret123", "phone": "9999999999" }                  │
│           Headers: Content-Type: application/json                                   │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ NETWORK → HTTP Request                                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ BACKEND LAYER                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ SecurityConfig.java ────────────────────────────────────────────────────────────┤
│  │  Step 1: Request arrives at server:8081                                          │
│  │  Step 2: Goes through security filter chain:                                     │
│  │     ├─ CorsFilter → validates origin against allowedOriginPatterns               │
│  │     ├─ JwtAuthFilter → no Authorization header, skips                           │
│  │     └─ SecurityFilterChain.authorizeHttpRequests →                              │
│  │        requestMatchers("/api/v1/auth/**").permitAll() → PASSES                   │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ AuthController.java ────────────────────────────────────────────────────────────┤
│  │  @PostMapping("/register")                                                       │
│  │  public ResponseEntity<ApiResponse<AuthResponse>> register(                      │
│  │      @Valid @RequestBody RegisterRequest request,    ← Jackson deserializes JSON │
│  │      HttpServletRequest servletRequest               ← injects request metadata │
│  │  ) {                                                                             │
│  │      AuthResponse response = authService.register(request);                      │
│  │      return ResponseEntity.ok(                                                   │
│  │          ApiResponse.success("Registration successful", response, uri)           │
│  │      );                                                                          │
│  │  }                                                                               │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ dto/request/RegisterRequest.java (record) ──────────────────────────────────────┤
│  │  public record RegisterRequest(                                                  │
│  │      @NotBlank @Email String email,                                              │
│  │      @NotBlank @Size(min=6) String password,                                    │
│  │      @NotBlank String fullName,                                                  │
│  │      String phone                                                                │
│  │  ) {}                                                                            │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ AuthService.java ───────────────────────────────────────────────────────────────┤
│  │  @Transactional                                                                  │
│  │  public AuthResponse register(RegisterRequest request) {                         │
│  │                                                                                  │
│  │    Step 1: Normalize email                                                       │
│  │    ├─ String email = request.email().trim().toLowerCase(Locale.ROOT);           │
│  │    └─ "John@Test.Com" → "john@test.com"                                         │
│  │                                                                                  │
│  │    Step 2: Check duplicate email                                                 │
│  │    ├─ userRepository.existsByEmailIgnoreCase(email)                              │
│  │    │  └─ UserRepository extends JpaRepository<User, UUID>                       │
│  │    │     └─ Spring Data derives query: SELECT COUNT(*) FROM users               │
│  │    │        WHERE LOWER(email) = LOWER(?1)                                      │
│  │    └─ If true → throw ConflictException("Email is already registered")           │
│  │       └─ GlobalExceptionHandler → 409 JSON response                            │
│  │                                                                                  │
│  │    Step 3: Hash password                                                         │
│  │    ├─ passwordEncoder.encode(request.password())                                 │
│  │    │  └─ BCryptPasswordEncoder → $2a$10$... (random salt + 10 rounds)          │
│  │                                                                                  │
│  │    Step 4: Build User entity                                                     │
│  │    ├─ User user = User.builder()                                                 │
│  │    │     .fullName(request.fullName())                                           │
│  │    │     .email(email)                                                           │
│  │    │     .password(hashedPassword)                                               │
│  │    │     .role(Role.USER)                                                        │
│  │    │     .isActive(true)                                                         │
│  │    │     .isEmailVerified(false)                                                 │
│  │    │     .phone(request.phone())                                                 │
│  │    │     .build();                                                               │
│  │                                                                                  │
│  │    Step 5: Persist User                                                          │
│  │    ├─ User savedUser = userRepository.save(user)                                 │
│  │    │  └─ Hibernate INSERT INTO users (id, full_name, email, password, role,      │
│  │    │     is_active, is_email_verified, phone, created_at, updated_at, version)   │
│  │    │     VALUES (UUID, ?, ?, ?, 'USER', true, false, ?, NOW(), NOW(), 0)         │
│  │    │  └─ Database: MySQL generates UUID via Hibernate (Type 4 UUID) + timestamps │
│  │    │     via @CreationTimestamp/@UpdateTimestamp                                 │
│  │                                                                                  │
│  │    Step 6: Auto-create Cart                                                      │
│  │    ├─ cartRepository.save(Cart.builder().user(savedUser).build())               │
│  │    │  └─ INSERT INTO carts (id, user_id, ...) VALUES (UUID, savedUser.id, ...)  │
│  │                                                                                  │
│  │    Step 7: Auto-create Wishlist                                                  │
│  │    ├─ wishlistRepository.save(Wishlist.builder().user(savedUser)                 │
│  │    │     .name("My Wishlist").build())                                           │
│  │    │  └─ INSERT INTO wishlists (id, user_id, name, ...) VALUES (...)            │
│  │                                                                                  │
│  │    Step 8: Issue Tokens                                                          │
│  │    ├─ return issueTokens(savedUser);                                             │
│  │    │                                                                             │
│  │    └─ private AuthResponse issueTokens(User user) {                              │
│  │         ├─ Create AppUserPrincipal                                               │
│  │         │  new AppUserPrincipal(user.getId(), user.getEmail(),                   │
│  │         │                   user.getPassword(), user.getIsActive(), user.getRole())│
│  │         │                                                                        │
│  │         ├─ Generate JWT Access Token (JwtService)                                │
│  │         │  Jwts.builder()                                                        │
│  │         │    .subject(principal.getUsername())  ← "john@test.com"               │
│  │         │    .claims(Map.of("uid", user.getId().toString(),                      │
│  │         │                  "role", user.getRole().name()))                       │
│  │         │    .issuedAt(Instant.now())                                            │
│  │         │    .expiration(Instant.now() + 900000ms)  ← 15 min                   │
│  │         │    .signWith(HMAC-SHA256 secret key from JwtConfig)                   │
│  │         │    .compact() → "eyJhbGciOiJIUzI1NiJ9..."                             │
│  │         │                                                                        │
│  │         ├─ Create Refresh Token (stored in DB)                                   │
│  │         │  RefreshToken.builder()                                                │
│  │         │    .token(UUID.randomUUID() + "." + UUID.randomUUID())                │
│  │         │    .user(user)                                                         │
│  │         │    .revoked(false)                                                     │
│  │         │    .expiryDate(Instant.now() + 604800000ms)  ← 7 days                │
│  │         │    .build()                                                            │
│  │         │  → refreshTokenRepository.save(refreshToken)                           │
│  │         │  → INSERT INTO refresh_tokens (id, token, expiry_date, revoked,       │
│  │         │     user_id, ...) VALUES (...)                                         │
│  │         │                                                                        │
│  │         ├─ Map User → UserResponse via UserMapper                                │
│  │         │  new UserResponse(id, fullName, email, role, isActive,                │
│  │         │                 isEmailVerified, phone, profileImageUrl, createdAt)    │
│  │         │                                                                        │
│  │         └─ Return AuthResponse                                                   │
│  │            new AuthResponse(                                                      │
│  │              accessToken,   ← JWT string                                         │
│  │              refreshToken.getToken(),  ← "uuid.uuid" string                     │
│  │              "Bearer",                                                            │
│  │              jwtService.getExpirationMillis(),  ← 900000                        │
│  │              userMapper.toResponse(user)   ← UserResponse                       │
│  │            )                                                                     │
│  │      }                                                                           │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ Response Construction ──────────────────────────────────────────────────────────┤
│  │  ApiResponse.success("Registration successful", authResponse, "/api/v1/auth/...")│
│  │  → {                                                                             │
│  │    "success": true,                                                              │
│  │    "message": "Registration successful",                                         │
│  │    "data": {                                                                     │
│  │      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",                                  │
│  │      "refreshToken": "550e8400...a8b4...",                                      │
│  │      "tokenType": "Bearer",                                                      │
│  │      "expiresIn": 900000,                                                        │
│  │      "user": { "id": "uuid", "fullName": "John", "email": "john@test.com", ...} │
│  │    },                                                                            │
│  │    "errorCode": null,                                                            │
│  │    "timestamp": "2026-06-18T11:00:00",                                          │
│  │    "path": "/api/v1/auth/register"                                              │
│  │  }                                                                               │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ NETWORK → HTTP Response → Frontend                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─ AuthContext.jsx (register method) ──────────────────────────────────────────────┤
│  │  const register = async (data) => {                                              │
│  │    const res = await authApi.register(data);                                     │
│  │    const { accessToken, refreshToken, user: u } = res.data.data;                │
│  │    localStorage.setItem('accessToken', accessToken);   ← Stores JWT              │
│  │    localStorage.setItem('refreshToken', refreshToken); ← Stores refresh          │
│  │    localStorage.setItem('user', JSON.stringify(u));    ← Stores user object      │
│  │    setUser(u);                                        ← React state update      │
│  │    return u;                                                                     │
│  │  }                                                                               │
│  └─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 User Login (`POST /api/v1/auth/login`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Login.jsx → authApi.login({ email, password })                                       │
│  → axios.post('/auth/login', { email, password })                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ AuthController.java:                                                                │
│   @PostMapping("/login")                                                            │
│   AuthResponse response = authService.login(request);                               │
│   return ApiResponse.success("Login successful", response, uri);                    │
│                                                                                     │
│ AuthService.java - login():                                                         │
│   Step 1: Normalize email → "John@Test.Com" → "john@test.com"                      │
│                                                                                     │
│   Step 2: Authenticate via Spring Security                                          │
│   ├─ authenticationManager.authenticate(                                            │
│   │    new UsernamePasswordAuthenticationToken(email, request.password()))          │
│   │                                                                                 │
│   │  ┌─ AuthenticationManager calls DaoAuthenticationProvider                      │
│   │  │  └─ Calls CustomUserDetailsService.loadUserByUsername("john@test.com")      │
│   │  │     └─ UserRepository.findByEmailIgnoreCase(email)                          │
│   │  │        └─ SELECT * FROM users WHERE LOWER(email) = LOWER(?)                  │
│   │  │     └─ If not found → ResourceNotFoundException → 404                       │
│   │  │     └─ Returns AppUserPrincipal(id, email, hashedPassword, active, role)    │
│   │  │                                                                              │
│   │  └─ DaoAuthenticationProvider verifies password:                                │
│   │     BCryptPasswordEncoder.matches(request.password, storedHash)                │
│   │     → Extracts salt from stored hash, hashes input with same salt, compares    │
│   │     → If doesn't match → BadCredentialsException → 401                        │
│   └────────────────────────────────────────────────────────────────────────────────  │
│                                                                                     │
│   Step 3: Fetch User                                                                │
│   ├─ userRepository.findByEmailIgnoreCase(email)                                    │
│   └─ Throws UnauthorizedException if not found (double-check safeguard)             │
│                                                                                     │
│   Step 4: Update lastLoginAt                                                        │
│   ├─ user.setLastLoginAt(LocalDateTime.now())                                       │
│   └─ userRepository.save(user) → UPDATE users SET last_login_at=NOW() WHERE id=?   │
│                                                                                     │
│   Step 5: issueTokens(user) — same process as Register                              │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: Same AuthResponse format as registration                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Token Refresh (`POST /api/v1/auth/refresh`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ TRIGGERED BY: Axios 401 Interceptor                                                 │
│                                                                                     │
│ Frontend:                                                                           │
│   axiosInstance.interceptors.response.use(                                          │
│     null,                                                                           │
│     async (error) => {                                                              │
│       if (error.response?.status === 401 && !orig._retry) {                        │
│         orig._retry = true;                                                         │
│         const rt = localStorage.getItem('refreshToken');                            │
│         const res = await axios.post(${BASE_URL}/auth/refresh, { refreshToken: rt });│
│         const { accessToken, refreshToken: newRt } = res.data.data;                │
│         localStorage.setItem('accessToken', accessToken);                           │
│         localStorage.setItem('refreshToken', newRt);                                │
│         orig.headers.Authorization = Bearer ${accessToken};                         │
│         return axiosInstance(orig);  ← RETRY original failed request               │
│       }                                                                             │
│     }                                                                               │
│   )                                                                                 │
│                                                                                     │
│  → POST http://localhost:8081/api/v1/auth/refresh                                   │
│     Body: { "refreshToken": "550e8400-e29b-41d4-a716-446655440000...." }           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ AuthController.java:                                                                │
│   @PostMapping("/refresh")                                                          │
│   AuthResponse response = authService.refreshToken(request);                        │
│                                                                                     │
│ AuthService.java - refreshToken():                                                  │
│   Step 1: Find refresh token in DB                                                  │
│   ├─ refreshTokenRepository.findByToken(request.refreshToken())                     │
│   │  SELECT * FROM refresh_tokens WHERE token = ?                                   │
│   └─ If not found → throw UnauthorizedException("Invalid refresh token")            │
│                                                                                     │
│   Step 2: Validate token                                                            │
│   ├─ if (refreshToken.getRevoked()) → UnauthorizedException                        │
│   ├─ if (refreshToken.isExpired()) → UnauthorizedException                         │
│   │  └─ isExpired(): LocalDateTime.now().isAfter(this.expiryDate)                  │
│                                                                                     │
│   Step 3: Revoke old token (rotation)                                               │
│   ├─ refreshToken.setRevoked(true)                                                  │
│   └─ refreshTokenRepository.save(refreshToken) → UPDATE SET revoked=true           │
│                                                                                     │
│   Step 4: Issue new token pair                                                      │
│   └─ return issueTokens(refreshToken.getUser())  ← Same as register/login          │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: New AuthResponse with fresh access + refresh tokens                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Logout (`POST /api/v1/auth/logout`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AuthContext.logout()                                                       │
│   const refreshToken = localStorage.getItem('refreshToken');                        │
│   await authApi.logout(refreshToken);                                               │
│   → axios.post('/auth/logout', { refreshToken })                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ AuthService.java - logout():                                                        │
│   refreshTokenRepository.findByToken(request.refreshToken()).ifPresent(token -> {   │
│     token.setRevoked(true);                                                         │
│     refreshTokenRepository.save(token);  ← UPDATE SET revoked=true WHERE id=?      │
│   });                                                                               │
│   (Silently ignores if token not found — no error thrown)                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Frontend then clears all localStorage and sets user to null                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.5 Get Current User (`GET /api/v1/auth/me`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AuthContext useEffect on mount if accessToken exists                       │
│   authApi.getMe() → axios.get('/auth/me')                                           │
│   → Request includes Authorization: Bearer <accessToken> via Axios interceptor      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ Security: JwtAuthFilter filters this request                                        │
│   Step 1: Extract "Bearer <token>" from Authorization header                        │
│   Step 2: jwtService.extractUsername(token) → parse JWT, get "sub" claim           │
│   Step 3: CustomUserDetailsService.loadUserByUsername(email) → from DB              │
│   Step 4: jwtService.isTokenValid(token, userDetails) → valid + not expired         │
│   Step 5: Set SecurityContext with UsernamePasswordAuthenticationToken               │
│                                                                                     │
│ AuthController.java:                                                                │
│   @GetMapping("/me")                                                                │
│   UUID userId = SecurityUtils.currentUserId();  ← Extracts from SecurityContext    │
│   userRepository.findById(userId) → SELECT * FROM users WHERE id = ?               │
│   UserResponse response = userMapper.toResponse(user)                               │
│   return ApiResponse.success("User fetched", response, uri)                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: UserResponse (id, fullName, email, role, isActive, etc.)                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PRODUCT FLOW

### 2.1 Get Product by ID (`GET /api/v1/products/{id}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: ProductDetail.jsx                                                          │
│   productApi.getById(id) → axios.get(`/products/${id}`)                             │
│   → GET http://localhost:8081/api/v1/products/550e8400-...                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ SecurityConfig: requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()  │
│ → No authentication required, JwtAuthFilter skips if no token                      │
│                                                                                     │
│ ProductController.java:                                                             │
│   @GetMapping("/{productId}")                                                       │
│   ProductResponse response = productService.getProductById(productId);              │
│                                                                                     │
│ ProductService.java:                                                                │
│   Product product = productRepository.findWithDetailsById(productId)                │
│     └─ Custom @Query with JOIN FETCH:                                               │
│        SELECT p FROM Product p                                                      │
│        LEFT JOIN FETCH p.images                                                     │
│        LEFT JOIN FETCH p.category                                                   │
│        LEFT JOIN FETCH p.inventory                                                  │
│        WHERE p.id = ?1                                                              │
│     └─ Prevents N+1 queries for images/category/inventory                          │
│     └─ If not found → ResourceNotFoundException → 404                              │
│                                                                                     │
│   return productMapper.toResponse(product)                                          │
│     └─ ProductMapper: Product → ProductResponse                                     │
│        ├─ Maps: id, name, slug, description, price, discountPrice                   │
│        ├─ Calls: product.getEffectivePrice()                                        │
│        │  → Returns discountPrice if > 0, else price                               │
│        ├─ Maps: category.id, category.name                                          │
│        ├─ Calls: toInventoryResponse(product.getInventory())                        │
│        │  → Returns InventoryResponse with availableQuantity, inStock, etc.        │
│        └─ Calls: toImageResponseList(product.getImages())                          │
│           → Returns List<ProductImageResponse> with isPrimary, imageUrl, etc.      │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: ProductResponse with nested InventoryResponse + List<ProductImageResponse> │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Search Products (`GET /api/v1/products/search`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Shop.jsx                                                                   │
│   productApi.getAll(params) → axios.get('/products/search', { params })             │
│   params = { keyword: "shirt", categoryId: "uuid", minPrice: 500, maxPrice: 2000,  │
│             page: 0, size: 12, sortBy: "price", sortDir: "asc" }                   │
│   → GET http://localhost:8081/api/v1/products/search?keyword=shirt&categoryId=...   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ProductController.java:                                                             │
│   @GetMapping("/search")                                                            │
│   PagedResponse<ProductResponse> response = productService.searchProducts(request); │
│                                                                                     │
│ ProductService.java:                                                                │
│   String sortBy = ALLOWED_SORT_FIELDS.contains(request.normalizedSortBy())          │
│                ? request.normalizedSortBy() : "createdAt";                          │
│   Pageable pageable = PageUtils.buildPageable(page, size, sortBy, sortDir);         │
│                                                                                     │
│   Page<ProductResponse> page = productRepository                                    │
│       .findAll(ProductSpecifications.withFilters(request), pageable)                │
│       .map(productMapper::toResponse);                                              │
│                                                                                     │
│   ProductSpecifications.withFilters(request):                                       │
│     Creates JPA Criteria Specification<Product>:                                    │
│     ├─ IF keyword not blank:                                                        │
│     │  WHERE LOWER(name) LIKE '%shirt%' OR                                         │
│     │        LOWER(description) LIKE '%shirt%' OR                                  │
│     │        LOWER(brand) LIKE '%shirt%' OR                                        │
│     │        LOWER(sku) LIKE '%shirt%'                                             │
│     ├─ IF categoryId not null: WHERE category_id = ?                               │
│     ├─ IF brand not blank: WHERE LOWER(brand) = LOWER(?)                          │
│     ├─ IF minPrice not null: WHERE price >= ?                                      │
│     ├─ IF maxPrice not null: WHERE price <= ?                                      │
│     └─ Combines all with AND                                                       │
│                                                                                     │
│   PagedResponse.from(page):                                                         │
│     new PagedResponse<>(content, page, size, totalElements, totalPages, last)      │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: PagedResponse<ProductResponse>                                            │
│ { "content": [...], "page": 0, "size": 12, "totalElements": 45,                    │
│   "totalPages": 4, "last": false }                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Create Product (`POST /api/v1/admin/products`) — Admin Only

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AdminProducts.jsx                                                          │
│   adminApi.createProduct(data) → axios.post('/admin/products', data)                │
│   Body: { name, slug, description, price, discountPrice, sku, categoryId,           │
│           brand, active, stockQuantity, lowStockThreshold, imageUrls: [...] }      │
│   → Authorization: Bearer <admin_token>  (JwtAuthFilter validates ADMIN role)      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ SecurityConfig: requestMatchers("/api/v1/admin/**").hasRole("ADMIN")                │
│ → JwtAuthFilter extracts token → Checks hasAuthority("ROLE_ADMIN")                 │
│ → If USER role → 403 Forbidden                                                      │
│                                                                                     │
│ AdminProductController.java:                                                        │
│   @PostMapping                                                                      │
│   ProductResponse response = productService.createProduct(request);                 │
│                                                                                     │
│ ProductService.java - createProduct():                                              │
│   Step 1: Validate unique slug + sku                                                │
│   ├─ productRepository.findBySlug(slug) → ConflictException if exists              │
│   └─ productRepository.findBySku(sku) → ConflictException if exists                │
│                                                                                     │
│   Step 2: Resolve category                                                          │
│   ├─ categoryRepository.findById(categoryId) → ResourceNotFoundException if not    │
│                                                                                     │
│   Step 3: Build Product entity                                                      │
│   ├─ Product.builder().name().slug().description().price().discountPrice()         │
│   │     .active(true).brand().sku().category(category).images(new ArrayList())     │
│   │     .build()                                                                    │
│                                                                                     │
│   Step 4: Save Product                                                              │
│   └─ Product saved = productRepository.save(product)                               │
│      INSERT INTO products (id, name, slug, ..., category_id, ...) VALUES (...)     │
│                                                                                     │
│   Step 5: Create Inventory record                                                   │
│   ├─ Inventory.builder().product(saved).sku(saved.getSku())                        │
│   │     .stockQuantity(stockQuantity).lowStockThreshold(lowStockThreshold)         │
│   │     .reservedQuantity(0).soldQuantity(0).inStock(stockQuantity > 0).build()    │
│   └─ inventoryRepository.save(inventory)                                           │
│      INSERT INTO inventory (id, product_id, stock_quantity, ...) VALUES (...)      │
│                                                                                     │
│   Step 6: Apply images                                                              │
│   └─ For each imageUrl → create ProductImage(product, url, displayOrder, isPrimary)│
│                                                                                     │
│   Step 7: Reload and return                                                         │
│   └─ productRepository.findWithDetailsById(saved.getId())  ← FETCH JOIN            │
│      → productMapper.toResponse(product)                                           │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: Full ProductResponse with inventory and image details                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Update Product (`PUT /api/v1/admin/products/{id}`) — Admin Only

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AdminProducts.jsx                                                          │
│   adminApi.updateProduct(id, data) → axios.put(`/admin/products/${id}`, data)       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ProductService.java - updateProduct():                                              │
│   Step 1: Find existing product                                                     │
│   ├─ productRepository.findById(productId) → 404 if not found                      │
│                                                                                     │
│   Step 2: Validate uniqueness (excluding current)                                   │
│   ├─ findBySlug(slug).ifPresent(existing → if(existing.id != productId) throw)     │
│   └─ findBySku(sku).ifPresent(...)                                                  │
│                                                                                     │
│   Step 3: Update all fields                                                         │
│   ├─ product.setName(), .setSlug(), .setDescription(), .setPrice()...               │
│                                                                                     │
│   Step 4: Clear and re-apply images                                                 │
│   ├─ product.getImages().clear() ← orphanRemoval=true → deletes old images          │
│   └─ applyImages(product, request.imageUrls()) ← creates new ProductImage entities │
│                                                                                     │
│   Step 5: Update inventory                                                          │
│   ├─ inventoryRepository.findByProductId(productId) → creates new if not found     │
│   ├─ Validates: stockQuantity >= reservedQuantity                                   │
│   │  → BusinessException if stock would be less than reserved                      │
│   ├─ Updates: stockQuantity, lowStockThreshold                                     │
│   └─ inventory.setInStock(availableQuantity > 0)                                   │
│                                                                                     │
│   Step 6: Save and return                                                           │
│   └─ productRepository.save(product) + inventoryRepository.save(inventory)         │
│      → productMapper.toResponse(reloadedProduct)                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Featured Products (`GET /api/v1/products/featured`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Home.jsx                                                                   │
│   productApi.getFeatured(limit) → axios.get('/products/featured', { params })       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ProductService.java - listFeaturedProducts():                                       │
│   productRepository.findAll().stream()  ← Fetches ALL products                     │
│     .filter(p -> Boolean.TRUE.equals(p.getActive()))  ← Only active                │
│     .sorted(Comparator.comparing(Product::getCreatedAt).reversed())  ← Newest first│
│     .limit(Math.max(1, Math.min(limit, 50)))  ← Cap at 50                          │
│     .map(productMapper::toResponse)                                                 │
│     .toList()                                                                       │
│                                                                                     │
│ ⚠ NOTE: Fetches all products then filters in-memory — potential perf issue          │
│   at scale. Better to use repository query with LIMIT + WHERE active = true.        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CART FLOW

### 3.1 Get Cart (`GET /api/v1/cart`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Navbar.jsx (cart icon badge) or Cart.jsx                                   │
│   cartApi.getCart() → axios.get('/cart')                                            │
│   → Authorization: Bearer <token> required                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ CartController.java:                                                                │
│   @GetMapping                                                                       │
│   UUID userId = SecurityUtils.currentUserId();  ← Extracts from JWT claims         │
│   CartResponse response = cartService.getCart(userId);                             │
│                                                                                     │
│ CartService.java:                                                                   │
│   Cart cart = cartRepository.findByUserId(userId)                                   │
│     SELECT * FROM carts WHERE user_id = ?                                          │
│     .orElseGet(() -> createCartForUser(userId));  ← Lazily creates if not exists   │
│       └─ User user = userRepository.findById(userId)                               │
│             Cart cart = Cart.builder().user(user).items(new ArrayList<>()).build()  │
│             cartRepository.save(cart) → INSERT INTO carts                          │
│                                                                                     │
│   return cartMapper.toResponse(cart);                                              │
│     └─ CartMapper.toResponse():                                                     │
│        ├─ For each CartItem → CartItemResponse(productResponse, quantity,          │
│        │   priceAtAddition, total)                                                  │
│        ├─ Calculates subtotal: SUM(priceAtAddition * quantity)                     │
│        ├─ Shipping: BigDecimal.ZERO (free shipping)                                │
│        └─ Total: subtotal + shipping                                                │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: CartResponse { id, userId, items: [...], totalItems, subtotal,            │
│           shippingAmount, totalAmount }                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Add Item to Cart (`POST /api/v1/cart/items`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: ProductDetail.jsx → "Add to Cart" button                                  │
│   cartApi.addItem({ productId, quantity }) → axios.post('/cart/items', data)        │
│   Body: { "productId": "uuid", "quantity": 2 }                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ CartService.java - addItem():                                                       │
│   Step 1: Validate quantity > 0 → BadRequestException                               │
│                                                                                     │
│   Step 2: Find or create cart                                                       │
│   └─ findOrCreateCart(userId)                                                      │
│                                                                                     │
│   Step 3: Find product                                                              │
│   └─ productRepository.findById(productId) → 404 if not found                      │
│                                                                                     │
│   Step 4: Check product is active                                                   │
│   └─ if (!Boolean.TRUE.equals(product.getActive())) → BusinessException             │
│                                                                                     │
│   Step 5: Check stock availability                                                  │
│   ├─ Inventory inventory = findByInventory(product.getId())                        │
│   └─ inventory.hasStock(request.quantity())                                        │
│      → inventory.getAvailableQuantity() >= quantity                                │
│      → availableQuantity = stockQuantity - reservedQuantity                        │
│      → If false → BusinessException("Insufficient stock")                          │
│                                                                                     │
│   Step 6: Find existing cart item or create new                                     │
│   ├─ cartItemRepository.findByCartIdAndProductId(cartId, productId)                 │
│   └─ If exists: increments quantity (item.setQuantity(item.getQuantity() + qty))   │
│      If new: CartItem.builder().cart(cart).product(product)                         │
│               .priceAtAddition(product.getEffectivePrice()).quantity(0).build()     │
│                                                                                     │
│   Step 7: Reserve inventory                                                         │
│   ├─ inventory.reserve(request.quantity())                                         │
│   │  → reservedQuantity += quantity                                               │
│   └─ inventoryRepository.save(inventory) → UPDATE inventory SET reserved=?          │
│                                                                                     │
│   Step 8: Save and return                                                           │
│   ├─ cartItemRepository.save(item) → INSERT or UPDATE cart_items                   │
│   └─ cartMapper.toResponse(reloadCart(userId))                                     │
│                                                                                     │
│   ⚠ KEY: Inventory is RESERVED when added to cart, not when order is placed        │
│     This prevents overselling (other users can't buy reserved stock)                │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: Updated CartResponse with all items                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Update Cart Item Quantity (`PUT /api/v1/cart/items/{cartItemId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Cart.jsx → quantity selector                                              │
│   cartApi.updateItem(cartItemId, { quantity: 3 }) → axios.put(...)                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ CartService.java - updateItem():                                                    │
│   Step 1: Find cart and item                                                        │
│   ├─ Cart cart = findOrCreateCart(userId)                                           │
│   └─ cartItemRepository.findByIdAndCartId(cartItemId, cart.getId()) → 404          │
│                                                                                     │
│   Step 2: Calculate delta                                                           │
│   ├─ delta = newQuantity - oldQuantity  (e.g., 3 - 1 = +2)                        │
│                                                                                     │
│   Step 3: Adjust inventory reservation                                              │
│   ├─ Inventory inventory = findInventory(item.getProduct().getId())                │
│   │                                                                                 │
│   │  If delta > 0 (increase):                                                       │
│   │  ├─ inventory.hasStock(delta) ? reserve(delta) : throw BusinessException       │
│   │  ├─ reservedQuantity += delta                                                  │
│   │                                                                                 │
│   │  If delta < 0 (decrease):                                                       │
│   │  └─ inventory.releaseReservation(Math.abs(delta))                              │
│   │     └─ reservedQuantity = max(0, reservedQuantity - delta)                     │
│   │                                                                                 │
│   ├─ inventoryRepository.save(inventory)                                            │
│                                                                                     │
│   Step 4: Update item quantity                                                      │
│   ├─ item.setQuantity(newQuantity)                                                  │
│   └─ cartItemRepository.save(item)                                                  │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: Updated CartResponse                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Remove Cart Item (`DELETE /api/v1/cart/items/{cartItemId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ CartService.java - removeItem():                                                    │
│   Step 1: Find cart + item                                                          │
│   Step 2: Release inventory reservation                                             │
│   ├─ Inventory inventory = findInventory(item.getProduct().getId())                │
│   └─ inventory.releaseReservation(item.getQuantity())                              │
│      → reservedQuantity = max(0, reservedQuantity - itemQuantity)                 │
│   ├─ inventoryRepository.save(inventory) → UPDATE inventory                        │
│                                                                                     │
│   Step 3: Delete cart item                                                          │
│   └─ cartItemRepository.delete(item) → DELETE FROM cart_items WHERE id = ?         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. ORDER FLOW

### 4.1 Place Order (`POST /api/v1/orders`)

This is the most complex operation — spans CartService, OrderService, CouponService, InventoryService, PaymentService, NotificationService.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Checkout.jsx                                                               │
│   orderApi.placeOrder({                                                             │
│     addressId: "uuid" | shippingAddress: {...},                                     │
│     couponCode: "SAVE20" (optional),                                                │
│     paymentMethod: "UPI"                                                            │
│   }) → axios.post('/orders', data)                                                  │
│   → Authorization: Bearer <token>                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ┌─ OrderController.java ──────────────────────────────────────────────────────────┤
│ │ @PostMapping                                                                      │
│ │ UUID userId = SecurityUtils.currentUserId();                                      │
│ │ OrderResponse response = orderService.placeOrder(userId, request);               │
│ └───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ┌─ OrderService.java - placeOrder() ──────────────────────────────────────────────┤
│ │ @Transactional — ENTIRE METHOD IS ATOMIC                                        │
│ │ If ANY step fails, ALL changes are rolled back                                  │
│ │                                                                                  │
│ │ Step 1: Fetch User's Cart                                                         │
│ │ ├─ Cart cart = cartRepository.findByUserId(userId)                               │
│ │ │     SELECT * FROM carts WHERE user_id = ?                                     │
│ │ └─ If cart not found → ResourceNotFoundException                                │
│ │                                                                                  │
│ │ Step 2: Validate cart not empty                                                   │
│ │ └─ if (cart.getItems().isEmpty()) → BusinessException                           │
│ │                                                                                  │
│ │ Step 3: Fetch User                                                                │
│ │ ├─ User user = userRepository.findById(userId)                                    │
│ │ └─ 404 if not found                                                              │
│ │                                                                                  │
│ │ Step 4: Calculate total price                                                     │
│ │ └─ BigDecimal totalPrice = cart.getItems().stream()                              │
│ │      .map(item -> item.getPriceAtAddition().multiply(BigDecimal.valueOf(         │
│ │                   item.getQuantity())))                                           │
│ │      .reduce(BigDecimal.ZERO, BigDecimal::add)                                   │
│ │                                                                                  │
│ │ Step 5: Apply coupon (if provided)                                                │
│ │ └─ CouponContext couponContext = applyCouponIfPresent(request.couponCode(),      │
│ │                                                  totalPrice)                     │
│ │    ├─ IF couponCode == null → return (null, BigDecimal.ZERO)                    │
│ │    ├─ ELSE:                                                                      │
│ │    │  ├─ couponRepository.findByCodeIgnoreCase(code) → 404 if not found        │
│ │    │  ├─ coupon.isValid()? → checks: active && !expired && usedCount<usageLimit│
│ │    │  │  → BusinessException if invalid                                         │
│ │    │  ├─ totalPrice >= coupon.getMinOrderAmount()?                              │
│ │    │  │  → BusinessException if below minimum                                   │
│ │    │  ├─ discount = coupon.calculateDiscount(totalPrice)                        │
│ │    │  │  ├─ PERCENTAGE: totalPrice * discountValue / 100 (capped at maxDiscount)│
│ │    │  │  └─ FLAT: discountValue                                                │
│ │    │  ├─ coupon.setUsedCount(coupon.getUsedCount() + 1)                        │
│ │    │  └─ couponRepository.save(coupon) → UPDATE used_count                      │
│ │    └─ return (coupon, discount)                                                  │
│ │                                                                                  │
│ │ Step 6: Resolve shipping address                                                  │
│ │ └─ resolveShippingAddress(userId, request)                                       │
│ │    ├─ IF addressId != null:                                                      │
│ │    │  addressRepository.findByIdAndUserId(addressId, userId) → 404 if not found │
│ │    │  addressMapper.toShippingAddress(address)  ← Converts to Embeddable         │
│ │    └─ ELSE IF shippingAddress != null:                                           │
│ │       addressMapper.toShippingAddress(request.shippingAddress())                 │
│ │       throw BadRequestException if both null                                     │
│ │                                                                                  │
│ │ Step 7: Build Order entity                                                        │
│ │ └─ Order order = Order.builder()                                                 │
│ │      .orderNumber(OrderNumberGenerator.nextOrderNumber())                       │
│ │      │  → "ORD-20260618-784532" (Date + 6 random digits)                        │
│ │      .totalPrice(totalPrice)                                                     │
│ │      .discountAmount(couponContext.discountAmount())                             │
│ │      .finalPrice(totalPrice.subtract(couponContext.discountAmount()))            │
│ │      .orderStatus(OrderStatus.PENDING)                                           │
│ │      .paymentStatus(PaymentStatus.PENDING)                                       │
│ │      .shippingAddress(shippingAddress)                                           │
│ │      .coupon(couponContext.coupon())                                             │
│ │      .user(user)                                                                  │
│ │      .items(new ArrayList<>())                                                    │
│ │      .build()                                                                     │
│ │                                                                                  │
│ │ Step 8: Save Order (initial — without items)                                     │
│ │ └─ Order savedOrder = orderRepository.save(order)                               │
│ │    INSERT INTO orders (id, order_number, total_price, ..., user_id, ...)        │
│ │                                                                                  │
│ │ Step 9: Process each cart item — CONFIRM SALE from inventory                    │
│ │ └─ for (CartItem cartItem : cart.getItems()) {                                  │
│ │    ├─ Inventory inventory = findByProductId(cartItem.getProduct().getId())       │
│ │    │                                                                             │
│ │    ├─ Validate reserved quantity >= required                                     │
│ │    │  if (inventory.getReservedQuantity() < requiredQty) {                      │
│ │    │    // Try to reserve more if available                                      │
│ │    │    int missing = requiredQty - inventory.getReservedQuantity()             │
│ │    │    if (!inventory.hasStock(missing)) → BusinessException                   │
│ │    │    inventory.reserve(missing)                                              │
│ │    │  }                                                                          │
│ │    │                                                                             │
│ │    ├─ CONFIRM SALE: inventory.confirmSale(requiredQty)                          │
│ │    │  ├─ stockQuantity -= quantity                                               │
│ │    │  ├─ reservedQuantity -= quantity                                            │
│ │    │  ├─ soldQuantity += quantity                                                │
│ │    │  └─ updateInStock()  → inStock = (availableQuantity > 0)                  │
│ │    ├─ inventoryRepository.save(inventory)                                       │
│ │    │                                                                             │
│ │    ├─ Create OrderItem (snapshot)                                                │
│ │    │  OrderItem.builder()                                                        │
│ │    │    .order(savedOrder)                                                        │
│ │    │    .product(cartItem.getProduct())                                           │
│ │    │    .quantity(requiredQty)                                                    │
│ │    │    .purchasePrice(cartItem.getPriceAtAddition())  ← Price snapshot          │
│ │    │    .subtotal(price * quantity)                                               │
│ │    │    .build()                                                                  │
│ │    └─ savedOrder.getItems().add(orderItem)                                       │
│ │  }                                                                               │
│ │                                                                                  │
│ │ Step 10: Create Payment record                                                    │
│ │ └─ Payment payment = Payment.builder()                                           │
│ │      .order(savedOrder)                                                          │
│ │      .amount(savedOrder.getFinalPrice())                                         │
│ │      .currency("INR")                                                            │
│ │      .status(PaymentStatus.PENDING)                                              │
│ │      .method(request.paymentMethod())                                            │
│ │      .build()                                                                     │
│ │  → savedOrder.setPayment(payment)                                               │
│ │                                                                                  │
│ │ Step 11: Save finalized order (with items + payment via cascade)                 │
│ │ └─ Order finalizedOrder = orderRepository.save(savedOrder)                      │
│ │    INSERT INTO order_items (id, order_id, product_id, quantity, ...)             │
│ │    INSERT INTO payments (id, order_id, amount, ...)                              │
│ │    UPDATE orders SET ... (linking items)                                         │
│ │                                                                                  │
│ │ Step 12: Clear cart — DELETE all cart items                                     │
│ │ └─ cartItemRepository.deleteAllByCartId(cart.getId())                           │
│ │    DELETE FROM cart_items WHERE cart_id = ?                                      │
│ │                                                                                  │
│ │ Step 13: Send async notification                                                  │
│ │ └─ notificationService.sendOrderPlacedNotification(finalizedOrder)              │
│ │    → @Async → logs: "Order confirmation notification queued"                   │
│ │                                                                                  │
│ │ Step 14: Return response                                                          │
│ │ └─ orderMapper.toResponse(finalOrder)                                           │
│ │    → OrderResponse { id, orderNumber, totalPrice, discountAmount, finalPrice,   │
│ │        orderStatus, paymentStatus, couponCode, shippingAddress,                  │
│ │        items: [...], payment: {...}, createdAt }                                │
│ └───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: Full OrderResponse with all items, payment, shipping, coupon details      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Get User Orders (`GET /api/v1/orders`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Orders.jsx                                                                  │
│   orderApi.getMyOrders() → axios.get('/orders')                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ OrderController.java:                                                               │
│   UUID userId = SecurityUtils.currentUserId();                                      │
│   List<OrderResponse> response = orderService.getUserOrders(userId);               │
│                                                                                     │
│ OrderService.java:                                                                   │
│   orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()              │
│     SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC                │
│     .map(orderMapper::toResponse)                                                    │
│     .toList()                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Get Order by ID (`GET /api/v1/orders/{orderId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ OrderController.java:                                                               │
│   UUID userId = SecurityUtils.currentUserId();  ← Ensures user owns the order      │
│   OrderResponse response = orderService.getOrderById(userId, orderId);             │
│                                                                                     │
│ OrderService.java:                                                                   │
│   Order order = orderRepository.findByIdAndUserId(orderId, userId)                 │
│     SELECT * FROM orders WHERE id = ? AND user_id = ?                              │
│     → 404 if not found (scoped to user — cannot view other user's orders)          │
│   return orderMapper.toResponse(order);                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Cancel Order (`POST /api/v1/orders/{orderId}/cancel`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ OrderService.java - cancelOrder():                                                  │
│   Step 1: Find order (user-scoped)                                                  │
│   └─ orderRepository.findByIdAndUserId(orderId, userId) → 404 if not found         │
│                                                                                     │
│   Step 2: Validate order can be cancelled                                           │
│   └─ if (CANCELLED || DELIVERED) → BusinessException                               │
│                                                                                     │
│   Step 3: Update order status                                                       │
│   ├─ order.setOrderStatus(OrderStatus.CANCELLED)                                   │
│   └─ if (paymentStatus == COMPLETED) → paymentStatus = REFUNDED                    │
│                                                                                     │
│   Step 4: Restock items                                                              │
│   └─ restockItems(order):                                                           │
│      for each OrderItem:                                                            │
│        Inventory inventory = findByProductId(item.getProduct().getId())            │
│        inventory.setStockQuantity(stock + item.getQuantity())  ← Add back stock    │
│        inventory.setSoldQuantity(max(0, sold - item.getQuantity()))                │
│        inventory.setInStock(availableQuantity > 0)                                 │
│        inventoryRepository.save(inventory) → UPDATE inventory SET ...              │
│                                                                                     │
│   Step 5: Save + notify                                                              │
│   └─ orderRepository.save(order) + notificationService.sendOrderStatusChanged()    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. PAYMENT FLOW

### 5.1 Get Payment Methods (`GET /api/v1/payments/methods`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Checkout.jsx (payment method dropdown)                                     │
│   → No API call needed, but available via: axios.get('/payments/methods')           │
│     (This endpoint is PUBLIC — no auth required)                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ PaymentController.java:                                                             │
│   @GetMapping("/methods")                                                           │
│   return ResponseEntity.ok(ApiResponse.success(                                     │
│     "Payment methods fetched",                                                      │
│     Arrays.asList(PaymentMethod.values()),  ← [CREDIT_CARD, DEBIT_CARD, UPI,       │
│                                                  NET_BANKING, WALLET, COD]          │
│     request.getRequestURI()                                                         │
│   ));                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Initiate Payment (`POST /api/v1/payments/initiate`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: (after order placed, on payment page)                                     │
│   → POST /payments/initiate { orderId, paymentMethod: "UPI" }                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ PaymentService.java - initiatePayment():                                            │
│   Step 1: Find order (user-scoped)                                                  │
│   └─ orderRepository.findByIdAndUserId(orderId, userId) → 404                      │
│                                                                                     │
│   Step 2: Find or create payment record                                             │
│   └─ paymentRepository.findByOrderId(order.getId())                                │
│      .orElseGet(() → Payment.builder().order(order).amount(order.getFinalPrice())  │
│                   .currency("INR").status(PENDING).build())                        │
│                                                                                     │
│   Step 3: Set payment method and generate Razorpay order ID                        │
│   ├─ payment.setMethod(request.paymentMethod())                                    │
│   └─ if (razorpayOrderId == null):                                                 │
│        payment.setRazorpayOrderId("rpay_order_" + UUID.randomUUID())               │
│                                                                                     │
│   Step 4: Save and return                                                           │
│   └─ paymentRepository.save(payment) → INSERT/UPDATE payments                      │
│      → toResponse(payment) → PaymentResponse                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Complete Mock Payment (`POST /api/v1/payments/mock-complete`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Checkout.jsx → "Pay with Mock" button (development)                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ PaymentService.java - completeMockPayment():                                        │
│   Step 1: Find order (user-scoped)                                                  │
│   Step 2: Find or create payment                                                    │
│   Step 3: Generate mock IDs and mark COMPLETED                                      │
│   ├─ payment.setRazorpayOrderId("mock_order_" + UUID.randomUUID())                 │
│   ├─ payment.setRazorpayPaymentId("mock_payment_" + UUID.randomUUID())             │
│   ├─ payment.setStatus(PaymentStatus.COMPLETED)                                     │
│   ├─ payment.setPaidAt(LocalDateTime.now())                                         │
│   Step 4: Update order status                                                       │
│   ├─ order.setPaymentStatus(PaymentStatus.COMPLETED)                               │
│   └─ if (order.getOrderStatus() == PENDING) → CONFIRMED                            │
│   Step 5: Save + notify                                                              │
│   └─ paymentRepository.save(payment) + orderRepository.save(order)                 │
│                                                                                     │
│   ⚠ No signature verification — for dev/testing only                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Verify Payment (`POST /api/v1/payments/verify`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: (after Razorpay checkout success — receives paymentId + signature)        │
│   → POST /payments/verify { orderId, razorpayOrderId, razorpayPaymentId, signature }│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ PaymentService.java - verifyPayment():                                              │
│   Step 1: Find order (user-scoped)                                                  │
│   Step 2: Find payment for order                                                    │
│                                                                                     │
│   Step 3: Validate razorpayOrderId matches stored                                   │
│   └─ if (!request.razorpayOrderId().equals(payment.getRazorpayOrderId()))          │
│        → BadRequestException("Razorpay order ID mismatch")                         │
│                                                                                     │
│   Step 4: Verify HMAC-SHA256 signature                                              │
│   └─ boolean valid = verifySignature(                                               │
│        request.razorpayOrderId(),                                                   │
│        request.razorpayPaymentId(),                                                 │
│        request.signature()                                                          │
│      )                                                                              │
│      ├─ payload = razorpayOrderId + "|" + razorpayPaymentId                        │
│      ├─ HmacSHA256(payload, paymentConfig.getSignatureSecret())                    │
│      ├─ Convert to hex string                                                       │
│      └─ Compare with request.signature()                                           │
│                                                                                     │
│   Step 5a: If VALID →                                                              │
│   ├─ payment.setStatus(COMPLETED), setPaidAt(now)                                  │
│   ├─ order.setPaymentStatus(COMPLETED)                                             │
│   ├─ if (orderStatus == PENDING) → CONFIRMED                                       │
│                                                                                     │
│   Step 5b: If INVALID →                                                            │
│   ├─ payment.setStatus(FAILED)                                                     │
│   └─ order.setPaymentStatus(FAILED)                                                │
│                                                                                     │
│   Step 6: Save + notify                                                              │
│   └─ paymentRepository.save(payment) + orderRepository.save(order)                 │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: PaymentResponse with updated status                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Get Payment for Order (`GET /api/v1/payments/order/{orderId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ PaymentController.java:                                                             │
│   UUID userId = SecurityUtils.currentUserId();                                      │
│   PaymentResponse response = paymentService.getPaymentForOrder(userId, orderId);   │
│                                                                                     │
│ PaymentService.java:                                                                │
│   Order order = orderRepository.findByIdAndUserId(orderId, userId) → 404            │
│   Payment payment = paymentRepository.findByOrderId(order.getId()) → 404            │
│   return toResponse(payment);                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. REVIEW FLOW

### 6.1 Upsert Review (`POST /api/v1/reviews`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: ProductDetail.jsx → "Write Review" form                                   │
│   reviewApi.upsert({ productId, rating: 4, title: "Great", body: "..." })           │
│   → axios.post('/reviews', data)                                                    │
│   → Authorization: Bearer <token> required                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ReviewController.java:                                                              │
│   UUID userId = SecurityUtils.currentUserId();                                      │
│   ReviewResponse response = reviewService.upsertReview(userId, request);           │
│                                                                                     │
│ ReviewService.java - upsertReview():                                                │
│   Step 1: Check verified purchase                                                   │
│   ├─ orderService.hasVerifiedPurchase(userId, request.productId())                  │
│   │  └─ orderRepository.existsByUserIdAndItemsProductIdAndOrderStatusIn(            │
│   │       userId, productId,                                                        │
│   │       [CONFIRMED, PROCESSING, SHIPPED, DELIVERED, RETURNED])                   │
│   │      → EXISTS (SELECT 1 FROM orders o JOIN order_items oi                     │
│   │          ON o.id = oi.order_id WHERE o.user_id=? AND oi.product_id=?           │
│   │          AND o.order_status IN (?))                                             │
│   └─ If false → BusinessException("Only verified buyers can review")               │
│                                                                                     │
│   Step 2: Find user + product                                                       │
│   ├─ User user = userRepository.findById(userId)                                   │
│   └─ Product product = productRepository.findById(request.productId())             │
│                                                                                     │
│   Step 3: Find existing review or create new (UPSERT pattern)                      │
│   ├─ Review review = reviewRepository.findByUserIdAndProductId(userId, prodId)     │
│   │    .orElseGet(() → Review.builder().user(user).product(product).build())      │
│                                                                                     │
│   Step 4: Update fields and reset status to PENDING                                 │
│   ├─ review.setRating(request.rating())                                            │
│   ├─ review.setTitle(request.title())                                              │
│   ├─ review.setBody(request.body())                                                │
│   ├─ review.setStatus(ReviewStatus.PENDING)  ← Always resets on update            │
│   └─ review.setIsVerifiedPurchase(true)                                            │
│                                                                                     │
│   Step 5: Save and return                                                           │
│   └─ reviewRepository.save(review) → INSERT OR UPDATE reviews                     │
│      → reviewMapper.toResponse(saved)                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Get Approved Reviews (`GET /api/v1/reviews/product/{productId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: ProductDetail.jsx (reviews section)                                       │
│   reviewApi.getByProduct(productId, { page: 0, size: 10 })                         │
│   → axios.get(`/reviews/product/${productId}`, { params })                         │
│   → PUBLIC — no auth required                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ReviewController.java: (public GET)                                                 │
│   @GetMapping("/product/{productId}")                                              │
│   PagedResponse<ReviewResponse> response = reviewService.getApprovedReviews(        │
│       productId, page, size);                                                       │
│                                                                                     │
│ ReviewService.java:                                                                  │
│   reviewRepository.findAllByProductIdAndStatus(productId, ReviewStatus.APPROVED,    │
│       PageRequest.of(Math.max(page, 0), Math.max(size, 1)))                        │
│     SELECT * FROM reviews WHERE product_id=? AND status='APPROVED'                 │
│     ORDER BY created_at DESC LIMIT ? OFFSET ?                                      │
│     .map(reviewMapper::toResponse)                                                  │
│   return PagedResponse.from(responsePage);                                          │
│                                                                                     │
│   ⚠ Only APPROVED reviews are publicly visible — PENDING/REJECTED are hidden      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Moderate Review (`PATCH /api/v1/admin/reviews/{id}/moderate`) — Admin Only

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AdminReviews.jsx                                                           │
│   adminApi.moderateReview(id, "APPROVED") → axios.patch(`/admin/reviews/${id}/...`) │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ReviewService.java - moderateReview():                                              │
│   Step 1: Find review                                                               │
│   └─ reviewRepository.findById(reviewId) → 404 if not found                        │
│                                                                                     │
│   Step 2: Set status (APPROVED or REJECTED)                                        │
│   └─ review.setStatus(status)                                                      │
│                                                                                     │
│   Step 3: Recalculate product average rating                                        │
│   └─ recalculateProductRatings(review.getProduct()):                               │
│      ├─ Object[] stats = reviewRepository.findRatingStats(productId, APPROVED)     │
│      │  → SELECT AVG(rating), COUNT(*) FROM reviews                               │
│      │     WHERE product_id=? AND status='APPROVED'                               │
│      ├─ avg = stats[0] ?? 0.0, total = stats[1] ?? 0                              │
│      ├─ product.setAvgRating(avg)                                                   │
│      ├─ product.setTotalReviews(total)                                              │
│      └─ productRepository.save(product)                                             │
│                                                                                     │
│   Step 4: Save review                                                               │
│   └─ reviewRepository.save(review) → UPDATE reviews SET status=?                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. WISHLIST FLOW

### 7.1 Get All Wishlists (`GET /api/v1/wishlists`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Wishlists.jsx                                                              │
│   wishlistApi.getAll() → axios.get('/wishlists')                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ WishlistService.java - getAllWishlists():                                           │
│   List<Wishlist> wishlists = wishlistRepository.findByUserId(userId)                │
│     SELECT * FROM wishlists WHERE user_id = ?                                      │
│                                                                                     │
│   if (wishlists.isEmpty()) {                                                        │
│     // Auto-create default wishlist on first access                                 │
│     Wishlist defaultWishlist = Wishlist.builder().user(user)                        │
│       .name("My Wishlist").items(new ArrayList<>()).build()                        │
│     wishlistRepository.save(defaultWishlist) → INSERT INTO wishlists              │
│     wishlists = List.of(defaultWishlist);                                           │
│   }                                                                                 │
│                                                                                     │
│   return wishlists.stream().map(wishlistMapper::toResponse).toList();              │
│     → WishlistResponse { id, userId, name, items: [WishlistItemResponse...],       │
│         totalItems }                                                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Add Item to Wishlist (`POST /api/v1/wishlists/{wishlistId}/items/{productId}`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: ProductDetail.jsx → "Add to Wishlist" button                              │
│   wishlistApi.addItem(wishlistId, productId) → axios.post(...)                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ WishlistService.java - addItem():                                                   │
│   Step 1: Find wishlist (user-scoped)                                               │
│   └─ wishlistRepository.findByIdAndUserId(wishlistId, userId) → 404                │
│                                                                                     │
│   Step 2: Find product                                                              │
│   └─ productRepository.findById(productId) → 404                                   │
│                                                                                     │
│   Step 3: Check product active                                                      │
│   └─ if (!product.getActive()) → BusinessException                                 │
│                                                                                     │
│   Step 4: Check if already exists (idempotent)                                      │
│   └─ wishlistItemRepository.findByWishlistIdAndProductId(wlId, prodId)             │
│      → If NOT exists: wishlistItemRepository.save(WishlistItem.builder()           │
│          .wishlist(wishlist).product(product).build())                             │
│         INSERT INTO wishlist_items (id, wishlist_id, product_id, added_at)         │
│      → If EXISTS: silently skip (no error)                                         │
│                                                                                     │
│   Step 5: Return updated wishlist                                                   │
│   └─ wishlistMapper.toResponse(reloadWishlist(wishlistId))                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Move Wishlist Item to Cart (`POST /api/v1/wishlists/{wlId}/items/{itemId}/move-to-cart?quantity=1`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ WishlistService.java - moveToCart():                                                │
│   Step 1: Find wishlist + item (user-scoped)                                        │
│   Step 2: Call CartService.addItem() → adds product to cart (with stock check)    │
│   Step 3: Delete the wishlist item                                                   │
│   └─ wishlistItemRepository.delete(item)                                           │
│   Step 4: Return updated wishlist                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. ADDRESS FLOW

### 8.1 Add Address (`POST /api/v1/addresses`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Profile.jsx or Checkout.jsx → address form                                │
│   addressApi.add({ fullName, phone, addressLine1, city, state, postalCode,          │
│                   country, addressType, isDefault })                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ AddressService.java - addAddress():                                                 │
│   Step 1: Find user                                                                 │
│   └─ userRepository.findById(userId) → 404                                         │
│                                                                                     │
│   Step 2: Clear default flag if new address is default                             │
│   └─ if (request.isDefault()) → clearDefaultAddress(userId)                        │
│      → findAllByUserId(userId).forEach(a -> { a.setIsDefault(false); save(a); })    │
│                                                                                     │
│   Step 3: Build + save address                                                      │
│   └─ Address.builder().fullName().phone().addressLine1()...                        │
│        .addressType(request.addressType()).isDefault(request.isDefault())           │
│        .user(user).build()                                                          │
│      → addressRepository.save(address) → INSERT INTO addresses                     │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: AddressResponse                                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. COUPON FLOW

### 9.1 Validate Coupon (`POST /api/v1/coupons/validate`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Checkout.jsx → "Apply Coupon" button                                      │
│   couponApi.validate({ code: "SAVE20", orderAmount: 1500.00 })                     │
│   → axios.post('/coupons/validate', data)                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ CouponService.java - validateCoupon():                                              │
│   Step 1: Find coupon by code (case-insensitive)                                    │
│   ├─ couponRepository.findByCodeIgnoreCase(request.code().trim())                  │
│   └─ If null → return CouponValidationResponse(code, false, 0, amount,             │
│                     "Coupon not found")  ← NO EXCEPTION, returns valid=false       │
│                                                                                     │
│   Step 2: Check validity                                                            │
│   ├─ coupon.isValid() → checks: active && !expired && usedCount < usageLimit)     │
│   └─ If invalid → return (valid=false, "Coupon expired or inactive")               │
│                                                                                     │
│   Step 3: Check minimum order amount                                                │
│   ├─ if (orderAmount < minOrderAmount) → (valid=false, "Below minimum amount")     │
│                                                                                     │
│   Step 4: Calculate discount                                                        │
│   └─ discount = coupon.calculateDiscount(orderAmount)                              │
│      ├─ PERCENTAGE: orderAmount * discountValue / 100                             │
│      │  if maxDiscountAmount && discount > maxDiscount → cap at max                  │
│      └─ FLAT: discountValue                                                        │
│      → payable = orderAmount - discount                                            │
│                                                                                     │
│   Step 5: Return validation result                                                  │
│   └─ CouponValidationResponse(code, true, discount, payable, "Coupon applied")     │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Response: CouponValidationResponse { code, valid, discountAmount, payableAmount,    │
│           message }                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. ADMIN FLOW

### 10.1 Admin: List All Orders (`GET /api/v1/admin/orders`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: AdminOrders.jsx                                                            │
│   adminApi.getAllOrders() → axios.get('/admin/orders')                              │
│   → Authorization: Bearer <admin_token> (must have ROLE_ADMIN)                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ Security: JwtAuthFilter validates token → userDetails.getAuthorities()              │
│   must contain "ROLE_ADMIN" → else 403 Forbidden                                   │
│                                                                                     │
│ AdminOrderController.java:                                                          │
│   List<AdminOrderResponse> response = orderService.getAllOrdersForAdmin();          │
│                                                                                     │
│ OrderService.java:                                                                  │
│   orderRepository.findAllWithDetailsOrderByCreatedAtDesc().stream()                 │
│     → Custom JPQL with JOIN FETCH items + user?                                   │
│     .map(orderMapper::toAdminResponse)                                              │
│     .toList()                                                                       │
│                                                                                     │
│   orderMapper.toAdminResponse() →                                                   │
│     Adds CustomerSummaryResponse(user.id, user.fullName, user.email)               │
│     + all OrderResponse fields                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Admin: Update Order Status (`PATCH /api/v1/admin/orders/{id}/status`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AdminOrderController.java:                                                          │
│   OrderResponse response = orderService.updateOrderStatus(orderId,                  │
│                                       request.orderStatus());                       │
│                                                                                     │
│ OrderService.java - updateOrderStatus():                                            │
│   Step 1: Find order with details (not user-scoped — admin sees all)               │
│   └─ orderRepository.findWithDetailsById(orderId) → 404                            │
│                                                                                     │
│   Step 2: Set order status                                                          │
│   └─ order.setOrderStatus(status)                                                  │
│                                                                                     │
│   Step 3: Auto-complete payment if DELIVERED                                       │
│   └─ if (status == DELIVERED && paymentStatus == PENDING)                         │
│        → paymentStatus = COMPLETED                                                 │
│                                                                                     │
│   Step 4: Auto-restock if CANCELLED                                                │
│   └─ if (status == CANCELLED) → restockItems(order)                               │
│                                                                                     │
│   Step 5: Save + notify                                                              │
│   └─ orderRepository.save(order) + notificationService.sendOrderStatusChanged()     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Admin: List Users (`GET /api/v1/admin/users`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AdminUserController.java:                                                           │
│   List<UserResponse> response = adminUserService.listUsers();                       │
│                                                                                     │
│ AdminUserService.java:                                                              │
│   userRepository.findAll().stream()                                                 │
│     SELECT * FROM users                                                             │
│     .sorted((left, right) → right.getCreatedAt().compareTo(left.getCreatedAt()))   │
│     .map(userMapper::toResponse)  ← UserResponse includes id, name, email, role,  │
│                                    isActive, isEmailVerified, phone, createdAt      │
│     .toList()                                                                       │
│                                                                                     │
│   ⚠ Contains password? NO — UserMapper.toResponse() maps only safe fields          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Admin: Update User Status (`PATCH /api/v1/admin/users/{id}/status`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AdminUserController.java:                                                           │
│   UserResponse response = adminUserService.updateUserStatus(userId,                 │
│                                       request.active());                            │
│                                                                                     │
│ AdminUserService.java:                                                              │
│   User user = userRepository.findById(userId) → 404                                 │
│   user.setIsActive(active)  ← Enable/disable user account                          │
│   return userMapper.toResponse(userRepository.save(user))                          │
│                                                                                     │
│   ⚠ When isActive=false, the user CANNOT log in (AppUserPrincipal.isEnabled()        │
│     returns isActive = false)                                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. CATEGORY FLOW

### 11.1 Get Category Tree (`GET /api/v1/categories/tree`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Frontend: Navbar.jsx or Shop.jsx → category filter                                  │
│   categoryApi.getTree() → axios.get('/categories/tree')                            │
│   → PUBLIC — no auth required                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ CategoryController.java:                                                            │
│   List<CategoryResponse> response = categoryService.getCategoryTree();              │
│                                                                                     │
│ CategoryService.java - getCategoryTree():                                           │
│   categoryRepository.findAllByParentCategoryIsNullOrderByNameAsc()                  │
│     SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name ASC             │
│     .map(this::toTree)  ← Recursive tree building                                  │
│       .toList()                                                                     │
│                                                                                     │
│   private CategoryResponse toTree(Category category):                               │
│     UUID parentId = category.getParentCategory()?.getId()                           │
│     List<CategoryResponse> children =                                              │
│       categoryRepository.findAllByParentCategoryIdOrderByNameAsc(category.getId()) │
│         SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC             │
│         .map(this::toTree)  ← RECURSIVE → builds full tree depth                  │
│         .toList()                                                                   │
│     return CategoryResponse(id, name, slug, description, imageUrl,                  │
│             parentId, children)                                                     │
│                                                                                     │
│   ⚠ Recursive N+1: For N root categories, makes N+1 queries                       │
│     Optimization: Could fetch all at once and build tree in-memory                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. INVENTORY FLOW

### 12.1 Get Inventory by Product (`GET /api/v1/admin/inventory/product/{productId}`) — Admin

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AdminInventoryController.java:                                                      │
│   InventoryResponse response = inventoryService.getByProduct(productId);            │
│                                                                                     │
│ InventoryService.java:                                                              │
│   Inventory inventory = inventoryRepository.findByProductId(productId) → 404        │
│   return productMapper.toInventoryResponse(inventory)                              │
│     → InventoryResponse { id, sku, stockQuantity, reservedQuantity,                │
│         soldQuantity, availableQuantity, lowStockThreshold, inStock }              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Update Inventory (`PUT /api/v1/admin/inventory`) — Admin

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AdminInventoryController.java:                                                      │
│   InventoryResponse response = inventoryService.updateStock(request);               │
│                                                                                     │
│ InventoryService.java - updateStock():                                              │
│   Step 1: Find inventory by productId                                               │
│   └─ inventoryRepository.findByProductId(request.productId()) → 404                │
│                                                                                     │
│   Step 2: Validate new stock >= reserved                                            │
│   └─ if (request.stockQuantity() < inventory.getReservedQuantity())                │
│        → BusinessException("Stock cannot be lower than reserved quantity")         │
│      (Prevents data inconsistency — can't reduce stock below what's reserved)      │
│                                                                                     │
│   Step 3: Update fields                                                             │
│   ├─ inventory.setStockQuantity(request.stockQuantity())                           │
│   ├─ inventory.setLowStockThreshold(request.lowStockThreshold())                   │
│   └─ inventory.setInStock(inventory.getAvailableQuantity() > 0)                    │
│                                                                                     │
│   Step 4: Save and return                                                           │
│   └─ productMapper.toInventoryResponse(inventoryRepository.save(inventory))         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ENTITY-DATABASE FIELD MAPPING SUMMARY

```
BaseEntity (abstract)
├── id: UUID → BINARY(16) PRIMARY KEY
├── created_at: LocalDateTime → TIMESTAMP
├── updated_at: LocalDateTime → TIMESTAMP
└── version: Long → BIGINT (@Version — optimistic lock)

User → users
├── fullName: String → full_name VARCHAR(100)
├── email: String → email VARCHAR(255) UNIQUE
├── password: String → password VARCHAR(255) (BCrypt hash)
├── role: Role → role VARCHAR(20) (ENUM → String)
├── isActive: Boolean → is_active BOOLEAN
├── isEmailVerified: Boolean → is_email_verified BOOLEAN
├── phone: String → phone VARCHAR(20)
├── profileImageUrl: String → profile_image_url VARCHAR(500)
└── lastLoginAt: LocalDateTime → last_login_at TIMESTAMP NULL

Product → products
├── name: String → name VARCHAR(255)
├── slug: String → slug VARCHAR(300) UNIQUE
├── description: String → description TEXT
├── price: BigDecimal → price DECIMAL(12,2)
├── discountPrice: BigDecimal → discount_price DECIMAL(12,2)
├── active: Boolean → active BOOLEAN
├── brand: String → brand VARCHAR(100)
├── sku: String → sku VARCHAR(50) UNIQUE
├── avgRating: Double → avg_rating DOUBLE
├── totalReviews: Integer → total_reviews INT
├── category_id: UUID → category_id BINARY(16) FK

Inventory → inventory
├── stockQuantity: Integer → stock_quantity INT
├── reservedQuantity: Integer → reserved_quantity INT
├── soldQuantity: Integer → sold_quantity INT
├── sku: String → sku VARCHAR(50) UNIQUE
├── lowStockThreshold: Integer → low_stock_threshold INT
├── inStock: Boolean → in_stock BOOLEAN
└── product_id: UUID → product_id BINARY(16) FK UNIQUE

Order → orders
├── orderNumber: String → order_number VARCHAR(30) UNIQUE
├── totalPrice: BigDecimal → total_price DECIMAL(12,2)
├── discountAmount: BigDecimal → discount_amount DECIMAL(12,2)
├── finalPrice: BigDecimal → final_price DECIMAL(12,2)
├── orderStatus: OrderStatus → order_status VARCHAR(30)
├── paymentStatus: PaymentStatus → payment_status VARCHAR(30)
├── shippingAddress: ShippingAddress (EMBEDDED)
│   ├── fullName → shipping_full_name VARCHAR(100)
│   ├── phone → shipping_phone VARCHAR(20)
│   ├── addressLine1 → shipping_address_line1 VARCHAR(255)
│   ├── addressLine2 → shipping_address_line2 VARCHAR(255)
│   ├── city → shipping_city VARCHAR(100)
│   ├── state → shipping_state VARCHAR(100)
│   ├── postalCode → shipping_postal_code VARCHAR(20)
│   └── country → shipping_country VARCHAR(100)
├── coupon_id: UUID → coupon_id BINARY(16) FK (nullable)
└── user_id: UUID → user_id BINARY(16) FK

Review → reviews
├── rating: Integer → rating INT
├── title: String → title VARCHAR(200)
├── body: String → body TEXT
├── status: ReviewStatus → status VARCHAR(20)
├── isVerifiedPurchase: Boolean → is_verified_purchase BOOLEAN
├── user_id: UUID → user_id BINARY(16) FK
├── product_id: UUID → product_id BINARY(16) FK
└── UNIQUE(user_id, product_id)

RefreshToken → refresh_tokens
├── token: String → token VARCHAR(500) UNIQUE
├── expiryDate: LocalDateTime → expiry_date TIMESTAMP
├── revoked: Boolean → revoked BOOLEAN
└── user_id: UUID → user_id BINARY(16) FK

Payment → payments
├── razorpayOrderId: String → razorpay_order_id VARCHAR(100)
├── razorpayPaymentId: String → razorpay_payment_id VARCHAR(100)
├── amount: BigDecimal → amount DECIMAL(12,2)
├── currency: String → currency VARCHAR(10)
├── status: PaymentStatus → status VARCHAR(20)
├── method: PaymentMethod → method VARCHAR(30)
├── paidAt: LocalDateTime → paid_at TIMESTAMP NULL
└── order_id: UUID → order_id BINARY(16) FK UNIQUE
```

---

## REQUEST FLOW SUMMARY

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPLETE REQUEST LIFECYCLE                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Browser/App → HTTP Request                                  │
│     │                                                           │
│     ├─ Method: GET/POST/PUT/DELETE/PATCH                        │
│     ├─ URL: http://localhost:8081/api/v1/...                    │
│     ├─ Headers: Authorization, Content-Type, etc.               │
│     └─ Body: JSON (for POST/PUT)                                │
│                                                                  │
│  2. Vite Dev Server (port 3001) → proxied or direct CORS        │
│     └─ If not matching CORS → CORS error                       │
│                                                                  │
│  3. Spring Security Filter Chain                                 │
│     ├─ CorsFilter → Validate origin                             │
│     ├─ SecurityContextHolderFilter                              │
│     ├─ JwtAuthFilter → Extract + validate JWT                  │
│     ├─ ... other filters                                        │
│     └─ FilterSecurityInterceptor → URL authorization           │
│                                                                  │
│  4. DispatcherServlet                                            │
│     └─ RequestMappingHandlerMapping → Route to Controller       │
│                                                                  │
│  5. Controller (@RestController)                                 │
│     ├─ @Valid → Validation (Bean Validation)                    │
│     ├─ SecurityUtils.currentUserId() → Extract user from JWT    │
│     ├─ Call Service Layer                                       │
│     └─ Return ResponseEntity<ApiResponse<T>>                    │
│                                                                  │
│  6. Service Layer (@Service)                                     │
│     ├─ @Transactional → Begin database transaction              │
│     ├─ Business logic & validation                              │
│     ├─ Call Repository Layer                                    │
│     ├─ Call Mapper Layer for entity→DTO conversion              │
│     ├─ Call other services as needed                            │
│     └─ @Transactional → Commit/Rollback                        │
│                                                                  │
│  7. Repository Layer (Spring Data JPA)                           │
│     ├─ Query derivation from method name                        │
│     └─ Hibernate → SQL query execution                          │
│                                                                  │
│  8. Database (MySQL)                                             │
│     └─ Execute SQL → Return ResultSet                          │
│                                                                  │
│  9. Response Construction (Reverse)                              │
│     ├─ Repository → Entity objects                              │
│     ├─ Service → Mapper → DTOs                                  │
│     └─ Controller → ApiResponse wrapper → JSON                  │
│                                                                  │
│ 10. HTTP Response → Client                                       │
│     ├─ Status: 200/201/400/401/403/404/409/422/500              │
│     ├─ Body: { success, message, data, errorCode, timestamp,    │
│                path }                                            │
│     └─ Content-Type: application/json                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

> **Generated by: Cline AI Assistant**  
> **Date**: June 18, 2026  
> **Purpose**: Layer-by-layer data flow analysis of the EEEE e-commerce platform