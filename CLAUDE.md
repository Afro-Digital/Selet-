# Selet (ስሌት) — AI Context & Project Rules

You are helping build Selet (ስሌት), an open-source (Apache-2.0), self-hosted cost estimation and pricing tool for software companies in Ethiopia.
Owner: afrodigital.dev.

## Tech Stack

- TypeScript across all packages and apps
- pnpm workspaces + Turborepo monorepo
- Next.js (App Router) + Tailwind CSS + shadcn/ui for `apps/web`
- NestJS (REST + OpenAPI) for `apps/api`
- PostgreSQL with Prisma ORM
- Zod for validation schemas
- Vitest for unit & integration tests
- Docker Compose for containerized deployment

## Workspace Layout

- `apps/web`: Web front-end
- `apps/api`: Back-end REST API
- `packages/pricing-engine`: Pure functions, zero I/O pricing calculation library
- `packages/tax-pack`: Versioned Ethiopian tax & statutory rules
- `packages/shared`: Shared types, constants, schemas

## Core Non-Negotiable Rules

1. **Money Representation**: Always use integer minor units (santim / cents) with an explicit currency code. Never use floating-point numbers for money.
2. **Margin Formula**: Margin is on price, not markup on cost: `price = cost / (1 - margin)`.
3. **Pure Pricing Engine**: The pricing engine contains only pure functions with no side effects or I/O, covered by unit and property-based tests.
4. **Tax Rules as Data**: All tax rules are versioned data records with source URL and verification date, never hardcoded into logic.
5. **Role-Based Data Filtering**: Cost, salary, and margin data must be filtered server-side based on user roles (Owner, PM, Developer). Unauthorized roles must never receive sensitive fields over the wire.
6. **Localization**: English and Amharic support from day one for user-facing text.
7. **Quote Immutability**: Issued quotes are immutable snapshots with frozen rates and tax pack versions.
8. **Scope for v1**: No CRM, no pipeline management, no e-signature, no multi-tenant SaaS, and no actual-hours tracking.
