# EEEE E-Commerce API Endpoints Reference

## Base URL: `/api/v1`

---

## Authentication Header
| Header | Value | Required For |
|--------|-------|-------------|
| `Authorization` | `Bearer <accessToken>` | 🔒 All protected endpoints |
| `Content-Type` | `application/json` | All POST/PUT/PATCH requests |

---

## 🔓 PUBLIC ENDPOINTS (No Auth Required)

---

### 1. Auth - Register
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/register` | Register a new user |

**Request Body:**
```json
{
  "fullName": "string (max 100 chars)",
  "email": "string (valid email, max 255)",
  "password": "string (min 8, max 72)",
  "phone": "string (10-15 digits, optional)"
}
```
**Response:** `AuthResponse` (accessToken, refreshToken, user)

---

### 2. Auth - Login
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/login` | Login existing user |

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```
**Response:** `AuthResponse` (accessToken, refreshToken, user)

---

### 3. Auth - Register Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/register-admin` | Register as admin |

**Headers:**
- `X-Admin-Setup-Key`: `string`
**Request Body:**
```json
{
  "fullName": "string (max 100)",
  "email": "string (valid email)",
  "password": "string (min 8, max 72)",
  "adminSecret": "string"
}
```

---

### 4. Auth - Refresh Token
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/refresh` | Get new access token |

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

---

### 5. Products - Get by ID
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/products/{productId}` | Get single product by UUID |

**Path Param:** `productId` (UUID)

---

### 6. Products - Get by Slug
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/products/slug/{slug}` | Get single product by URL slug |

**Path Param:** `slug` (string)

---

### 7. Products - Search / List
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/products/search` | Search & filter products (paginated) |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| keyword | string | No | Search keyword (max 200 chars) |
| categoryId | UUID | No | Filter by category ID |
| categorySlug | string | No | Filter by category slug (max 120) |
| brand | string | No | Filter by brand (max 100) |
| minPrice | decimal | No | Min price filter |
| maxPrice | decimal | No | Max price filter |
| sortBy | string | No | Sort field (default: "createdAt") |
| sortDir | string | No | Sort direction: "asc" / "desc" (default: "desc") |
| page | int | No | Page number (default: 0) |
| size | int | No | Page size (default: 20, max: 100) |

---

### 8. Products - Featured
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/products/featured` | Get featured products |

**Query Param:** `limit` (int, default: 10)

---

### 9. Categories - Tree
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/categories/tree` | Get full category hierarchy tree |

---

### 10. Categories - Get by ID
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/categories/{categoryId}` | Get single category |

**Path Param:** `categoryId` (UUID)

---

### 11. Search - Global
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/search/products` | Global product search (paginated) |

**Query Params:** Same as Products search above.

---

### 12. Meta - Order Statuses
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/meta/order-statuses` | Get all order status enums |

---

### 13. Meta - Payment Methods
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/meta/payment-methods` | Get all payment method enums |

---

### 14. Payments - Get Methods
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/payments/methods` | Get all available payment methods |

---

### 15. Reviews - Get Approved (for Product)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/reviews/product/{productId}` | Get approved reviews for a product |

**Path Param:** `productId` (UUID)
**Query Params:** `page` (int, default: 0), `size` (int, default: 10)

---

### 16. Coupons - Validate
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/coupons/validate` | Validate a coupon code |

**Request Body:**
```json
{
  "code": "string",
  "cartSubtotal": "decimal"
}
```

---

## 🔒 USER ENDPOINTS (Auth Required)

---

### 17. Auth - Get Current User
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/auth/me` | 🔒 Get logged-in user's profile |

---

### 18. Auth - Logout
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/logout` | 🔒 Logout & invalidate refresh token |

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

---

### 19. Cart - Get Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/cart` | 🔒 Get current user's cart with items |

---

### 20. Cart - Add Item
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/cart/items` | 🔒 Add product to cart |

**Request Body:**
```json
{
  "productId": "UUID",
  "quantity": "integer (min 1)"
}
```

---

### 21. Cart - Update Item Quantity
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/cart/items/{cartItemId}` | 🔒 Update cart item quantity |

**Path Param:** `cartItemId` (UUID)
**Request Body:**
```json
{
  "quantity": "integer (min 1)"
}
```

---

### 22. Cart - Remove Item
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/cart/items/{cartItemId}` | 🔒 Remove item from cart |

**Path Param:** `cartItemId` (UUID)

---

### 23. Orders - Place Order
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/orders` | 🔒 Place a new order from cart |

**Request Body:**
```json
{
  "addressId": "UUID (optional, if using saved address)",
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "couponCode": "string (optional, max 50)",
  "paymentMethod": "COD / CARD / UPI / MOCK"
}
```

---

### 24. Orders - Get User Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/orders` | 🔒 Get all orders for current user |

---

### 25. Orders - Get Order by ID
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/orders/{orderId}` | 🔒 Get specific order detail |

**Path Param:** `orderId` (UUID)

---

### 26. Orders - Cancel Order
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/orders/{orderId}/cancel` | 🔒 Cancel an order |

**Path Param:** `orderId` (UUID)

---

