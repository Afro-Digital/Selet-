import React from 'react';
import { X, Printer, Download, ShieldCheck, FileText } from 'lucide-react';

export interface QuoteUiData {
  id: string;
  quoteNumber: string;
  title: string;
  status: 'DRAFT' | 'ISSUED' | 'EXPIRED' | 'ACCEPTED' | 'REJECTED';
  clientName: string;
  clientTin?: string;
  clientContact?: string;
  clientEmail?: string;
  currency: string;
  subtotalMinor: number;
  taxPackVersion: string;
  vatRate: number;
  vatAmountMinor: number;
  withholdingRate?: number;
  withholdingAmountMinor?: number;
  totalPriceMinor: number;
  expectedCashMinor?: number;
  clientRecurringMonthlyMinor?: number;
  secondaryCurrency?: string;
  exchangeRateSnapshot?: number;
  secondaryTotalPriceMinor?: number;
  executiveSummary?: string;
  lineItems: Array<{
    id: string;
    title: string;
    description?: string;
    visibility: 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP';
    groupName?: string;
    priceMinor: number;
  }>;
  milestones: Array<{
    id?: string;
    title: string;
    description?: string;
    percentage?: number;
    amountMinor?: number;
    dueDate?: string;
  }>;
  termsAndConditions?: string;
  validUntil: string;
  issuedAt?: string;
  createdAt: string;
}

