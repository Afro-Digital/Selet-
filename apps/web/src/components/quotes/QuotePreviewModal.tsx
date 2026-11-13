'use client';

import React from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { formatEthiopianDate } from '@selet/shared';

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
  language?: string;
  calendar?: string;
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

  const isAmharic = quote.language === 'am';
  const isEthiopianCal = quote.calendar === 'ETHIOPIAN' || isAmharic;

  const formatMoney = (minor: number | undefined, curr = quote.currency) => {
    if (minor === undefined) {
      return isAmharic && curr === 'ETB' ? 'ብር 0.00' : `0.00 ${curr}`;
    }
    const val = (minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (isAmharic && curr === 'ETB') {
      return `ብር ${val}`;
    }
    return `${curr} ${val}`;
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
        priceDisplay: isAmharic ? 'በጥቅል ውስጥ የተካተተ' : 'Included in Package',
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

  // Dates formatting
  const validDate = new Date(quote.validUntil);
  const issuedDate = quote.issuedAt ? new Date(quote.issuedAt) : new Date(quote.createdAt);

  const validGreg = validDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const issuedGreg = issuedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  let validUntilDisplay = validGreg;
  let issuedDateDisplay = issuedGreg;

  if (isEthiopianCal) {
    const validEth = formatEthiopianDate(validDate, { locale: isAmharic ? 'am' : 'en' });
    const issuedEth = formatEthiopianDate(issuedDate, { locale: isAmharic ? 'am' : 'en' });
    if (isAmharic) {
      validUntilDisplay = `${validEth} (${validGreg} እ.ኤ.አ)`;
      issuedDateDisplay = `${issuedEth} (${issuedGreg} እ.ኤ.አ)`;
    } else {
      validUntilDisplay = `${validEth} (${validGreg} G.C.)`;
      issuedDateDisplay = `${issuedEth} (${issuedGreg} G.C.)`;
    }
  }

  const vatPercent = Math.round((quote.vatRate || 0.15) * 100);
  const withholdingPercent = Math.round((quote.withholdingRate || 0.03) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quote Preview Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto font-sans"
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
                <span>{isAmharic ? 'የአፍሮ ዲጂታል ኦፊሴላዊ የዋጋ ማቅረቢያ' : 'Afro Digital Branded Quote'}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {quote.quoteNumber}
                </span>
                {isAmharic && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    አማርኛ (Amharic)
                  </span>
                )}
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
              <span>{isAmharic ? 'አትም (Print)' : 'Print'}</span>
            </button>
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isAmharic ? 'ፒዲኤፍ አውርድ' : 'Download PDF'}</span>
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
              <h1 className="text-2xl font-black text-emerald-800 tracking-tight">
                {isAmharic ? 'አፍሮ ዲጂታል ቴክኖሎጂስ' : 'Afro Digital Technologies'}
              </h1>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                <p>
                  {isAmharic
                    ? 'የግብር ከፋይ መለያ (TIN): 0076543210 • ቦሌ ክ/ከተማ፣ ወረዳ 03፣ አዲስ አበባ፣ ኢትዮጵያ'
                    : 'TIN: 0076543210 • Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia'}
                </p>
                <p>Email: billing@afrodigital.et • Phone: +251 91 123 4567</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {isAmharic ? 'ኦፊሴላዊ የዋጋ ማቅረቢያ' : 'Formal Quotation'}
              </span>
              <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{quote.quoteNumber}</div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    quote.status === 'ISSUED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isAmharic ? (quote.status === 'ISSUED' ? 'የተሰጠ (ISSUED)' : 'ረቂቅ (DRAFT)') : quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Metadata Card */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                {isAmharic ? 'ለደንበኛ የቀረበ (Prepared For)' : 'Prepared For Client'}
              </span>
              <div className="text-sm font-bold text-slate-900">{quote.clientName}</div>
              {quote.clientTin && (
                <div className="text-slate-600 mt-0.5">
                  {isAmharic ? 'የግብር መለያ (TIN):' : 'TIN:'} {quote.clientTin}
                </div>
              )}
              {quote.clientContact && (
                <div className="text-slate-600">
                  {isAmharic ? 'ግንኙነት አድራጊ:' : 'Contact:'} {quote.clientContact}
                </div>
              )}
              {quote.clientEmail && (
                <div className="text-slate-600">
                  {isAmharic ? 'ኢሜይል:' : 'Email:'} {quote.clientEmail}
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-500 font-semibold">{isAmharic ? 'የተሰጠበት ቀን:' : 'Issued Date:'} </span>
                <span className="font-bold text-slate-800">{issuedDateDisplay}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">{isAmharic ? 'የሚያበቃበት ቀን:' : 'Valid Until:'} </span>
                <span className="font-bold text-slate-800">{validUntilDisplay}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">{isAmharic ? 'ዋና የገንዘብ አይነት:' : 'Currency:'} </span>
                <span className="font-bold text-slate-800">{quote.currency}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">{isAmharic ? 'የግብር ደንብ:' : 'Tax Pack:'} </span>
                <span className="font-bold text-slate-800">{isAmharic ? 'ኢትዮጵያ' : 'Ethiopia'} v{quote.taxPackVersion}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {quote.executiveSummary && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block mb-1">
                {isAmharic ? 'የፕሮጀክት አጠቃላይ መግለጫ እና ወሰን (Scope & Summary)' : 'Project Scope & Executive Summary'}
              </span>
              <p className="leading-relaxed">{quote.executiveSummary}</p>
            </div>
          )}

          {/* Deliverables Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {isAmharic ? 'የፕሮጀክት ክፍሎች እና የዋጋ ዝርዝር (Project Deliverables)' : 'Project Deliverables & Commercial Investment'}
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left w-12">#</th>
                    <th className="py-2.5 px-4 text-left">{isAmharic ? 'የሥራው / ሞጁል ዝርዝር መግለጫ' : 'Deliverable Description'}</th>
                    <th className="py-2.5 px-4 text-right w-44">
                      {isAmharic ? `ዋጋ (${quote.currency === 'ETB' ? 'ብር' : quote.currency})` : `Investment (${quote.currency})`}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedLines.map((line, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{line.title}</span>
                          {line.isGroup && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              {isAmharic ? 'ጥቅል አገልግሎት' : 'Package Group'}
                            </span>
                          )}
                        </div>
                        {line.description && <div className="text-[11px] text-slate-500 mt-0.5">{line.description}</div>}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">{line.priceDisplay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Recurring Cloud Infrastructure */}
          {quote.clientRecurringMonthlyMinor && quote.clientRecurringMonthlyMinor > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold">
                  {isAmharic ? 'ወርሃዊ ተደጋጋሚ የደመና መሠረተ ልማት ወጪ:' : 'Estimated Client Cloud Infrastructure:'}{' '}
                </span>
                <span>
                  {formatMoney(quote.clientRecurringMonthlyMinor)}{' '}
                  {isAmharic ? '/ በወር (ለደመና፣ ዶሜይን፣ SSL እና ክፍያ መቀበያ)' : '/ month (Hosting, Domain, SSL & Payment Gateway)'}
                </span>
              </div>
              <span className="text-[11px] text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                {isAmharic ? 'በቀጥታ ለአቅራቢው የሚከፈል' : 'Direct Provider Billing'}
              </span>
            </div>
          )}

          {/* Statutory Tax Breakdown and Totals */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-1">
                  {isAmharic ? 'የታክስ ህግ ተገዢነት ማረጋገጫ (Statutory Tax Compliance):' : 'Statutory Tax Compliance:'}
                </strong>
                {isAmharic
                  ? `ተጨማሪ እሴት ታክስ በኢትዮጵያ ተጨማሪ እሴት ታክስ አዋጅ ቁጥር 1341/2016 መሠረት 15% ተሰልቷል። ሁሉም ህጋዊ ግዴታዎች በግልጽ ተካተዋል።`
                  : `VAT computed at ${vatPercent}% pursuant to Ethiopian Proclamation 1341/2024. All enterprise quotes itemize VAT explicitly.`}
              </div>

              {quote.withholdingAmountMinor && quote.withholdingAmountMinor > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong className="block mb-0.5">
                    {isAmharic ? `የቅድመ ግብር ተቀናሽ (${withholdingPercent}% ዊዝሆልዲንግ):` : `Withholding Tax Note (${withholdingPercent}%):`}
                  </strong>
                  {isAmharic
                    ? `የአገር ውስጥ ደንበኞች ከሙያዊ አገልግሎት ክፍያ ላይ 3% (${formatMoney(quote.withholdingAmountMinor)}) ቀንሰው ደረሰኝ ለአፍሮ ዲጂታል ይሰጣሉ። የተጣራ ተከፋይ ጥሬ ገንዘብ: ${formatMoney(quote.expectedCashMinor)}።`
                    : `Domestic client payments are subject to a 3% withholding tax (${formatMoney(quote.withholdingAmountMinor)}). Net cash payable upon invoice presentation: ${formatMoney(quote.expectedCashMinor)}.`}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 text-xs divide-y divide-slate-200">
              <div className="flex justify-between p-3 font-semibold text-slate-700">
                <span>{isAmharic ? 'ድምር (ያለ ቫት / Excl. VAT):' : 'Subtotal (Excl. VAT):'}</span>
                <span className="font-bold text-slate-900">{formatMoney(quote.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between p-3 font-semibold text-slate-700">
                <span>{isAmharic ? `ተጨማሪ እሴት ታክስ (${vatPercent}% - አዋጅ 1341/2016):` : `VAT (${vatPercent}% - Procl. 1341/2024):`}</span>
                <span className="font-bold text-slate-900">{formatMoney(quote.vatAmountMinor)}</span>
              </div>
              <div className="flex justify-between p-4 bg-emerald-50/70 text-emerald-950 font-black text-sm border-t-2 border-emerald-600">
                <span>{isAmharic ? 'አጠቃላይ የፕሮጀክት ዋጋ:' : 'Total Project Price:'}</span>
                <span className="text-base text-emerald-800">{formatMoney(quote.totalPriceMinor)}</span>
              </div>
              {quote.secondaryCurrency && quote.secondaryTotalPriceMinor && (
                <div className="flex justify-between p-2.5 bg-emerald-100/50 text-emerald-900 text-[11px] font-semibold">
                  <span>
                    {isAmharic ? 'ተመጣጣኝ ዋጋ' : 'Equivalent'} ({quote.secondaryCurrency} @ {quote.exchangeRateSnapshot} ETB):
                  </span>
                  <span>{formatMoney(quote.secondaryTotalPriceMinor, quote.secondaryCurrency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Schedule */}
          {quote.milestones && quote.milestones.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isAmharic ? 'የክፍያ ደረጃዎች እና የጊዜ ሰሌዳ (Payment Milestones)' : 'Payment Milestones Schedule'}
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left w-20">{isAmharic ? 'ደረጃ' : 'Stage'}</th>
                      <th className="py-2 px-3 text-left">{isAmharic ? 'የክፍያ ደረጃ እና የሚረከበው ውጤት' : 'Milestone Condition'}</th>
                      <th className="py-2 px-3 text-center w-20">{isAmharic ? 'ድርሻ' : 'Share'}</th>
                      <th className="py-2 px-3 text-right w-36">{isAmharic ? 'መጠን' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.milestones.map((m, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-2 px-3 font-bold text-slate-500">
                          {isAmharic ? `ደረጃ ${idx + 1}` : `Stage ${idx + 1}`}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{m.title}</div>
                          {m.description && <div className="text-[11px] text-slate-500">{m.description}</div>}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700">{m.percentage}%</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatMoney(m.amountMinor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Terms & Assumptions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              {isAmharic ? 'የውል ስምምነት እና ቅድመ ሁኔታዎች (Commercial Terms)' : 'Commercial Terms & Assumptions'}
            </h4>
            <p className="whitespace-pre-line text-slate-600">
              {quote.termsAndConditions ||
                (isAmharic
                  ? '1. ተቀባይነት ጊዜ: ይህ የዋጋ ማቅረቢያ ከተሰጠበት ቀን ጀምሮ ለ30 ቀናት ፀንቶ ይቆያል።\n2. ክፍያ: በክፍያ ደረጃዎች ሰሌዳ መሠረት እያንዳንዱ የሥራ ደረጃ ሲጠናቀቅ እና ሲረከብ ደረሰኝ ይቀርባል።\n3. የገንዘብ አይነት: ደረሰኞች በኢትዮጵያ ብር (ETB) ይቀርባሉ።\n4. የባለቤትነት መብት (IP): የሶፍትዌሩ ምንጭ ኮድ (Source Code) እና የስርዓቱ ሰነዶች ሙሉ ክፍያ ሲጠናቀቅ ለደንበኛ ይተላለፋሉ።'
                  : '1. Validity: 30 days from date of issuance.\n2. Invoicing: Milestones billed upon client milestone acceptance.\n3. IP Transfer: Full source code and documentation transferred upon receipt of final milestone payment.')}
            </p>
          </div>

          {/* Signatures Grid */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t border-slate-300 pt-3">
              <span className="font-bold text-slate-900 text-xs block mb-6">
                {isAmharic ? 'በአፍሮ ዲጂታል ኃላፊ የተፈረመ' : 'Authorized Afro Digital Representative'}
              </span>
              <div className="text-xs text-slate-500 space-y-1">
                <p>{isAmharic ? 'ስም: _____________________________' : 'Name: _____________________________'}</p>
                <p>{isAmharic ? 'ፊርማ: ___________________________' : 'Signature: ________________________'}</p>
                <p>{isAmharic ? 'ቀን: _____________________________' : 'Date: _____________________________'}</p>
              </div>
            </div>

            <div className="border-t border-slate-300 pt-3">
              <span className="font-bold text-slate-900 text-xs block mb-6">
                {isAmharic ? 'በደንበኛ ተቀባይነት ማረጋገጫ እና ፊርማ' : 'Client Acceptance & Authorization'}
              </span>
              <div className="text-xs text-slate-500 space-y-1">
                <p>{isAmharic ? 'ስም: _____________________________' : 'Name: _____________________________'}</p>
                <p>{isAmharic ? 'ፊርማ: ___________________________' : 'Signature: ________________________'}</p>
                <p>{isAmharic ? 'ቀን: _____________________________' : 'Date: _____________________________'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            {isAmharic
              ? `በስሌት (Selet) የዋጋ ማቅረቢያ ሥርዓት የተዘጋጀ • የማይለወጥ ኦፊሴላዊ ሰነድ • የዋጋ ማጣቀሻ: ${quote.quoteNumber}`
              : `Generated by Selet (ስሌት) Pricing Platform • Immutable Record • Ref: ${quote.quoteNumber}`}
          </div>
        </div>
      </div>
    </div>
  );
};
