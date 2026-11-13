# Selet (ስሌት) User Guide

Welcome to Selet (ስሌት) — the software estimation, pricing, and proposal generation platform for Ethiopian software development companies.

---

## 1. Interface & Role Simulator

At the top right of the navigation bar, Selet provides:
- **Language Switcher:** Toggle instantly between English (`EN`) and Amharic (`አማርኛ`).
- **Calendar Preference:** Toggle between Ethiopian Calendar (`ዓ.ም.` / E.C.) and Gregorian Calendar (`G.C.`).
- **Role Simulator:** Switch between **Owner**, **Project Manager (PM)**, and **Developer** views to test permission boundaries.
- **Notification Bell:** Real-time alerts regarding stale catalog prices, tax rule updates, and commercial floor violations.
- **Legal Disclaimer:** Instant access to the statutory limitations and tax disclaimer.

---

## 2. Core Workflows

### 2.1 Workflow 1: Building a Work Breakdown Structure (WBS)
1. Navigate to the **Estimates** tab.
2. Select an existing project or click **New Project Estimate**.
3. Choose a starter template (e.g., *Fintech & Payment Integration*, *E-Commerce Platform*, *Enterprise ERP Portal*) or build a custom WBS hierarchy.
4. For each feature, select the estimation method:
   - **T-Shirt Sizing (XS, S, M, L, XL):** Quick early-stage sizing.
   - **Single Point:** Direct developer hour estimate.
   - **PERT Three-Point (Optimistic, Likely, Pessimistic):** Computes expected hours $\mu = \frac{O + 4L + P}{6}$ and variance $\sigma^2 = \left(\frac{P - O}{6}\right)^2$ to hedge against delivery uncertainty.
5. Assign team roles (e.g., Senior Backend Engineer, UI/UX Designer). Direct labor cost updates automatically.

### 2.2 Workflow 2: Sizing Cloud Infrastructure & Scale
1. Navigate to the **Risk & Scale** tab.
2. Input target client metrics:
   - **Monthly Active Users (MAU):** e.g., `50,000`
   - **Peak Concurrency:** e.g., `1,500 requests/sec`
   - **Storage Requirements:** e.g., `250 GB`
   - **Monthly Bandwidth:** e.g., `500 GB`
   - **Payment Volume (ETB):** e.g., `10,000,000 ETB`
3. Click **Suggest Infrastructure & Recurring Costs**.
4. Selet recommends appropriate infrastructure (e.g. AWS EC2, DigitalOcean Droplets, Ethio Telecom SMS Gateways) and labels each as:
   - `Client Pass-Through`: Billed directly to client.
   - `Agency Internal Recurring`: Absorbed by agency operations.

### 2.3 Workflow 3: Risk Multipliers & Contingency
1. Under **Risk & Scale**, review the risk factors:
   - *Unclear or Evolving Requirements* (+5%)
   - *Frequent Scope Changes Expected* (+5%)
   - *New / Unfamiliar Technology Stack* (+5%)
   - *Tight Deadline / Urgent Delivery* (+10%)
2. Toggle active risk factors. Selet computes the total risk allowance and adjusts total project cost accordingly.

### 2.4 Workflow 4: Pricing & Margin Balancer
1. Navigate to the **Pricing & Margins** tab.
2. Review the baseline project cost summary and market baseline range.
3. **Scenario Cards:** View three pre-computed commercial scenarios:
   - **Conservative / Floor:** Baseline margin floor (15–20%).
   - **Recommended:** Target blended margin (30–35%).
   - **Stretch / Premium:** High-demand or sole-source pricing (40–50%).
4. **Margin Balancer Table:**
   - Lock the organization blended margin at **30%**.
   - If a client requests a discount on a specific module (e.g. reducing Mobile App from 25% to 20%), Selet automatically increases margins on backend services and architecture to guarantee the overall contract remains profitable.
   - **Target Price Mode:** Enter a client's fixed budget (e.g., `1,200,000 ETB`) to automatically solve for line item prices.
   - **What-If Discount:** Apply a 5% or 10% commercial negotiation discount and instantly preview the impact on gross profit.

### 2.5 Workflow 5: Bilingual Quote Generation & PDF Export
1. Navigate to the **Quotes & PDF** tab.
2. Click **Create New Quote Proposal**.
3. Select proposal language (**English** or **Amharic**) and calendar (**Ethiopian** or **Gregorian**).
4. Configure milestones (e.g., 30% Advance Deposit, 30% Architecture & Alpha, 30% Beta & UAT, 10% Final Handover & Warranty). Percentages must sum exactly to 100%.
5. Click **Preview Proposal** to open the branded Afro Digital proposal modal.
6. Click **Download Formal PDF** to generate a binary vector PDF rendered via Playwright Chromium, complete with Ge'ez numerals, Ethiopian dates, and VAT Proclamation 1341/2016 statutory citations.

### 2.6 Workflow 6: Executive Financial Reports
1. Navigate to the **Reports** tab (Owner and PM only).
2. Review executive KPI metrics: Total Portfolio Revenue, Delivery Costs, Gross Profit, and Blended Margin %.
3. Verify the **"Reconciled with Stored Quotes (100% Match)"** badge confirming numbers tie out against historical snapshots.
4. Toggle sub-tabs:
   - **Profit per Project:** Margin performance per contract.
   - **Profit per Client:** Client profitability ranking.
   - **Profit per Team Member:** Labor utilization and profit attribution.
5. Click **Export to CSV** to download tabular data for Microsoft Excel or Google Sheets.

---

## 3. Role-Based Permissions Summary

| Capability | Organization Owner | Project Manager (PM) | Developer |
| :--- | :---: | :---: | :---: |
| View Team Member Basic Salaries | ✅ Yes | ❌ Redacted | ❌ Redacted |
| View Blended Hourly Costs | ✅ Yes | ❌ Redacted | ❌ Redacted |
| Create / Edit WBS Estimates | ✅ Yes | ✅ Yes | ❌ Read-only |
| Input PERT Hours on Assigned Tasks | ✅ Yes | ✅ Yes | ✅ Yes |
| Run Margin Balancer & Scenarios | ✅ Yes | ✅ Yes | ❌ Hidden |
| Issue & Sign Formal Quotes | ✅ Yes | ⚠️ Needs Owner Sign-off | ❌ Restricted |
| View Financial Reports & Reconciliation | ✅ Yes | ✅ Yes (Salaries masked) | ❌ 403 Forbidden |
