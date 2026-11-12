# Selet (ስሌት) – PRD and Build Prompts

Part 1 is the Product Requirements Document. Part 2 is a sequence of prompts to give to your AI coding assistant one at a time. Do not move to the next prompt until the "Done when" checks of the current one pass.

---

# Part 1: PRD

## 1. Summary

Selet is an open-source (Apache-2.0), self-hosted web app that helps software companies in Ethiopia calculate the true cost of a software project and recommend a profitable price range. It combines team costs, infrastructure and tool costs, risk, overhead, Ethiopian taxes and a margin strategy, then produces a branded PDF quote.

## 2. Problem

Software agencies quote from gut feeling or spreadsheets. They forget costs (hosting, payment fees, pension, risk, meetings), mix up markup and margin, lose profit when clients negotiate, and have no safe way to trade margin between features while protecting overall profit. Generic tools track time and invoices but do not answer "what should we charge?"

## 3. Goals

1. Produce a defensible cost and recommended price range for any software project in under 30 minutes.
2. Let the user negotiate (discount, budget cap, feature trade-offs) while always seeing the effect on profit.
3. Reflect Ethiopian tax and payroll rules, kept current through editable data.
4. Be easy to self-host and easy to contribute to.

## 4. Non-goals (v1)

CRM, sales pipeline, e-signature, Basic/Standard/Premium quote tiers, actual-hours tracking, AI features, multi-tenant SaaS, invoicing and accounting.

## 5. Users

| Persona | Needs |
| --- | --- |
| Owner | Full visibility; sets margins, floors, taxes; approves low-margin quotes |
| Project Manager | Builds estimates and quotes within owner limits |
| Developer | Enters hours for features; sees no costs or margins |

## 6. Functional requirements

Priority: P0 must have, P1 important, P2 later in v1.

| ID | Requirement | Priority |
| --- | --- | --- |
| F1 | Accounts with roles Owner, PM, Developer; server-side field filtering of cost data | P0 |
| F2 | People and roles with pay type (salary, hourly, per project, contractor), nationality flag, utilization; computed hourly cost including employer pension | P0 |
| F3 | Cost catalog (hosting, CDN, licenses, gateway fees) with price, currency, source, last-verified date, payer (agency or client); stale-price notifications | P0 |
| F4 | Estimate builder: project, modules, features, per-role hours; methods: three-point, single value, t-shirt size, story points, WBS | P0 |
| F5 | Risk and complexity multipliers, contingency, overhead | P0 |
| F6 | Scale estimator: users, traffic, storage produce suggested infrastructure and recurring costs | P1 |
| F7 | Pricing engine: cost, margin on price, range (low, recommended, high), market range comparison | P0 |
| F8 | Margin Balancer: lock blended margin, adjust one line, system recomputes others; target-price mode; what-if discount; floor guardrails | P0 |
| F9 | Tax Pack: VAT, withholding, profit tax estimate, employer pension, as versioned editable data | P0 |
| F10 | Currency: ETB base, USD and EUR conversion, automatic rates, manual override, rate snapshot per quote | P0 |
| F11 | Quote builder with per-line visibility, flexible milestones with presets, validity date, terms | P0 |
| F12 | PDF export, branded, English and Amharic, Gregorian and Ethiopian dates | P0 |
| F13 | Reports: profit per project, client and team member | P1 |
| F14 | Starter templates (e-commerce, SaaS, mobile, landing page, internal tool, maintenance), all removable | P1 |
| F15 | Audit log of changes to rates, taxes, and quotes | P1 |
| F16 | Docker Compose install, backup and restore, documentation | P0 |

## 7. Key calculation rules

- Money is integer minor units (santim, cents) with explicit currency; never floating point.
- Margin is on price: `price = cost / (1 - margin)`.
- Hourly cost = (basic + allowances + employer pension + benefits) / productive hours.
- Blended margin `M = 1 - sum(cost) / sum(price)`.
- VAT is added on top of the price and never counted as profit. Withholding is a cash-flow line. Profit tax is an estimate in the owner view only.
- Issued quotes are immutable snapshots including rates and Tax Pack version.
- Rounding: round half up, at line level, defined once and tested.

## 8. Non-functional requirements

