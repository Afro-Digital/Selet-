# Mathematical Reference & Pricing Formulas

This document provides the authoritative mathematical specifications, accounting formulas, and invariants implemented throughout Selet (ስሌት) and `@selet/pricing-engine`.

---

## 1. Margin on Price vs. Cost-Plus Markup

A critical failure mode for software agencies in Ethiopia is confusing **Markup** with **Gross Margin**. 

- **Markup** is the percentage added to direct costs:
  $$\text{Markup} = \frac{\text{Price} - \text{Cost}}{\text{Cost}}$$
- **Margin (Profit Margin)** is the percentage of the selling price that is retained as profit:
  $$\text{Margin} = \frac{\text{Price} - \text{Cost}}{\text{Price}} = 1 - \frac{\text{Cost}}{\text{Price}}$$

### 1.1 The Golden Formula: Price from Margin
In Selet, **prices are always calculated from margin on price**, never cost-plus markup:

$$\text{Price} = \frac{\text{Cost}}{1 - \text{Margin}}$$

#### Concrete Example:
Suppose an e-commerce integration module costs **100,000 ETB** to deliver, and the agency targets a **30% margin**:
- **Incorrect (Markup on Cost):** $100,000 \times 1.30 = 130,000 \text{ ETB}$.  
  Actual margin realized: $\frac{130,000 - 100,000}{130,000} = 23.08\%$ (**6.92% margin leak**).
- **Correct (Selet Formula):** $\frac{100,000}{1 - 0.30} = \frac{100,000}{0.70} = 142,857.14 \text{ ETB}$.  
  Actual margin realized: $\frac{142,857.14 - 100,000}{142,857.14} = 30.00\%$.

---

## 2. Blended Portfolio & Multi-Module Margin

When a project or agency quote consists of $N$ modules or deliverables, each with its own cost $C_i$ and price $P_i$:

$$\text{Total Cost} = C_{\text{total}} = \sum_{i=1}^{N} C_i$$

$$\text{Total Price} = P_{\text{total}} = \sum_{i=1}^{N} P_i$$

$$\text{Total Gross Profit} = \Pi_{\text{total}} = P_{\text{total}} - C_{\text{total}} = \sum_{i=1}^{N} (P_i - C_i)$$

$$\text{Blended Margin } (m_{\text{blended}}) = \frac{\Pi_{\text{total}}}{P_{\text{total}}} = 1 - \frac{\sum_{i=1}^{N} C_i}{\sum_{i=1}^{N} P_i}$$

### 2.1 The Margin Balancer Invariant
When an agency owner adjusts one line item's margin (e.g., discounts Module $k$ from $30\%$ down to $20\%$ to win a competitive client pitch) while keeping the portfolio blended margin $m^*$ locked, the remaining balancing modules $J$ must absorb the difference:

$$P_{\text{total}} = \frac{C_{\text{total}}}{1 - m^*}$$

$$P_k = \frac{C_k}{1 - m_k}$$

The remaining target revenue for balancing lines $J$:

$$P_J^* = P_{\text{total}} - P_k - \sum_{i \notin (J \cup \{k\})} P_i$$

The pricing engine allocates $P_J^*$ across balancing items proportionally to their cost basis using integer minor unit rounding:

$$P_j = \text{allocate}(P_J^*, C_j / C_J)$$

$$m_j = 1 - \frac{C_j}{P_j}$$

---

## 3. Fully Burdened Team Member Labor Cost

Direct labor cost is not merely an employee's basic salary. In Ethiopia, statutory employer pension and productive hours must be factored in.

### 3.1 Monthly Burdened Cost Formula

$$\text{Monthly Burden} = \text{Basic Salary} + \text{Employer POESSA Pension} + \text{Allowances} + \text{Benefits}$$

Where:
$$\text{Employer POESSA Pension} = \text{Basic Salary} \times 0.11 \quad (\text{Proc. 1268/2022})$$

### 3.2 Productive Working Hours per Month
A standard Ethiopian working year consists of:
- **Total Calendar Days:** 365 days (52 weeks $\times 40 \text{ hours} = 2,080 \text{ hours}$).
- **Paid Annual Leave:** Statutory minimum of **16 working days** (Labour Proclamation No. 1156/2019) $= 128 \text{ hours}$.
- **Public & National Holidays:** **13 statutory public holidays** in Ethiopia $= 104 \text{ hours}$.
- **Sick Leave & Buffer:** 5 days $= 40 \text{ hours}$.
- **Net Available Work Days:** $260 - 16 - 13 - 5 = 226 \text{ days} \times 8 \text{ hours} = 1,808 \text{ hours/year}$.
- **Average Available Working Hours per Month:** $\frac{1,808}{12} \approx 150.67 \text{ hours}$ (nominal standard: **160 hours**).

