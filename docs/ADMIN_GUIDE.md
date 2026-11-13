# Selet (ስሌት) Administrator Guide

This guide is intended for system administrators, DevOps engineers, and organization owners deploying, configuring, and managing Selet in a production or self-hosted enterprise environment.

---

## 1. Quickstart & Deployment

### 1.1 Docker Compose (Recommended Production Setup)
Selet is fully containerized. A multi-container production environment runs PostgreSQL 16, the NestJS API, and the Next.js Web frontend.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Afro-Digital/Selet-.git
   cd Selet-
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to set strong passwords and secrets:
   ```env
   POSTGRES_USER=selet
   POSTGRES_PASSWORD=your_secure_db_password_here
   POSTGRES_DB=selet
   JWT_SECRET=your_32_character_cryptographic_secret_here
   API_PORT=3001
   WEB_PORT=3000
   CORS_ORIGIN=http://localhost:3000,https://selet.yourcompany.com
   ```

3. **Start the containers:**
   ```bash
   docker compose up -d
   ```

4. **Verify container health:**
   ```bash
   docker compose ps
   ```
   All three services (`selet-postgres`, `selet-api`, `selet-web`) should report `healthy` or `running`.

5. **Seed the database with standard Ethiopian agency data:**
   ```bash
   docker compose exec api npx tsx prisma/seed.ts
   ```

---

## 2. Default Administrative Accounts

The seed script initializes three accounts for testing and evaluation:

| Role | Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@afrodigital.dev` | `SeletOwner2026!` | Full financial access, salary visibility, margin locks, audit logs |
| **PM** | `pm@afrodigital.dev` | `SeletPm2026!` | WBS estimates, scale estimator, quote builder (salaries masked) |
| **Developer** | `dev@afrodigital.dev` | `SeletDev2026!` | Assigned task hours estimation only (all financials redacted) |

> [!CAUTION]
> In production, log in immediately as Owner and update default credentials.

---

## 3. Managing Job Roles & Rate Cards

Rate cards define client-facing billing rates and establish billing benchmarks for proposals.

### 3.1 Creating a Rate Card
1. Navigate to **Rate Cards** tab.
2. Click **Create Rate Card**.
3. Specify:
   - **Name:** e.g., `Standard Commercial Local (ETB) 2026`.
   - **Currency:** `ETB` (or `USD` for export clients).
   - **Effective Date:** e.g., `2026-01-01`.
   - **Is Default:** Check if this is the default billing schedule for new estimates.
4. Set hourly billing rates per role:
   - Lead Architect: `1,100 ETB/hr`
   - Senior Backend Developer: `850 ETB/hr`
   - Senior Frontend Developer: `750 ETB/hr`
   - QA & Automation Engineer: `550 ETB/hr`
   - UI/UX Designer: `650 ETB/hr`
5. Save the rate card.

---

## 4. Managing People & POESSA Pension Compliance

In Ethiopia, private sector employers must remit **11% employer pension** and deduct **7% employee pension** under Proclamation No. 1268/2022.

### 4.1 Configuring Team Members
1. Go to **Team Members** tab.
2. Click **Add Team Member**.
3. Enter:
   - **Name & Email**
   - **Assigned Job Role**
   - **Basic Monthly Salary:** e.g., `60,000 ETB`
   - **POESSA Pension:** Ensure `isEthiopianNational` is checked to automatically compute the 11% employer pension (6,600 ETB).
   - **Allowances & Benefits:** Transportation, mobile allowance, health coverage.
   - **Paid Hours:** Default standard is `160 hours/month`.
   - **Billable Utilization:** e.g., `75%` (accounting for internal meetings and code reviews).
4. Selet automatically computes the **Weighted Fully Burdened Hourly Cost** (`596.67 ETB/hr`).

---

## 5. Cost Catalog & Stale Price Review

The Cost Catalog tracks pass-through infrastructure, licenses, and API gateway fees.

- **Stale Price Tracking:** Any catalog item not verified within **90 days** receives an amber **Stale Price Warning**.
- **Review Workflow:**
  1. Navigate to **Cost Catalog**.
  2. Filter by **Needs Review / Stale**.
  3. Verify current vendor pricing (e.g. AWS pricing, DigitalOcean, Ethio Telecom SMS gateway rates).
  4. Click **Verify Price** to reset the 90-day validity window.

---

## 6. Updating the Ethiopian Tax Pack

When the Ministry of Revenue (MoR) or Council of Ministers issues new tax directives:

1. **VAT Rate:** Default is 15% under Proclamation No. 1341/2016. If your organization qualifies for export service zero-rating (0%), set quote-specific VAT overrides in the Quote Builder.
2. **Withholding Tax:** Default domestic service withholding is 3%. Non-resident withholding is 10% under Proclamation No. 979/2016.
3. Code updates to the tax pack are maintained in `packages/tax-pack/src/tax-rules.ts`.

---

## 7. Automated Backups & Disaster Recovery

### 7.1 Manual Backup
Run the included backup script:
```bash
./scripts/backup.sh
```
This produces a gzip-compressed dump in `./backups/` along with an automated SHA-256 checksum:
```
./backups/selet_backup_20261113_160000.sql.gz
./backups/selet_backup_20261113_160000.sql.gz.sha256
```

### 7.2 Automated Cron Backup
Add an entry to `/etc/crontab` to back up the database daily at 02:00 AM:
```cron
0 2 * * * root /path/to/Selet/scripts/backup.sh >> /var/log/selet-backup.log 2>&1
```

### 7.3 Restoring from Backup
```bash
./scripts/restore.sh ./backups/selet_backup_20261113_160000.sql.gz
```
The script validates the SHA-256 checksum and asks for confirmation before restoring into PostgreSQL.
