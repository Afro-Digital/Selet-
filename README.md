# Selet (ስሌት)

[![Release](https://img.shields.io/badge/release-v1.0.0-emerald.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-161%20passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)]()

**Selet (ስሌት)** is an open-source, self-hosted software estimation, margin balancing, and commercial pricing platform designed specifically for Ethiopian software companies, digital agencies, and independent consultancies.

Built by **[Afro Digital Software Solutions](https://afrodigital.dev)**.

---

## Why Selet?

Most software agencies in Ethiopia face painful margin erosion and cash flow surprises due to three fundamental issues:
1. **Confusing Markup with Margin:** Calculating prices using cost-plus markup ($C \times 1.30$) instead of true margin on price ($C / (1 - 0.30)$), resulting in immediate 7–10% margin leakage.
2. **Hidden Ethiopian Labor Burdens:** Failing to account for mandatory employer pension (**POESSA 11%** under Proc. 1268/2022), statutory annual leave (16 days), 13 national holidays, and billable utilization limits.
3. **Tax & Cash Flow Timing:** Overlooking **15% VAT** (Proc. 1341/2016) and **3% domestic withholding** (Proc. 979/2016), leading to severe working capital deficits upon milestone disbursements.

**Selet solves this by providing defensible, mathematically validated pricing tailored to the Ethiopian legal, tax, and currency reality.**

---

## Key Features

- **🇪🇹 Ethiopian Statutory Compliance Built-In:**
  - **POESSA Pension (11%):** Automatically computed on base salaries under Proclamation No. 1268/2022.
  - **VAT (15%):** Computed according to Ministry of Revenue Value Added Tax Proclamation No. 1341/2016.
  - **Withholding Tax (3% & 10%):** Domestic and cross-border advance withholding deductions factored into cash-flow projections.
  - **Foreign Exchange:** Benchmarked against National Bank of Ethiopia (NBE) rates with manual risk overrides.
- **📅 Dual Calendar & Ge'ez Support:**
  - Native **Ethiopian Calendar (`ዓ.ም.`)** with full 13th month (*Pagumē* 1–6) and leap year calculations.
  - Bidirectional Gregorian <-> Ethiopian date conversions based on continuous Julian Day Numbers (110-year test bounds).
  - **Ge'ez Numerals (፩, ፪, ፫, ... ፻)** and bilingual Amharic (`አማርኛ`) / English interface and PDF quotes.
- **📐 Mathematical Rigor & Pure Pricing Engine:**
  - Margin calculated strictly on price: $\text{Price} = \frac{\text{Cost}}{1 - \text{Margin}}$.
  - All currency stored as integer minor units (santim / cents) using `BigInt` — **zero floating-point rounding drift**.
  - Verified performance benchmark: **600-feature enterprise WBS rollups calculate in under 15ms**.
- **⚖️ Real-Time Margin Balancer:**
  - Lock your target blended margin (e.g. 30%) and adjust individual module discounts; Selet automatically recalibrates remaining modules so your total contract remains profitable.
  - **Target Price Mode:** Automatically solve deliverable prices for fixed client budgets.
  - **Commercial Floor Guard:** Protects against selling below cost (configurable minimum margin floor).
- **🔒 Role-Based Confidentiality (RBAC):**
  - **Owner:** Full financial transparency, margin locks, and executive profit reports.
  - **PM:** Scoping, WBS, scale estimates, and client pricing (individual team member salaries masked).
  - **Developer:** Assigned task hours estimation (salaries, margins, and financial reports return `403 Forbidden`).
- **📄 Branded Proposal Generation & Vector PDF:**
  - Generate branded client proposals via headless Playwright Chromium.
  - Milestone payment terms with statutory percentage validation (must sum to 100%).
  - Immutable historical snapshots for client quote tracking and audit trails.
- **📊 Executive Reports & Reconciliation:**
  - Profit per project, client, and team member.
  - **100% mathematical reconciliation** verifying that portfolio totals tie out against historical quote snapshots.
  - RFC-compliant CSV exports for Excel and Google Sheets.

---

## Quickstart with Docker Compose

The fastest way to deploy Selet is via Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/Afro-Digital/Selet-.git
cd Selet-

# 2. Configure environment variables
cp .env.example .env

# 3. Start PostgreSQL, API, and Web containers
docker compose up -d

# 4. Seed with standard Ethiopian software agency data
docker compose exec api npx tsx prisma/seed.ts
```

Open your browser:
- **Web Application:** `http://localhost:3000`
- **REST API:** `http://localhost:3001`
- **Swagger / OpenAPI Documentation:** `http://localhost:3001/api/docs`

### Pre-Configured Demo Accounts:
- **Organization Owner:** `owner@afrodigital.dev` / `SeletOwner2026!`
- **Project Manager:** `pm@afrodigital.dev` / `SeletPm2026!`
- **Developer:** `dev@afrodigital.dev` / `SeletDev2026!`

---

## Local Development (Bare Metal)

### Prerequisites
- Node.js >= 20.x or 22.x LTS
- `pnpm` >= 9.x or 11.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- PostgreSQL 16 (or `docker compose up postgres -d`)

### Steps:
```bash
# Install dependencies across all monorepo packages
pnpm install

# Start PostgreSQL container
docker compose up postgres -d

# Generate Prisma Client & Run Seed
pnpm --filter @selet/api prisma:generate
pnpm --filter @selet/api prisma:seed

# Start Turborepo dev servers (Web on :3000, API on :3001)
pnpm dev
```

---

## Monorepo Layout

```text
Selet (ስሌት)/
├── apps/
│   ├── api/                     # NestJS 11 REST API with Swagger/OpenAPI & Playwright PDF
│   └── web/                     # Next.js 15 App Router web application
├── packages/
│   ├── pricing-engine/          # Pure functions, BigInt santim units, margin on price math
│   ├── tax-pack/                # Ethiopian tax proclamation models (VAT 15%, Withholding 3%, POESSA 11%)
│   └── shared/                  # Ethiopian <-> Gregorian calendar conversion, Ge'ez numerals, formatters
├── scripts/
│   ├── backup.sh                # Gzip-compressed PostgreSQL backup with SHA-256 verification
│   └── restore.sh               # Verified database restoration script
├── docs/                        # In-depth architectural and mathematical references
├── docker-compose.yml           # Multi-container production deployment
└── turbo.json                   # Turborepo task pipeline
```

---

## Available Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start API and Web concurrently in hot-reload development mode |
| `pnpm build` | Compile all monorepo apps and packages via Turborepo |
| `pnpm test` | Run all 161 unit, e2e, and benchmark test suites using Vitest |
| `pnpm typecheck` | Run TypeScript compiler typechecks across all 5 packages |
| `pnpm lint` | Run ESLint checks across all projects |
| `./scripts/backup.sh` | Create a compressed, timestamped database backup with SHA-256 checksum |
| `./scripts/restore.sh <file>` | Safely verify and restore a database backup |

---

## Documentation & Guides

- 📘 **[Admin Guide](docs/ADMIN_GUIDE.md)**: Deployment, rate cards, POESSA pensions, catalog updates, and automated backups.
- 📗 **[User Guide](docs/USER_GUIDE.md)**: Step-by-step walkthroughs for Owners, PMs, and Developers.
- 📐 **[Pricing Formulas & Math](docs/PRICING_FORMULAS.md)**: Authoritative mathematical definitions and accounting models.
- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Technical specifications, calendar algorithm, and data models.
- ⚖️ **[Known Limitations & Legal Disclaimer](docs/LEGAL_DISCLAIMER.md)**: Statutory framework and verification scope.
- 📜 **[Changelog](CHANGELOG.md)**: Version history and stage release notes.
- 🤝 **[Contributing](CONTRIBUTING.md)**: Contribution guidelines and commit conventions.

---

## Statutory Disclaimer

Selet (ስሌት) is an engineering cost modeling and commercial pricing tool. It does **not** provide certified public accounting, legal, or statutory tax advisory services. All tax computations (VAT 15%, domestic withholding 3%, POESSA employer pension 11%) represent mathematical models based on statutory default rates. Agencies must independently verify tax classifications and foreign currency billing terms with authorized accountants before executing binding contracts. See [Legal Disclaimer](docs/LEGAL_DISCLAIMER.md).

---

## License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for details.

Copyright © 2026 Afro Digital Software Solutions (`afrodigital.dev`).