### 27. Addresses - List
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/addresses` | 🔒 Get all saved addresses |

---

### 28. Addresses - Add
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/addresses` | 🔒 Add new address |

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "street": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "country": "string",
  "isDefault": "boolean"
}
```

---

### 29. Addresses - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/addresses/{addressId}` | 🔒 Update an address |

**Path Param:** `addressId` (UUID)
**Request Body:** Same as Add address

---

### 30. Addresses - Delete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/addresses/{addressId}` | 🔒 Delete an address |

**Path Param:** `addressId` (UUID)

---

### 31. Payments - Initiate
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/payments/initiate` | 🔒 Initiate a payment |

**Request Body:**
```json
{
  "orderId": "UUID",
  "paymentMethod": "COD / CARD / UPI / MOCK"
}
```

---

### 32. Payments - Mock Complete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/payments/mock-complete` | 🔒 Complete mock payment (testing) |

**Request Body:** Same as initiate

---

### 33. Payments - Process Card
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/payments/process-card` | 🔒 Process card payment |

**Request Body:**
```json
{
  "orderId": "UUID",
  "paymentMethod": "CARD",
  "cardNumber": "string",
  "cardHolderName": "string",
  "expiryDate": "string",
  "cvv": "string"
}
```

---

### 34. Payments - Process UPI
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/payments/process-upi` | 🔒 Process UPI payment |

**Request Body:**
```json
{
  "orderId": "UUID",
  "paymentMethod": "UPI",
  "upiId": "string"
}
```

---

### 35. Payments - Verify
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/payments/verify` | 🔒 Verify payment status |

**Request Body:**
```json
{
  "paymentId": "UUID",
  "paymentMethod": "COD / CARD / UPI / MOCK"
}
```

---

### 36. Payments - Get by Order
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/payments/order/{orderId}` | 🔒 Get payment details for an order |

**Path Param:** `orderId` (UUID)

---

### 37. Reviews - Submit
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/reviews` | 🔒 Submit/update a product review |

**Request Body:**
```json
{
  "productId": "UUID",
  "rating": "integer (1-5)",
  "title": "string (optional)",
  "comment": "string"
}
```

---

### 38. Wishlists - List All
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/wishlists` | 🔒 Get all user's wishlists |

---

### 39. Wishlists - Get Single
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/wishlists/{wishlistId}` | 🔒 Get wishlist with items |

**Path Param:** `wishlistId` (UUID)

---

### 40. Wishlists - Create
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/wishlists` | 🔒 Create a new wishlist |

**Request Body:**
```json
{
  "name": "string (max 100 chars)"
}
```

---

### 41. Wishlists - Rename
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/wishlists/{wishlistId}` | 🔒 Rename a wishlist |

**Path Param:** `wishlistId` (UUID)
**Request Body:**
```json
{
  "name": "string (max 100 chars)"
}
```

---

### 42. Wishlists - Delete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/wishlists/{wishlistId}` | 🔒 Delete a wishlist |

**Path Param:** `wishlistId` (UUID)

---

### 43. Wishlists - Add Item
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/wishlists/{wishlistId}/items/{productId}` | 🔒 Add product to wishlist |

**Path Params:** `wishlistId` (UUID), `productId` (UUID)

---

### 44. Wishlists - Remove Item
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/wishlists/{wishlistId}/items/{wishlistItemId}` | 🔒 Remove item from wishlist |

**Path Params:** `wishlistId` (UUID), `wishlistItemId` (UUID)

---

### 45. Wishlists - Move to Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/wishlists/{wishlistId}/items/{wishlistItemId}/move-to-cart` | 🔒 Move wishlist item to cart |

**Path Params:** `wishlistId` (UUID), `wishlistItemId` (UUID)
**Query Param:** `quantity` (int, default: 1)

---

## 🔒 ADMIN ENDPOINTS (Admin Role Required)

---

### 46. Admin - Categories - List
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/categories` | 🔒 List all categories (flat) |

---

### 47. Admin - Categories - Create
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/admin/categories` | 🔒 Create new category |

**Request Body:**
```json
{
  "name": "string",
  "slug": "string (optional)",
  "description": "string (optional)",
  "parentId": "UUID (optional)",
  "imageUrl": "string (optional)",
  "sortOrder": "integer (optional)"
}
```

---

### 48. Admin - Categories - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/admin/categories/{categoryId}` | 🔒 Update category |

**Path Param:** `categoryId` (UUID)
**Request Body:** Same as Create category

---

### 49. Admin - Categories - Delete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/admin/categories/{categoryId}` | 🔒 Delete category |

**Path Param:** `categoryId` (UUID)

---

### 50. Admin - Products - Create
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/admin/products` | 🔒 Create new product |

**Request Body:**
```json
{
  "name": "string",
  "slug": "string (optional)",
  "description": "string",
  "brand": "string (optional)",
  "categoryId": "UUID",
  "basePrice": "decimal",
  "salePrice": "decimal (optional)",
  "featured": "boolean (default: false)",
  "active": "boolean (default: true)",
  "tags": ["string"],
  "images": [{"url": "string", "altText": "string", "sortOrder": "int"}]
}
```

---

### 51. Admin - Products - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/admin/products/{productId}` | 🔒 Update product |

