# Selet (ስሌት) — Pricing Reference & 10 Worked Examples

This document outlines the standard calculation formulas used in the Selet Pricing Engine, along with 10 worked reference examples. All monetary calculations are performed in integer minor units (santim / cents) to eliminate floating-point drift.

---

## Formula Reference

1. **Hourly Cost**:
   $$\text{Monthly Cost} = \text{Basic Salary} + \text{Allowances} + \text{Employer Pension (11\% of Basic)} + \text{Benefits}$$
   $$\text{Productive Hours} = \text{Paid Hours} \times \text{Utilization Rate}$$
   $$\text{Hourly Cost} = \frac{\text{Monthly Cost}}{\text{Productive Hours}}$$

2. **PERT Three-Point Estimation**:
   $$\text{Expected Hours} = \frac{O + 4L + P}{6}$$

3. **Project Direct & Total Cost**:
   $$\text{Direct Cost} = \text{Labor} + \text{Tools} + \text{Infrastructure} + \text{Third-Party}$$
   $$\text{Risk Cost} = \text{Direct Cost} \times (\text{Contingency \%} + \sum \text{Risk Multipliers})$$
   $$\text{Total Cost} = (\text{Direct Cost} + \text{Risk Cost}) \times (1 + \text{Overhead \%})$$

4. **Price from Margin (Margin on Price)**:
   $$\text{Price} = \frac{\text{Cost}}{1 - \text{Margin}}$$
   $$\text{Profit} = \text{Price} - \text{Cost}$$
   $$\text{Margin} = \frac{\text{Price} - \text{Cost}}{\text{Price}} = 1 - \frac{\text{Cost}}{\text{Price}}$$

5. **Blended Margin**:
   $$M = 1 - \frac{\sum C_i}{\sum P_i}$$

6. **Ethiopian Taxes**:
   $$\text{VAT (15\%)} = \text{Quote Price} \times 0.15$$
   $$\text{Total Client Payable} = \text{Quote Price} + \text{VAT}$$
   $$\text{Withholding (3\%)} = \text{Quote Price} \times 0.03$$
   $$\text{Net Cash Expected} = \text{Total Client Payable} - \text{Withholding}$$

---

## Worked Examples

### Example 1: Hourly Cost of Salaried Ethiopian Developer

- **Basic Salary**: 30,000 ETB (3,000,000 santim)
- **Allowances**: 5,000 ETB (500,000 santim)
- **Employer Pension (11% on basic)**: $30,000 \times 0.11 = 3,300$ ETB (330,000 santim)
- **Total Monthly Cost**: $30,000 + 5,000 + 3,300 = 38,300$ ETB (3,830,000 santim)
- **Paid Hours**: 160 hours
- **Utilization**: 70% (0.70)
- **Productive Hours**: $160 \times 0.70 = 112$ hours
- **Calculated Hourly Cost**:
  $$\frac{38,300 \text{ ETB}}{112 \text{ hrs}} = 341.96428... \text{ ETB} \rightarrow \mathbf{341.96 \text{ ETB}} \ (34,196 \text{ santim})$$

---

### Example 2: Hourly Cost of Foreign National (Pension Exempt)

- **Basic Salary**: 30,000 ETB (3,000,000 santim)
- **Allowances**: 5,000 ETB (500,000 santim)
- **Employer Pension**: 0 ETB (Exempt)
- **Total Monthly Cost**: 35,000 ETB (3,500,000 santim)
- **Productive Hours**: 112 hours
- **Calculated Hourly Cost**:
  $$\frac{35,000 \text{ ETB}}{112 \text{ hrs}} = 312.50 \text{ ETB} \ (31,250 \text{ santim})$$

---

### Example 3: PERT Three-Point Estimate

- **Feature**: Ethiopian Payment Gateway Integration (Telebirr & Chapa)
- **Optimistic ($O$)**: 12 hours
- **Likely ($L$)**: 24 hours
- **Pessimistic ($P$)**: 48 hours
- **Calculation**:
  $$\text{Expected} = \frac{12 + (4 \times 24) + 48}{6} = \frac{12 + 96 + 48}{6} = \frac{156}{6} = \mathbf{26 \text{ hours}}$$

---

### Example 4: Project Cost Rollup

- **Direct Labor**: 150 hours at 341.96 ETB = 51,294.00 ETB (5,129,400 santim)
- **Tools & Licenses**: 4,000.00 ETB (400,000 santim)
- **Agency Infrastructure**: 2,500.00 ETB (250,000 santim)
- **Direct Cost**: $51,294 + 4,000 + 2,500 = 57,794.00$ ETB (5,779,400 santim)
- **Risk (10% Contingency + 5% Unclear Req. = 15%)**: $57,794 \times 0.15 = 8,669.10$ ETB (866,910 santim)
- **Subtotal with Risk**: $57,794 + 8,669.10 = 66,463.10$ ETB (6,646,310 santim)
- **Overhead (12%)**: $66,463.10 \times 0.12 = 7,975.57$ ETB (797,557 santim)
- **Total Project Cost**: $66,463.10 + 7,975.57 = \mathbf{74,438.67 \text{ ETB}} \ (7,443,867 \text{ santim})$

