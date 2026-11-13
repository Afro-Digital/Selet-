'use client';

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Person,
  Role,
  RateCard,
  CatalogItem,
  ExchangeRate,
  ExchangeRateHistory,
  InAppNotification,
} from '../types';
import { Locale, translations } from '../lib/i18n';
import {
  INITIAL_PEOPLE,
  INITIAL_ROLES,
  INITIAL_RATE_CARDS,
  INITIAL_CATALOG_ITEMS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_NOTIFICATIONS,
} from '../lib/mock-data';
import { formatCurrencyMinor } from '../lib/person-cost';
import { PeopleTable } from '../components/people/PeopleTable';
import { AddPersonModal } from '../components/people/AddPersonModal';
import { RolesList } from '../components/roles/RolesList';
import { RateCardsList } from '../components/rate-cards/RateCardsList';
import { CatalogList } from '../components/catalog/CatalogList';
import { CurrencyWidget } from '../components/currency/CurrencyWidget';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { EstimateBuilder } from '../components/estimates/EstimateBuilder';
import { ScaleEstimator } from '../components/scale/ScaleEstimator';
import { RiskManager, RiskFactorUi } from '../components/risk/RiskManager';
import { ProjectCostSummaryCard } from '../components/cost/ProjectCostSummaryCard';
import { CommercialFloorGuard } from '../components/pricing/CommercialFloorGuard';
import { PricingScenariosCard } from '../components/pricing/PricingScenariosCard';
import { MarginBalancer, ModuleLineItem } from '../components/pricing/MarginBalancer';
import { QuoteBuilder } from '../components/quotes/QuoteBuilder';
import { ReportsDashboard } from '../components/reports/ReportsDashboard';
import { LegalDisclaimerModal } from '../components/legal/LegalDisclaimerModal';
import {
  Users,
  Briefcase,
  CreditCard,
  Package,
  Languages,
  Shield,
  Clock,
  Coins,
  CheckCircle2,
  Lock,
  Layers,
  TrendingUp,
  Tag,
  FileText,
  Calendar,
  BarChart3,
  Scale,
  Sun,
  Moon,
  Search,
  ChevronRight,
  SlidersHorizontal,
  FolderKanban,
  Check,
} from 'lucide-react';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [calendarPreference, setCalendarPreference] = useState<'ETHIOPIAN' | 'GREGORIAN'>('ETHIOPIAN');
  const [userRole, setUserRole] = useState<UserRole>('OWNER');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<
    'people' | 'roles' | 'rate-cards' | 'catalog' | 'currency' | 'estimates' | 'scale' | 'pricing' | 'quotes' | 'reports'
  >('people');

  // Theme synchronization with document class and localStorage
  useEffect(() => {
    const saved = (localStorage.getItem('selet_theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('selet_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [rateCards, setRateCards] = useState<RateCard[]>(INITIAL_RATE_CARDS);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(INITIAL_CATALOG_ITEMS);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(INITIAL_EXCHANGE_RATES);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRateHistory[]>([
    {
      id: 'h-1',
      fromCurrency: 'USD',
      toCurrency: 'ETB',
      rate: 128.5,
      source: 'National Bank of Ethiopia (NBE)',
      isManualOverride: false,
      capturedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'h-2',
      fromCurrency: 'EUR',
      toCurrency: 'ETB',
      rate: 138.2,
      source: 'National Bank of Ethiopia (NBE)',
      isManualOverride: false,
      capturedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Stage 8 Risk & Scale State
  const [contingencyRate, setContingencyRate] = useState<number>(0.1);
  const [overheadRate, setOverheadRate] = useState<number>(0.1);
  const [riskFactors, setRiskFactors] = useState<RiskFactorUi[]>([
    {
      id: 'unclear_reqs',
      name: 'Unclear or Evolving Requirements',
      multiplier: 0.05,
      isEnabled: true,
    },
    {
      id: 'frequent_changes',
      name: 'Frequent Scope Changes Expected',
      multiplier: 0.05,
      isEnabled: false,
    },
    {
      id: 'new_technology',
      name: 'New / Unfamiliar Technology Stack',
      multiplier: 0.08,
      isEnabled: true,
    },
    {
      id: 'tight_deadline',
      name: 'Tight Deadline / Urgent Delivery',
      multiplier: 0.05,
      isEnabled: false,
    },
  ]);
  const [clientMonthlyRecurringMinor, setClientMonthlyRecurringMinor] = useState<number>(2212250);
  const [agencyMonthlyRecurringMinor, setAgencyMonthlyRecurringMinor] = useState<number>(334100);

  // Stage 9 Pricing & Margin Balancer State
  const [organizationFloorMargin] = useState<number>(0.15);
  const [isOwnerApprovedBelowFloor, setIsOwnerApprovedBelowFloor] = useState<boolean>(false);
  const [pricingBlendedMargin, setPricingBlendedMargin] = useState<number>(0.3);
  const [marketRangeMin, setMarketRangeMin] = useState<number>(60000);
  const [marketRangeMax, setMarketRangeMax] = useState<number>(90000);
  const [pricingLines] = useState<ModuleLineItem[]>([
    {
      id: 'mod-a',
      name: 'Module A (Core Features & API)',
      costMinor: 200000, // 2,000 ETB
      margin: 0.25, // 25%
      floorMargin: 0.15,
      ceilingMargin: 0.6,
    },
    {
      id: 'mod-b',
      name: 'Module B (Storefront & Checkout)',
      costMinor: 200000, // 2,000 ETB
      margin: 0.35, // 35%
      floorMargin: 0.15,
      ceilingMargin: 0.6,
    },
  ]);

  const t = translations[locale];
  const isOwner = userRole === 'OWNER';

  // Metrics
  const totalProductiveHours = people.reduce(
    (sum, p) => sum + (p.computedHourlyCost?.productiveHoursPerMonth || 0),
    0,
  );

  const totalMonthlyCostMinor = people.reduce(
    (acc, p) => acc + BigInt(p.computedHourlyCost?.totalMonthlyCostMinor || '0'),
    0n,
  );

  const blendedHourlyCostMinor =
    totalProductiveHours > 0
      ? (totalMonthlyCostMinor / BigInt(totalProductiveHours)).toString()
      : '0';

  const usdRate = exchangeRates.find((r) => r.fromCurrency === 'USD')?.rate || 128.5;

  // Actions: People & Roles
  const handleUpdatePerson = (updated: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPerson = (newPerson: Person) => {
    setPeople((prev) => [newPerson, ...prev]);
  };

  const handleAddRole = (newRole: Role) => {
    setRoles((prev) => [...prev, newRole]);
  };

  const handleAddRateCard = (newCard: RateCard) => {
    setRateCards((prev) => [...prev, newCard]);
  };

  const handleSetDefaultRateCard = (id: string) => {
    setRateCards((prev) =>
      prev.map((rc) => ({
        ...rc,
        isDefault: rc.id === id,
      })),
    );
  };

  // Actions: Cost Catalog
  const handleAddCatalogItem = (item: CatalogItem) => {
    setCatalogItems((prev) => [item, ...prev]);
  };

  const handleVerifyCatalogItem = (id: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, verifiedAt: new Date().toISOString(), isStale: false } : item,
      ),
    );
    // Dismiss corresponding stale notification
    setNotifications((prev) =>
      prev.filter((n) => !(n.type === 'STALE_CATALOG_PRICE' && n.entityId === id)),
    );
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalogItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSeedExamples = () => {
    setCatalogItems(INITIAL_CATALOG_ITEMS);
  };

  const handleRemoveExamples = () => {
    setCatalogItems((prev) => prev.filter((item) => !item.isExample));
  };

  // Actions: Currency Service
  const handleSetManualOverride = (fromCurrency: string, rate: number) => {
    setExchangeRates((prev) =>
      prev.map((r) =>
        r.fromCurrency === fromCurrency
          ? {
              ...r,
              rate,
              source: 'MANUAL_OVERRIDE',
              isManualOverride: true,
              effectiveAt: new Date().toISOString(),
            }
          : r,
      ),
    );

    setExchangeHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        fromCurrency,
        toCurrency: 'ETB',
        rate,
        source: 'MANUAL_OVERRIDE',
        isManualOverride: true,
        capturedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleClearOverride = (fromCurrency: string) => {
    const baseline = fromCurrency === 'USD' ? 128.5 : 138.2;
    setExchangeRates((prev) =>
      prev.map((r) =>
        r.fromCurrency === fromCurrency
          ? {
              ...r,
              rate: baseline,
              source: 'National Bank of Ethiopia (NBE)',
              isManualOverride: false,
              effectiveAt: new Date().toISOString(),
            }
          : r,
      ),
    );

    setExchangeHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        fromCurrency,
        toCurrency: 'ETB',
        rate: baseline,
        source: 'NBE_AUTOMATIC',
        isManualOverride: false,
        capturedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleRefreshFeed = () => {
    setExchangeRates((prev) =>
      prev.map((r) => {
        if (r.isManualOverride) return r;
        const base = r.fromCurrency === 'USD' ? 128.5 : 138.2;
        const newRate = Math.round((base + (Math.random() * 0.4 - 0.2)) * 100) / 100;
        return {
          ...r,
          rate: newRate,
          source: 'National Bank of Ethiopia (NBE)',
          effectiveAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Actions: Notifications
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const isDark = theme === 'dark';

  // Navigation tab definitions
  const coreNavItems = [
    { id: 'estimates', label: t.estimates, icon: Layers },
    { id: 'scale', label: t.scaleAndRisk, icon: TrendingUp },
    { id: 'pricing', label: t.pricingAndMargins, icon: Tag },
    { id: 'quotes', label: t.quotesAndPdf, icon: FileText },
    { id: 'reports', label: t.reports, icon: BarChart3 },
  ] as const;

  const masterDataNavItems = [
    { id: 'people', label: t.teamMembers, icon: Users, count: people.length },
    { id: 'roles', label: t.jobRoles, icon: Briefcase, count: roles.length },
    { id: 'rate-cards', label: t.rateCards, icon: CreditCard, count: rateCards.length },
    { id: 'catalog', label: t.costCatalog, icon: Package, count: catalogItems.length },
    { id: 'currency', label: t.currencyService, icon: Coins },
  ] as const;

  const currentTabLabel =
    [...coreNavItems, ...masterDataNavItems].find((item) => item.id === activeTab)?.label ||
    'Dashboard';

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#fafafa] transition-colors duration-150">
      {/* 1. Settle-941 Slim Icon Rail (tablet: 64px) */}
      <aside
        aria-hidden="true"
        className="fixed inset-y-0 left-0 z-40 hidden w-16 shrink-0 flex-col items-center border-r border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121212] md:flex lg:hidden"
      >
        <div className="flex h-14 shrink-0 items-center">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] font-semibold text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
            ስ
          </span>
        </div>
        <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.08]" />
        <nav className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto py-3">
          {[...coreNavItems, ...masterDataNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                title={item.label}
                aria-label={item.label}
                className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. Settle-941 Full Desktop Sidebar (desktop: 252px) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] shrink-0 flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121212] lg:flex">
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] font-black text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
              ስ
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">
                  Selet (ስሌት)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[5px] bg-black/[0.05] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 font-medium">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {locale === 'am' ? 'የሶፍትዌር ወጪ እና ዋጋ' : 'Software Cost & Pricing'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Core Operations Group */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {locale === 'am' ? 'ዋና ተግባራት' : 'Core Operations'}
            </div>
            <nav className="space-y-0.5">
              {coreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-inherit' : 'text-neutral-400 dark:text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Master Data & Rates Group */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {locale === 'am' ? 'መሰረታዊ መረጃና ተመኖች' : 'Master Data & Rates'}
            </div>
            <nav className="space-y-0.5">
              {masterDataNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-inherit' : 'text-neutral-400 dark:text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.2 rounded-[5px] ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-neutral-950'
                            : 'bg-black/[0.05] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{locale === 'am' ? 'ሲስተም ንቁ' : 'System Live'}</span>
            </span>
            <span className="font-mono text-[10px]">Proc 1341/979</span>
          </div>
        </div>
      </aside>

      {/* 3. Main Content Area */}
      <div className="md:pl-16 lg:pl-[252px] min-h-screen flex flex-col">
        {/* Sticky Frosted Header */}
        <header className="sticky top-0 z-30 h-14 w-full backdrop-blur-[6px] border-b border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#121212]/85 px-4 sm:px-6 flex items-center justify-between transition-colors">
          {/* Left: Breadcrumbs & Search */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2 mr-1">
              <span className="grid h-7 w-7 place-items-center rounded-[8px] font-black text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                ስ
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white">Selet (ስሌት)</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                {currentTabLabel}
              </span>
            </div>

            {/* Quick Search Box */}
            <div className="hidden xl:flex items-center gap-2 pl-4">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={locale === 'am' ? 'ፈልግ...' : 'Search rates, catalog...'}
                  className="h-8 pl-8 pr-8 text-xs rounded-[10px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 w-48 transition-all focus:w-64"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08]">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Notification Bell */}
            <NotificationBell
              notifications={notifications}
              locale={locale}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

            {/* Ethiopian Calendar Switcher */}
            <div
              className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-[7px] p-0.5 border border-black/[0.06] dark:border-white/[0.08]"
              title={t.calendarPreference}
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1" />
              <button
                type="button"
                onClick={() => setCalendarPreference('ETHIOPIAN')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-[5px] transition-all ${
                  calendarPreference === 'ETHIOPIAN'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                ዓ.ም.
              </button>
              <button
                type="button"
                onClick={() => setCalendarPreference('GREGORIAN')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-[5px] transition-all ${
                  calendarPreference === 'GREGORIAN'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                G.C.
              </button>
            </div>

            {/* Segmented Language Switcher [ EN | አማርኛ ] */}
            <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-[7px] p-0.5 border border-black/[0.06] dark:border-white/[0.08]">
              <Languages className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLocale('en')}
                className={`w-9 py-0.5 text-center text-xs font-semibold rounded-[5px] transition-all ${
                  locale === 'en'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('am')}
                className={`px-2 py-0.5 text-center text-xs font-semibold rounded-[5px] transition-all ${
                  locale === 'am'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                አማርኛ
              </button>
            </div>

            {/* Role Simulator Selector */}
            <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-[7px] px-2.5 py-1 border border-black/[0.06] dark:border-white/[0.08] text-xs">
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-500 dark:text-neutral-400 hidden md:inline">{t.simulatedRole}:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent font-semibold text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none cursor-pointer"
              >
                <option value="OWNER" className="dark:bg-neutral-900">{t.roleOwner}</option>
                <option value="PM" className="dark:bg-neutral-900">{t.rolePm}</option>
                <option value="DEVELOPER" className="dark:bg-neutral-900">{t.roleDeveloper}</option>
              </select>
            </div>

            {/* Legal Disclaimer Button */}
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              title={t.legalDisclaimer}
              aria-label={t.legalDisclaimer}
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.legalDisclaimer}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="grid h-8 w-8 place-items-center rounded-[8px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Settle-941 High-Density KPI Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Tile 1: Team Members */}
            <div className="p-4 rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {t.teamMembers}
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                  {people.length}
                </p>
                <p className="text-[11.5px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {people.filter((p) => p.isEthiopianNational).length} with 11% POESSA
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Tile 2: Monthly Productive Hours */}
            <div className="p-4 rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {t.productiveHours}
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                  {totalProductiveHours} <span className="text-sm font-normal text-neutral-400">hrs</span>
                </p>
                <p className="text-[11.5px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Monthly productive capacity
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Tile 3: Blended Hourly Cost (Owner Only) */}
            <div className="p-4 rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {locale === 'am' ? 'አማካይ የሰዓት ወጪ' : 'Blended Hourly Cost'}
                </p>
                {isOwner ? (
                  <>
                    <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrencyMinor(blendedHourlyCostMinor, 'ETB')}
                    </p>
                    <p className="text-[11.5px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Weighted team labor floor
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-neutral-400 mt-2 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>{t.confidentialHidden}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Owner account required</p>
                  </>
                )}
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Tile 4: Live USD/ETB Rate */}
            <div className="p-4 rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  USD / ETB Rate
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                  {usdRate.toFixed(2)} <span className="text-sm font-normal text-neutral-400">ETB</span>
                </p>
                <p className="text-[11.5px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>NBE / Effective</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Tab Views */}
          <div className="transition-opacity duration-150">
            {activeTab === 'people' && (
              <PeopleTable
                people={people}
                roles={roles}
                userRole={userRole}
                locale={locale}
                onUpdatePerson={handleUpdatePerson}
                onDeletePerson={handleDeletePerson}
                onOpenAddModal={() => setIsAddPersonModalOpen(true)}
              />
            )}

            {activeTab === 'roles' && (
              <RolesList roles={roles} userRole={userRole} locale={locale} onAddRole={handleAddRole} />
            )}

            {activeTab === 'rate-cards' && (
              <RateCardsList
                rateCards={rateCards}
                roles={roles}
                userRole={userRole}
                locale={locale}
                onAddRateCard={handleAddRateCard}
                onSetDefault={handleSetDefaultRateCard}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogList
                items={catalogItems}
                userRole={userRole}
                locale={locale}
                onAddItem={handleAddCatalogItem}
                onVerifyItem={handleVerifyCatalogItem}
                onDeleteItem={handleDeleteCatalogItem}
                onSeedExamples={handleSeedExamples}
                onRemoveExamples={handleRemoveExamples}
              />
            )}

            {activeTab === 'currency' && (
              <CurrencyWidget
                rates={exchangeRates}
                history={exchangeHistory}
                userRole={userRole}
                locale={locale}
                onSetOverride={handleSetManualOverride}
                onClearOverride={handleClearOverride}
                onRefreshFeed={handleRefreshFeed}
              />
            )}

            {activeTab === 'estimates' && (
              <EstimateBuilder
                t={t}
                simulatedRole={userRole}
                currentUserId="user-dev-1"
                roles={roles.map((r) => ({
                  id: r.id,
                  name: r.name,
                  defaultHourlyCostMinor: Number(r.defaultHourlyCostMinor || 0),
                }))}
                users={[
                  { id: 'user-owner', name: 'Alazar Owner', email: 'owner@addis.dev', role: 'OWNER' },
                  { id: 'user-pm', name: 'Bethel PM', email: 'pm@addis.dev', role: 'PM' },
                  {
                    id: 'user-dev-1',
                    name: 'Dawit Developer',
                    email: 'dawit@addis.dev',
                    role: 'DEVELOPER',
                  },
                  {
                    id: 'user-dev-2',
                    name: 'Hiwot Developer',
                    email: 'hiwot@addis.dev',
                    role: 'DEVELOPER',
                  },
                ]}
              />
            )}

            {activeTab === 'scale' && (
              <div className="space-y-6">
                <ProjectCostSummaryCard
                  t={t}
                  userRole={userRole}
                  data={{
                    currency: 'ETB',
                    totalHours: 120,
                    laborCostMinor: 5000000,
                    toolsCostMinor: 0,
                    agencyInfrastructureCostMinor: agencyMonthlyRecurringMinor,
                    thirdPartyCostMinor: 0,
                    directCostMinor: 5000000 + agencyMonthlyRecurringMinor,
                    totalRiskRate:
                      contingencyRate +
                      riskFactors
                        .filter((rf) => rf.isEnabled)
                        .reduce((sum, rf) => sum + rf.multiplier, 0),
                    riskCostMinor: Math.round(
                      (5000000 + agencyMonthlyRecurringMinor) *
                        (contingencyRate +
                          riskFactors
                            .filter((rf) => rf.isEnabled)
                            .reduce((sum, rf) => sum + rf.multiplier, 0)),
                    ),
                    subtotalWithRiskMinor:
                      5000000 +
                      agencyMonthlyRecurringMinor +
                      Math.round(
                        (5000000 + agencyMonthlyRecurringMinor) *
                          (contingencyRate +
                            riskFactors
                              .filter((rf) => rf.isEnabled)
                              .reduce((sum, rf) => sum + rf.multiplier, 0)),
                      ),
                    overheadRate,
                    overheadCostMinor: Math.round(
                      (5000000 +
                        agencyMonthlyRecurringMinor +
                        Math.round(
                          (5000000 + agencyMonthlyRecurringMinor) *
                            (contingencyRate +
                              riskFactors
                                .filter((rf) => rf.isEnabled)
                                .reduce((sum, rf) => sum + rf.multiplier, 0)),
                        )) *
                        overheadRate,
                    ),
                    totalCostMinor:
                      5000000 +
                      agencyMonthlyRecurringMinor +
                      Math.round(
                        (5000000 + agencyMonthlyRecurringMinor) *
                          (contingencyRate +
                            riskFactors
                              .filter((rf) => rf.isEnabled)
                              .reduce((sum, rf) => sum + rf.multiplier, 0)),
                      ) +
                      Math.round(
                        (5000000 +
                          agencyMonthlyRecurringMinor +
                          Math.round(
                            (5000000 + agencyMonthlyRecurringMinor) *
                              (contingencyRate +
                                riskFactors
                                  .filter((rf) => rf.isEnabled)
                                  .reduce((sum, rf) => sum + rf.multiplier, 0)),
                          )) *
                          overheadRate,
                      ),
                    clientRecurringMonthlyMinor: clientMonthlyRecurringMinor,
                  }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <RiskManager
                      t={t}
                      userRole={userRole}
                      contingencyRate={contingencyRate}
                      overheadRate={overheadRate}
                      riskFactors={riskFactors}
                      onContingencyChange={setContingencyRate}
                      onOverheadChange={setOverheadRate}
                      onRiskFactorsChange={setRiskFactors}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ScaleEstimator
                      t={t}
                      userRole={userRole}
                      currency="ETB"
                      usdRate={usdRate}
                      onMonthlyRecurringChange={(clientMinor, agencyMinor) => {
                        setClientMonthlyRecurringMinor(clientMinor);
                        setAgencyMonthlyRecurringMinor(agencyMinor);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <CommercialFloorGuard
                  t={t}
                  userRole={userRole}
                  currentMargin={pricingBlendedMargin}
                  floorMargin={organizationFloorMargin}
                  isOwnerApproved={isOwnerApprovedBelowFloor}
                  onApprove={() => setIsOwnerApprovedBelowFloor(true)}
                  onRevoke={() => setIsOwnerApprovedBelowFloor(false)}
                />

                <PricingScenariosCard
                  t={t}
                  userRole={userRole}
                  currency="ETB"
                  scenarios={{
                    low: {
                      name: 'Conservative / Low',
                      costMinor: 3400000,
                      priceMinor: 4000000,
                      profitMinor: 600000,
                      margin: 0.15,
                    },
                    recommended: {
                      name: 'Recommended',
                      costMinor: 4000000,
                      priceMinor: 5714286,
                      profitMinor: 1714286,
                      margin: 0.3,
                    },
                    high: {
                      name: 'Stretch / High',
                      costMinor: 5000000,
                      priceMinor: 8333333,
                      profitMinor: 3333333,
                      margin: 0.4,
                    },
                  }}
                  marketRangeMin={marketRangeMin}
                  marketRangeMax={marketRangeMax}
                  onMarketRangeChange={(min, max) => {
                    setMarketRangeMin(min);
                    setMarketRangeMax(max);
                  }}
                />

                <MarginBalancer
                  t={t}
                  userRole={userRole}
                  currency="ETB"
                  initialLines={pricingLines}
                  initialBlendedMargin={0.3}
                  floorMargin={organizationFloorMargin}
                  onBlendedMarginChange={(blended) => {
                    setPricingBlendedMargin(blended);
                  }}
                />
              </div>
            )}

            {activeTab === 'quotes' && (
              <QuoteBuilder
                t={t}
                locale={locale}
                userRole={userRole}
                projectId="proj-1"
                projectName="E-Commerce Platform with Chapa & Telebirr"
                pricingModules={pricingLines.map((l) => ({
                  id: l.id,
                  name: l.name,
                  priceMinor: Math.round(l.costMinor / (1 - l.margin)),
                }))}
                clientMonthlyRecurringMinor={clientMonthlyRecurringMinor}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsDashboard t={t} locale={locale} userRole={userRole} />
            )}
          </div>
        </main>

        {/* Accessible Footer with Release Version v1.0.0 and Disclaimer */}
        <footer className="w-full border-t border-black/[0.06] dark:border-white/[0.08] mt-12 py-6 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-white">Selet (ስሌት) v1.0.0</span>
              <span>•</span>
              <span>Open-source software pricing platform for Ethiopia (Apache-2.0)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLegalModalOpen(true)}
                className="text-amber-700 dark:text-amber-400 hover:underline font-semibold underline-offset-4 flex items-center gap-1 focus:outline-none cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{t.legalDisclaimer}</span>
              </button>
              <span>•</span>
              <span className="font-mono text-neutral-400">afrodigital.dev</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        roles={roles}
        locale={locale}
        onAddPerson={handleAddPerson}
      />

      <LegalDisclaimerModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        t={t}
        locale={locale}
      />
    </div>
  );
}
