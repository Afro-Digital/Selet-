# Selet (ስሌት) – Product & Technical Specification v0.1

Open-source (Apache-2.0) cost estimation and pricing tool for software companies. First user: afrodigital.dev. Market: Ethiopia. Self-hosted.

## 1. Purpose

Given a software project, Selet calculates the full cost (people, tools, infrastructure, overhead, risk), applies a profit strategy, adds Ethiopian taxes, and recommends a price range. It then produces a branded PDF quote that shows the client only what you choose.

## 2. Decisions so far

| Area | Decision |
| --- | --- |
| Users | Separate accounts: Owner, Project Manager, Developer |
| Visibility | Salaries, costs and margins are hidden from non-owners; the client PDF shows the total plus selected items |
| Currency | ETB base; USD and EUR conversion; automatic rates with manual override; quotes can show two currencies |
| Calendars | Gregorian and Ethiopian |
| Languages | English and Amharic, i18n from day one |
| Output | PDF quote with company branding (Afro Digital identity) |
| Estimation | Three-point (optimistic / likely / pessimistic), single value, t-shirt sizes, story points, work breakdown structure |
| Pricing | Target margin and market-rate comparison; what-if mode; Margin Balancer |
| Milestones | Flexible per quote, with saved presets |
| Reports | Profit per project, per client, per team member |
| Not included | CRM, sales pipeline, e-signature, quote tiers (Basic/Standard/Premium), actual-hours tracking, AI features |
| Starter data | Starter templates provided, all removable |
| License / deploy | Apache-2.0; Docker Compose |

A minimal client record (name, TIN, contact) is kept only so a quote can be addressed and filtered in reports. It is not a CRM.

## 3. Roles and permissions

| Capability | Owner | Project Manager | Developer |
| --- | --- | --- | --- |
| See salaries and hourly costs | Yes | No | No |
| See margins and profit | Yes | Configurable | No |
| Create and edit estimates | Yes | Yes | Own features only |
| Enter hours for features | Yes | Yes | Yes |
| Use Margin Balancer | Yes | Yes (within owner floors) | No |
| Set margin floors and tax pack | Yes | No | No |
| Generate and download quote PDF | Yes | Yes | No |
| Reports | Yes | Limited | No |

Rule: cost data is filtered on the server. The UI never receives fields the user may not see.

## 4. Core modules

1. **Team and rate cards**: people, roles, pay type (monthly salary, hourly, per project, contractor), computed hourly cost.
2. **Cost catalog**: hosting, CDN, domain, SSL, payment gateway fees, licenses, tools. Each item has price, currency, source, last-verified date, and who pays (agency or client). Items older than a configurable age raise a notification: "check this price".
3. **Scale estimator**: inputs such as monthly users (e.g. 5,000), traffic and storage produce suggested infrastructure tiers and recurring monthly cost from the catalog.
4. **Estimate builder**: project, modules, features, per-role hours using the chosen method. T-shirt sizes and story points map to hours through editable tables.
5. **Risk and complexity**: multipliers (unclear requirements, frequent changes, new technology, tight deadline) plus contingency percentage.
6. **Pricing engine**: pure TypeScript package (section 6).
7. **Tax Pack**: Ethiopian rules as editable data (section 7).
8. **Margin Balancer and what-if** (section 6.3).
9. **Quote and PDF**: sections, visibility toggles per line, terms, payment milestones, validity date.
10. **Currency service**: NBE rate as default source, fallback source, manual override, rate snapshot stored on each quote.
11. **Reports**: profit by project, client, team member.
12. **Starter templates**: e-commerce, SaaS, mobile app, landing page, internal tool, maintenance. Fully editable and deletable.

## 5. Cost calculation

### 5.1 Hourly cost of a person

```
monthly cost = basic salary + allowances + employer pension (11% of basic) + optional benefits
hourly cost  = monthly cost / productive hours per month
productive hours = paid hours x utilization (default 70%, editable)
```

For hourly or per-project contractors the stated rate is used directly. Employer pension applies to Ethiopian nationals only and is configurable per person.

### 5.2 Project cost

```
labor        = sum(hours x hourly cost) over all roles
direct cost  = labor + tools + infrastructure paid by agency + third-party costs
risk         = direct cost x (contingency % + risk multipliers)
total cost   = (direct cost + risk) x (1 + overhead %)
```

Three-point hours per feature use the PERT expected value `(O + 4L + P) / 6` for the likely figure; the optimistic and pessimistic totals give the price range.

## 6. Pricing

### 6.1 Price from margin

Margin is always on price, never on cost:

```
price = cost / (1 - margin)
```

Example: cost 4,000 and margin 30% gives price 5,714.29, not 5,200.

### 6.2 Range

- Low: optimistic hours and the minimum acceptable margin
- Recommended: likely hours and the target margin
- High: pessimistic hours and a stretch margin
- Market comparison: the owner can enter a market range per project type, and Selet flags when the recommendation falls outside it.

### 6.3 Margin Balancer

Each line item i (module or feature group) has cost C\_i and margin m\_i, so its price is P\_i = C\_i / (1 - m\_i). The project's blended margin is:

