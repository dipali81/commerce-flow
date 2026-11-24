# Architecture Overview

## Selected use case

**Use Case 2 – E-Commerce Order & Inventory**. It was selected because it covers the required registration/login, catalog, cart, checkout, order history and admin CRUD features, while also demonstrating concurrency control, event handling and scalability-oriented design.

## High-level architecture

```mermaid
flowchart LR
    Browser[Next.js SPA\nRedux Toolkit + Tailwind] -->|REST / JSON + JWT| API[Spring Boot REST API]
    API --> Controller[Controller layer\nrequest mapping + validation]
    Controller --> Service[Service layer\nbusiness rules + transactions]
    Service --> Repository[Repository layer\nSpring Data JPA]
    Repository --> DB[(H2 in-memory DB)]
    Service --> Events[Application events\n@Async + AFTER_COMMIT]
    Events --> Logs[Async listener / audit log]
    API --> Docs[OpenAPI / Swagger UI]
```

## MVC mapping

| MVC concern | Backend implementation |
|---|---|
| Model | JPA entities in `domain/*`, DTOs in `dto/*`, repositories in `repository/*` |
| View | Next.js App Router pages in `frontend/app/*` and reusable components in `frontend/components/*` |
| Controller | `controller/*` classes annotated with `@RestController` |

The backend follows a layered MVC style with additional service and repository layers:

1. **Controller** – maps HTTP verbs/paths, validates `@Valid` request bodies, maps principal to user id.
2. **Service** – owns transactions, orchestration, stock checks, order numbering and event publication.
3. **Repository** – Spring Data JPA queries, including a conditional bulk stock update.
4. **Model** – JPA entities with optimistic `@Version` and auditing timestamps.

## Frontend state flow

```mermaid
flowchart LR
    Component[Page / Component] --> Hook[useAppDispatch]
    Hook --> Thunk[RTK AsyncThunk]
    Thunk --> ApiClient[lib/api.ts fetch wrapper]
    ApiClient --> Backend[Spring Boot REST API]
    Thunk --> Reducer[RTK Slice]
    Reducer --> Store[Redux Store]
    Store --> Selector[useAppSelector]
    Selector --> Component
```

Slices:

- `authSlice` – token/user persisted in `localStorage`, hydration on app start.
- `productSlice` – catalog list, detail, filters, admin CRUD status.
- `cartSlice` – cart fetch/add/update/remove.
- `orderSlice` – order history and checkout.

## Request flow: checkout

```mermaid
sequenceDiagram
    participant U as Browser
    participant C as OrderController
    participant S as OrderService
    participant P as ProductRepository
    participant O as OrderRepository
    participant E as EventListener

    U->>C: POST /api/orders/checkout + JWT
    C->>S: checkout(userId, address)
    S->>S: load cart, verify not empty
    loop each cart item
        S->>P: conditional decrement stock
        P-->>S: rows updated (1 or 0)
        alt insufficient stock
            S-->>C: 409 Conflict, transaction rollback
        end
    end
    S->>O: save order + order items
    S->>S: clear cart
    S->>E: publish OrderPlacedEvent (AFTER_COMMIT)
    S-->>C: 201 Created + OrderResponse
    E-->>E: async audit log / future outbox publisher
```

## Concurrency and scalability considerations

- **Stock updates** use a single conditional `UPDATE ... WHERE stock_quantity >= :quantity`, so two concurrent checkouts cannot both consume the last unit. A `0` row count maps to `409 Conflict`.
- **Optimistic locking** via `@Version` on all entities protects aggregate updates.
- **Transactions** are service-level and read-only where possible.
- **Open session in view is disabled**; DTO mapping happens inside service transactions.
- **Events** are published after commit and processed on a bounded async executor, keeping checkout latency low.
- **Stateless JWT auth** allows horizontal scaling of API instances without server sessions.
- **H2 is used for portability** in this assessment; the repository/SQL layer is ANSI-friendly, so switching to PostgreSQL later mainly requires datasource configuration and a migration tool such as Flyway.
- **Pagination and whitelisted sorting** protect catalog endpoints from unbounded queries and unsafe sort fields.
- **CI/CD** builds and tests both applications on every push/PR and publishes a versioned backend JAR from `main`.

## Security

- BCrypt password hashing.
- JWT (HS256) bearer authentication with configurable secret and expiry.
- Role-based access: `ROLE_USER` for cart/orders, `ROLE_ADMIN` for product management.
- Method-level `@PreAuthorize("hasRole('ADMIN')")` in addition to URL rules.
- Consistent JSON error responses for 400/401/403/404/409/500 with trace ids.
- Request logging intentionally excludes payloads to avoid logging credentials/PII.
