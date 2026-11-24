# REST API Reference

Base URL: `http://localhost:8080`

All successful responses use:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { "...": "..." },
  "timestamp": "2026-11-24T10:00:00Z"
}
```

All errors use:

```json
{
  "timestamp": "2026-11-24T10:00:00Z",
  "status": 400,
  "error": "Validation failed",
  "message": "Please correct the highlighted fields",
  "path": null,
  "fieldErrors": { "email": "Email must be valid" },
  "traceId": "uuid"
}
```

Send authenticated requests with `Authorization: Bearer <accessToken>`.

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a `ROLE_USER` account |
| POST | `/api/auth/login` | No | Authenticate and receive JWT |
| GET | `/api/auth/me` | Yes | Current user profile |

```json
// POST /api/auth/register
{ "fullName": "Ada Lovelace", "email": "ada@example.com", "password": "Password@123" }
```

## Products (public)

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | Paginated search |
| GET | `/api/products/{id}` | Product details |

Query parameters for search: `search`, `category`, `minPrice`, `maxPrice`, `page`, `size`, `sortBy`, `sortDir`.

Allowed `sortBy`: `price`, `name`, `sku`, `createdAt`, `stockQuantity`. Unsupported values fall back to `createdAt`.

## Cart (user)

| Method | Path | Description |
|---|---|---|
| GET | `/api/cart` | Get current cart |
| POST | `/api/cart/items` | Add item `{ "productId": 1, "quantity": 2 }` |
| PUT | `/api/cart/items/{productId}` | Update quantity `{ "quantity": 3 }` |
| DELETE | `/api/cart/items/{productId}` | Remove item |
| DELETE | `/api/cart` | Clear cart |

## Orders (user)

| Method | Path | Description |
|---|---|---|
| POST | `/api/orders/checkout` | Place order from cart |
| GET | `/api/orders` | Order history (paginated) |
| GET | `/api/orders/{orderNumber}` | Order details |

```json
// POST /api/orders/checkout
{
  "shippingLine1": "12 Main Street",
  "shippingLine2": "Apt 4",
  "city": "Bengaluru",
  "postalCode": "560001",
  "country": "India"
}
```

## Admin products (admin only)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Soft-deactivate product |

```json
// POST /api/admin/products
{
  "sku": "NEW-001",
  "name": "New Product",
  "description": "Optional description",
  "category": "Accessories",
  "price": 999.00,
  "stockQuantity": 20,
  "imageUrl": null,
  "active": true
}
```

## Operations / docs

| Path | Description |
|---|---|
| `/api/health` | Simple health response |
| `/actuator/health` | Spring Boot health endpoint |
| `/swagger-ui.html` | Swagger UI |
| `/v3/api-docs` | OpenAPI JSON |
| `/h2-console` | H2 console (local only) |

## Status codes

| Code | Meaning |
|---|---|
| 200 | Read/update succeeded |
| 201 | Resource created |
| 400 | Validation or business rule violation |
| 401 | Missing/invalid credentials |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Duplicate resource or insufficient stock |
| 500 | Unexpected error (see `traceId`) |