---

### Example 5: Price from Margin (Margin vs Markup)

- **Total Cost**: 4,000.00 ETB (400,000 santim)
- **Target Margin**: 30% (0.30)
- **Incorrect Markup Calculation**: $4,000 \times 1.30 = 5,200.00$ ETB (yields only 23% margin)
- **Correct Selet Margin on Price**:
  $$\text{Price} = \frac{4,000}{1 - 0.30} = \frac{4,000}{0.70} = \mathbf{5,714.29 \text{ ETB}} \ (571,429 \text{ santim})$$
- **Profit**: $5,714.29 - 4,000.00 = 1,714.29$ ETB
- **Verification**: $\frac{1,714.29}{5,714.29} = 30.00\%$

---

### Example 6: Three-Tier Price Range & Market Benchmarking

- **Optimistic Cost**: 45,000 ETB | **Minimum Margin**: 20%
  $$\text{Low Price} = \frac{45,000}{1 - 0.20} = \mathbf{56,250.00 \text{ ETB}}$$
- **Likely Cost**: 60,000 ETB | **Target Margin**: 30%
  $$\text{Recommended Price} = \frac{60,000}{1 - 0.30} = \mathbf{85,714.29 \text{ ETB}}$$
- **Pessimistic Cost**: 85,000 ETB | **Stretch Margin**: 40%
  $$\text{High Price} = \frac{85,000}{1 - 0.40} = \mathbf{141,666.67 \text{ ETB}}$$
- **Market Benchmarks**: 70,000 ETB to 100,000 ETB
- **Status**: Recommended price (85,714.29 ETB) is **Within Market Range**.

---

### Example 7: Margin Balancer — Lock Blended Margin

A project has two modules with total cost = 4,000 ETB and target blended margin = 30%:

- **Module A**: Cost = 2,000 ETB, initial margin = 25% (Price = 2,666.67 ETB)
- **Module B**: Cost = 2,000 ETB, initial margin = 35% (Price = 3,076.92 ETB)
- **Target Total Price**: $\frac{4,000}{1 - 0.30} = 5,714.29$ ETB
- **User Action**: Lowers Module A margin to 20% to win a competitive feature request.
  - New Price of Module A: $\frac{2,000}{1 - 0.20} = 2,500.00$ ETB
- **Balancing Module B**:
  - Required Price for B: $5,714.29 - 2,500.00 = 3,214.29$ ETB
  - New Margin for B:
    $$m_B = 1 - \frac{2,000}{3,214.29} = 1 - 0.6222 = \mathbf{37.78\%}$$
- **Result**: Blended project margin remains protected at **30.00%**.

---

### Example 8: Margin Balancer — Guardrail Infeasibility Detection

- Take Example 7, but Module B has an owner ceiling of **35%**.
- Required margin for Module B is **37.78%**, which exceeds the 35% ceiling.
- **Engine Output**:
  - `isFeasible`: `false`
  - `violations`: `[{ lineId: 'module-b', attemptedMargin: 0.3778, boundType: 'CEILING', boundValue: 0.35 }]`
  - Explains the margin gap so Project Managers cannot save an unapproved low-margin quote.

---

### Example 9: Target Price Mode (Client Budget Cap)

- **Total Project Cost**: 80,000 ETB
- **Owner Minimum Blended Margin Floor**: 25%
- **Client Fixed Budget**: 100,000 ETB
- **Resulting Blended Margin**:
  $$M = 1 - \frac{80,000}{100,000} = 20.00\%$$
- **Engine Result**:
  - $20.00\% < 25.00\%$ (Floor violated).
  - System flags: `isFeasible = false`, warns PM that an owner override is required to accept 100,000 ETB.

---

### Example 10: Client Quote Taxes and Owner Profit Breakdown

- **Agreed Project Price**: 100,000.00 ETB (10,000,000 santim)
- **Project Cost**: 65,000.00 ETB (6,500,000 santim)
- **Client Quote Presentation**:
  - Service Quote Price: 100,000.00 ETB
  - VAT (15% Proclamation 1341/2024): 15,000.00 ETB
  - **Total Invoiced to Client**: **115,000.00 ETB**
  - Withholding Note (3% domestic service): 3,000.00 ETB deducted at source
  - **Expected Cash Flow Received**: **112,000.00 ETB**
- **Owner Internal Profit View**:
  - Gross Profit: $100,000 - 65,000 = 35,000.00$ ETB
  - Corporate Tax Estimate (30%): $35,000 \times 0.30 = 10,500.00$ ETB
  - **Estimated Net Post-Tax Profit**: **24,500.00 ETB**
