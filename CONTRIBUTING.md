# Contributing to Selet (ስሌት)

Thank you for contributing to Selet (ስሌት) — the open-source software cost estimation and pricing platform for Ethiopia! We welcome contributions from developers, designers, technical writers, and Ethiopian tax/legal practitioners.

---

## 1. Non-Negotiable Core Rules

All pull requests must strictly adhere to these fundamental architectural invariants:

1. **Integer Minor Units Everywhere:**  
   Money MUST always be represented as integer minor units (santim or cents) using `bigint` or integer types. **Never use floating-point numbers for money.** Major unit formatting (e.g. `128.50 ETB`) is allowed exclusively at presentation boundaries.
2. **Margin is on Price, Never Markup:**  
   $$\text{Price} = \frac{\text{Cost}}{1 - \text{Margin}}$$
   Cost-plus markup logic is strictly prohibited.
3. **Pure Pricing Engine:**  
   Code in `packages/pricing-engine` MUST remain pure functions with zero I/O, zero network dependencies, and zero database queries. Every formula must have deterministic unit tests.
4. **Confidentiality by Design (RBAC):**  
   Salary figures and profit margins must NEVER be leaked to Developer roles. Ensure all API endpoints are guarded by `@Roles()` and intercepted by `RoleSerializerInterceptor`.
5. **Canonical UTC Timestamps:**  
   All dates and timestamps are stored in UTC (ISO 8601). Conversions to the Ethiopian Calendar (ዓ.ም.) and Ge'ez numerals must occur only at display boundaries using `@selet/shared`.

---

## 2. Development Setup

### Prerequisites
- Node.js >= 20.x or 22.x LTS
- `pnpm` >= 9.x or 11.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker & Docker Compose (optional, for local PostgreSQL)

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/Afro-Digital/Selet-.git
cd Selet-

# Install dependencies across all monorepo packages
pnpm install

# Start local PostgreSQL via Docker
docker compose up postgres -d

# Generate Prisma Client & Run Migrations
pnpm --filter @selet/api prisma:generate

# Seed the database with Ethiopian demo data
pnpm --filter @selet/api prisma:seed

# Start both API and Web in development mode
pnpm dev
```

The Web UI will be accessible at `http://localhost:3000` and the API at `http://localhost:3001` (OpenAPI Swagger at `http://localhost:3001/api/docs`).

---

## 3. Pull Request Verification Checklist

Before opening a pull request, ensure all monorepo checks pass locally:

```bash
# 1. Typecheck all packages
pnpm typecheck

# 2. Run all unit and e2e tests
pnpm test

# 3. Run linter
pnpm lint

# 4. Run production build
pnpm build
```

---

## 4. Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): add new feature`
- `fix(scope): resolve bug or calculation error`
- `test(scope): add or improve tests`
- `docs(scope): update documentation or guides`
- `refactor(scope): internal code restructuring`
- `perf(scope): performance improvements`
