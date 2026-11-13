import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';

export interface FormattedQuoteData {
  quoteNumber: string;
  title: string;
  status: string;
  clientName: string;
  clientTin?: string | null;
  clientContact?: string | null;
  clientEmail?: string | null;
  currency: string;
  subtotalMinor: string | bigint;
  taxPackVersion: string;
  vatRate: number;
  vatAmountMinor: string | bigint;
  withholdingRate?: number | null;
  withholdingAmountMinor?: string | bigint | null;
  totalPriceMinor: string | bigint;
  expectedCashMinor?: string | bigint | null;
  clientRecurringMonthlyMinor?: string | bigint | null;
  secondaryCurrency?: string | null;
  exchangeRateSnapshot?: number | null;
  secondaryTotalPriceMinor?: string | bigint | null;
  executiveSummary?: string | null;
  lineItemsSnapshot: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    visibility: 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP';
    groupName?: string;
    priceMinor: string;
    displayOrder?: number;
  }>;
  milestonesSnapshot: Array<{
    id?: string;
    title: string;
    description?: string;
    percentage?: number;
    amountMinor?: string;
    dueDate?: string;
  }>;
  termsAndConditions?: string | null;
  brandingSnapshot?: {
    companyName?: string;
    companyTin?: string;
    companyAddress?: string;
    companyEmail?: string;
    companyPhone?: string;
    primaryColor?: string;
    logoUrl?: string;
  } | null;
  validUntil: Date | string;
  issuedAt?: Date | string | null;
  createdAt: Date | string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Format minor units into clean localized currency string.
   */
  public formatMoney(amountMinor: string | bigint | number | undefined | null, currency = 'ETB'): string {
    if (amountMinor === undefined || amountMinor === null) return `0.00 ${currency}`;
    const minorVal = typeof amountMinor === 'bigint' ? Number(amountMinor) : Number(amountMinor);
    const majorVal = minorVal / 100;
    return `${currency} ${majorVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Generates the Afro Digital branded HTML template for quotes.
   */
  public generateHtml(data: FormattedQuoteData): string {
    const branding = data.brandingSnapshot || {};
    const companyName = branding.companyName || 'Afro Digital Technologies';
    const companyTin = branding.companyTin || '0076543210';
    const companyAddress = branding.companyAddress || 'Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia';
    const companyEmail = branding.companyEmail || 'billing@afrodigital.et';
    const companyPhone = branding.companyPhone || '+251 91 123 4567';
    const primaryColor = branding.primaryColor || '#047857'; // Afro Digital Emerald
    const logoUrl = branding.logoUrl || 'https://raw.githubusercontent.com/Afro-Digital/Selet-/main/docs/logo.png';

    const subtotalFormatted = this.formatMoney(data.subtotalMinor, data.currency);
    const vatFormatted = this.formatMoney(data.vatAmountMinor, data.currency);
    const totalFormatted = this.formatMoney(data.totalPriceMinor, data.currency);
    const vatPercent = Math.round((data.vatRate || 0.15) * 100);

    const withholdingPercent = Math.round((data.withholdingRate || 0.03) * 100);
    const withholdingFormatted = data.withholdingAmountMinor
      ? this.formatMoney(data.withholdingAmountMinor, data.currency)
      : null;
    const expectedCashFormatted = data.expectedCashMinor
      ? this.formatMoney(data.expectedCashMinor, data.currency)
      : null;

    const recurringFormatted = data.clientRecurringMonthlyMinor && Number(data.clientRecurringMonthlyMinor) > 0
      ? this.formatMoney(data.clientRecurringMonthlyMinor, data.currency)
      : null;

    // Secondary currency details
    let secondarySummaryHtml = '';
    if (data.secondaryCurrency && data.exchangeRateSnapshot && data.secondaryTotalPriceMinor) {
      const secondaryTotalFormatted = this.formatMoney(data.secondaryTotalPriceMinor, data.secondaryCurrency);
      secondarySummaryHtml = `
        <div class="secondary-currency-badge">
          <span class="label">Equivalent (${data.secondaryCurrency}):</span>
          <span class="value">${secondaryTotalFormatted}</span>
          <span class="rate-note">(@ 1 ${data.secondaryCurrency} = ${data.exchangeRateSnapshot.toFixed(2)} ETB snapshot)</span>
        </div>
      `;
    }

    // Process line items according to visibility rules:
    // SHOW_PRICE -> title, desc, price
    // DESCRIPTION_ONLY -> title, desc, no price displayed
    // MERGE_GROUP -> items grouped together by groupName
    interface ProcessedLine {
      title: string;
      description?: string;
      priceHtml: string;
      isMergedGroup?: boolean;
    }

    const processedLines: ProcessedLine[] = [];
    const mergedGroupsMap = new Map<string, { title: string; descriptions: string[]; totalPriceMinor: bigint }>();

    for (const item of data.lineItemsSnapshot || []) {
      if (item.visibility === 'MERGE_GROUP' && item.groupName) {
        const existing = mergedGroupsMap.get(item.groupName) || {
          title: item.groupName,
          descriptions: [],
          totalPriceMinor: BigInt(0),
        };
        if (item.title) {
          existing.descriptions.push(item.description ? `${item.title}: ${item.description}` : item.title);
        }
        existing.totalPriceMinor += BigInt(item.priceMinor || 0);
        mergedGroupsMap.set(item.groupName, existing);
      } else if (item.visibility === 'DESCRIPTION_ONLY') {
        processedLines.push({
          title: item.title,
          description: item.description,
          priceHtml: '<span class="included-badge">Included in Scope</span>',
        });
      } else {
        // SHOW_PRICE
        processedLines.push({
          title: item.title,
          description: item.description,
          priceHtml: this.formatMoney(item.priceMinor, data.currency),
        });
      }
    }

    // Append merged groups
    for (const [groupName, groupData] of mergedGroupsMap.entries()) {
      processedLines.push({
        title: groupName,
        description: groupData.descriptions.join(' • '),
        priceHtml: this.formatMoney(groupData.totalPriceMinor, data.currency),
        isMergedGroup: true,
      });
    }

    const lineRowsHtml = processedLines
      .map(
        (line, idx) => `
        <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
          <td class="col-num">${idx + 1}</td>
          <td class="col-desc">
            <div class="line-title">${this.escapeHtml(line.title)} ${line.isMergedGroup ? '<span class="group-tag">Package Group</span>' : ''}</div>
            ${line.description ? `<div class="line-sub">${this.escapeHtml(line.description)}</div>` : ''}
          </td>
          <td class="col-price">${line.priceHtml}</td>
        </tr>`,
      )
      .join('\n');

    // Milestones
    const milestonesRowsHtml = (data.milestonesSnapshot || [])
      .map(
        (m, idx) => `
        <tr>
          <td class="m-stage">Stage ${idx + 1}</td>
          <td class="m-title">
            <strong>${this.escapeHtml(m.title)}</strong>
            ${m.description ? `<div class="m-desc">${this.escapeHtml(m.description)}</div>` : ''}
          </td>
          <td class="m-pct">${m.percentage !== undefined ? `${m.percentage}%` : '-'}</td>
          <td class="m-amt">${m.amountMinor ? this.formatMoney(m.amountMinor, data.currency) : '-'}</td>
          <td class="m-due">${m.dueDate ? this.escapeHtml(m.dueDate) : 'Upon milestone sign-off'}</td>
        </tr>`,
      )
      .join('\n');

    const validUntilStr = new Date(data.validUntil).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const issuedDateStr = data.issuedAt
      ? new Date(data.issuedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : new Date(data.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

    const statusBadgeClass = `status-${(data.status || 'DRAFT').toLowerCase()}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quote ${this.escapeHtml(data.quoteNumber)} - ${this.escapeHtml(data.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 16px;
    }
    .header-logo-cell {
      vertical-align: top;
      width: 50%;
    }
    .company-title {
      font-size: 20px;
      font-weight: 800;
      color: ${primaryColor};
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .company-details {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
    }
    .header-meta-cell {
      vertical-align: top;
      text-align: right;
      width: 50%;
    }
    .quote-badge-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .quote-number {
      font-size: 14px;
      font-weight: 700;
      color: ${primaryColor};
      margin-bottom: 6px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-issued { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .status-draft { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-accepted { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .status-expired { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
    .status-rejected { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

    .client-grid {
      display: table;
      width: 100%;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
    }
    .client-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
    }
    .client-col-right {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      text-align: right;
    }
    .section-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .client-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .client-detail-line {
      font-size: 11.5px;
      color: #334155;
    }

    .exec-summary-box {
      margin-bottom: 24px;
      padding: 12px 16px;
      background: #f0fdf4;
      border-left: 4px solid ${primaryColor};
      border-radius: 4px;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.6;
    }
    .exec-summary-title {
      font-weight: 700;
      color: #047857;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 10.5px;
      letter-spacing: 0.5px;
    }

    .section-header {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }

    .deliverables-table, .milestones-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .deliverables-table th, .milestones-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    .deliverables-table td, .milestones-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      font-size: 12px;
    }
    .deliverables-table tr.odd { background: #ffffff; }
    .deliverables-table tr.even { background: #fafafa; }
    .col-num { width: 30px; text-align: center; color: #94a3b8; font-weight: 600; }
    .col-desc { width: 70%; }
    .col-price { width: 25%; text-align: right; font-weight: 700; color: #0f172a; }
    .line-title { font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .line-sub { font-size: 11.5px; color: #64748b; line-height: 1.4; }
    .group-tag { font-size: 9.5px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-left: 6px; }
    .included-badge { font-size: 11px; color: #059669; font-style: italic; font-weight: 600; }

    .summary-container {
      display: table;
      width: 100%;
      margin-bottom: 24px;
    }
    .summary-notes-cell {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 20px;
    }
    .summary-totals-cell {
      display: table-cell;
      width: 50%;
      vertical-align: top;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fafafa;
    }
    .totals-table td {
      padding: 8px 12px;
      font-size: 12px;
    }
    .total-label { color: #475569; }
    .total-val { text-align: right; font-weight: 700; color: #0f172a; }
    .total-grand-row {
      background: #f0fdf4;
      border-top: 2px solid ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
    }
    .total-grand-row td {
      font-size: 14px;
      font-weight: 800;
      color: #047857;
      padding: 10px 12px;
    }

    .tax-citation-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 11px;
      color: #475569;
      margin-bottom: 12px;
    }
    .tax-citation-card strong { color: #0f172a; }
    .withholding-note {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 3px solid #d97706;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 11px;
      color: #78350f;
      line-height: 1.4;
    }

    .secondary-currency-badge {
      margin-top: 8px;
      padding: 6px 10px;
      background: #f0fdf4;
      border: 1px dashed #047857;
      border-radius: 4px;
      font-size: 11.5px;
      text-align: right;
    }
    .secondary-currency-badge .label { color: #065f46; font-weight: 600; }
    .secondary-currency-badge .value { color: #047857; font-weight: 800; margin: 0 4px; }
    .secondary-currency-badge .rate-note { color: #64748b; font-size: 10px; display: block; }

    .recurring-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .recurring-box strong { color: #1e40af; }

    .m-stage { width: 70px; font-weight: 700; color: #475569; }
    .m-title { width: 45%; }
    .m-desc { font-size: 11px; color: #64748b; margin-top: 2px; }
    .m-pct { width: 60px; text-align: center; font-weight: 600; }
    .m-amt { width: 110px; text-align: right; font-weight: 700; }
    .m-due { width: 130px; text-align: right; font-size: 11px; color: #475569; }

    .terms-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 24px;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }
    .terms-box h4 {
      font-size: 11.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .signoff-grid {
      display: table;
      width: 100%;
      margin-top: 28px;
      page-break-inside: avoid;
    }
    .signoff-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding: 0 16px;
    }
    .sign-box {
      border-top: 1px solid #94a3b8;
      padding-top: 8px;
      margin-top: 40px;
      font-size: 11px;
      color: #475569;
    }
    .sign-title { font-weight: 700; color: #0f172a; margin-bottom: 2px; }

    .footer {
      margin-top: 32px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Afro Digital Header -->
  <table class="header-table">
    <tr>
      <td class="header-logo-cell">
        ${logoUrl ? `<img src="${this.escapeHtml(logoUrl)}" alt="Logo" style="height: 28px; margin-bottom: 6px; display: block;" />` : ''}
        <div class="company-title">${this.escapeHtml(companyName)}</div>
        <div class="company-details">
          TIN: ${this.escapeHtml(companyTin)} • ${this.escapeHtml(companyAddress)}<br>
          Email: ${this.escapeHtml(companyEmail)} • Phone: ${this.escapeHtml(companyPhone)}
        </div>
      </td>
      <td class="header-meta-cell">
        <div class="quote-badge-title">FORMAL QUOTE</div>
        <div class="quote-number">${this.escapeHtml(data.quoteNumber)}</div>
        <div>
          <span class="status-badge ${statusBadgeClass}">${this.escapeHtml(data.status)}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Client & Validity Details -->
  <div class="client-grid">
    <div class="client-col">
      <div class="section-label">Prepared For Client</div>
      <div class="client-name">${this.escapeHtml(data.clientName)}</div>
      ${data.clientTin ? `<div class="client-detail-line">Client TIN: ${this.escapeHtml(data.clientTin)}</div>` : ''}
      ${data.clientContact ? `<div class="client-detail-line">Contact Person: ${this.escapeHtml(data.clientContact)}</div>` : ''}
      ${data.clientEmail ? `<div class="client-detail-line">Email: ${this.escapeHtml(data.clientEmail)}</div>` : ''}
    </div>
    <div class="client-col-right">
      <div class="section-label">Quote Details</div>
      <div class="client-detail-line"><strong>Issued Date:</strong> ${issuedDateStr}</div>
      <div class="client-detail-line"><strong>Valid Until:</strong> ${validUntilStr}</div>
      <div class="client-detail-line"><strong>Primary Currency:</strong> ${this.escapeHtml(data.currency)}</div>
      <div class="client-detail-line"><strong>Tax Pack:</strong> Ethiopia v${this.escapeHtml(data.taxPackVersion)}</div>
    </div>
  </div>

  <!-- Executive Scope Summary -->
  ${
    data.executiveSummary
      ? `<div class="exec-summary-box">
          <div class="exec-summary-title">Scope & Executive Summary</div>
          ${this.escapeHtml(data.executiveSummary)}
         </div>`
      : ''
  }

  <!-- Deliverables & Pricing Lines -->
  <div class="section-header">Project Deliverables & Scope Breakdown</div>
  <table class="deliverables-table">
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-desc">Module / Deliverable Description</th>
        <th class="col-price">Investment (${this.escapeHtml(data.currency)})</th>
      </tr>
    </thead>
    <tbody>
      ${lineRowsHtml}
    </tbody>
  </table>

  <!-- Monthly Recurring Client Cloud Infrastructure (if any) -->
  ${
    recurringFormatted
      ? `<div class="recurring-box">
          <strong>Recurring Client Infrastructure:</strong> ${recurringFormatted} / month (estimated for Cloud Hosting, Domain, SSL, CDN & Payment Gateway). Billed directly to client by service providers.
         </div>`
      : ''
  }

  <!-- Tax Breakdown & Grand Totals -->
  <div class="summary-container">
    <div class="summary-notes-cell">
      <div class="tax-citation-card">
        <strong>Statutory Tax Compliance:</strong><br>
        VAT applied at ${vatPercent}% in accordance with Ethiopian <strong>Proclamation 1341/2024</strong>. All statutory obligations are fully recorded and transparently itemized.
      </div>

      ${
        withholdingFormatted
          ? `<div class="withholding-note">
              <strong>Withholding Tax Note (${withholdingPercent}%):</strong><br>
              Domestic client payments are subject to a 3% withholding tax on professional IT services (${withholdingFormatted}). Net cash receivable upon invoice presentation: <strong>${expectedCashFormatted}</strong>. Withholding tax receipt to be issued to Afro Digital by client.
             </div>`
          : ''
      }
    </div>

    <div class="summary-totals-cell">
      <table class="totals-table">
        <tr>
          <td class="total-label">Subtotal (Excl. VAT):</td>
          <td class="total-val">${subtotalFormatted}</td>
        </tr>
        <tr>
          <td class="total-label">VAT (${vatPercent}% - Procl. 1341/2024):</td>
          <td class="total-val">${vatFormatted}</td>
        </tr>
        <tr class="total-grand-row">
          <td>Total Project Price:</td>
          <td class="total-val">${totalFormatted}</td>
        </tr>
      </table>
      ${secondarySummaryHtml}
    </div>
  </div>

  <!-- Payment Milestones Schedule -->
  <div class="section-header">Payment Milestones Schedule</div>
  <table class="milestones-table">
    <thead>
      <tr>
        <th class="m-stage">Stage</th>
        <th class="m-title">Milestone & Deliverable Condition</th>
        <th class="m-pct">Share</th>
        <th class="m-amt">Amount (${this.escapeHtml(data.currency)})</th>
        <th class="m-due">Due Date / Trigger</th>
      </tr>
    </thead>
    <tbody>
      ${milestonesRowsHtml}
    </tbody>
  </table>

  <!-- Terms and Conditions -->
  <div class="terms-box">
    <h4>Commercial Terms & Assumptions</h4>
    <div>${this.escapeHtml(data.termsAndConditions || '1. Validity: This quotation remains valid for 30 days from the issue date.\n2. Invoicing: Invoices are submitted upon milestone completion according to the payment schedule above.\n3. Currency: Invoices are rendered in ETB. Foreign currency conversions reflect snapshot rates at quotation.\n4. Intellectual Property: Final source code, system documentation, and architecture IP are transferred upon receipt of full payment.')}</div>
  </div>

  <!-- Sign-off & Acceptance Grid -->
  <div class="signoff-grid">
    <div class="signoff-col">
      <div class="sign-box">
        <div class="sign-title">Authorized Afro Digital Representative</div>
        <div>Name: ___________________________________</div>
        <div>Signature: ________________________________</div>
        <div>Date: _____________________________________</div>
      </div>
    </div>
    <div class="signoff-col">
      <div class="sign-box">
        <div class="sign-title">Client Acceptance & Authorization</div>
        <div>Name: ___________________________________</div>
        <div>Signature: ________________________________</div>
        <div>Date: _____________________________________</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    Generated by Selet (ስሌት) Pricing Platform • Quote Ref: ${this.escapeHtml(data.quoteNumber)} • Tax Pack Version: ${this.escapeHtml(data.taxPackVersion)} • Immutable Record
  </div>

</body>
</html>`;
  }

  /**
   * Render HTML into binary PDF buffer using Playwright headless Chromium.
   */
  public async renderPdf(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '12mm',
          bottom: '12mm',
          left: '12mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (err: any) {
      this.logger.error(`Playwright PDF generation failed: ${err.message}`, err.stack);
      throw err;
    } finally {
      if (browser) {
        await browser.close().catch((closeErr) => {
          this.logger.warn(`Failed to close browser cleanly: ${closeErr.message}`);
        });
      }
    }
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
