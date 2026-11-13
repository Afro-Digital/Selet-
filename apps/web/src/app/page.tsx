'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [userRole, setUserRole] = useState<UserRole>('OWNER');
  const [activeTab, setActiveTab] = useState<
    'people' | 'roles' | 'rate-cards' | 'catalog' | 'currency' | 'estimates' | 'scale' | 'pricing' | 'quotes'
  >('people');

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
    // Refresh automated feeds (keeps manual overrides untouched)
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              ስ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Selet (ስሌት)
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  v0.1.0 Stage 9
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell
              notifications={notifications}
              locale={locale}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all ${
                  locale === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('am')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all ${
                  locale === 'am'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                አማርኛ
              </button>
            </div>

            {/* Role Simulator Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200 text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 hidden md:inline">{t.simulatedRole}:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="OWNER">{t.roleOwner}</option>
                <option value="PM">{t.rolePm}</option>
                <option value="DEVELOPER">{t.roleDeveloper}</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Team Members */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{t.teamMembers}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{people.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {people.filter((p) => p.isEthiopianNational).length} with 11% POESSA
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Productive Hours */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{t.productiveHours}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalProductiveHours} hrs</p>
              <p className="text-xs text-slate-400 mt-0.5">Monthly productive capacity</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Blended Hourly Cost (Owner Only) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {locale === 'am' ? 'አማካይ የሰዓት ወጪ' : 'Blended Hourly Cost'}
              </p>
              {isOwner ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {formatCurrencyMinor(blendedHourlyCostMinor, 'ETB')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Weighted team labor floor</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>{t.confidentialHidden}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Owner account required</p>
                </>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Live USD/ETB Exchange Rate */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">USD / ETB Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {usdRate.toFixed(2)} ETB
              </p>
              <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NBE / Effective</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('people')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'people'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.teamMembers}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {people.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'roles'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t.jobRoles}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {roles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rate-cards')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'rate-cards'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.rateCards}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {rateCards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.costCatalog}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {catalogItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'currency'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{t.currencyService}</span>
          </button>

          <button
            onClick={() => setActiveTab('estimates')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'estimates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.estimates}</span>
          </button>

          <button
            onClick={() => setActiveTab('scale')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'scale'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.scaleAndRisk}</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'pricing'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t.pricingAndMargins}</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'quotes'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.quotesAndPdf}</span>
          </button>
        </div>

        {/* Active Tab Views */}
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
          <div className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          <div className="space-y-8">
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
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        roles={roles}
        locale={locale}
        onAddPerson={handleAddPerson}
      />
    </main>
  );
}
