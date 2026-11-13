import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Sparkles,
  Globe,
  Calendar,
} from 'lucide-react';
import { TranslationDictionary, Locale } from '../../lib/i18n';
import { QuotePreviewModal, QuoteUiData } from './QuotePreviewModal';
import { EthiopianDatePicker } from '../calendar/EthiopianDatePicker';
import { formatEthiopianDate } from '@selet/shared';

export interface QuoteBuilderProps {
  t: TranslationDictionary;
  locale?: Locale;
  userRole: 'OWNER' | 'PM' | 'DEVELOPER';
  projectId: string;
  projectName: string;
  initialQuotes?: QuoteUiData[];
  pricingModules?: Array<{ id: string; name: string; priceMinor: number }>;
  clientMonthlyRecurringMinor?: number;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  t,
  locale = 'en',
  userRole,
  projectName,
  initialQuotes = [],
  pricingModules = [],
  clientMonthlyRecurringMinor = 0,
}) => {
  const [quotes, setQuotes] = useState<QuoteUiData[]>(() => {
    if (initialQuotes.length > 0) return initialQuotes;
    // Default mock quote if none provided
    return [
      {
        id: 'quote-sample-1',
        quoteNumber: 'QT-2026-0001',
        title: `${projectName} - Enterprise System Proposal`,
        status: 'ISSUED',
        clientName: 'Ethiopian Airlines Enterprise',
        clientTin: '0012345678',
        clientContact: 'Tewodros Kassahun',
        clientEmail: 'tewodros@ethiopianairlines.com',
        currency: 'ETB',
        language: 'en',
        calendar: 'ETHIOPIAN',
        subtotalMinor: 120000000, // 1,200,000 ETB
        taxPackVersion: '2026.1',
        vatRate: 0.15,
        vatAmountMinor: 18000000, // 180,000 ETB
        withholdingRate: 0.03,
        withholdingAmountMinor: 3600000, // 36,000 ETB
        totalPriceMinor: 138000000, // 1,380,000 ETB
        expectedCashMinor: 134400000, // 1,344,000 ETB
        clientRecurringMonthlyMinor: clientMonthlyRecurringMinor,
        secondaryCurrency: 'USD',
        exchangeRateSnapshot: 155.0,
        secondaryTotalPriceMinor: 890322, // ~$8,903.22 USD
        executiveSummary:
          'Comprehensive enterprise software platform engineered to modern scalable standards with localized Ethiopian compliance and cloud infrastructure.',
        lineItems: [
          {
            id: 'line-1',
            title: 'Core Engine & Architecture',
            description: 'Scalable backend API, database schemas, and identity services',
            visibility: 'SHOW_PRICE',
            priceMinor: 60000000,
          },
          {
            id: 'line-2',
            title: 'Automated QA & Security Audit',
            description: 'Automated test suite and security hardening',
            visibility: 'DESCRIPTION_ONLY',
            priceMinor: 15000000,
          },
          {
            id: 'line-3',
            title: 'Operations Dashboard & Telemetry',
            description: 'Real-time telemetry and management portal',
            visibility: 'MERGE_GROUP',
            groupName: 'Operations & Management Suite',
            priceMinor: 25000000,
          },
          {
            id: 'line-4',
            title: 'Reporting & Analytics Engine',
            description: 'Exportable reporting dashboards',
            visibility: 'MERGE_GROUP',
            groupName: 'Operations & Management Suite',
            priceMinor: 20000000,
          },
        ],
        milestones: [
          {
            id: 'm1',
            title: 'Project Kickoff & Advance Mobilization',
            percentage: 30,
            amountMinor: 41400000,
            description: 'Due upon contract signing and repository setup',
          },
          {
            id: 'm2',
            title: 'Core Deliverables & User Acceptance (UAT)',
            percentage: 40,
            amountMinor: 55200000,
            description: 'Due upon functional beta delivery and acceptance',
          },
          {
            id: 'm3',
            title: 'Final Handover & Production Go-Live',
            percentage: 30,
            amountMinor: 41400000,
            description: 'Due upon production deployment and source code transfer',
          },
        ],
        termsAndConditions:
          '1. Validity: 30 days from date of issue.\n2. Invoicing: Milestones billed upon client milestone acceptance.\n3. IP Transfer: Full source code and documentation transferred upon receipt of final milestone payment.',
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        issuedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [selectedQuote, setSelectedQuote] = useState<QuoteUiData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Quote Form State
  const [newTitle, setNewTitle] = useState(`${projectName} - Formal Commercial Quotation`);
  const [clientName, setClientName] = useState('Ethiopian Commercial Client');
  const [clientTin, setClientTin] = useState('0098765432');
  const [clientContact, setClientContact] = useState('Abebe Bikila');
  const [clientEmail, setClientEmail] = useState('client@example.et');
  const [validUntilDate, setValidUntilDate] = useState<string>(() =>
    new Date(Date.now() + 30 * 86400000).toISOString(),
  );
  const [quoteLanguage, setQuoteLanguage] = useState<'en' | 'am'>(locale === 'am' ? 'am' : 'en');
  const [quoteCalendar, setQuoteCalendar] = useState<'ETHIOPIAN' | 'GREGORIAN'>('ETHIOPIAN');
  const [secondaryCurrency, setSecondaryCurrency] = useState<'NONE' | 'USD' | 'EUR'>('USD');
  const [includeWithholding, setIncludeWithholding] = useState(true);

  // Per-line visibility state
  const [lineItems, setLineItems] = useState(() => {
    if (pricingModules.length > 0) {
      return pricingModules.map((m, idx) => ({
        id: m.id || `mod-${idx + 1}`,
        title: m.name,
        description: `Deliverables and engineering for ${m.name}`,
        visibility: 'SHOW_PRICE' as 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP',
        groupName: '',
        priceMinor: m.priceMinor || 30000000,
      }));
    }
    return [
      {
        id: 'line-mod-1',
        title: 'Core Platform & API Services',
        description: 'Microservice backend, database design, and authentication',
        visibility: 'SHOW_PRICE' as 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP',
        groupName: '',
        priceMinor: 60000000,
      },
      {
        id: 'line-mod-2',
        title: 'User Interface & Mobile Experience',
        description: 'Responsive web frontend and mobile client interface',
        visibility: 'SHOW_PRICE' as 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP',
        groupName: '',
        priceMinor: 40000000,
      },
    ];
  });

  // Milestones State
  const [milestonePreset, setMilestonePreset] = useState<'30/40/30' | '50/50' | '25/25/25/25' | 'CUSTOM'>('30/40/30');
  const [milestones, setMilestones] = useState<Array<{ title: string; percentage: number; description: string }>>([
    {
      title: 'Advance Mobilization & Kickoff',
      percentage: 30,
      description: 'Due upon contract signing and repository setup',
    },
    {
      title: 'Core Deliverables & User Acceptance (UAT)',
      percentage: 40,
      description: 'Due upon delivery of functional milestone build',
    },
    {
      title: 'Final Handover & Production Go-Live',
      percentage: 30,
      description: 'Due upon production deployment and handover',
    },
  ]);

  const applyPreset = (preset: '30/40/30' | '50/50' | '25/25/25/25') => {
    setMilestonePreset(preset);
    if (preset === '30/40/30') {
      setMilestones([
        { title: 'Advance Mobilization & Kickoff', percentage: 30, description: 'Due upon contract signing' },
        { title: 'Core Deliverables & User Acceptance (UAT)', percentage: 40, description: 'Due upon functional beta sign-off' },
        { title: 'Final Handover & Production Go-Live', percentage: 30, description: 'Due upon production handover' },
      ]);
    } else if (preset === '50/50') {
      setMilestones([
        { title: 'Advance Mobilization Deposit', percentage: 50, description: 'Due upon contract signing' },
        { title: 'Final Delivery & Acceptance Sign-off', percentage: 50, description: 'Due upon production handover' },
      ]);
    } else if (preset === '25/25/25/25') {
      setMilestones([
        { title: 'Phase 1: Architecture & Design', percentage: 25, description: 'Specifications approval' },
        { title: 'Phase 2: Alpha Milestone', percentage: 25, description: 'Core functional workflow' },
        { title: 'Phase 3: Beta & User Acceptance', percentage: 25, description: 'Testing & QA verification' },
        { title: 'Phase 4: Production Handover', percentage: 25, description: 'Deployment and warranty handover' },
      ]);
    }
  };

  const totalMilestonePercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const isMilestonesValid = Math.abs(totalMilestonePercentage - 100) < 0.05;

  // Real-time tax math for new quote
  const calculatedSubtotal = lineItems.reduce((sum, l) => sum + l.priceMinor, 0);
  const calculatedVat = Math.round(calculatedSubtotal * 0.15);
  const calculatedTotal = calculatedSubtotal + calculatedVat;
  const calculatedWithholding = includeWithholding ? Math.round(calculatedSubtotal * 0.03) : 0;
  const calculatedCash = calculatedTotal - calculatedWithholding;

  const handleCreateQuote = () => {
    if (!isMilestonesValid) {
      alert(t.milestonesMustEqual100);
      return;
    }

    const nextNumber = `QT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(4, '0')}`;
    const rateSnapshot = secondaryCurrency === 'USD' ? 155.0 : secondaryCurrency === 'EUR' ? 165.0 : undefined;
    const secondaryTotal = rateSnapshot ? Math.round(calculatedTotal / rateSnapshot) : undefined;

    const newQuote: QuoteUiData = {
      id: `quote-${Date.now()}`,
      quoteNumber: nextNumber,
      title: newTitle,
      status: 'DRAFT',
      clientName,
      clientTin,
      clientContact,
      clientEmail,
      currency: 'ETB',
      subtotalMinor: calculatedSubtotal,
      taxPackVersion: '2026.1',
      vatRate: 0.15,
      vatAmountMinor: calculatedVat,
      withholdingRate: includeWithholding ? 0.03 : undefined,
      withholdingAmountMinor: calculatedWithholding,
      totalPriceMinor: calculatedTotal,
      expectedCashMinor: calculatedCash,
      clientRecurringMonthlyMinor: clientMonthlyRecurringMinor,
      secondaryCurrency: secondaryCurrency !== 'NONE' ? secondaryCurrency : undefined,
      exchangeRateSnapshot: rateSnapshot,
      secondaryTotalPriceMinor: secondaryTotal,
      language: quoteLanguage,
      calendar: quoteCalendar,
      executiveSummary: `Formal quotation for ${projectName} comprising ${lineItems.length} deliverable modules.`,
      lineItems: lineItems.map((l, idx) => ({ ...l, id: l.id || `line-${idx}` })),
      milestones: milestones.map((m, idx) => ({
        id: `ms-${idx}`,
        title: m.title,
        percentage: m.percentage,
        amountMinor: Math.round((calculatedTotal * m.percentage) / 100),
        description: m.description,
      })),
      validUntil: validUntilDate,
      createdAt: new Date().toISOString(),
    };

    setQuotes([newQuote, ...quotes]);
    setIsCreating(false);
  };

  const handleIssueQuote = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'ISSUED', issuedAt: new Date().toISOString() } : q)),
    );
  };

  const formatMoney = (minor: number | undefined, curr = 'ETB') => {
    if (minor === undefined) return `0.00 ${curr}`;
    return `${curr} ${(minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (userRole === 'DEVELOPER') {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Access Restricted</div>
          <p className="mt-0.5 text-xs text-amber-800">
            Quotes, commercial rates, statutory tax items, and PDF exports are accessible to Project Managers and Owners only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.quoteBuilder}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {t.quoteImmutabilityNotice}
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createQuote}</span>
        </button>
      </div>

      {/* Quote Creation Form Modal */}
      {isCreating && (
        <div className="p-6 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Create New Commercial Quote</span>
              </h3>
              <p className="text-xs text-slate-500">Configure client visibility, milestones, and statutory taxes.</p>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>

          {/* Client Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label htmlFor="quote-title-input" className="font-semibold text-slate-700 block mb-1">Quote Title</label>
              <input
                id="quote-title-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="client-name-input" className="font-semibold text-slate-700 block mb-1">Client Name</label>
              <input
                id="client-name-input"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="client-tin-input" className="font-semibold text-slate-700 block mb-1">Client TIN</label>
              <input
                id="client-tin-input"
                type="text"
                value={clientTin}
                onChange={(e) => setClientTin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="contact-person-input" className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                id="contact-person-input"
                type="text"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="client-email-input" className="font-semibold text-slate-700 block mb-1">Client Email</label>
              <input
                id="client-email-input"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label htmlFor="quote-language-select" className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.quoteLanguage}</span>
              </label>
              <select
                id="quote-language-select"
                value={quoteLanguage}
                onChange={(e) => setQuoteLanguage(e.target.value as 'en' | 'am')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium bg-white"
              >
                <option value="en">English (EN)</option>
                <option value="am">አማርኛ (Amharic)</option>
              </select>
            </div>
            <div>
              <label htmlFor="quote-calendar-select" className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.quoteCalendar}</span>
              </label>
              <select
                id="quote-calendar-select"
                value={quoteCalendar}
                onChange={(e) => setQuoteCalendar(e.target.value as 'ETHIOPIAN' | 'GREGORIAN')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium bg-white"
              >
                <option value="ETHIOPIAN">{t.ethiopianCalendar}</option>
                <option value="GREGORIAN">{t.gregorianCalendar}</option>
              </select>
            </div>
            <div>
              <label htmlFor="secondary-currency-select" className="font-semibold text-slate-700 block mb-1">Secondary Currency Snapshot</label>
              <select
                id="secondary-currency-select"
                value={secondaryCurrency}
                onChange={(e) => setSecondaryCurrency(e.target.value as 'NONE' | 'USD' | 'EUR')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium bg-white"
              >
                <option value="NONE">None (ETB Only)</option>
                <option value="USD">USD (Snapshot ~155.0 ETB)</option>
                <option value="EUR">EUR (Snapshot ~165.0 ETB)</option>
              </select>
            </div>

            {/* Ethiopian / Gregorian Date Picker */}
            <div className="col-span-1 md:col-span-3 pt-2">
              <EthiopianDatePicker
                value={validUntilDate}
                onChange={(iso) => setValidUntilDate(iso)}
                locale={locale}
                defaultCalendar={quoteCalendar}
                label={locale === 'am' ? 'የዋጋ ማቅረቢያው የሚያበቃበት ቀን' : 'Quote Validity Date'}
              />
            </div>
          </div>

          {/* Per-line Visibility Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{t.perLineVisibility}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Control what the client sees: individual price, scope description only, or aggregated package group.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Internal Hours & Margins Strict Privacy Guarantee</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200 text-left">
                  <tr>
                    <th className="py-2.5 px-3">Deliverable Line</th>
                    <th className="py-2.5 px-3 w-48">Visibility Mode</th>
                    <th className="py-2.5 px-3 w-48">Group Name (If Merged)</th>
                    <th className="py-2.5 px-3 text-right w-36">Investment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          aria-label={`Visibility mode for ${item.title}`}
                          value={item.visibility}
                          onChange={(e) => {
                            const newMode = e.target.value as 'SHOW_PRICE' | 'DESCRIPTION_ONLY' | 'MERGE_GROUP';
                            setLineItems((prev) =>
                              prev.map((l, i) => (i === idx ? { ...l, visibility: newMode } : l)),
                            );
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:border-emerald-500"
                        >
                          <option value="SHOW_PRICE">{t.showPrice}</option>
                          <option value="DESCRIPTION_ONLY">{t.descriptionOnly}</option>
                          <option value="MERGE_GROUP">{t.mergeGroup}</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.visibility === 'MERGE_GROUP' ? (
                          <input
                            type="text"
                            placeholder="e.g. Core Suite"
                            value={item.groupName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLineItems((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, groupName: val } : l)),
                              );
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.visibility === 'DESCRIPTION_ONLY' ? (
                          <span className="text-emerald-600 font-semibold italic text-[11px]">Included</span>
                        ) : (
                          formatMoney(item.priceMinor)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Milestones Configuration */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t.paymentMilestones}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select a standard Ethiopian delivery preset or define customized milestones summing to 100%.
                </p>
              </div>

              {/* Preset Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => applyPreset('30/40/30')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    milestonePreset === '30/40/30' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 / 40 / 30
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('50/50')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    milestonePreset === '50/50' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  50 / 50
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('25/25/25/25')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    milestonePreset === '25/25/25/25' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  25 × 4
                </button>
              </div>
            </div>

            {/* Milestones Schedule Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200 text-left">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Stage</th>
                    <th className="py-2.5 px-3">Milestone Deliverable</th>
                    <th className="py-2.5 px-3 w-28 text-center">Share (%)</th>
                    <th className="py-2.5 px-3 text-right w-36">Calculated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {milestones.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold text-slate-500">Stage {idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          aria-label={`Milestone title for stage ${idx + 1}`}
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMilestones((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item)),
                            );
                            setMilestonePreset('CUSTOM');
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            aria-label={`Milestone percentage for stage ${idx + 1}`}
                            type="number"
                            min="0"
                            max="100"
                            value={m.percentage}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setMilestones((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, percentage: val } : item)),
                              );
                              setMilestonePreset('CUSTOM');
                            }}
                            className="w-16 px-2 py-1 rounded border border-slate-200 text-xs font-bold text-center focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-500 font-bold">%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatMoney(Math.round((calculatedTotal * m.percentage) / 100))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Validation Indicator */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isMilestonesValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2">
                {isMilestonesValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>
                  {isMilestonesValid
                    ? 'Milestones total exactly 100.0% (Valid payment schedule)'
                    : `Milestone sum is ${totalMilestonePercentage.toFixed(1)}%. Must equal exactly 100%.`}
                </span>
              </div>
              <span className="font-mono font-bold text-sm">{totalMilestonePercentage}%</span>
            </div>
          </div>

          {/* Statutory Taxes & Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWithholding}
                  onChange={(e) => setIncludeWithholding(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Include 3% Domestic Withholding Tax Note</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Itemizes client domestic service tax deduction and net cash receivable expectation on final invoice.
              </p>
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-semibold text-slate-900">{formatMoney(calculatedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (15% Proclamation 1341/2024):</span>
                <span className="font-semibold text-slate-900">{formatMoney(calculatedVat)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-emerald-800">
                <span>Total Project Investment:</span>
                <span className="text-base text-emerald-700">{formatMoney(calculatedTotal)}</span>
              </div>
              {secondaryCurrency !== 'NONE' && (
                <div className="text-[11px] text-slate-500 pt-0.5">
                  Approx. Equivalent: ~
                  {secondaryCurrency === 'USD'
                    ? `$${(calculatedTotal / 155 / 100).toFixed(2)} USD`
                    : `€${(calculatedTotal / 165 / 100).toFixed(2)} EUR`}{' '}
                  (Snapshot conversion)
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!isMilestonesValid}
              onClick={handleCreateQuote}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-colors shadow-sm ${
                isMilestonesValid ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Quote Draft</span>
            </button>
          </div>
        </div>
      )}

      {/* Quotes Listing */}
      <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {quote.quoteNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 tracking-tight">{quote.title}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    quote.status === 'ISSUED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {quote.status === 'ISSUED' && <Lock className="w-3 h-3 text-emerald-600" />}
                  <span>{quote.status === 'ISSUED' ? t.issuedStatus : t.draftStatus}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {quote.language === 'am' ? 'አማርኛ' : 'EN'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {quote.calendar === 'ETHIOPIAN' ? 'ዓ.ም. (E.C.)' : 'እ.ኤ.አ (G.C.)'}
                </span>
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  Client: <strong className="text-slate-700">{quote.clientName}</strong>
                </span>
                <span>•</span>
                <span>
                  Valid Until:{' '}
                  <strong className="text-slate-700">
                    {quote.calendar === 'ETHIOPIAN' || locale === 'am'
                      ? formatEthiopianDate(new Date(quote.validUntil), { locale })
                      : new Date(quote.validUntil).toLocaleDateString()}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Tax Pack: <strong className="text-emerald-700">v{quote.taxPackVersion}</strong>
                </span>
                {quote.secondaryCurrency && (
                  <>
                    <span>•</span>
                    <span>
                      Dual Currency: <strong className="text-slate-700">{quote.secondaryCurrency} Snapshot</strong>
                    </span>
                  </>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-600 flex items-center gap-4 pt-1">
                <span>
                  Subtotal: <span className="text-slate-900 font-bold">{formatMoney(quote.subtotalMinor)}</span>
                </span>
                <span>+</span>
                <span>
                  VAT (15%): <span className="text-slate-900 font-bold">{formatMoney(quote.vatAmountMinor)}</span>
                </span>
                <span>=</span>
                <span className="text-emerald-700 font-bold text-sm">
                  Total: {formatMoney(quote.totalPriceMinor)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={() => {
                  setSelectedQuote(quote);
                  setIsPreviewOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>{t.previewQuote}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedQuote(quote);
                  setIsPreviewOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t.exportPdf}</span>
              </button>

              {quote.status !== 'ISSUED' && (
                <button
                  onClick={() => handleIssueQuote(quote.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.issueQuoteButton}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Afro Digital Fullscreen Branded Preview Modal */}
      {selectedQuote && (
        <QuotePreviewModal
          quote={selectedQuote}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownloadPdf={() => {
            window.print();
          }}
        />
      )}
    </div>
  );
};