interface QuotePreviewModalProps {
  quote: QuoteUiData;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf?: () => void;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  quote,
  isOpen,
  onClose,
  onDownloadPdf,
}) => {
  if (!isOpen) return null;

  const formatMoney = (minor: number | undefined, curr = quote.currency) => {
    if (minor === undefined) return `0.00 ${curr}`;
    return `${curr} ${(minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Grouping for MERGE_GROUP items
  interface ProcessedLine {
    title: string;
    description?: string;
    priceDisplay: string;
    isGroup?: boolean;
  }

  const processedLines: ProcessedLine[] = [];
  const mergedGroups = new Map<string, { title: string; descriptions: string[]; totalPriceMinor: number }>();

  for (const item of quote.lineItems) {
    if (item.visibility === 'MERGE_GROUP' && item.groupName) {
      const existing = mergedGroups.get(item.groupName) || {
        title: item.groupName,
        descriptions: [],
        totalPriceMinor: 0,
      };
      existing.descriptions.push(item.description ? `${item.title}: ${item.description}` : item.title);
      existing.totalPriceMinor += item.priceMinor;
      mergedGroups.set(item.groupName, existing);
    } else if (item.visibility === 'DESCRIPTION_ONLY') {
      processedLines.push({
        title: item.title,
        description: item.description,
        priceDisplay: 'Included in Package',
      });
    } else {
      processedLines.push({
        title: item.title,
        description: item.description,
        priceDisplay: formatMoney(item.priceMinor),
      });
    }
  }

  mergedGroups.forEach((groupData, groupName) => {
    processedLines.push({
      title: groupName,
      description: groupData.descriptions.join(' • '),
      priceDisplay: formatMoney(groupData.totalPriceMinor),
      isGroup: true,
    });
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quote Preview Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Controls Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>Afro Digital Branded Quote</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {quote.quoteNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">Playwright-Ready High Fidelity Document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="overflow-y-auto p-8 text-slate-900 bg-white space-y-6">
          {/* Header & Logo */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-emerald-700">
            <div>
              <h1 className="text-2xl font-black text-emerald-800 tracking-tight">Afro Digital Technologies</h1>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                <p>TIN: 0076543210 • Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia</p>
                <p>Email: billing@afrodigital.et • Phone: +251 91 123 4567</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Formal Quotation</span>
              <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{quote.quoteNumber}</div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    quote.status === 'ISSUED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Metadata Card */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                Prepared For Client
              </span>
              <div className="text-sm font-bold text-slate-900">{quote.clientName}</div>
              {quote.clientTin && <div className="text-slate-600 mt-0.5">TIN: {quote.clientTin}</div>}
              {quote.clientContact && <div className="text-slate-600">Contact: {quote.clientContact}</div>}
              {quote.clientEmail && <div className="text-slate-600">{quote.clientEmail}</div>}
            </div>
            <div className="text-right space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                Quotation Snapshot
              </span>
              <div>
                <span className="text-slate-500">Valid Until: </span>
                <span className="font-semibold text-slate-800">{new Date(quote.validUntil).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Primary Currency: </span>
                <span className="font-semibold text-slate-800">{quote.currency}</span>
              </div>
              <div>
                <span className="text-slate-500">Statutory Tax Pack: </span>
                <span className="font-semibold text-emerald-700">Ethiopia v{quote.taxPackVersion}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {quote.executiveSummary && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border-l-4 border-emerald-600 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-emerald-900 uppercase tracking-wider block text-[10px] mb-1">
                Executive Scope & Solution Overview
              </span>
              {quote.executiveSummary}
            </div>
          )}

          {/* Deliverables Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Deliverables & Module Scope Breakdown
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center text-slate-400">#</th>
                    <th className="py-2.5 px-3">Scope Deliverable</th>
                    <th className="py-2.5 px-3 text-right">Investment ({quote.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {processedLines.map((line, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{line.title}</span>
                          {line.isGroup && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                              Package Group
                            </span>
                          )}
                        </div>
                        {line.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{line.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {line.priceDisplay === 'Included in Package' ? (
                          <span className="text-emerald-600 italic font-semibold">{line.priceDisplay}</span>
                        ) : (
                          line.priceDisplay
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Recurring Infrastructure Note */}
          {quote.clientRecurringMonthlyMinor && quote.clientRecurringMonthlyMinor > 0 ? (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <span className="font-bold">Estimated Monthly Cloud Infrastructure:</span>
              <span>{formatMoney(quote.clientRecurringMonthlyMinor)} / month</span>
              <span className="text-blue-700 text-[11px]">(Hosting, Domain, CDN & Payment Gateway)</span>
            </div>
          ) : null}

          {/* Tax Breakdown & Totals Grid */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Statutory Tax Compliance
                </span>
                VAT applied at 15% in accordance with Ethiopian <strong>Proclamation 1341/2024</strong>. All statutory obligations are fully recorded and transparently itemized.
              </div>

              {quote.withholdingAmountMinor && quote.withholdingAmountMinor > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold block mb-1">Domestic Withholding Tax (3% Services):</span>
                  Client deducts 3% withholding ({formatMoney(quote.withholdingAmountMinor)}) upon payment and provides receipt. Net cash receivable: <strong>{formatMoney(quote.expectedCashMinor)}</strong>.
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-semibold text-slate-900">{formatMoney(quote.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (15% Proclamation 1341/2024):</span>
                <span className="font-semibold text-slate-900">{formatMoney(quote.vatAmountMinor)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-emerald-800">
                <span>Total Project Price:</span>
                <span className="text-base text-emerald-700">{formatMoney(quote.totalPriceMinor)}</span>
              </div>

              {quote.secondaryCurrency && quote.exchangeRateSnapshot && quote.secondaryTotalPriceMinor ? (
                <div className="mt-3 pt-2 border-t border-dashed border-emerald-300 text-right">
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Equivalent in {quote.secondaryCurrency}:{' '}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {formatMoney(quote.secondaryTotalPriceMinor, quote.secondaryCurrency)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    (@ 1 {quote.secondaryCurrency} = {quote.exchangeRateSnapshot.toFixed(2)} ETB snapshot)
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Payment Milestones Schedule */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Payment Milestones Schedule
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Stage</th>
                    <th className="py-2.5 px-3">Milestone Deliverable</th>
                    <th className="py-2.5 px-3 text-center w-20">Share</th>
                    <th className="py-2.5 px-3 text-right">Amount ({quote.currency})</th>
                    <th className="py-2.5 px-3 text-right">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quote.milestones.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-bold text-slate-600">Stage {idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{m.title}</div>
                        {m.description && <div className="text-[11px] text-slate-500 mt-0.5">{m.description}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{m.percentage}%</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{formatMoney(m.amountMinor)}</td>
                      <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                        {m.dueDate || 'Upon milestone sign-off'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Commercial Terms & Warranty</h4>
            <p className="whitespace-pre-line leading-relaxed">
              {quote.termsAndConditions ||
                '1. Validity: 30 days from date of issue.\n2. Invoicing: Milestones billed upon client milestone acceptance.\n3. IP Transfer: Full source code and documentation transferred upon receipt of final milestone payment.'}
            </p>
          </div>

          {/* Signatures Block */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="border-t border-slate-300 pt-3 text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-800 block text-xs">Authorized Afro Digital Representative</span>
              <p>Name: _______________________________</p>
              <p>Signature: __________________________</p>
              <p>Date: _______________________________</p>
            </div>
            <div className="border-t border-slate-300 pt-3 text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-800 block text-xs">Client Acceptance & Authorization</span>
              <p>Name: _______________________________</p>
              <p>Signature: __________________________</p>
              <p>Date: _______________________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
