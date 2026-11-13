import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import { formatEthiopianDate } from '@selet/shared';

export interface FormattedQuoteData {
  quoteNumber: string;
  title: string;
  status: string;
  clientName: string;
  clientTin?: string | null;
  clientContact?: string | null;
  clientEmail?: string | null;
  currency: string;
  language?: string | null;
  calendar?: string | null;
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
  public formatMoney(
    amountMinor: string | bigint | number | undefined | null,
    currency = 'ETB',
    isAmharic = false,
  ): string {
    if (amountMinor === undefined || amountMinor === null) {
      return isAmharic && currency === 'ETB' ? 'ብር 0.00' : `0.00 ${currency}`;
    }
    const minorVal = typeof amountMinor === 'bigint' ? Number(amountMinor) : Number(amountMinor);
    const majorVal = minorVal / 100;
    const formattedNum = majorVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (isAmharic && currency === 'ETB') {
      return `ብር ${formattedNum}`;
    }
    return `${currency} ${formattedNum}`;
  }

  /**
   * Generates the Afro Digital branded HTML template for quotes with full Amharic and Ethiopian calendar support.
   */
  public generateHtml(data: FormattedQuoteData): string {
    const isAmharic = data.language === 'am';
    const isEthiopianCal = data.calendar === 'ETHIOPIAN' || isAmharic;

    const branding = data.brandingSnapshot || {};
    const companyName = branding.companyName || (isAmharic ? 'አፍሮ ዲጂታል ቴክኖሎጂስ' : 'Afro Digital Technologies');
    const companyTin = branding.companyTin || '0076543210';
    const companyAddress = branding.companyAddress || (isAmharic ? 'ቦሌ ክ/ከተማ፣ ወረዳ 03፣ አዲስ አበባ፣ ኢትዮጵያ' : 'Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia');
    const companyEmail = branding.companyEmail || 'billing@afrodigital.et';
    const companyPhone = branding.companyPhone || '+251 91 123 4567';
    const primaryColor = branding.primaryColor || '#047857'; // Afro Digital Emerald
    const logoUrl = branding.logoUrl || 'https://raw.githubusercontent.com/Afro-Digital/Selet-/main/docs/logo.png';

    const subtotalFormatted = this.formatMoney(data.subtotalMinor, data.currency, isAmharic);
    const vatFormatted = this.formatMoney(data.vatAmountMinor, data.currency, isAmharic);
    const totalFormatted = this.formatMoney(data.totalPriceMinor, data.currency, isAmharic);
    const vatPercent = Math.round((data.vatRate || 0.15) * 100);

    const withholdingPercent = Math.round((data.withholdingRate || 0.03) * 100);
    const withholdingFormatted = data.withholdingAmountMinor
      ? this.formatMoney(data.withholdingAmountMinor, data.currency, isAmharic)
      : null;
    const expectedCashFormatted = data.expectedCashMinor
      ? this.formatMoney(data.expectedCashMinor, data.currency, isAmharic)
      : null;

    const recurringFormatted = data.clientRecurringMonthlyMinor && Number(data.clientRecurringMonthlyMinor) > 0
      ? this.formatMoney(data.clientRecurringMonthlyMinor, data.currency, isAmharic)
      : null;

    // Secondary currency details
    let secondarySummaryHtml = '';
    if (data.secondaryCurrency && data.exchangeRateSnapshot && data.secondaryTotalPriceMinor) {
      const secondaryTotalFormatted = this.formatMoney(data.secondaryTotalPriceMinor, data.secondaryCurrency);
      secondarySummaryHtml = `
        <div class="secondary-currency-badge">
          <span class="label">${isAmharic ? 'ተመጣጣኝ ዋጋ' : 'Equivalent'} (${data.secondaryCurrency}):</span>
          <span class="value">${secondaryTotalFormatted}</span>
          <span class="rate-note">(@ 1 ${data.secondaryCurrency} = ${data.exchangeRateSnapshot.toFixed(2)} ETB snapshot)</span>
        </div>
      `;
    }

    // Process line items according to visibility rules
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
          priceHtml: `<span class="included-badge">${isAmharic ? 'በጥቅል ውስጥ የተካተተ' : 'Included in Scope'}</span>`,
        });
      } else {
        // SHOW_PRICE
        processedLines.push({
          title: item.title,
          description: item.description,
          priceHtml: this.formatMoney(item.priceMinor, data.currency, isAmharic),
        });
      }
    }

    // Append merged groups
    for (const [groupName, groupData] of mergedGroupsMap.entries()) {
      processedLines.push({
        title: groupName,
        description: groupData.descriptions.join(' • '),
        priceHtml: this.formatMoney(groupData.totalPriceMinor, data.currency, isAmharic),
        isMergedGroup: true,
      });
    }

    const lineRowsHtml = processedLines
      .map(
        (line, idx) => `
        <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
          <td class="col-num">${idx + 1}</td>
          <td class="col-desc">
            <div class="line-title">${this.escapeHtml(line.title)} ${line.isMergedGroup ? `<span class="group-tag">${isAmharic ? 'ጥቅል አገልግሎት' : 'Package Group'}</span>` : ''}</div>
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
          <td class="m-stage">${isAmharic ? `ደረጃ ${idx + 1}` : `Stage ${idx + 1}`}</td>
          <td class="m-title">
            <strong>${this.escapeHtml(m.title)}</strong>
            ${m.description ? `<div class="m-desc">${this.escapeHtml(m.description)}</div>` : ''}
          </td>
          <td class="m-pct">${m.percentage !== undefined ? `${m.percentage}%` : '-'}</td>
          <td class="m-amt">${m.amountMinor ? this.formatMoney(m.amountMinor, data.currency, isAmharic) : '-'}</td>
          <td class="m-due">${m.dueDate ? this.escapeHtml(m.dueDate) : (isAmharic ? 'የደረጃው ርክክብ ሲፈረም' : 'Upon milestone sign-off')}</td>
        </tr>`,
      )
      .join('\n');

    // Dates formatting (Ethiopian & Gregorian)
    const validDate = new Date(data.validUntil);
    const issuedDate = data.issuedAt ? new Date(data.issuedAt) : new Date(data.createdAt);

    const validGregStr = validDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const issuedGregStr = issuedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let validUntilStr = validGregStr;
    let issuedDateStr = issuedGregStr;

    if (isEthiopianCal) {
      const validEthStr = formatEthiopianDate(validDate, { locale: isAmharic ? 'am' : 'en' });
      const issuedEthStr = formatEthiopianDate(issuedDate, { locale: isAmharic ? 'am' : 'en' });
      if (isAmharic) {
        validUntilStr = `${validEthStr} (${validGregStr} እ.ኤ.አ)`;
        issuedDateStr = `${issuedEthStr} (${issuedGregStr} እ.ኤ.አ)`;
      } else {
        validUntilStr = `${validEthStr} (${validGregStr} GC)`;
        issuedDateStr = `${issuedEthStr} (${issuedGregStr} GC)`;
      }
    }

    const statusBadgeClass = `status-${(data.status || 'DRAFT').toLowerCase()}`;
    const statusLabelMap: Record<string, { en: string; am: string }> = {
      DRAFT: { en: 'DRAFT', am: 'ረቂቅ (DRAFT)' },
      ISSUED: { en: 'ISSUED', am: 'የተሰጠ (ISSUED)' },
      ACCEPTED: { en: 'ACCEPTED', am: 'ተቀባይነት ያገኘ (ACCEPTED)' },
      EXPIRED: { en: 'EXPIRED', am: 'ጊዜው ያለፈበት (EXPIRED)' },
      REJECTED: { en: 'REJECTED', am: 'ውድቅ የተደረገ (REJECTED)' },
    };
    const statusUpper = (data.status || 'DRAFT').toUpperCase();
    const statusDisplayText = isAmharic
      ? statusLabelMap[statusUpper]?.am || statusUpper
      : statusLabelMap[statusUpper]?.en || statusUpper;

    return `<!DOCTYPE html>
<html lang="${isAmharic ? 'am' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${isAmharic ? 'የዋጋ ማቅረቢያ' : 'Quote'} ${this.escapeHtml(data.quoteNumber)} - ${this.escapeHtml(data.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&display=swap');
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
      font-family: 'Noto Sans Ethiopic', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
      font-size: 22px;
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
        <div class="quote-badge-title">${isAmharic ? 'ኦፊሴላዊ የዋጋ ማቅረቢያ' : 'FORMAL QUOTE'}</div>
        <div class="quote-number">${this.escapeHtml(data.quoteNumber)}</div>
        <div>
          <span class="status-badge ${statusBadgeClass}">${this.escapeHtml(statusDisplayText)}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Client & Validity Details -->
  <div class="client-grid">
    <div class="client-col">
      <div class="section-label">${isAmharic ? 'ለደንበኛ የቀረበ (Prepared For)' : 'Prepared For Client'}</div>
      <div class="client-name">${this.escapeHtml(data.clientName)}</div>
      ${data.clientTin ? `<div class="client-detail-line">${isAmharic ? 'የደንበኛ የግብር መለያ (TIN):' : 'Client TIN:'} ${this.escapeHtml(data.clientTin)}</div>` : ''}
      ${data.clientContact ? `<div class="client-detail-line">${isAmharic ? 'ግንኙነት አድራጊ:' : 'Contact Person:'} ${this.escapeHtml(data.clientContact)}</div>` : ''}
      ${data.clientEmail ? `<div class="client-detail-line">${isAmharic ? 'ኢሜይል:' : 'Email:'} ${this.escapeHtml(data.clientEmail)}</div>` : ''}
    </div>
    <div class="client-col-right">
      <div class="section-label">${isAmharic ? 'የዋጋ ማቅረቢያ ዝርዝር መረጃ' : 'Quote Details'}</div>
      <div class="client-detail-line"><strong>${isAmharic ? 'የተሰጠበት ቀን:' : 'Issued Date:'}</strong> ${issuedDateStr}</div>
      <div class="client-detail-line"><strong>${isAmharic ? 'የሚያበቃበት ቀን:' : 'Valid Until:'}</strong> ${validUntilStr}</div>
      <div class="client-detail-line"><strong>${isAmharic ? 'ዋና የገንዘብ አይነት:' : 'Primary Currency:'}</strong> ${this.escapeHtml(data.currency)}</div>
      <div class="client-detail-line"><strong>${isAmharic ? 'የግብር ደንብ:' : 'Tax Pack:'}</strong> ${isAmharic ? 'ኢትዮጵያ' : 'Ethiopia'} v${this.escapeHtml(data.taxPackVersion)}</div>
    </div>
  </div>

  <!-- Executive Scope Summary -->
  ${
    data.executiveSummary
      ? `<div class="exec-summary-box">
          <div class="exec-summary-title">${isAmharic ? 'የፕሮጀክት አጠቃላይ መግለጫ እና ወሰን (Scope & Summary)' : 'Scope & Executive Summary'}</div>
          ${this.escapeHtml(data.executiveSummary)}
         </div>`
      : ''
  }

  <!-- Deliverables & Pricing Lines -->
  <div class="section-header">${isAmharic ? 'የፕሮጀክት ክፍሎች እና የዋጋ ዝርዝር (Project Deliverables & Scope)' : 'Project Deliverables & Scope Breakdown'}</div>
  <table class="deliverables-table">
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-desc">${isAmharic ? 'የሥራው / ሞጁል ዝርዝር መግለጫ' : 'Module / Deliverable Description'}</th>
        <th class="col-price">${isAmharic ? `ዋጋ (${data.currency === 'ETB' ? 'ብር' : this.escapeHtml(data.currency)})` : `Investment (${this.escapeHtml(data.currency)})`}</th>
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
          <strong>${isAmharic ? 'ወርሃዊ ተደጋጋሚ የደመና መሠረተ ልማት ወጪ:' : 'Recurring Client Infrastructure:'}</strong> ${recurringFormatted} ${isAmharic ? 'በወር (ለደመና ማስተናገጃ፣ ለዶሜይን፣ SSL፣ CDN እና ክፍያ መቀበያ የተገመተ)። በቀጥታ ለአገልግሎት ሰጪ ድርጅቶች የሚከፈል።' : '/ month (estimated for Cloud Hosting, Domain, SSL, CDN & Payment Gateway). Billed directly to client by service providers.'}
         </div>`
      : ''
  }

  <!-- Tax Breakdown & Grand Totals -->
  <div class="summary-container">
    <div class="summary-notes-cell">
      <div class="tax-citation-card">
        <strong>${isAmharic ? 'የታክስ ህግ ተገዢነት ማረጋገጫ (Statutory Tax Compliance):' : 'Statutory Tax Compliance:'}</strong><br>
        ${
          isAmharic
            ? `ተጨማሪ እሴት ታክስ (ቫት/VAT) በኢትዮጵያ ተጨማሪ እሴት ታክስ አዋጅ ቁጥር 1341/2016 መሠረት ${vatPercent}% ተሰልቷል። ሁሉም ህጋዊ ግዴታዎች በግልጽ እና በህጉ መሠረት ተካተዋል።`
            : `VAT applied at ${vatPercent}% in accordance with Ethiopian <strong>Proclamation 1341/2024</strong>. All statutory obligations are fully recorded and transparently itemized.`
        }
      </div>

      ${
        withholdingFormatted
          ? `<div class="withholding-note">
              <strong>${isAmharic ? `የቅድመ ግብር ተቀናሽ ማስታወሻ (${withholdingPercent}% Withholding):` : `Withholding Tax Note (${withholdingPercent}%):`}</strong><br>
              ${
                isAmharic
                  ? `በኢትዮጵያ የታክስ አስተዳደር አዋጅ መሠረት የአገር ውስጥ ደንበኞች ከሙያዊ የአይቲ አገልግሎት ክፍያ ላይ 3% ዊዝሆልዲንግ ታክስ (${withholdingFormatted}) ቀንሰው ገቢ ያደርጋሉ። ደረሰኝ ሲቀርብ የሚከፈል የተጣራ ጥሬ ገንዘብ: <strong>${expectedCashFormatted}</strong>። ደንበኛው ህጋዊ የዊዝሆልዲንግ ደረሰኝ ለአፍሮ ዲጂታል ይሰጣል።`
                  : `Domestic client payments are subject to a 3% withholding tax on professional IT services (${withholdingFormatted}). Net cash receivable upon invoice presentation: <strong>${expectedCashFormatted}</strong>. Withholding tax receipt to be issued to Afro Digital by client.`
              }
             </div>`
          : ''
      }
    </div>

    <div class="summary-totals-cell">
      <table class="totals-table">
        <tr>
          <td class="total-label">${isAmharic ? 'ድምር (ያለ ቫት / Excl. VAT):' : 'Subtotal (Excl. VAT):'}</td>
          <td class="total-val">${subtotalFormatted}</td>
        </tr>
        <tr>
          <td class="total-label">${isAmharic ? `ተጨማሪ እሴት ታክስ (${vatPercent}% - አዋጅ 1341/2016):` : `VAT (${vatPercent}% - Procl. 1341/2024):`}</td>
          <td class="total-val">${vatFormatted}</td>
        </tr>
        <tr class="total-grand-row">
          <td>${isAmharic ? 'አጠቃላይ የፕሮጀክት ዋጋ:' : 'Total Project Price:'}</td>
          <td class="total-val">${totalFormatted}</td>
        </tr>
      </table>
      ${secondarySummaryHtml}
    </div>
  </div>

  <!-- Payment Milestones Schedule -->
  <div class="section-header">${isAmharic ? 'የክፍያ ደረጃዎች እና የጊዜ ሰሌዳ (Payment Milestones Schedule)' : 'Payment Milestones Schedule'}</div>
  <table class="milestones-table">
    <thead>
      <tr>
        <th class="m-stage">${isAmharic ? 'ደረጃ' : 'Stage'}</th>
        <th class="m-title">${isAmharic ? 'የክፍያ ደረጃ እና የሚረከበው ውጤት' : 'Milestone & Deliverable Condition'}</th>
        <th class="m-pct">${isAmharic ? 'ድርሻ' : 'Share'}</th>
        <th class="m-amt">${isAmharic ? `መጠን (${data.currency === 'ETB' ? 'ብር' : this.escapeHtml(data.currency)})` : `Amount (${this.escapeHtml(data.currency)})`}</th>
        <th class="m-due">${isAmharic ? 'የሚከፈልበት ጊዜ / ቅድመ-ሁኔታ' : 'Due Date / Trigger'}</th>
      </tr>
    </thead>
    <tbody>
      ${milestonesRowsHtml}
    </tbody>
  </table>

  <!-- Terms and Conditions -->
  <div class="terms-box">
    <h4>${isAmharic ? 'የውል ስምምነት እና ቅድመ ሁኔታዎች (Commercial Terms)' : 'Commercial Terms & Assumptions'}</h4>
    <div>${this.escapeHtml(
      data.termsAndConditions ||
        (isAmharic
          ? '1. ተቀባይነት ጊዜ: ይህ የዋጋ ማቅረቢያ ከተሰጠበት ቀን ጀምሮ ለ30 ቀናት ፀንቶ ይቆያል።\n2. ክፍያ: በክፍያ ደረጃዎች ሰሌዳ መሠረት እያንዳንዱ የሥራ ደረጃ ሲጠናቀቅ እና ሲረከብ ደረሰኝ ይቀርባል።\n3. የገንዘብ አይነት: ደረሰኞች በኢትዮጵያ ብር (ETB) ይቀርባሉ። የውጭ ምንዛሬ ተመኖች በዋጋ ማቅረቢያው ቀን የነበረውን የምንዛሬ ቅጽበታዊ መረጃ ያመለክታሉ።\n4. የባለቤትነት መብት (IP): የሶፍትዌሩ ምንጭ ኮድ (Source Code) እና የስርዓቱ ሰነዶች ሙሉ ክፍያ ሲጠናቀቅ ለደንበኛ ይተላለፋሉ።'
          : '1. Validity: This quotation remains valid for 30 days from the issue date.\n2. Invoicing: Invoices are submitted upon milestone completion according to the payment schedule above.\n3. Currency: Invoices are rendered in ETB. Foreign currency conversions reflect snapshot rates at quotation.\n4. Intellectual Property: Final source code, system documentation, and architecture IP are transferred upon receipt of full payment.'),
    )}</div>
  </div>

  <!-- Sign-off & Acceptance Grid -->
  <div class="signoff-grid">
    <div class="signoff-col">
      <div class="sign-box">
        <div class="sign-title">${isAmharic ? 'በአፍሮ ዲጂታል ኃላፊ የተፈረመ' : 'Authorized Afro Digital Representative'}</div>
        <div>${isAmharic ? 'ስም:' : 'Name:'} ___________________________________</div>
        <div>${isAmharic ? 'ፊርማ:' : 'Signature:'} ________________________________</div>
        <div>${isAmharic ? 'ቀን:' : 'Date:'} _____________________________________</div>
      </div>
    </div>
    <div class="signoff-col">
      <div class="sign-box">
        <div class="sign-title">${isAmharic ? 'በደንበኛ ተቀባይነት ማረጋገጫ እና ፊርማ' : 'Client Acceptance & Authorization'}</div>
        <div>${isAmharic ? 'ስም:' : 'Name:'} ___________________________________</div>
        <div>${isAmharic ? 'ፊርማ:' : 'Signature:'} ________________________________</div>
        <div>${isAmharic ? 'ቀን:' : 'Date:'} _____________________________________</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    ${
      isAmharic
        ? `በስሌት (Selet) የዋጋ ማቅረቢያ ሥርዓት የተዘጋጀ • የዋጋ ማጣቀሻ: ${this.escapeHtml(data.quoteNumber)} • የታክስ ደንብ: ኢትዮጵያ v${this.escapeHtml(data.taxPackVersion)} • የማይለወጥ ኦፊሴላዊ ሰነድ`
        : `Generated by Selet (ስሌት) Pricing Platform • Quote Ref: ${this.escapeHtml(data.quoteNumber)} • Tax Pack Version: ${this.escapeHtml(data.taxPackVersion)} • Immutable Record`
    }
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
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
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