- Security: password hashing, role checks on every endpoint, no cost fields sent to unauthorized roles, audit log.
- Correctness: pricing engine is pure and covered by unit and property tests.
- Usability: usable on desktop and tablet; keyboard-friendly tables.
- Internationalization: English and Amharic from the first screen built.
- Operations: one `docker compose up`, a single env file, documented backups.
- Open source: Apache-2.0, CONTRIBUTING, issue templates, CI.

## 9. Success metrics

- A full e-commerce estimate and quote can be produced in under 30 minutes.
- Pricing engine passes all test cases with zero rounding discrepancies against a reference spreadsheet.
- Owner can run a negotiation scenario and read the resulting profit in one screen.
- Fresh install works from README steps alone.

## 10. Risks and assumptions

| Risk | Mitigation |
| --- | --- |
| Tax rules change or sources disagree | Tax Pack as data, source and verified date shown, accountant review before use |
| Wrong default hours in templates | Mark as examples; owner edits; removable |
| Scope too large for one developer | Strict prompt-by-prompt order; each stage shippable |
| Exchange rate source unavailable | Fallback source plus manual override |

## 11. Release plan

Stages 1 to 13 in Part 2. Internal use can start after Stage 10 (quotes working). Public release after Stage 13.

---

# Part 2: Prompts, one at a time

How to use: start a new session for each stage if you can. Paste the **Master context** first, then the stage prompt. After each stage, run the tests, commit, and only then continue.

## Master context (paste at the start of every session; also save as CLAUDE.md or similar in the repo)

```
You are helping build Selet (ስሌት), an open-source (Apache-2.0), self-hosted cost estimation and pricing tool for software companies in Ethiopia. Owner: afrodigital.dev.

Stack: TypeScript everywhere. pnpm + Turborepo monorepo. Next.js (App Router) + Tailwind + shadcn/ui for the web app. NestJS for the API (REST + OpenAPI). PostgreSQL with Prisma. zod for validation. Vitest for tests. Playwright for PDF. Docker Compose for deployment.

Repo layout: apps/web, apps/api, packages/pricing-engine, packages/tax-pack, packages/shared.

Non-negotiable rules:
1. Money is integer minor units plus a currency code. Never use floats for money.
2. Margin is calculated on price: price = cost / (1 - margin).
3. The pricing engine is pure functions with no I/O and must have thorough tests.
4. Tax rules are data (versioned, with source and last-verified date), never hardcoded.
5. Cost, salary and margin data must be filtered on the server by role (Owner, PM, Developer). The UI never receives fields the user may not see.
6. Every user-facing string goes through i18n (English and Amharic).
7. Issued quotes are immutable snapshots.
8. Keep changes small, write tests, and explain any assumption you make. If something is ambiguous, ask before building.

Out of scope for v1: CRM, sales pipeline, e-signature, quote tiers, actual-hours tracking, AI features, multi-tenancy, invoicing.
```

## Stage 1: Repository foundation

```
Set up the Selet monorepo.

Tasks:
- pnpm workspace + Turborepo with apps/web (Next.js), apps/api (NestJS), packages/pricing-engine, packages/tax-pack, packages/shared.
- Strict TypeScript, ESLint, Prettier, Vitest, shared tsconfig.
- docker-compose.yml with web, api, postgres; a .env.example; health-check endpoint on the API.
- GitHub Actions CI: install, lint, typecheck, test, build.
- Root README, LICENSE (Apache-2.0), CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue and PR templates.
- A CLAUDE.md containing the project rules.

Done when: `pnpm install && pnpm test && pnpm build` passes, `docker compose up` starts all three services, CI is green.
```

## Stage 2: Pricing engine (most important)