```
M = 1 - sum(C_i) / sum(P_i)
```

Modes:

1. **Lock blended margin**: the user lowers line a to m\_a'. With target M, the required total price is `P_total = sum(C) / (1 - M)`. Line b must then satisfy `P_b' = P_total - sum(P of all other lines)`, so `m_b' = 1 - C_b / P_b'`. If m\_b' is above that line's ceiling, spread the shortfall over several lines or show the gap.
2. **Target price**: the client states a budget B. Selet shows the resulting blended margin `1 - sum(C)/B`, the minimum price allowed by the floor, and which lines can flex.
3. **What-if discount**: apply a % discount to the total or to a line and see the new profit instantly, with a warning below the floor.

Guardrails: owner-defined floor margin per line and for the whole project; Project Managers cannot save a quote that breaks the floor without owner approval.

## 7. Ethiopian tax and employer costs (as of research on 12 Nov 2026)

All values live in a versioned **Tax Pack** (rate, threshold, effective date, source, last verified). Every figure below must be verified by the owner or an accountant before first use. Sources disagree in places.

| Item | Value found | Notes |
| --- | --- | --- |
| VAT | 15% standard | Proclamation 1341/2024; registration threshold ETB 2,000,000 over 12 months; exports of services zero-rated |
| Corporate (profit) tax | 30% | Shown as an estimate in the owner's view |
| Withholding on domestic services | 3% per one source; services threshold reported as ETB 10,000 in another | Conflicting; 30% if supplier has no TIN or business license per one source. Cash-flow line, not a cost |
| Employer pension (POESSA) | 11% of basic salary | Ethiopian nationals; foreign nationals reported exempt |
| Employee pension | 7% | Withheld from employee; not an employer cost |
| Employee income tax (PAYE) | 0% to 35% | Reformed in 2025; sources conflict on brackets, so the tax-free floor reported is ETB 2,000 per month. Borne by employee, not added to cost |
| Pension base and ceiling | Basic salary per PwC; some sources say gross, one mentions an ETB 15,000 ceiling | Make base and ceiling configurable |
| Severance accrual | About 8.3% per one source | Optional provision, off by default |
| Digital Services Tax | New, scope pending regulation | Watch item |

How Selet applies them:

- **Employer costs** (pension, optional severance) are added to each person's cost.
- **VAT** is added on top of the price on the quote, never counted as profit.
- **Withholding tax** is shown as the expected cash received versus invoiced amount.
- **Profit tax** is an estimate in the owner's profit view only.
- Each quote stores the Tax Pack version used.

## 8. Quote PDF

- Branding: Afro Digital logo, colors, fonts; editable per installation.
- Language: English or Amharic; Gregorian and Ethiopian dates.
- Contents: scope summary, deliverables grouped by module, timeline, optional line prices, total, VAT, payment milestones, terms, validity.
- Per-line visibility toggles: show price, show description only, or merge into a group.
- Currency: ETB primary with optional USD or EUR equivalent using the stored rate snapshot.

## 9. Data model (main entities)

Organization, User (role), Person (pay type, salary, nationality, utilization), Role, RateCard, CatalogItem (price, currency, source, verifiedAt, payer), TaxRule (value, effectiveFrom, source, verifiedAt), Client, Project, Module, Feature (O/L/P hours, size, points), FeatureRoleHours, RiskFactor, Estimate (version, status), PricingScenario (margins, discounts), Quote (snapshot of all numbers, rates, tax pack version), Milestone, ExchangeRate, Notification, AuditLog.

Money is stored as integer minor units with an explicit currency. Quotes are immutable snapshots once issued.

## 10. Architecture

- Monorepo (pnpm + Turborepo, TypeScript throughout)
- `packages/pricing-engine`: pure functions, no I/O, exhaustive unit and property tests
- `packages/tax-pack`: Ethiopian rules as data plus loader and validation
- `packages/shared`: types, zod schemas
- `apps/api`: NestJS, REST with OpenAPI, PostgreSQL via Prisma or Drizzle, role-based access, audit log
- `apps/web`: Next.js, Tailwind, shadcn/ui, i18n (English, Amharic)
- PDF: HTML templates rendered with Playwright
- Scheduled jobs: exchange-rate refresh, stale-price checks and notifications
- Deployment: Docker Compose (web, api, Postgres), with a single env file
- Repository: Apache-2.0, CONTRIBUTING, issue templates, docs, CI with lint, tests and type checks

## 11. Build order (full product, delivered in stages)

1. Monorepo, CI, Docker, auth and roles
2. Pricing engine and Tax Pack with full tests
3. People, rate cards, cost catalog, currency service
4. Estimate builder with all estimation methods, risk, scale estimator
5. Pricing scenarios, Margin Balancer, what-if
6. Quote builder, milestones, PDF (English and Amharic)
7. Reports, notifications, starter templates
8. Documentation, hardening, first public release

## 12. Open items

- Owner or accountant to verify the Tax Pack values in section 7
- Choose the exchange-rate source and fallback
- Confirm Afro Digital brand assets (logo files, colors, fonts)
- Decide default overhead %, contingency %, and utilization for the starter data
- Decide whether PMs may see margins (default: no)
