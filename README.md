# CommerceFlow — Full Stack E-Commerce Assessment

[![CI/CD](https://github.com/<YOUR_USERNAME>/commerce-flow/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/commerce-flow/actions/workflows/ci-cd.yml)

A production-style **Use Case 2 – E-Commerce Order & Inventory** application built with Spring Boot MVC + H2 and a Next.js/Redux Toolkit/Tailwind frontend. It covers registration/login, product search/details, cart, guarded checkout, order history and admin product CRUD, with validation, exception handling, logging, JWT security, events, unit/integration tests and a GitHub Actions CI/CD pipeline.

> Replace `<YOUR_USERNAME>` in the badge and remote commands with your GitHub username after creating the repository.

---

## 1. Features

### Business features
- User registration, login and JWT profile lookup.
- Public product listing with search, category filter, price filters, pagination and safe sorting.
- Product detail page.
- Per-user cart with add/update/remove/clear and stock validation.
- Checkout that atomically decrements inventory, creates an order with line-item snapshots, clears the cart and publishes an `OrderPlacedEvent`.
- Order history and order detail, scoped to the signed-in user.
- Admin-only product create/update/soft-delete.

### Engineering features
- MVC + layered architecture: Controller → Service → Repository → JPA Model.
- DTO validation with `jakarta.validation` and consistent field-error responses.
- Central exception handling with trace ids and structured logging.
- BCrypt password hashing, stateless JWT auth, RBAC (`ROLE_USER`, `ROLE_ADMIN`) and method-level admin guard.
- Optimistic locking plus a conditional atomic stock update for concurrency safety.
- Async, after-commit domain event listener (outbox-ready seam for Kafka/SQS later).
- OpenAPI/Swagger documentation and Spring Boot Actuator health.
- Unit tests (Mockito/JUnit) and MockMvc integration tests covering the full checkout flow.
- Frontend unit tests with Vitest and a clean Next.js production build.
- GitHub Actions CI/CD: build, test, lint, package and publish a versioned backend JAR.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3.5, Spring MVC, Spring Data JPA, Spring Security, Hibernate, H2, JJWT, Lombok, springdoc-openapi |
| Frontend | Next.js 15 (App Router), React 19, Redux Toolkit, React Redux, Tailwind CSS 3, TypeScript, Lucide icons, Vitest |
| Testing | JUnit 5, Mockito, MockMvc, Spring Security Test, Vitest |
| CI/CD | GitHub Actions, Maven, npm, GitHub Releases |
| Database | H2 in-memory (no Docker, no PostgreSQL required) |

---

## 3. Project structure

```text
commerce-flow/
├── .github/workflows/ci-cd.yml          # CI/CD pipeline
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/commerceflow/
│       ├── CommerceFlowApplication.java
│       ├── common/                      # ApiResponse, ErrorResponse, PagedResponse, BaseEntity
│       ├── config/                      # Security, async, logging, data seeder, REST handlers
│       ├── controller/                  # Auth, Product, AdminProduct, Cart, Order, Health
│       ├── domain/                      # user, product, cart, order, event entities/enums
│       ├── dto/                         # auth, product, cart, order request/response records
│       ├── exception/                   # custom exceptions + GlobalExceptionHandler
│       ├── mapper/                      # manual DTO mappers
│       ├── repository/                  # Spring Data JPA repositories
│       ├── security/                    # JWT provider/filter, principal, user details
│       └── service/                     # interfaces + implementations
│   └── src/test/java/com/commerceflow/  # unit + integration tests
│   └── src/main/resources/application*.yml
├── frontend/
│   ├── app/                             # App Router pages and layout
│   ├── components/                      # Header, Footer, ProductCard
│   ├── lib/                             # fetch wrapper and helpers
│   ├── store/                           # auth, product, cart, order slices
│   ├── tests/                           # Vitest tests
│   ├── types/                           # shared TypeScript types
│   ├── package.json / package-lock.json
│   └── tailwind.config.ts / vitest.config.ts
├── docs/
│   ├── architecture.md                  # diagrams and design decisions
│   ├── database.md                      # ERD, schema notes, indexes
│   ├── api.md                           # full API reference
│   └── test-evidence/                   # saved local test run outputs
├── .gitignore
└── README.md
```

Detailed design notes: [docs/architecture.md](docs/architecture.md), [docs/database.md](docs/database.md), [docs/api.md](docs/api.md).

---

## 4. Local setup

### Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 20+ and npm 10+
- Git

No Docker and no external database are required.

### 4.1 Start the backend

```bash
cd backend
mvn -B -ntp spring-boot:run
```

Backend starts at <http://localhost:8080>.

Useful URLs:

- Health: <http://localhost:8080/api/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>
- H2 console: <http://localhost:8080/h2-console> (JDBC URL `jdbc:h2:mem:commerceflow`, user `sa`, blank password)

The app seeds demo users and 12 products on first startup.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@commerceflow.dev` | `Admin@123` |
| Shopper | `shopper@commerceflow.dev` | `Shopper@123` |

### 4.2 Start the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env.local    # optional; defaults to http://localhost:8080
npm ci
npm run dev
```

Frontend starts at <http://localhost:3000>.

To point the frontend at another backend:

```bash
NEXT_PUBLIC_API_URL=https://your-api-host npm run build
```

CORS is enabled on the backend for `http://localhost:3000` and `http://127.0.0.1:3000` by default. For a deployed frontend, set:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-host
```

### 4.3 One-command verification

From the repository root:

```bash
# Backend: compile, unit tests, integration tests, package
cd backend && mvn -B -ntp verify && cd ..

# Frontend: lint, unit tests, production build
cd frontend && npm ci && npm run lint && npm test && npm run build && cd ..
```

---

## 5. API overview

Full reference: [docs/api.md](docs/api.md).

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Get JWT |
| GET | `/api/auth/me` | User | Profile |
| GET | `/api/products` | Public | Search/list products |
| GET | `/api/products/{id}` | Public | Product details |
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart/items` | User | Add item |
| PUT | `/api/cart/items/{productId}` | User | Update quantity |
| DELETE | `/api/cart/items/{productId}` | User | Remove item |
| DELETE | `/api/cart` | User | Clear cart |
| POST | `/api/orders/checkout` | User | Place order |
| GET | `/api/orders` | User | Order history |
| GET | `/api/orders/{orderNumber}` | User | Order detail |
| POST | `/api/admin/products` | Admin | Create product |
| PUT | `/api/admin/products/{id}` | Admin | Update product |
| DELETE | `/api/admin/products/{id}` | Admin | Deactivate product |

Example login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shopper@commerceflow.dev","password":"Shopper@123"}'
```

Use the returned `data.accessToken` as `Authorization: Bearer <token>`.

---

## 6. Testing

### Backend

```bash
cd backend
mvn -B -ntp test          # tests only
mvn -B -ntp verify        # tests + packaged JAR
```

Coverage in this repository:

- **Unit tests** – `AuthServiceImplTest`, `ProductServiceImplTest`, `CartServiceImplTest`, `OrderServiceImplTest`, `JwtTokenProviderTest`.
- **Integration tests** – `AuthIntegrationTest`, `ProductIntegrationTest`, `OrderFlowIntegrationTest` using MockMvc against the real Spring context and H2.

Saved evidence: [docs/test-evidence/backend-tests.txt](docs/test-evidence/backend-tests.txt).

### Frontend

```bash
cd frontend
npm test                  # Vitest unit tests
npm run lint              # ESLint
npm run build             # TypeScript + production build
```

Saved evidence: [docs/test-evidence/frontend-tests.txt](docs/test-evidence/frontend-tests.txt), [docs/test-evidence/frontend-checks.txt](docs/test-evidence/frontend-checks.txt).

### Test summary

| Suite | Result |
|---|---|
| Backend unit + integration | 23 tests, 0 failures, 0 errors |
| Frontend unit | 8 tests, 3 files, 0 failures |
| Frontend lint | Passed |
| Frontend production build | Passed |

---

## 7. CI/CD pipeline

Workflow: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

| Job | Trigger | What it does |
|---|---|---|
| `backend` | Every push/PR to `main` or `develop` | Sets up JDK 21, runs `mvn verify`, uploads Surefire reports and the packaged JAR |
| `frontend` | Every push/PR to `main` or `develop` | Sets up Node 20 with npm cache, runs `npm ci`, lint, tests and production build |
| `release` | Push to `main` only | Downloads the JAR and publishes `v<run-number>` as a GitHub Release with the artifact attached |

Concurrency is enabled so newer pushes cancel superseded runs. Test reports are uploaded even on failure for debugging.

Local preflight evidence: [docs/test-evidence/ci-status.md](docs/test-evidence/ci-status.md). After your first push, open the Actions tab and replace the placeholder badge URL with your real repository path. If you later want true cloud deployment, the packaged JAR can be deployed to AWS Elastic Beanstalk/EC2 or Azure App Service using the documented secrets; this assessment intentionally avoids Docker and managed PostgreSQL.

---

## 8. Creating the GitHub repository, committing and pushing

The local history is already split into reviewable milestones. To publish it:

1. Create an empty repository on GitHub named `commerce-flow` (do **not** add a README/license, since this repo already has them).
2. Copy the repository URL.
3. Run from this folder:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/commerce-flow.git
git branch -M main
git push -u origin main
```

If you need to recreate the history from scratch, these are the milestones used:

```bash
git init
git add .gitignore README.md docs
git commit -m "chore: bootstrap repository and architecture docs"

git add backend
git commit -m "feat(backend): add MVC layers, security, REST APIs and H2 persistence"

git add backend/src/test
git commit -m "test(backend): add unit and integration tests for core flows"

git add frontend
git commit -m "feat(frontend): add Next.js, Redux Toolkit and Tailwind storefront"

git add .github docs/test-evidence
git commit -m "ci: add GitHub Actions pipeline and test evidence"
```

Commit plan mapping to your assessment tracker:

| Day | Focus | Commit milestone |
|---|---|---|
| 1 | Requirement & architecture | `chore: bootstrap repository and architecture docs` |
| 2 | Backend implementation | `feat(backend): ...` |
| 3 | Business features + tests | `test(backend): ...` |
| 4 | Frontend + CI/CD | `feat(frontend): ...`, `ci: ...` |
| 5 | Final review, evidence, demo | Final README/evidence review, tag/release after push |

---

## 9. Assumptions and limitations

- H2 is in-memory, so data resets on backend restart. This is intentional for a portable assessment; schema/scripts are ready to move to a durable DB.
- The event listener writes an audit log; it does not call Kafka/SQS/RabbitMQ. The `OrderPlacedEvent` boundary is ready for an outbox/messaging implementation.
- Payments, tax calculation, shipping providers, email/SMS and image uploads are out of scope.
- The admin UI assumes a single admin role; no organization/tenant model is implemented.
- CSRF is disabled because the API is stateless and JWT-based; in a cookie-based deployment, enable CSRF and same-site protections.
- `JWT_SECRET` must be overridden with a strong 32+ byte value in any shared environment.
- Swagger UI and H2 console are exposed for demo convenience; restrict them in production.
- If your organization restricts AI-assisted work, use this code as a reference implementation, review every line yourself, and re-run all commands so you can explain and defend the design in the review.