**Path Param:** `productId` (UUID)
**Request Body:** Same as Create product

---

### 52. Admin - Products - Delete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/admin/products/{productId}` | 🔒 Delete product |

**Path Param:** `productId` (UUID)

---

### 53. Admin - Products - Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/products/search` | 🔒 Admin search products (paginated) |

**Query Params:** Same as public Products search

---

### 54. Admin - Orders - List All
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/orders` | 🔒 Get all orders (admin view) |

---

### 55. Admin - Orders - Get by ID
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/orders/{orderId}` | 🔒 Get specific order details |

**Path Param:** `orderId` (UUID)

---

### 56. Admin - Orders - Update Status
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PATCH** | `/api/v1/admin/orders/{orderId}/status` | 🔒 Update order status |

**Path Param:** `orderId` (UUID)
**Request Body:**
```json
{
  "orderStatus": "PENDING / CONFIRMED / PROCESSING / SHIPPED / DELIVERED / CANCELLED / REFUNDED"
}
```

---

### 57. Admin - Inventory - Get by Product
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/inventory/product/{productId}` | 🔒 Get inventory for a product |

**Path Param:** `productId` (UUID)

---

### 58. Admin - Inventory - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/admin/inventory` | 🔒 Update stock quantity |

**Request Body:**
```json
{
  "productId": "UUID",
  "quantityAvailable": "integer"
}
```

---

### 59. Admin - Users - List
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/users` | 🔒 List all users |

---

### 60. Admin - Users - Get by ID
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/users/{userId}` | 🔒 Get single user details |

**Path Param:** `userId` (UUID)

---

### 61. Admin - Users - Create
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/admin/users` | 🔒 Create a new user |

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)",
  "role": "ROLE_USER / ROLE_ADMIN",
  "active": "boolean"
}
```

---

### 62. Admin - Users - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/admin/users/{userId}` | 🔒 Update user details |

**Path Param:** `userId` (UUID)
**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "role": "ROLE_USER / ROLE_ADMIN",
  "active": "boolean"
}
```

---

### 63. Admin - Users - Update Status
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PATCH** | `/api/v1/admin/users/{userId}/status` | 🔒 Activate/deactivate user |

**Path Param:** `userId` (UUID)
**Request Body:**
```json
{
  "active": "boolean"
}
```

---

### 64. Admin - Users - Delete
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/admin/users/{userId}` | 🔒 Delete user |

**Path Param:** `userId` (UUID)

---

### 65. Admin - Reviews - Moderate
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PATCH** | `/api/v1/admin/reviews/{reviewId}/moderate` | 🔒 Approve/reject a review |

**Path Param:** `reviewId` (UUID)
**Request Body:**
```json
{
  "status": "APPROVED / REJECTED"
}
```

---

### 66. Admin - Coupons - List
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/admin/coupons` | 🔒 List all coupons |

---

### 67. Admin - Coupons - Create
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/admin/coupons` | 🔒 Create a new coupon |

**Request Body:**
```json
{
  "code": "string",
  "discountType": "PERCENTAGE / FIXED",
  "discountValue": "decimal",
  "minOrderValue": "decimal (optional)",
  "maxDiscount": "decimal (optional)",
  "usageLimit": "integer (optional)",
  "validFrom": "ISO date string",
  "validUntil": "ISO date string",
  "active": "boolean"
}
```

---

### 68. Admin - Coupons - Update
| Method | Endpoint | Description |
|--------|----------|-------------|
| **PUT** | `/api/v1/admin/coupons/{couponId}` | 🔒 Update a coupon |

**Path Param:** `couponId` (UUID)
**Request Body:** Same as Create coupon

---

### 69. Admin - Coupons - Deactivate
| Method | Endpoint | Description |
|--------|----------|-------------|
| **DELETE** | `/api/v1/admin/coupons/{couponId}` | 🔒 Deactivate a coupon |

**Path Param:** `couponId` (UUID)

---

## 📋 CART RESPONSE STRUCTURE

The cart endpoints return a `CartResponse` object:
```json
{
  "id": "UUID",
  "userId": "UUID",
  "items": [
    {
      "id": "UUID",
      "productId": "UUID",
      "productName": "string",
      "productSlug": "string",
      "productImage": "string",
      "unitPrice": "decimal",
      "quantity": "int",
      "subtotal": "decimal"
    }
  ],
  "totalItems": "int",
  "subtotal": "decimal",
  "shippingAmount": "decimal",
  "totalAmount": "decimal"
}
```

> **Note:** The `totalItems` field in the cart response shows the total count of items (sum of quantities) — use this to display the cart badge count in the frontend.

---

## 📝 GENERIC RESPONSE WRAPPER

All API responses follow this structure:
```json
{
  "success": true,
  "message": "Success/error message",
  "data": { ... },
  "timestamp": "ISO date string",
  "path": "/api/v1/..."
}
```

For paginated endpoints:
```json
{
  "success": true,
  "message": "Products fetched",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "timestamp": "...",
  "path": "..."
}