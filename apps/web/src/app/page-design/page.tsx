'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  SlidersHorizontal,
  Scale,
  FileText,
  Building2,
  Receipt,
  Users,
  Calendar,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  AlertTriangle,
  Globe,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function PageDesignPreview() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'30d' | '7d' | '90d'>('30d');
  const [discountPercent, setDiscountPercent] = useState<number>(5);

  const t = {
    en: {
      appName: 'Selet ስሌት',
      orgName: 'Afro Digital Solutions',
      accountLabel: 'acq_ethio · live',
      overview: 'Overview',
      wbsMatrix: 'WBS Matrix',
      marginBalancer: 'Margin Balancer',
      scaleEstimator: 'Scale Estimator',
      rateCards: 'Rate Cards',
      costCatalog: 'Cost Catalog',
      quotes: 'Quotes & Invoices',
      reports: 'Profit Reconciliation',
      operations: 'Operations',
      pricing: 'Pricing Engine',
      compliance: 'Compliance & Tax',
      fiscalClose: 'Fiscal Milestone',
      cutOffText: 'Active Month: Tikimt 2019 E.C. · POESSA 11% & VAT 15% compliant',
      exportSummary: 'Export Summary',
      newEstimate: 'New Project Estimate',
      bannerTitle: 'Target Blended Margin: 32.5% (Above 30% target, well above 15% floor)',
      bannerDesc: 'Across 4 active enterprise software estimates for Ethiopian banks and public utilities.',
      workQueue: 'Adjust Margins',
      netPipeline: 'Total Pipeline',
      settledRevenue: 'Contracted Revenue',
      taxReserve: 'Tax & POESSA Reserve',
      blendedMargin: 'Blended Margin',
      volumeTitle: 'Software Estimation & Labor Rollup',
      volumeSub: 'Direct labor vs infrastructure vs overhead · hover for detail',
      balanceTitle: 'Ethiopian Statutory Waterfall',
      balanceSub: 'VAT Proc. 1341/2016 · WHT Proc. 979/2016',
      grossQuote: 'Gross Base Quote',
      vatAmount: '15% VAT (Included in Invoice)',
      whtAmount: '2% Withholding Tax (Deducted at source)',
      netReceivable: 'Net Cash Expected',
      nextMilestone: 'Next Project Milestone',
      milestoneSub: 'Commercial Bank of Ethiopia · Core MVP',
      discountSimulator: 'What-If Discount Simulator',
      baseMargin: 'Original Margin: 32.5%',
      newMargin: 'Effective Margin',
      floorWarning: 'Warning: Margin below 15% organization floor!',
      safeMargin: 'Safe: Margin above organization floor',
    },
    am: {
      appName: 'ስሌት (Selet)',
      orgName: 'አፍሮ ዲጂታል ሶፍትዌር',
      accountLabel: 'የኢትዮጵያ ንግድ ባንክ · የቀጥታ',
      overview: 'አጠቃላይ እይታ',
      wbsMatrix: 'የስራ ዝርዝር ግምት (WBS)',
      marginBalancer: 'የትርፍ ማመጣጠኛ',
      scaleEstimator: 'የመጠን ማስያ',
      rateCards: 'የክፍያ ተመን',
      costCatalog: 'የመሳሪያዎች ካታሎግ',
      quotes: 'የዋጋ ማቅረቢያና ፕሮፎርማ',
      reports: 'የትርፍና ወጪ ሪፖርት',
      operations: 'የስራ ክንውኖች',
      pricing: 'የዋጋ ቀመር',
      compliance: 'ግብርና ደንቦች',
      fiscalClose: 'የበጀት ወር ማጠቃለያ',
      cutOffText: 'የበጀት ወር፡ ጥቅምት 2019 ዓ.ም · 15% ተ.እ.ታ እና 11% የጡረታ መዋጮ',
      exportSummary: 'ማጠቃለያ አውርድ',
      newEstimate: 'አዲስ የፕሮጀክት ግምት',
      bannerTitle: 'የተጣራ የትርፍ መጠን፡ 32.5% (ከ 30% ዒላማ በላይ፤ ከ 15% ወለል አስተማማኝ)',
      bannerDesc: 'በኢትዮጵያ ባንኮች እና የመንግስት ተቋማት ላሉ 4 ንቁ የሶፍትዌር ፕሮጀክቶች የተዘጋጀ።',
      workQueue: 'ትርፍ አስተካክል',
      netPipeline: 'አጠቃላይ የፕሮጀክቶች ዋጋ',
      settledRevenue: 'የተፈረመ የውል ዋጋ',
      taxReserve: 'የግብርና የጡረታ ተቀማጭ',
      blendedMargin: 'የተጣመረ ትርፍ',
      volumeTitle: 'የሶፍትዌር ግምት እና የሰው ኃይል ወጪ',
      volumeSub: 'ቀጥተኛ የጉልበት ወጪ፣ መሠረተ-ልማት እና ተጓዳኝ ወጪዎች',
      balanceTitle: 'የኢትዮጵያ የግብርና ታክስ ተዋረድ',
      balanceSub: 'ተ.እ.ታ አዋጅ 1341/2016 · 2% ቅድመ ግብር አዋጅ 979/2016',
      grossQuote: 'የፕሮጀክት ጠቅላላ ዋጋ',
      vatAmount: '15% ተ.እ.ታ (ተጨማሪ እሴት ታክስ)',
      whtAmount: '2% ቅድመ ግብር (ከምንጭ የሚቀነስ)',
      netReceivable: 'የተጣራ ገቢ',
      nextMilestone: 'ቀጣይ የርክክብ ምዕራፍ',
      milestoneSub: 'የኢትዮጵያ ንግድ ባንክ · ኮር ሲስተም',
      discountSimulator: 'የዋጋ ቅናሽ መሞከሪያ',
      baseMargin: 'የቀድሞ ትርፍ፡ 32.5%',
      newMargin: 'የአሁኑ ትርፍ',
      floorWarning: 'ማስጠንቀቂያ፡ ትርፉ ከተፈቀደው ዝቅተኛ ወለል (15%) አነሰ!',
      safeMargin: 'አስተማማኝ፡ ትርፉ ከተፈቀደው ወለል በላይ ነው',
    },
  }[lang];

  // Dynamic calculations based on discount
  const baseGrossMinor = 485000000n; // 4,850,000.00 ETB
  const discountMultiplier = (100 - discountPercent) / 100;
  const discountedGrossMinor = Number(baseGrossMinor) * discountMultiplier;
  const effectiveMargin = Math.max(0, 32.5 - discountPercent * 0.95);
  const isBelowFloor = effectiveMargin < 15;

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'dark bg-neutral-950 text-neutral-50' : 'bg-[#fafafa] text-neutral-950'}`}>
      <div className="flex min-h-screen w-full antialiased">
        {/* Settle-941 Slim Icon Aside (md:flex lg:hidden) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 shrink-0 flex-col items-center border-r border-black/[0.06] bg-white md:flex lg:hidden dark:border-white/[0.08] dark:bg-neutral-900">
          <div className="flex h-14 shrink-0 items-center">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-xs">
              ስ
            </span>
          </div>
          <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.08]" />
          <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-4">
            <button className="grid h-9 w-9 place-items-center rounded-[10px] bg-black/[0.06] text-neutral-900 dark:bg-white/[0.09] dark:text-neutral-50">
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-[10px] text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400">
              <Calculator className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-[10px] text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-[10px] text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400">
              <FileText className="h-4 w-4" />
            </button>
          </nav>
        </aside>

        {/* Settle-941 Full Sidebar (lg:flex) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] shrink-0 flex-col border-r border-black/[0.06] bg-white lg:flex 2xl:w-[276px] dark:border-white/[0.08] dark:bg-neutral-900">
          {/* Header Brand */}
          <div className="flex h-14 items-center gap-2.5 px-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-sm tracking-tight">
              ስ
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-[13px] font-semibold tracking-tight">{t.appName}</p>
              <p className="m-0 truncate text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">{t.accountLabel}</p>
            </div>
            <button type="button" className="ibtn-sm ml-auto" title="Switch organization">
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">{t.operations}</p>
              <a className="nav-item" data-on="1" href="#overview">
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.overview}</span>
              </a>
              <a className="nav-item" href="#wbs">
                <Calculator className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.wbsMatrix}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-black/[0.06] text-neutral-600 dark:bg-white/[0.09] dark:text-neutral-400">
                  12
                </span>
              </a>
              <a className="nav-item" href="#margin">
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.marginBalancer}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-emerald-50 text-emerald-800 dark:bg-emerald-500/[0.12] dark:text-emerald-200">
                  32.5%
                </span>
              </a>
              <a className="nav-item" href="#scale">
                <Scale className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.scaleEstimator}</span>
              </a>
            </div>

            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">{t.pricing}</p>
              <a className="nav-item" href="#rates">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.rateCards}</span>
              </a>
              <a className="nav-item" href="#catalog">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.costCatalog}</span>
              </a>
              <a className="nav-item" href="#quotes">
                <Receipt className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.quotes}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200">
                  3
                </span>
              </a>
            </div>

            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">{t.compliance}</p>
              <a className="nav-item" href="#reports">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t.reports}</span>
              </a>
            </div>
          </nav>

          {/* Settle-941 Fiscal Milestone Card */}
          <div className="p-4 pt-0">
            <div className="block w-full rounded-[12px] border border-black/[0.06] bg-neutral-50 p-3 text-left dark:border-white/[0.08] dark:bg-neutral-800/40">
              <div className="flex items-center gap-2">
                <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">{t.fiscalClose}</p>
                <span className="ml-auto text-[11px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                  ጥቅምት 2019
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                <span className="h-1.5 flex-1 rounded-full bg-black/[0.08] dark:bg-white/[0.12]" />
              </div>
              <p className="m-0 mt-2 text-[11.5px] font-medium leading-snug">{t.cutOffText}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex min-w-0 flex-1 flex-col md:pl-16 lg:pl-[252px] 2xl:pl-[276px]">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-black/[0.06] bg-white/85 px-4 backdrop-blur-[6px] sm:px-6 2xl:px-10 dark:border-white/[0.08] dark:bg-neutral-900/85">
            {/* Breadcrumb */}
            <nav className="flex min-w-0 items-center">
              <ol className="m-0 flex min-w-0 list-none items-center gap-1 p-0">
                <li className="min-w-0 hidden sm:block">
                  <a className="crumb-link truncate" href="#">
                    {t.appName}
                  </a>
                </li>
                <li className="hidden shrink-0 text-neutral-400 sm:block">
                  <ChevronRight className="h-3 w-3" />
                </li>
                <li className="min-w-0">
                  <span className="crumb-current truncate">{t.overview}</span>
                </li>
                <li className="ml-2">
                  <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300">
                    Settle-941 Theme Preview
                  </span>
                </li>
              </ol>
            </nav>

            {/* Search Input */}
            <div className="relative ml-auto hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                aria-label="Search"
                placeholder={lang === 'am' ? 'ግምት ወይም ደንበኛ ፈልግ...' : 'Search estimate, role or quote...'}
                className="h-8 w-[240px] rounded-[9px] border border-black/[0.08] bg-transparent pl-8 pr-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-neutral-400 2xl:w-[320px] dark:border-white/[0.12]"
                type="search"
              />
            </div>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="ibtn flex items-center gap-1 text-[11.5px] font-semibold w-auto px-2"
              title="Toggle Amharic / English"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="ibtn"
              title="Toggle Dark / Light Theme"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Notifications */}
            <button type="button" className="ibtn relative" title="Notifications">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
            </button>

            <span className="hidden h-5 w-px bg-black/[0.08] sm:block dark:bg-white/[0.12]" />

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white dark:bg-neutral-50 dark:text-neutral-900">
                AD
              </span>
              <span className="hidden md:block text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                Owner
              </span>
            </div>
          </header>

          {/* Main Dashboard Canvas */}
          <main className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 2xl:px-10">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">
              {/* Page Title & Actions */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="t-display m-0">{t.overview}</h1>
                  <p className="m-0 mt-1 text-[12.5px] text-neutral-500 dark:text-neutral-400">
                    {lang === 'am' ? 'ዓርብ ጥቅምት 4 ቀን 2019 ዓ.ም · የኢትዮጵያ ንግድ ባንክ የምንዛሬ ተመን 1 USD = 128.50 ETB' : 'Friday 13 November 2026 · Official NBE Benchmark 1 USD = 128.50 ETB'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="btn border border-black/[0.1] text-neutral-800 hover:bg-black/[0.04] dark:border-white/[0.14] dark:text-neutral-100">
                    <Download className="h-3.5 w-3.5" />
                    <span>{t.exportSummary}</span>
                  </button>
                  <button type="button" className="btn bg-[#007a55] text-white hover:bg-[#006244] shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.newEstimate}</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-500/[0.12] dark:text-emerald-200">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="min-w-[240px] flex-1">
                  <p className="t-row m-0 text-neutral-900 dark:text-neutral-100 font-semibold">{t.bannerTitle}</p>
                  <p className="t-meta m-0 mt-0.5 text-neutral-500 dark:text-neutral-400">{t.bannerDesc}</p>
                </div>
                <button type="button" className="btn border border-black/[0.1] text-neutral-800 hover:bg-black/[0.04] dark:border-white/[0.14] dark:text-neutral-100">
                  <span>{t.workQueue}</span>
                </button>
              </div>

              {/* 4 Primary Metric Cards (Settle-941 Style) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Metric 1 */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">{t.netPipeline}</p>
                    <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300">
                      <ArrowUpRight className="h-3 w-3" /> 14.2%
                    </span>
                  </div>
                  <p className="t-display m-0 mt-3 tabular-nums font-semibold">
                    ETB {(discountedGrossMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    <span>4 Active Projects</span>
                    <span className="font-mono">~ ${(discountedGrossMinor / 100 / 128.5).toFixed(0)} USD</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">{t.blendedMargin}</p>
                    <span className={`badge ${isBelowFloor ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/[0.12]' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12]'}`}>
                      {effectiveMargin.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`t-display m-0 mt-3 tabular-nums font-semibold ${isBelowFloor ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {effectiveMargin.toFixed(1)}%
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    <span>Target: 30.0%</span>
                    <span>Floor: 15.0%</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">{t.taxReserve}</p>
                    <span className="badge bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200">
                      T+30 Dep.
                    </span>
                  </div>
                  <p className="t-display m-0 mt-3 tabular-nums font-semibold">
                    ETB 727,500
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    <span>15% VAT Proc 1341</span>
                    <span>11% POESSA</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">Average Rate</p>
                    <span className="badge bg-neutral-100 text-neutral-700 dark:bg-white/[0.1] dark:text-neutral-300">
                      Standard Local
                    </span>
                  </div>
                  <p className="t-display m-0 mt-3 tabular-nums font-semibold">
                    ETB 1,850/hr
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    <span>5 Active Roles</span>
                    <span>4 Engineers</span>
                  </div>
                </div>
              </div>

              {/* Main Chart Section & Side Waterfalls */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* Main Graph & Modules Table (xl:col-span-8) */}
                <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-8 2xl:col-span-9 dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/[0.06] pb-4 dark:border-white/[0.08]">
                    <div>
                      <h2 className="t-h1 m-0">{t.volumeTitle}</h2>
                      <p className="t-meta m-0 mt-1 text-neutral-500 dark:text-neutral-400">{t.volumeSub}</p>
                    </div>

                    {/* Time Tab Controls */}
                    <div className="flex items-center gap-1 rounded-[8px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
                      {(['7d', '30d', '90d'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`seg ${activeTab === tab ? 'seg-on' : ''}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Wave Visualization */}
                  <div className="py-4">
                    <div className="relative h-44 w-full">
                      <svg viewBox="0 0 720 180" className="h-full w-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007a55" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#007a55" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <path
                          d="M0 130 Q120 70 240 100 T480 60 T720 90 L720 180 L0 180 Z"
                          fill="url(#emeraldGrad)"
                        />
                        {/* Stroke */}
                        <path
                          d="M0 130 Q120 70 240 100 T480 60 T720 90"
                          fill="none"
                          stroke="#007a55"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                      <span>መስከረም 1 (Sep 11)</span>
                      <span>መስከረም 15 (Sep 25)</span>
                      <span>ጥቅምት 1 (Oct 11)</span>
                      <span>ጥቅምት 15 (Oct 25)</span>
                      <span>ኅዳር 1 (Nov 10)</span>
                    </div>
                  </div>

                  {/* Project Modules Breakdown Grid */}
                  <div className="mt-4 space-y-2">
                    <p className="t-label text-neutral-400">Active WBS Scope Modules</p>
                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                      {[
                        { name: 'Core Backend & Database Architecture', hours: '380 hrs', cost: 'ETB 1,240,000', margin: '35.0%', risk: '10%' },
                        { name: 'Telebirr & CBE Birr Payment Gateways', hours: '240 hrs', cost: 'ETB 860,000', margin: '30.0%', risk: '15%' },
                        { name: 'Admin Operations & Financial Dashboard', hours: '310 hrs', cost: 'ETB 1,050,000', margin: '32.0%', risk: '10%' },
                        { name: 'DevOps, CI/CD & Local Data Center Deployment', hours: '190 hrs', cost: 'ETB 680,000', margin: '28.0%', risk: '20%' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 text-[12.5px]">
                          <div className="min-w-0 pr-4">
                            <p className="m-0 font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                            <p className="m-0 text-[11px] text-neutral-400">Risk Factor: {item.risk} · Expected Duration: {item.hours}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="m-0 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">{item.cost}</p>
                            <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300">
                              {item.margin} margin
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Statutory Waterfall & What-If Simulator (xl:col-span-4) */}
                <div className="flex flex-col gap-6 xl:col-span-4 2xl:col-span-3">
                  {/* Ethiopian Tax & Revenue Card */}
                  <section className="rounded-[14px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                    <h2 className="t-h2 m-0">{t.balanceTitle}</h2>
                    <p className="t-meta m-0 mt-1 text-neutral-500 dark:text-neutral-400">{t.balanceSub}</p>

                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-[12.5px]">
                        <span className="text-neutral-500 dark:text-neutral-400">{t.grossQuote}</span>
                        <span className="font-semibold tabular-nums">ETB {(Number(discountedGrossMinor) / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[12.5px] text-emerald-700 dark:text-emerald-400">
                        <span>{t.vatAmount}</span>
                        <span className="font-semibold tabular-nums">+ ETB {(Number(discountedGrossMinor) * 0.15 / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[12.5px] text-rose-600 dark:text-rose-400">
                        <span>{t.whtAmount}</span>
                        <span className="font-semibold tabular-nums">- ETB {(Number(discountedGrossMinor) * 0.02 / 100).toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />
                      <div className="flex justify-between text-[13px] font-bold">
                        <span>{t.netReceivable}</span>
                        <span className="text-[#007a55] dark:text-[#5ee9b5] tabular-nums">
                          ETB {(Number(discountedGrossMinor) * 1.13 / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* What-If Discount Simulator */}
                  <section className="rounded-[14px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                      <h2 className="t-h2 m-0">{t.discountSimulator}</h2>
                      <span className="font-mono text-[12px] font-bold bg-black/[0.04] px-2 py-0.5 rounded-[6px] dark:bg-white/[0.06]">
                        {discountPercent}%
                      </span>
                    </div>
                    <p className="t-meta m-0 mt-1 text-neutral-500 dark:text-neutral-400">{t.baseMargin}</p>

                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="mt-4 w-full accent-[#007a55]"
                    />

                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span>{t.newMargin}:</span>
                      <span className={`font-bold tabular-nums ${isBelowFloor ? 'text-rose-600' : 'text-[#007a55] dark:text-[#5ee9b5]'}`}>
                        {effectiveMargin.toFixed(1)}%
                      </span>
                    </div>

                    <div className={`mt-3 rounded-[8px] p-2.5 text-[11px] leading-snug flex items-center gap-2 ${
                      isBelowFloor
                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/[0.12] dark:text-rose-200'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/[0.12] dark:text-emerald-200'
                    }`}>
                      {isBelowFloor ? <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /> : <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                      <span>{isBelowFloor ? t.floorWarning : t.safeMargin}</span>
                    </div>
                  </section>

                  {/* Next Project Milestone Stepper */}
                  <section className="rounded-[14px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                    <h2 className="t-h2 m-0">{t.nextMilestone}</h2>
                    <p className="t-meta m-0 mt-1 text-neutral-500 dark:text-neutral-400">{t.milestoneSub}</p>

                    <ol className="m-0 mt-4 list-none p-0 space-y-3">
                      <li className="flex gap-2.5 items-start">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/[0.2] dark:text-emerald-300">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <div>
                          <p className="m-0 text-[12px] font-medium leading-tight">Architecture & Threat Model</p>
                          <p className="m-0 text-[10.5px] text-neutral-400">Completed · 28 መስከረም 2019</p>
                        </div>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#007a55] text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div>
                          <p className="m-0 text-[12px] font-semibold leading-tight text-[#007a55] dark:text-[#5ee9b5]">
                            Core Engine & Pricing Matrix
                          </p>
                          <p className="m-0 text-[10.5px] text-neutral-400">In Progress · Target 18 ኅዳር 2019</p>
                        </div>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-neutral-300 dark:border-neutral-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        </span>
                        <div>
                          <p className="m-0 text-[12px] font-medium leading-tight text-neutral-400">
                            Gov Tender Handover & Audit
                          </p>
                          <p className="m-0 text-[10.5px] text-neutral-400">Scheduled · ታኅሣሥ 2019</p>
                        </div>
                      </li>
                    </ol>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
