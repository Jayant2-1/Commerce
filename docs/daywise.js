const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageBreak
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "888888" };
const borders = { top: border, bottom: border, left: border, right: border };

function code(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: lines.map(l => new Paragraph({
              spacing: { after: 20 },
              children: [new TextRun({ text: l, font: "Consolas", size: 18, color: "E5E5E5" })]
            }))
          })
        ]
      })
    ]
  });
}

function dayHeading(num, title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(`DAY ${num}. ${title}`)]
  });
}
function task(n, text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: `${n}. `, bold: true }), new TextRun(text)]
  });
}
function note(text) {
  return new Paragraph({
    spacing: { before: 40, after: 160 },
    children: [new TextRun({ text, italics: true, color: "444444", size: 21 })]
  });
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: "111111" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "000000" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "000000" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 },
        children: [new TextRun({ text: "DAYWISE ASSIGNMENT", bold: true, size: 44, color: "000000" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "Subject: Spring Boot Fundamentals and REST API Development", size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [new TextRun({ text: "Project Reference: Cart \u2013 Payment Mock Application", bold: true, size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
        children: [new TextRun({ text: "Backend: cart_backend (Spring Boot)  |  Frontend: cart_frontend (React + Vite + TypeScript)", italics: true, size: 20, color: "333333" })] }),
      new Paragraph({ spacing: { after: 60 },
        children: [new TextRun({ text: "Name: ", bold: true }), new TextRun("Jayant Bhatia")] }),
      new Paragraph({ spacing: { after: 60 },
        children: [new TextRun({ text: "UID: ", bold: true }), new TextRun("24BCS10352")] }),
      new Paragraph({ spacing: { after: 300 },
        children: [new TextRun({ text: "Date: ", bold: true }), new TextRun("20 June 2026")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("How this maps to the project")] }),
      new Paragraph({ spacing: { after: 200 },
        children: [
          new TextRun("Every day's tasks below are answered in the context of the actual "),
          new TextRun({ text: "cart_backend", bold: true }),
          new TextRun(" / "),
          new TextRun({ text: "cart_frontend", bold: true }),
          new TextRun(" project \u2013 a payment / shopping-cart mock application built with Spring Boot (Spring Security, Spring Data JPA, MySQL, JWT via jjwt, OAuth2 client, Bean Validation) on the backend and React + Vite + TypeScript on the frontend, rather than being answered as a disconnected generic exercise.")
        ] }),

      pb(),

      dayHeading(1, "Spring Boot Starters"),
      task(1, "In cart_backend, the starters used are spring-boot-starter-webmvc (REST endpoints for cart/payment), spring-boot-starter-validation (request validation), spring-boot-starter-data-jpa (MySQL persistence) and spring-boot-starter-security (auth). Together these form the equivalent of a directory-style service \u2013 here, a payment/cart catalogue \u2013 with web, validation and persistence wired in automatically by auto-configuration."),
      task(2, "A minimal cart_backend build with only webmvc + data-jpa starts faster because fewer auto-configuration classes are scanned at boot. Adding starter-security and starter-security-oauth2-client (both present in the real pom.xml) pulls in filter chains and OAuth2 client beans, increasing startup time. Removing the OAuth2-client starter when social login isn't needed for a given environment measurably reduces boot time."),
      task(3, "Using spring-boot-starter-actuator (not yet in the current pom.xml but easy to add) on top of the existing webmvc starter would expose /actuator/health for the payment service, giving readiness/liveness checks before it is registered behind a load balancer."),
      task(4, "A small internal module that logs the method, path and JWT subject of every incoming request (registered as a Spring Filter/Interceptor) can be extracted as a reusable \u201cstarter-like\u201d module and reused across cart_backend and any future microservice in the same way the security and validation starters are reused today."),
      note("Reference: cart_backend/pom.xml \u2013 spring-boot-starter-webmvc, spring-boot-starter-validation, spring-boot-starter-data-jpa, spring-boot-starter-security."),

      dayHeading(2, "Auto-configuration, Dependency Injection"),
      task(1, "In the payment mock app, a PaymentMethodStrategy interface can have UpiPaymentService, CardPaymentService and NetBankingPaymentService implementations, each annotated @Service with a @Qualifier; the controller injects the right bean based on the request's payment type field rather than using if/else chains."),
      task(2, "A NotificationService interface with EmailNotificationSender and SmsNotificationSender implementations can be auto-selected using @Profile(\"email\") / @Profile(\"sms\") so the active Spring profile decides which bean is injected when a cart checkout completes."),
      task(3, "The current CartController/PaymentController-style classes should use constructor injection (final fields + Lombok's @RequiredArgsConstructor, which is already a dependency in pom.xml) instead of field injection, making the service layer easy to mock in unit tests with Mockito."),
      task(4, "A configurable audit logger for cart/payment actions can use @ConditionalOnProperty(name = \"audit.enabled\", havingValue = \"true\") so audit logging can be toggled per environment via application.properties without code changes."),

      dayHeading(3, "REST APIs: Controller-Service-Repository architecture, DTOs"),
      task(1, "cart_backend follows Controller \u2192 Service \u2192 Repository layering: a CartController exposes endpoints, delegates business rules (e.g. quantity limits, stock checks) to a CartService, which uses a CartRepository (Spring Data JPA) for persistence \u2013 the same separation a customer-support-ticket API would use."),
      task(2, "For the payment/cart APIs, dedicated request/response DTOs (e.g. AddToCartRequest, PaymentRequestDto, PaymentResponseDto) are used instead of exposing JPA entities directly, preventing internal fields like password hashes or audit columns from leaking into API responses."),
      task(3, "CRUD for the product/cart-item catalogue enforces business rules in the service layer \u2013 e.g. price and quantity cannot be negative \u2013 keeping the controller a thin layer that only handles HTTP concerns."),
      task(4, "A search endpoint such as GET /api/payments?status=SUCCESS or GET /api/cart/items?category=electronics follows the same layered pattern, with filtering logic implemented in the service layer rather than in the controller."),

      pb(),

      dayHeading(4, "Validation, Global Exception Handling"),
      task(1, "User/registration and checkout DTOs in cart_backend use Bean Validation annotations (@Email, @NotBlank, @Pattern for mobile numbers, @Size for passwords), enabled by the spring-boot-starter-validation dependency already present in the project."),
      task(2, "A @ControllerAdvice class (GlobalExceptionHandler) maps MethodArgumentNotValidException, EntityNotFoundException and custom business exceptions to a consistent JSON error shape: { timestamp, status, error, message, path }."),
      task(3, "For the payment flow, a loan-style strict-validation pattern is mirrored when validating a checkout request \u2013 rejecting negative amounts, missing card/UPI details, or an inactive cart."),
      task(4, "Custom exceptions such as InsufficientStockException or PaymentFailedException are thrown from the service layer and translated by the global handler into clear 4xx responses instead of raw stack traces."),
      code([
        "@RestControllerAdvice",
        "public class GlobalExceptionHandler {",
        "    @ExceptionHandler(MethodArgumentNotValidException.class)",
        "    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {",
        "        return ResponseEntity.badRequest().body(ApiError.of(ex));",
        "    }",
        "}"
      ]),

      dayHeading(5, "Creating Mini Project with Service Layer"),
      task(1, "The cart checkout workflow mirrors a leave-management style approval flow: a cart moves from PENDING \u2192 PAYMENT_INITIATED \u2192 PAID/FAILED, with each transition validated inside CartService/PaymentService."),
      task(2, "Service-layer checks prevent duplicate/overlapping payment attempts on the same order \u2013 e.g. rejecting a second payment initiation while one is already PENDING for that cart."),
      task(3, "Stock/availability checks before allowing checkout mirror a doctor-availability-style rule: an item already out of stock cannot be added to the cart or paid for."),
      task(4, "A coupon/discount service applied to the cart enforces expiry date, one-time-use, and minimum order value \u2013 directly usable in the payment mock app's checkout step."),

      dayHeading(6, "Testing Mini Project with Service Layer"),
      task(1, "Unit tests for CartService/PaymentService use Mockito to mock CartRepository, verifying that checkout logic behaves correctly without hitting MySQL."),
      task(2, "A test verifies that initiating a second payment while one is PENDING for the same cart throws the expected business exception."),
      task(3, "Negative tests cover an expired coupon, an invalid/unauthenticated user, and re-use of an already-used coupon code."),
      task(4, "Coverage targets the branching logic inside the service layer \u2013 stock checks, coupon rules, and payment-status transitions \u2013 rather than getters/setters."),
      code([
        "@Test",
        "void rejectsSecondPaymentWhilePending() {",
        "    when(cartRepo.findById(id)).thenReturn(Optional.of(pendingCart));",
        "    assertThrows(PaymentInProgressException.class,",
        "        () -> paymentService.initiatePayment(id, request));",
        "}"
      ]),

      pb(),

      dayHeading(7, "Entity Mapping"),
      task(1, "User, CartItem and Product/Address entities in cart_backend use @Entity, @Id, @GeneratedValue and @Column with appropriate constraints (nullable = false, unique = true on email)."),
      task(2, "A Payment entity has fields for status, amount and createdAt, mapped with @Table(name = \"payments\") to a custom table name distinct from the Java class name."),
      task(3, "AuditLog and UserAccount entities add @Index on frequently queried columns (userId, createdAt) and timestamp fields populated via @CreationTimestamp."),
      task(4, "Payment/order status is mapped with @Enumerated(EnumType.STRING) instead of ORDINAL, so reordering enum constants later doesn't silently corrupt stored data \u2013 important for a payment-status field."),
      code([
        "@Entity",
        "@Table(name = \"payments\")",
        "public class Payment {",
        "    @Id @GeneratedValue private Long id;",
        "    @Enumerated(EnumType.STRING) private PaymentStatus status;",
        "    private BigDecimal amount;",
        "    @CreationTimestamp private LocalDateTime createdAt;",
        "}"
      ]),

      dayHeading(8, "Relationships"),
      task(1, "A many-to-many style relationship (analogous to Student\u2013Course) appears between User and SavedPaymentMethod in a wallet-style extension of the cart app."),
      task(2, "The core e-commerce relationship in cart_backend is User \u2013 Cart (one-to-many) and Cart \u2013 CartItem (one-to-many), mirroring Customer\u2013Order and Order\u2013OrderItem."),
      task(3, "If reviews/comments were added to products, a Product\u2013Review\u2013Tag relationship set would follow the same Post/Comment/Tag pattern."),
      task(4, "A more elaborate booking-style extension (e.g. scheduled payment slots) would reuse the Theatre/Screen/Show/Seat style of nested one-to-many relationships."),

      dayHeading(9, "Cascade Types, JPQL, Native Queries, Criteria API"),
      task(1, "Cart \u2192 CartItem uses cascade = CascadeType.ALL so deleting a cart also deletes its line items in one operation."),
      task(2, "JPQL such as SELECT p FROM Payment p WHERE p.status = 'SUCCESS' AND p.createdAt > :date fetches recent successful payments."),
      task(3, "A native query aggregates monthly totals: SELECT MONTH(created_at), SUM(amount) FROM payments GROUP BY MONTH(created_at)."),
      task(4, "A dynamic Criteria API query filters cart items by category, price range and stock status for an admin search screen, building predicates conditionally based on which filters are supplied."),
      code([
        "@Query(\"SELECT p FROM Payment p WHERE p.status = :status AND p.createdAt > :since\")",
        "List<Payment> findRecentByStatus(PaymentStatus status, LocalDateTime since);"
      ]),

      pb(),

      dayHeading(10, "Pagination, Sorting, Fetch Strategies"),
      task(1, "The product/catalogue listing endpoint in cart_frontend calls the backend with page, size and sort=price,desc parameters, backed by Spring Data's Pageable."),
      task(2, "A customer/payment-history listing supports page, size, sort and a keyword filter on description or payment reference."),
      task(3, "Cart \u2192 CartItem is fetched lazily by default; an N+1 issue when listing carts with items is fixed using a JOIN FETCH JPQL query or @EntityGraph."),
      task(4, "The product listing endpoint used by the React frontend's infinite scroll returns a Page<ProductDto> so the UI can request subsequent pages without re-fetching already-rendered items."),

      dayHeading(11, "Creating Mini Project with Database"),
      task(1, "cart_backend itself is the working example: a database-persisted cart system with per-user carts stored in MySQL via Spring Data JPA."),
      task(2, "Extending it with a saved-items/wishlist table mirrors a library-style borrow/return history, tracking when an item was added and removed from the cart."),
      task(3, "An inventory layer on top of the product table can add supplier, stock-movement and reorder-alert tables, feeding stock checks used during checkout."),
      task(4, "A normalized schema for orders/payments \u2013 separate Order, Payment and PaymentMethod tables linked by foreign keys \u2013 follows the same normalization principle as a student-result system."),

      dayHeading(12, "Testing Mini Project with Database"),
      task(1, "Repository integration tests for CartRepository/PaymentRepository run against an in-memory H2 database configured for the test profile."),
      task(2, "Tests confirm that Cart \u2192 CartItem persistence and cascade-delete behaviour work as expected when a cart is removed."),
      task(3, "A transactional test verifies that if writing the Payment row fails mid-way, the associated cart-status update is rolled back rather than left in an inconsistent state."),
      task(4, "Custom JPQL/native queries (e.g. the monthly-totals query) get dedicated test cases asserting the returned aggregation is correct against seeded H2 data."),

      pb(),

      dayHeading(13, "Authentication vs Authorization"),
      task(1, "cart_backend's Spring Security configuration distinguishes a logged-in (authenticated) user from one who is authorized to call a specific endpoint, e.g. only an authenticated user can call /api/cart, but only that same user's own cart can be returned."),
      task(2, "Role checks (USER vs ADMIN) gate admin-only endpoints such as managing the product catalogue, distinct from the customer-only cart/payment endpoints."),
      task(3, "A resource-ownership check ensures a user can only view/cancel their own payments unless they hold the ADMIN role, preventing IDOR-style access to other users' payment records."),
      task(4, "An audit trail entry for every payment action records both the authenticated principal (from the JWT) and whether the authorization check passed or failed, for traceability."),

      dayHeading(14, "JWT: Token generation, Signing, Validation Filters"),
      task(1, "cart_backend already depends on io.jsonwebtoken (jjwt-api, jjwt-impl, jjwt-jackson). Login issues a signed JWT that a custom OncePerRequestFilter validates on every subsequent /api/** request."),
      task(2, "Access tokens are short-lived; a refresh-token endpoint issues a new access token without requiring the user to re-enter credentials, important for a payment flow where sessions shouldn't expire mid-checkout."),
      task(3, "Roles/claims (e.g. role: USER) are embedded in the JWT payload and read in the security filter to authorize endpoints without an extra database lookup per request."),
      task(4, "Logout is implemented by adding the token's JTI to a blacklist (in-memory or Redis-backed) checked by the JWT filter, since JWTs can't be \u201cdeleted\u201d server-side otherwise."),
      code([
        "public class JwtAuthFilter extends OncePerRequestFilter {",
        "    protected void doFilterInternal(HttpServletRequest req,",
        "            HttpServletResponse res, FilterChain chain) {",
        "        String token = extractToken(req);",
        "        if (token != null && jwtService.isValid(token)) {",
        "            SecurityContextHolder.getContext()",
        "                .setAuthentication(jwtService.getAuthentication(token));",
        "        }",
        "        chain.doFilter(req, res);",
        "    }",
        "}"
      ]),

      dayHeading(15, "RBAC & OAuth2"),
      task(1, "An admin dashboard endpoint for managing the product catalogue is restricted so only ADMIN can create products, similar to ADMIN-only user creation."),
      task(2, "cart_backend's pom.xml already includes spring-boot-starter-security-oauth2-client, so a Google/GitHub login can be wired for the React frontend in addition to the existing JWT username/password login."),
      task(3, "@PreAuthorize(\"hasRole('ADMIN')\") protects sensitive operations like refunding a payment or deleting a product."),
      task(4, "A finer-grained RBAC model (e.g. CUSTOMER, SUPPORT, ADMIN) can gate which payment operations \u2013 view, refund, cancel \u2013 each role is permitted to perform."),

      pb(),

      dayHeading(16, "CORS Configuration"),
      task(1, "cart_backend's Spring Security config registers a CorsConfigurationSource that allows the cart_frontend Vite dev server (typically http://localhost:5173) to call the API running on a different port."),
      task(2, "Production CORS configuration restricts allowed origins to the deployed frontend domain only, while a separate dev profile keeps things permissive for local development."),
      task(3, "A CORS error involving the Authorization header is fixed by explicitly allowing that header in allowedHeaders and enabling allowCredentials(true) when cookies/credentials are used."),
      task(4, "Environment-specific CORS beans (local/staging/production) are configured via Spring profiles so each environment only trusts its own known frontend origin."),
      code([
        "@Bean",
        "CorsConfigurationSource corsConfigurationSource() {",
        "    CorsConfiguration config = new CorsConfiguration();",
        "    config.setAllowedOrigins(List.of(\"http://localhost:5173\"));",
        "    config.setAllowedMethods(List.of(\"GET\",\"POST\",\"PUT\",\"DELETE\"));",
        "    config.setAllowedHeaders(List.of(\"Authorization\",\"Content-Type\"));",
        "    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();",
        "    src.registerCorsConfiguration(\"/**\", config);",
        "    return src;",
        "}"
      ]),

      dayHeading(17, "Axios/Fetch Setup with Interceptors"),
      task(1, "cart_frontend configures an Axios instance whose request interceptor reads the JWT from storage and attaches it as a Bearer token on every call to cart_backend."),
      task(2, "A response interceptor catches 401 responses globally and redirects the user back to the login screen, clearing the stale token."),
      task(3, "A reusable API client wraps Axios with a sensible timeout and a retry policy for transient network failures during checkout."),
      task(4, "When the access token expires mid-session, the response interceptor transparently calls the refresh-token endpoint and retries the original request once with the new token."),
      code([
        "api.interceptors.response.use(",
        "  res => res,",
        "  async (error) => {",
        "    if (error.response?.status === 401) {",
        "      window.location.href = \"/login\";",
        "    }",
        "    return Promise.reject(error);",
        "  }",
        ");"
      ]),

      pb(),

      dayHeading(18, "GitHub Actions CI/CD"),
      task(1, "A GitHub Actions workflow on cart_backend runs mvn test on every pull request to main, catching broken builds before merge."),
      task(2, "Separate jobs build/test cart_backend, run cart_frontend's npm test and lint, so backend and frontend failures are reported independently."),
      task(3, "Branch-based rules deploy the develop branch to a staging environment and main to production after tests pass."),
      task(4, "Database/JWT secrets are stored as GitHub Actions secrets and injected as environment variables at deploy time, never hardcoded in the repository."),

      dayHeading(19, "Netlify Hosting"),
      task(1, "The cart_frontend React app is deployed to Netlify, pointing its build command/output (npm run build, dist) at Netlify's build settings."),
      task(2, "The API base URL for cart_backend is set via a Netlify environment variable (e.g. VITE_API_BASE_URL) rather than hardcoded in the frontend code."),
      task(3, "A _redirects rule (/* /index.html 200) fixes client-side routing 404s for the React Router-based SPA after deployment."),
      task(4, "Separate Netlify sites/branches are configured for a dev deployment pointing at a staging cart_backend and a prod deployment pointing at production."),

      dayHeading(20, "Mini Project - Security"),
      task(1, "Document/portal-style ownership checks map directly onto the cart app: a user can only view their own cart, addresses and payment history."),
      task(2, "The payment-history endpoint in cart_backend only returns transactions belonging to the authenticated user's id, enforced in the service layer."),
      task(3, "Rate limiting on the login/payment-initiation endpoints, audit logging of every payment attempt, and BCrypt password hashing (already standard with spring-boot-starter-security) harden the mock payment API."),
      task(4, "Admin-only reporting endpoints (e.g. total revenue, failed-payment counts) are protected with both JWT authentication and an ADMIN role check."),

      pb(),

      dayHeading(21, "Testing Mini Project"),
      task(1, "End-to-end tests cover registration/login, adding items to cart, checkout, and role-based access to admin endpoints."),
      task(2, "Both success (valid coupon, valid payment) and failure (expired coupon, declined payment) scenarios are tested for the checkout flow."),
      task(3, "API contract tests assert that PaymentResponseDto always includes the fields the frontend depends on (status, amount, reference id)."),
      task(4, "The test suite spans all three layers \u2013 PaymentServiceTest (business rules), PaymentRepositoryTest (persistence with H2), and PaymentControllerTest (HTTP contract with MockMvc)."),

      dayHeading(22, "React Application"),
      task(1, "cart_frontend is structured with React Router routes for Login, Cart, Checkout and Payment-History pages, with shared state (cart contents, auth user) managed via context/hooks."),
      task(2, "A dashboard-style summary page can show totals \u2013 items in cart, last payment status \u2013 consuming data from cart_backend's APIs."),
      task(3, "A shared layout component wraps every page with a navbar, optional sidebar (for an admin view) and protected-route logic that redirects unauthenticated users to login."),
      task(4, "The project is organized into components/, services/ (the Axios API client), hooks/ and pages/, matching how a medium-sized React app should be structured."),

      dayHeading(23, "UI for React Application"),
      task(1, "The login and registration forms in cart_frontend are responsive, with inline validation messages for invalid email/password before the request is even sent."),
      task(2, "A product/cart-items table supports search, sort and pagination controls, mirroring a data-table UI for a product catalogue."),
      task(3, "A reusable confirmation modal is used before destructive actions such as removing an item from the cart or cancelling a payment."),
      task(4, "A payment-status dashboard uses status chips (SUCCESS/FAILED/PENDING) and summary widgets for quick visual scanning of recent transactions."),

      pb(),

      dayHeading(24, "Running React Application"),
      task(1, "cart_frontend uses Vite's .env / .env.production files to set VITE_API_BASE_URL differently for local development and production builds."),
      task(2, "A build break caused by a mismatched React/TypeScript or Vite plugin version is fixed by aligning package.json versions and reinstalling node_modules."),
      task(3, "npm scripts (dev, build, preview) are kept consistent across the team so everyone runs the cart_frontend app the same way."),
      task(4, "The Vite dev server (with HMR) behaves differently from a production build \u2013 the dev server is slower to first load but updates instantly, while the production build is a static, optimized bundle served without HMR."),

      dayHeading(25, "Applying Frontend to Backend"),
      task(1, "cart_frontend's cart page calls cart_backend's /api/cart endpoints directly for adding, updating and removing items."),
      task(2, "The login flow is: React form submits credentials \u2192 cart_backend validates and returns a JWT \u2192 token stored client-side \u2192 protected routes check for a valid token before rendering."),
      task(3, "A product-creation form (for the admin side) sends multipart/form-data to the backend when a product image is included alongside its fields."),
      task(4, "Pagination, sorting and search on the catalogue page are passed as query parameters that cart_backend's GET endpoint reads directly into its Pageable/filter logic."),

      dayHeading(26, "Testing Frontend"),
      task(1, "Component tests cover the login form, the cart-items table rendering, and that protected routes redirect when no token is present."),
      task(2, "Axios calls are mocked in tests so loading, success and error states of the checkout flow can be verified without hitting cart_backend."),
      task(3, "The checkout form's validation rules (required fields, valid card/UPI details) and its submit behaviour are tested independently of the network call."),
      task(4, "Role-based UI visibility \u2013 e.g. an \u201cAdmin\u201d link only shown for ADMIN users \u2013 is covered with tests that render the app under different mocked auth states."),

      pb(),

      dayHeading(27, "Guiding Major Project"),
      task(1, "The system architecture for the full cart/payment application is laid out as: React frontend \u2192 Spring Boot REST API \u2192 MySQL, secured with JWT and (optionally) OAuth2."),
      task(2, "The project is broken into modules \u2013 Auth, Catalogue, Cart, Payment, Admin \u2013 each with its own sprint tasks and milestones."),
      task(3, "Before coding, the API contract (cart/payment endpoints), the DB schema (User, Product, Cart, CartItem, Payment) and the React page map (Login, Shop, Cart, Checkout, History) are defined."),
      task(4, "Non-functional requirements are called out explicitly: scalability of the payment endpoint under load, security of stored payment metadata, observability via logs/metrics, and a CI/CD-based deployment strategy."),

      dayHeading(28, "Presentation Major Project"),
      task(1, "The presentation opens with the problem statement (a secure mock payment/cart flow), followed by the architecture diagram and the chosen technology stack \u2013 Spring Boot + JWT + MySQL on the backend, React + Vite + TypeScript on the frontend."),
      task(2, "The demo script walks through login, adding items to the cart, applying a coupon, completing a mock payment, and viewing the resulting payment-history record, including an edge case like an expired coupon."),
      task(3, "Slides cover trade-offs (e.g. JWT statelessness vs. session-based auth), current limitations (mock payment, not a real gateway), and future improvements (real payment gateway integration, refund workflow)."),
      task(4, "System design is presented using a component diagram (frontend/backend/DB), a sequence diagram for the checkout flow, a DB ER diagram (User\u2013Cart\u2013CartItem\u2013Payment), and a deployment diagram (Netlify + backend host + MySQL)."),

      dayHeading(29, "Deploying Project to GitHub"),
      task(1, "cart_backend and cart_frontend are maintained as two separate GitHub repositories, each with its own README describing setup and run instructions."),
      task(2, "Branch protection on main, a pull request template, and issue labels (bug, enhancement, backend, frontend) keep contributions organized."),
      task(3, "Build-status and deployment-status badges are added to each README so the current health of both repositories is visible at a glance."),
      task(4, "Commit history is kept clean with meaningful messages and changes are merged through pull requests rather than direct pushes to main."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("docs/24BCS10352_Daywise.docx", buffer);
  console.log("done");
});