### 3.3 Billable Utilization Adjustment
No software engineer spends 100% of working hours writing client code (internal meetings, architecture discussions, continuous learning). With target utilization $u \in [0.60, 0.85]$:

$$\text{Productive Hours per Month} = \text{Paid Hours per Month} \times u$$

$$\text{Direct Hourly Cost} = \frac{\text{Monthly Burden}}{\text{Productive Hours per Month}} = \frac{\text{Basic} + 0.11 \times \text{Basic} + \text{Allowances} + \text{Benefits}}{160 \times u}$$

#### Concrete Example:
- Basic Salary: **60,000 ETB/mo**
- POESSA Employer (11%): **6,600 ETB/mo**
- Allowances: **5,000 ETB/mo**
- Total Monthly Burden: **71,600 ETB/mo**
- Utilization Rate: **75%** (120 productive hours/mo)
- **Hourly Cost:** $\frac{71,600}{120} = \mathbf{596.67 \text{ ETB/hr}}$.

---

## 4. PERT Three-Point Estimation

To mitigate estimation bias and scope risk, Selet implements the classical Program Evaluation and Review Technique (PERT) based on a Beta distribution:

- $O$: Optimistic hours (best case scenario)
- $M$: Most likely / nominal hours (normal delivery)
- $P$: Pessimistic hours (everything that can go wrong goes wrong)

$$\mu_{\text{expected}} = \frac{O + 4M + P}{6}$$

$$\sigma_{\text{standard deviation}} = \frac{P - O}{6}$$

$$\text{Variance} = \sigma^2 = \left(\frac{P - O}{6}\right)^2$$

### 4.1 Project-Level Confidence Intervals
When summing $K$ independent tasks:

$$\text{Total Expected Hours} = \sum_{k=1}^{K} \mu_k$$

$$\sigma_{\text{project}} = \sqrt{\sum_{k=1}^{K} \sigma_k^2}$$

- **50% Confidence:** $\mu_{\text{project}}$
- **84% Confidence (+1 Standard Deviation):** $\mu_{\text{project}} + \sigma_{\text{project}}$
- **97.7% Confidence (+2 Standard Deviations):** $\mu_{\text{project}} + 2\sigma_{\text{project}}$

---

## 5. Risk Contingency & Overhead Allocation

$$\text{Direct Project Cost} = C_{\text{direct}} = C_{\text{labor}} + C_{\text{tools}} + C_{\text{infrastructure}}$$

$$\text{Risk Multiplier} = r_{\text{risk}} = r_{\text{contingency}} + \sum_{j} r_{\text{factor}, j}$$

$$\text{Risk Contingency Allowance} = C_{\text{risk}} = C_{\text{direct}} \times r_{\text{risk}}$$

$$\text{Subtotal with Risk} = C_{\text{subtotal}} = C_{\text{direct}} + C_{\text{risk}} = C_{\text{direct}} \times (1 + r_{\text{risk}})$$

$$\text{Overhead Allocation} = C_{\text{overhead}} = C_{\text{subtotal}} \times r_{\text{overhead}}$$

$$\text{Total Project Delivery Cost} = C_{\text{total}} = C_{\text{subtotal}} + C_{\text{overhead}} = C_{\text{direct}} \times (1 + r_{\text{risk}}) \times (1 + r_{\text{overhead}})$$

---

## 6. Commercial Floor Guard

The commercial floor guard protects the organization against loss-making contracts:

$$\text{Floor Price} = \frac{C_{\text{total}}}{1 - m_{\text{floor}}}$$

If a proposed quote price $P_{\text{proposed}} < \text{Floor Price}$, the system:
1. Flags a **Commercial Floor Violation**.
2. Restricts issuance without explicit Organization Owner sign-off.
3. Computes the cash deficit: $\text{Deficit} = \text{Floor Price} - P_{\text{proposed}}$.

---

## 7. Statutory Ethiopian Tax Formulas

Given quote subtotal $P_{\text{quote}}$ in integer minor units (santim):

$$\text{VAT Amount} = \text{round}\left(P_{\text{quote}} \times 0.15\right) \quad (\text{Proc. 1341/2016})$$

$$\text{Total Client Payable} = P_{\text{quote}} + \text{VAT Amount}$$

$$\text{Withholding Amount (3%)} = \text{round}\left(P_{\text{quote}} \times 0.03\right) \quad (\text{Proc. 979/2016})$$

$$\text{Net Expected Cash Inflow} = \text{Total Client Payable} - \text{Withholding Amount} = P_{\text{quote}} \times 1.12$$