```
Build packages/pricing-engine as pure TypeScript with no I/O.

Implement:
- Money type: integer minor units + currency; add, subtract, multiply by rational, allocate; round half up; currency mismatch throws.
- hourlyCost(person): (basic + allowances + employerPension + benefits) / productiveHours, with pension rate and base configurable and foreign-national exemption.
- threePointHours(O, L, P) using PERT (O + 4L + P) / 6, plus optimistic and pessimistic totals.
- projectCost: labor + tools + agency-paid infrastructure + third-party, then risk (contingency + multipliers), then overhead.
- priceFromMargin(cost, margin) and marginFromPrice(cost, price). Reject margin >= 100%.
- priceRange: low (optimistic hours, minimum margin), recommended (likely hours, target margin), high (pessimistic hours, stretch margin).
- Margin Balancer: lines with cost and margin; blendedMargin; lockBlended(lines, changedLine, newMargin, targetBlended, balancingLines) that distributes the required change and reports infeasibility against per-line floors and ceilings; targetPrice(lines, budget); applyDiscount(total or line).
- Tax helpers that take a tax-pack object: VAT on top, withholding as cash-flow, profit-tax estimate.

Tests: unit tests for each function, property-based tests (fast-check) for invariants (blended margin after lockBlended equals target when feasible; totals never lose a unit of currency in allocation; round-trip price and margin), and at least 10 worked examples in a docs/pricing-examples.md that match a reference calculation.

Done when: all tests pass with high coverage and every formula in the spec has an example.
```

## Stage 3: Tax Pack

```
Build packages/tax-pack.

- zod schema for a TaxPack: version, country, effectiveFrom, rules[] (id, type, rate or brackets, thresholds, base, ceiling, appliesTo, source URL, verifiedAt, notes).
- A loader and validator; reject packs with missing source or verifiedAt.
- Create ethiopia-2026.json with: VAT 15% (registration threshold ETB 2,000,000; exports of services zero-rated), corporate tax 30%, employer pension 11%, employee pension 7%, PAYE brackets, domestic withholding tax, optional severance provision (off by default). Mark every value whose sources conflict with a `needsVerification: true` flag and a note.
- A function that reports stale or unverified rules.

Done when: the pack validates, tests cover the validator, and the pricing engine can consume it. Do not claim legal accuracy; flag values for accountant review.
```

## Stage 4: Database, authentication, roles

```
In apps/api build the data layer and access control.

- Prisma schema for: Organization, User (role OWNER | PM | DEVELOPER), Role (job role), Person, RateCard, Client (name, TIN, contact only), AuditLog. Use integer minor units for money.
- Email and password auth with secure hashing, sessions or JWT with refresh, first-run owner setup.
- A NestJS guard and decorator for role checks; response serializers that strip cost, salary and margin fields for non-authorized roles.
- Seed script creating one owner.
- Audit log for changes to people, rates, tax packs.

Tests: e2e tests proving a Developer token never receives salary or margin fields from any endpoint, and a PM cannot change floors.

Done when: e2e tests pass and OpenAPI docs are served.
```

## Stage 5: People and rate cards

```
Build the People and Rate Card feature (API + UI).

- CRUD for job roles and people: pay type (monthly salary, hourly, per project, contractor), basic salary, allowances, nationality flag (pension applies to Ethiopian nationals), utilization percentage, benefits.
- Show computed hourly cost using packages/pricing-engine. Only Owner sees salaries and hourly costs.
- UI: table with inline editing, English and Amharic labels, validation messages.

Done when: an Owner can add a team, see hourly costs, and a Developer account sees nothing sensitive. Add tests.
```

## Stage 6: Cost catalog, currency, notifications

```
Build the cost catalog and currency service.

- CatalogItem: name, category (hosting, CDN, domain, SSL, payment gateway, license, tool), price model (fixed, per month, per user, percentage), amount, currency, source URL, verifiedAt, payer (AGENCY or CLIENT), stale-after days.
- Seed a small, removable set of example items clearly labeled as examples.
- Currency service: ETB base; USD and EUR; default source configurable (National Bank of Ethiopia), fallback source, manual override, scheduled refresh job, history table. If the source cannot be reached, keep the last rate and create a notification.
- Notifications: stale catalog price, stale exchange rate, unverified tax rule. In-app list and optional email.

Done when: a stale item produces a notification, a manual override beats the automatic rate, and tests cover rate snapshots.
```

## Stage 7: Estimate builder

```
Build the estimate builder (API + UI).

- Project, Module, Feature, FeatureRoleHours entities, plus estimate versions.
- Estimation methods per feature: three-point, single value, t-shirt size (editable size-to-hours table per role), story points (editable points-to-hours), and WBS nesting for modules and tasks.
- Developers can enter hours only on features assigned to them; PMs and Owner can edit all.
- Live totals of hours per role and per module (Developers see hours only, never cost).
- Starter templates (e-commerce, SaaS, mobile app, landing page, internal tool, maintenance) loadable and deletable; label hours as examples.

Done when: a user can build an e-commerce estimate from a template, switch methods, and see correct hour totals. Add tests.
```

