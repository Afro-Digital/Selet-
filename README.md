# Selet (ስሌት)

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/afrodigital/selet/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

**Selet (ስሌት)** is an open-source (Apache-2.0), self-hosted cost estimation and pricing tool designed specifically for software agencies and companies operating in Ethiopia.

It combines team costs, infrastructure, tool subscriptions, risk multipliers, overhead, Ethiopian tax and pension rules, and strategic margin balancing to calculate the true cost of software projects and generate branded client quotes.

---

## Features

- **Accurate Costing**: Computes true hourly rates including base salary, allowances, benefits, utilization factor, and employer pension (POESSA 11%).
- **Estimation Methods**: Three-point (PERT: Optimistic, Likely, Pessimistic), single value, t-shirt sizing, and story points.
- **Ethiopian Tax Pack**: Versioned, editable tax rules for VAT (15%), Withholding, Corporate Tax, and Pension.
- **Margin Balancer**: Lock blended margin, simulate discounts, and adjust line-item margins with floor protections.
- **Role-Based Visibility**: Server-side filtering hides margins and internal salaries from non-owners and developers.
- **Branded Quotes & PDF**: Export professional quotes in English and Amharic with dual Gregorian / Ethiopian calendars.
- **Self-Hosted**: Run in seconds with Docker Compose.

---

## Monorepo Structure

```text
selet/
├── apps/
│   ├── api/             # NestJS REST API with OpenAPI & Prisma
│   └── web/             # Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
├── packages/
│   ├── shared/          # Shared TypeScript types, schemas & constants
│   ├── pricing-engine/  # Pure calculation engine (no I/O)
│   └── tax-pack/        # Versioned Ethiopian tax rules & schemas
├── docker-compose.yml   # Multi-container local & self-hosted setup
└── turbo.json           # Turborepo task pipeline
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v10+
- [Docker](https://www.docker.com/) & Docker Compose (optional, for database & full stack)

### Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/afrodigital/selet.git
   cd selet
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Install dependencies:**

   ```bash
   pnpm install
   ```

4. **Start PostgreSQL database:**

   ```bash
   docker compose up -d postgres
   ```

5. **Run all apps and packages in dev mode:**
   ```bash
   pnpm dev
   ```
   - Web app: `http://localhost:3000`
   - API: `http://localhost:3001`
   - API Health: `http://localhost:3001/health`

---

## Running with Docker Compose

To run the entire stack (Postgres + API + Web):

```bash
docker compose up --build
```

---

## Available Scripts

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `pnpm build`        | Build all apps and packages via Turborepo        |
| `pnpm dev`          | Run all apps concurrently in development mode    |
| `pnpm test`         | Run test suites across all packages using Vitest |
| `pnpm lint`         | Run ESLint across all projects                   |
| `pnpm typecheck`    | Run TypeScript compiler checks                   |
| `pnpm format`       | Format code with Prettier                        |
| `pnpm format:check` | Check code formatting                            |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
