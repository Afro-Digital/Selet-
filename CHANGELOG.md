# Changelog

All notable changes to Selet (ስሌት) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-13

### Initial Public & Open-Source Release (v1.0.0)

This major release delivers the complete 13-stage scope defined in the Selet (ስሌት) Product Requirements Document (PRD) for Ethiopian software companies, digital agencies, and independent consultancies.

---

### Added

#### Stage 1: Monorepo Skeleton & Engineering Foundation
- Turborepo + pnpm monorepo architecture with `@selet/api`, `@selet/web`, `@selet/pricing-engine`, `@selet/tax-pack`, and `@selet/shared`.
- Strict TypeScript configuration (`tsconfig.base.json`) enforcing integer minor units and banning floats for currency arithmetic.
- Vitest test runners and Next.js 15 App Router structure with Tailwind CSS and shadcn/ui.

#### Stage 2: Database Schema & Prisma ORM Layer
- PostgreSQL 16 schema with complete data models: `Organization`, `User`, `Role`, `Person`, `RateCard`, `RateCardItem`, `CatalogItem`, `ExchangeRate`, `ExchangeRateHistory`, `Notification`, `Project`, `Feature`, `Quote`, and `AuditLog`.
- Minor units stored as 64-bit integer (`BigInt`) fields for santim accuracy.
- Immutable audit log table tracking changes to rate cards, floor margins, salaries, and quote statuses.

#### Stage 3: Ethiopian Tax Pack & Fully Burdened Labor Math
- Pure functional engine in `@selet/tax-pack` modeling Ethiopian statutory tax laws.
- VAT Proclamation No. 1341/2016 (15% standard rate, registration threshold, and exempt supplies).
- Domestic withholding tax (3%) under Income Tax Proclamation No. 979/2016.
- Private Organization Employees' Pension Scheme Proclamation No. 1268/2022 (POESSA 11% employer, 7% employee).
- Fully burdened labor rate calculator accounting for Ethiopian annual leave (16 days), statutory public holidays (13 days), and billable utilization.

#### Stage 4: People & Rate Cards Management
- Full CRUD API and UI for managing team members with POESSA pensions and direct hourly costs.
- Rate Cards management supporting multiple concurrent schedules (Commercial ETB, Offshore USD, NGO).
- Default rate card resolution and role-based hourly cost floor calculation.

#### Stage 5: Authentication, RBAC & Salary Confidentiality
- JWT authentication with secure password hashing (`bcrypt`) and refresh mechanism.
- Role-Based Access Control (`UserRole`: `OWNER`, `PM`, `DEVELOPER`).
- NestJS `RoleSerializerInterceptor` intercepting and stripping confidential basic salaries and hourly cost numbers before serializing responses to PMs and Developers.

#### Stage 6: Cost Catalog, NBE Currency Service & Notifications
- Cost Catalog tracking third-party services, cloud hosting, and SMS gateways.
- 90-day stale price detection with automated warning badges.
- Foreign exchange rate engine supporting National Bank of Ethiopia (NBE) official rates and manual executive overrides.
- In-app notification center for stale prices, tax changes, and floor margin warnings.

#### Stage 7: Estimate Builder, WBS Hierarchy & PERT Estimation
- Hierarchical Work Breakdown Structure (WBS) with drag-and-drop / indent controls for Modules, Sections, and Tasks.
- Multi-method estimation: T-Shirt sizing (XS, S, M, L, XL), Single Point hours, and PERT 3-Point estimation ($\mu = \frac{O + 4L + P}{6}$, $\sigma = \frac{P - O}{6}$).
- Industry starter templates: *Fintech & Mobile Banking*, *E-Commerce Platform with Chapa & Telebirr*, and *Enterprise ERP Portal*.

#### Stage 8: Risk, Overhead & Scale Estimator
- Scale Estimator automatically sizing server infrastructure, bandwidth, and database capacity based on MAU, peak concurrency, storage, and payment volume.
- Distinction between `Client Pass-Through` recurring costs and `Agency Internal Recurring` infrastructure.
- Multi-factor risk contingency calculation (unclear requirements, scope volatility, unfamiliar tech stack, tight deadlines).
- 10% organization overhead allocation.

#### Stage 9: Pricing Scenarios, Margin Balancer & Commercial Floor Guard
- Scenario modeling cards: Conservative / Floor, Recommended Target (30–35%), and Stretch / Premium (40–50%).
- Real-time Margin Balancer: locking organization blended margin on price ($P = \frac{C}{1 - m}$) while shifting margins across line items without revenue leakage.
- Target Price Solver: distributing fixed client budgets across deliverables.
- What-If negotiation discount simulator.
- Commercial Floor Guard enforcing organization minimum floor margin (15%) and blocking below-cost quotes.

#### Stage 10: Quote Builder, Immutable Snapshots & PDF Generation
- Quote generation with milestone payment schedules (advance deposit, alpha, beta, final handover).
- Automatic milestone validation ensuring milestone percentages sum to exactly 100%.
- Immutable JSON snapshots freezing pricing, tax rates, deliverables, and team members upon issuance.
- Binary vector PDF generation via headless Playwright Chromium with Afro Digital branding and statutory tax citations.

#### Stage 11: Amharic Localization & Bidirectional Ethiopian Calendar
- Complete bilingual internationalization (`en` and `am`) across all web interfaces, validation messages, and PDF documents.
- Bidirectional Ethiopian <-> Gregorian calendar conversion engine (`@selet/shared`) based on continuous Julian Day Numbers (JDN).
- 110-year test bounds verification (1970–2080 G.C.) including 13th month (*Pagumē* 1–6) and leap year rule `(year % 4 === 3)`.
- Ge'ez numeral formatting engine (`toGeezNumeral`) converting Arabic digits to Ge'ez numerals (፩, ፪, ፫, ... ፻).
- Noto Sans Ethiopic font integration for web and PDF rendering.

#### Stage 12: Executive Reports, Quote Reconciliation & CSV Export
- Executive financial reporting dashboard for Organization Owners (PM salary masked; Developer restricted).
- Profit per Project, Profit per Client, and Profit per Team Member analytics.
- Reconciliation engine validating 100% mathematical tie-out between report totals and historical quote snapshots.
- RFC-compliant CSV export streaming for spreadsheet analysis.

#### Stage 13: Hardening, Security, Backup/Restore & Release Ready
- HTTP security headers with `helmet` (XSS, HSTS, noSniff, frameguard).
- API rate limiting via `@nestjs/throttler` (150 requests/min).
- Automated database backup script (`scripts/backup.sh`) with gzip compression and SHA-256 verification.
- Safe database restore script (`scripts/restore.sh`).
- Enterprise demo seed script (`apps/api/prisma/seed.ts`).
- Performance benchmark suite (`packages/pricing-engine/src/performance-500.spec.ts`) verifying that 600-feature WBS rollups complete in < 15ms.
- Statutory Limitations and Legal Disclaimer modal and documentation (`docs/LEGAL_DISCLAIMER.md`).
- Multi-container `docker-compose.yml` with healthchecks.