## Stage 8: Risk, overhead, scale estimator

```
Add risk and scale features.

- Risk factors with editable multipliers (unclear requirements, frequent changes, new technology, tight deadline) and a contingency percentage; overhead percentage in organization settings.
- Scale estimator: inputs (monthly users, peak concurrency, storage, traffic, payment volume) map through editable rules to suggested catalog items, tiers and monthly recurring cost, including payment gateway percentage fees. Show assumptions and let the user override any suggestion.
- Each recurring item states who pays (agency or client).

Done when: entering 5,000 monthly users on an e-commerce project suggests infrastructure and shows monthly recurring cost with assumptions visible. Add tests.
```

## Stage 9: Pricing scenarios and Margin Balancer UI

```
Build the pricing screen (Owner and PM; PM limited by owner floors).

- Scenario per estimate: target margin, minimum margin, stretch margin, market range, per-line margins grouped by module.
- Show cost, price, profit and blended margin live; show low, recommended and high price.
- Margin Balancer: lock blended margin; change one line's margin and see the balancing lines update with a clear explanation; infeasible changes show the gap and which floor blocks them.
- Target-price mode (client budget) and what-if discount on total or on a line.
- Block saving a quote below the owner's floor unless an Owner approves.
- Everything uses packages/pricing-engine; no pricing math in the UI.

Done when: the example "lower module A margin from 25% to 20%, raise module B, keep blended 30%" works and matches engine tests. Add UI tests.
```

## Stage 10: Quote builder and PDF

```
Build quotes and PDF export.

- Quote created from a pricing scenario; stores an immutable snapshot (numbers, exchange rate, tax pack version, wording).
- Per-line visibility: show price, show description only, or merge into a group. Client never sees cost, margin or hours unless explicitly enabled.
- Payment milestones: flexible percentages or fixed amounts, saved presets, validation that milestones sum to 100%.
- Taxes on the quote: VAT shown separately; optional withholding note.
- PDF via Playwright from HTML templates: Afro Digital branding configurable (logo, colors, fonts), validity date, terms, ETB primary with optional USD or EUR equivalent from the stored rate.
- Quote numbering and status (draft, issued, expired).

Done when: an issued quote regenerates identically years later, even after rates and taxes change. Add tests.
```

## Stage 11: Amharic and Ethiopian calendar

```
Complete internationalization.

- English and Amharic for all screens, validation messages, notifications and PDF templates, with a language switcher and per-quote language.
- Ethiopian calendar support for display and input, plus Gregorian; store dates in a single canonical format (ISO, UTC) and convert only at the edges.
- Fonts that render Ge'ez script correctly in the web app and in PDFs.
- Locale-aware number and currency formatting.

Done when: a full quote can be produced in Amharic with Ethiopian dates, and conversion round-trip tests pass (including leap years and the 13th month).
```

## Stage 12: Reports

```
Build reports for the Owner (PM limited).

- Profit per project, per client, and per team member (based on estimate allocation), over a selectable period.
- Filters, totals, CSV export.
- Respect role filtering; Developers see no reports.

Done when: report totals reconcile with the stored quote snapshots. Add tests.
```

## Stage 13: Hardening and open-source release

```
Prepare Selet for public release.

- Security review: input validation, rate limiting, secure headers, dependency audit, secrets handling, backup and restore scripts and documentation.
- Performance check on large estimates (500+ features).
- Accessibility pass on core screens.
- Documentation: install guide, admin guide (rates, tax pack updates, catalog), user guide per role, architecture, pricing formulas, contribution guide, roadmap.
- Release process: semantic versioning, changelog, tagged Docker images, sample data and demo script.
- A "known limitations and legal disclaimer" page: Selet is not tax or legal advice; tax values must be verified.

Done when: a new machine can install from the README alone, CI is green, and a tagged v1.0.0 release is ready.
```

## Tips for working one prompt at a time

- Start each stage by asking the assistant to restate the plan and list assumptions before writing code.
- Commit after every stage and keep the tests green.
- If a stage feels too big, split it in two rather than skipping parts.
- Before Stage 3 is used for real quotes, have an accountant verify the Tax Pack values.
