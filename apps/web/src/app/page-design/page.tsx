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
  Clock,
  Trash2,
} from 'lucide-react';

interface WBSTask {
  id: string;
  name: string;
  role: string;
  hourlyRateMinor: bigint; // Santim/cents
  o: number; // Optimistic hours
  m: number; // Likely hours
  p: number; // Pessimistic hours
}

export default function PageDesignDemo() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
  };
  const [activeNav, setActiveNav] = useState<'overview' | 'wbs' | 'balancer' | 'quotes'>('overview');
  const [activeTimeRange, setActiveTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(30);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Initial WBS Tasks (Selet Core System Demo)
  const [tasks, setTasks] = useState<WBSTask[]>([
    {
      id: '1',
      name: 'Core Estimation & Arithmetic Engine (Integer Minor Units)',
      role: 'Lead Architect',
      hourlyRateMinor: 250000n, // 2,500.00 ETB/hr
      o: 30,
      m: 45,
      p: 75,
    },
    {
      id: '2',
      name: 'Ethiopian Tax Waterfall (VAT Proc 1341 & WHT Proc 979)',
      role: 'Senior Tax Specialist',
      hourlyRateMinor: 210000n, // 2,100.00 ETB/hr
      o: 20,
      m: 32,
      p: 50,
    },
    {
      id: '3',
      name: 'POESSA 11% Pension & Salary Masking Access Control',
      role: 'Full Stack Engineer',
      hourlyRateMinor: 160000n, // 1,600.00 ETB/hr
      o: 25,
      m: 40,
      p: 65,
    },
    {
      id: '4',
      name: 'Telebirr & CBE Birr Payment Gateways Integration',
      role: 'FinTech Integration Lead',
      hourlyRateMinor: 220000n, // 2,200.00 ETB/hr
      o: 35,
      m: 55,
      p: 90,
    },
    {
      id: '5',
      name: 'Bilingual UI & Ethiopian Calendar (የቀን መቁጠሪያ)',
      role: 'Frontend UI/UX Designer',
      hourlyRateMinor: 140000n, // 1,400.00 ETB/hr
      o: 18,
      m: 28,
      p: 45,
    },
  ]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskRole, setNewTaskRole] = useState('Senior Engineer');
  const [newTaskRate, setNewTaskRate] = useState(1800);
  const [newTaskO, setNewTaskO] = useState(10);
  const [newTaskM, setNewTaskM] = useState(20);
  const [newTaskP, setNewTaskP] = useState(35);

  // PERT Calculation: (O + 4M + P) / 6
  const pertExpected = (o: number, m: number, p: number) => (o + 4 * m + p) / 6;

  // Task labor calculation
  const totalExpectedHours = tasks.reduce((sum, t) => sum + pertExpected(t.o, t.m, t.p), 0);
  const totalLaborCostMinor = tasks.reduce(
    (sum, t) => sum + BigInt(Math.round(pertExpected(t.o, t.m, t.p) * 100)) * (t.hourlyRateMinor / 100n),
    0n
  );

  // Rollups: Risk (10%), Overhead (10%), Target Margin (dynamic)
  const riskCostMinor = (totalLaborCostMinor * 10n) / 100n;
  const overheadCostMinor = (totalLaborCostMinor * 10n) / 100n;
  const totalDirectCostMinor = totalLaborCostMinor + riskCostMinor + overheadCostMinor;

  // Pricing: Price = Cost / (1 - margin)
  const marginDecimal = targetMarginPercent / 100;
  const rawPriceMinor = marginDecimal < 1 ? Number(totalDirectCostMinor) / (1 - marginDecimal) : Number(totalDirectCostMinor);
  const discountedPriceMinor = rawPriceMinor * ((100 - discountPercent) / 100);

  // Effective margin after discount
  const effectiveMargin = discountedPriceMinor > 0 ? ((discountedPriceMinor - Number(totalDirectCostMinor)) / discountedPriceMinor) * 100 : 0;
  const isFloorViolated = effectiveMargin < 15; // 15% Organization Floor

  // Ethiopian Taxes on Discounted Price
  const vatMinor = discountedPriceMinor * 0.15; // 15% VAT
  const whtMinor = discountedPriceMinor * 0.02; // 2% Withholding
  const netReceivableMinor = discountedPriceMinor + vatMinor - whtMinor;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const item: WBSTask = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      role: newTaskRole,
      hourlyRateMinor: BigInt(newTaskRate * 100),
      o: Number(newTaskO),
      m: Number(newTaskM),
      p: Number(newTaskP),
    };
    setTasks([...tasks, item]);
    setNewTaskName('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'dark bg-[#0a0a0a] text-[#fafafa]' : 'bg-[#fafafa] text-[#0a0a0a]'}`}>
      <div className="flex min-h-screen w-full antialiased font-sans">
        {/* 1. Settle-941 Icon Aside (hidden on mobile, visible on tablet) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 shrink-0 flex-col items-center border-r border-black/[0.06] bg-white md:flex lg:hidden dark:border-white/[0.08] dark:bg-neutral-900">
          <div className="flex h-14 shrink-0 items-center">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-semibold text-xs">
              ስ
            </span>
          </div>
          <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.08]" />
          <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-4">
            <button
              onClick={() => setActiveNav('overview')}
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${
                activeNav === 'overview'
                  ? 'bg-black/[0.06] text-neutral-900 dark:bg-white/[0.09] dark:text-neutral-50'
                  : 'text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveNav('wbs')}
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${
                activeNav === 'wbs'
                  ? 'bg-black/[0.06] text-neutral-900 dark:bg-white/[0.09] dark:text-neutral-50'
                  : 'text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400'
              }`}
            >
              <Calculator className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveNav('balancer')}
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${
                activeNav === 'balancer'
                  ? 'bg-black/[0.06] text-neutral-900 dark:bg-white/[0.09] dark:text-neutral-50'
                  : 'text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveNav('quotes')}
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${
                activeNav === 'quotes'
                  ? 'bg-black/[0.06] text-neutral-900 dark:bg-white/[0.09] dark:text-neutral-50'
                  : 'text-neutral-500 hover:bg-black/[0.04] dark:text-neutral-400'
              }`}
            >
              <Receipt className="h-4 w-4" />
            </button>
          </nav>
        </aside>

        {/* 2. Settle-941 Full Sidebar (lg:flex on desktop) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] shrink-0 flex-col border-r border-black/[0.06] bg-white lg:flex 2xl:w-[276px] dark:border-white/[0.08] dark:bg-neutral-900">
          {/* Header Brand */}
          <div className="flex h-14 items-center gap-2.5 px-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-semibold text-xs tracking-tight">
              ስ
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-[13px] font-semibold tracking-[-0.005em]">
                {lang === 'am' ? 'አፍሮ ዲጂታል ሶፍትዌር' : 'Afro Digital Software'}
              </p>
              <p className="m-0 truncate font-mono text-[10.5px] text-neutral-500 dark:text-neutral-400">
                org_afro_etb · live
              </p>
            </div>
            <button type="button" className="ibtn-sm ml-auto" title="Switch organization">
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">
                {lang === 'am' ? 'የስራ ክንውኖች' : 'OPERATIONS'}
              </p>
              <button
                type="button"
                onClick={() => setActiveNav('overview')}
                className="nav-item"
                data-on={activeNav === 'overview' ? '1' : '0'}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'አጠቃላይ ዳሽቦርድ' : 'Overview'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNav('wbs')}
                className="nav-item"
                data-on={activeNav === 'wbs' ? '1' : '0'}
              >
                <Calculator className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የስራ ዝርዝር ግምት' : 'WBS Estimation'}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-black/[0.06] text-neutral-600 dark:bg-white/[0.09] dark:text-neutral-400">
                  {tasks.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNav('balancer')}
                className="nav-item"
                data-on={activeNav === 'balancer' ? '1' : '0'}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የትርፍ ማመጣጠኛ' : 'Margin Balancer'}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-emerald-50 text-emerald-800 dark:bg-emerald-500/[0.12] dark:text-emerald-200">
                  {effectiveMargin.toFixed(0)}%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNav('quotes')}
                className="nav-item"
                data-on={activeNav === 'quotes' ? '1' : '0'}
              >
                <Receipt className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የዋጋ ማቅረቢያ' : 'Quotes & Taxes'}</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[6px] px-1 text-[11px] font-medium tabular-nums bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200">
                  15% VAT
                </span>
              </button>
            </div>

            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">
                {lang === 'am' ? 'የዋጋ ቀመሮች' : 'PRICING ENGINE'}
              </p>
              <div className="nav-item">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የክፍያ ተመን' : 'Rate Cards'}</span>
              </div>
              <div className="nav-item">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የመሳሪያዎች ካታሎግ' : 'Cost Catalog'}</span>
              </div>
              <div className="nav-item">
                <Scale className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የመጠን ማስያ' : 'Scale Archetypes'}</span>
              </div>
            </div>

            <div>
              <p className="t-label m-0 px-2 pb-2 text-neutral-400 dark:text-neutral-500">
                {lang === 'am' ? 'ግብርና ተገዢነት' : 'COMPLIANCE & TAX'}
              </p>
              <div className="nav-item">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{lang === 'am' ? 'የትርፍና ወጪ ሪፖርት' : 'Profit Reconciliation'}</span>
              </div>
            </div>
          </nav>

          {/* Settle-941 Fiscal Milestone Card */}
          <div className="p-4 pt-0">
            <div className="block w-full rounded-[12px] border border-black/[0.06] bg-neutral-50 p-4 text-left transition-colors hover:bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
              <div className="flex items-center gap-2">
                <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">
                  {lang === 'am' ? 'የበጀት ወር' : "TODAY'S CLOSE"}
                </p>
                <span className="ml-auto text-[11px] font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
                  {lang === 'am' ? 'ጥቅምት 2019 ዓ.ም' : 'Tikimt 2019 E.C.'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                <span className="h-1.5 flex-1 rounded-full bg-amber-400" />
                <span className="h-1.5 flex-1 rounded-full bg-black/[0.08] dark:bg-white/[0.12]" />
              </div>
              <p className="m-0 mt-2 text-[12px] font-medium leading-snug">
                {lang === 'am' ? '15% ተ.እ.ታ እና 11% የጡረታ ተገዢነት' : '15% VAT & 11% POESSA verified'}
              </p>
              <p className="t-micro m-0 mt-1 text-neutral-600 dark:text-neutral-300">
                NBE Directives · <span className="font-mono">128.50 ETB/USD</span>
              </p>
            </div>
          </div>
        </aside>

        {/* 3. Main Content Viewport */}
        <div className="flex min-w-0 flex-1 flex-col md:pl-16 lg:pl-[252px] 2xl:pl-[276px]">
          {/* Header Bar */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-black/[0.06] bg-white/85 px-4 backdrop-blur-[6px] sm:px-6 2xl:px-10 dark:border-white/[0.08] dark:bg-neutral-900/85">
            {/* Breadcrumb */}
            <nav className="flex min-w-0 items-center">
              <ol className="m-0 flex min-w-0 list-none items-center gap-1 p-0">
                <li className="min-w-0 hidden sm:block">
                  <span className="crumb-link truncate">
                    {lang === 'am' ? 'ስሌት (Selet)' : 'Selet'}
                  </span>
                </li>
                <li className="hidden shrink-0 text-neutral-400 sm:block">
                  <ChevronRight className="h-3 w-3" />
                </li>
                <li className="min-w-0">
                  <span className="crumb-current truncate">
                    {activeNav === 'overview' && (lang === 'am' ? 'አጠቃላይ ዳሽቦርድ' : 'Overview')}
                    {activeNav === 'wbs' && (lang === 'am' ? 'የስራ ዝርዝር ግምት' : 'WBS Feature Estimation')}
                    {activeNav === 'balancer' && (lang === 'am' ? 'የትርፍ ማመጣጠኛ' : 'Margin Balancer')}
                    {activeNav === 'quotes' && (lang === 'am' ? 'የዋጋ ማቅረቢያና ግብር' : 'Quote & Tax Waterfall')}
                  </span>
                </li>
              </ol>
            </nav>

            {/* Quick Search */}
            <div className="relative ml-auto hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                aria-label="Search"
                placeholder={lang === 'am' ? 'ግምት ወይም ደንበኛ ፈልግ...' : 'Search estimate, role or quote...'}
                className="h-8 w-[240px] rounded-[9px] border border-black/[0.08] bg-transparent pl-8 pr-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-neutral-400 2xl:w-[320px] dark:border-white/[0.12]"
                type="search"
              />
            </div>

            {/* Bilingual Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="ibtn flex items-center gap-1 text-[11.5px] font-semibold w-auto px-2"
              title="Toggle Amharic / English"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>

            {/* Dark/Light Theme Switcher */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="ibtn"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Notification Bell */}
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
                  <h1 className="t-h1 m-0">
                    {lang === 'am' ? 'የሶፍትዌር ዋጋና ወጪ ስሌት ዳሽቦርድ' : 'Software Cost & Pricing Overview'}
                  </h1>
                  <p className="m-0 mt-2 text-[12.5px] text-neutral-600 dark:text-neutral-300">
                    {lang === 'am'
                      ? 'ዓርብ ጥቅምት 4 ቀን 2019 ዓ.ም · የብሔራዊ ባንክ የምንዛሬ ተመን 1 USD = 128.50 ETB'
                      : 'Friday 13 November 2026 · Official NBE Foreign Exchange Benchmark 1 USD = 128.50 ETB'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveNav('quotes')}
                    className="btn border border-black/[0.1] text-neutral-800 hover:bg-black/[0.04] dark:border-white/[0.14] dark:text-neutral-100 dark:hover:bg-white/[0.08]"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    <span>{lang === 'am' ? 'ፕሮፎርማ አውርድ' : 'Export Proforma'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav('wbs')}
                    className="btn bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>{lang === 'am' ? '+ አዲስ ግምት ጀምር' : '+ New Estimate'}</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-[240px] flex-1">
                  <p className="t-row m-0 font-medium text-neutral-900 dark:text-neutral-100">
                    {lang === 'am'
                      ? 'የንግድ ባንክ እና የቴሌብር ውህደት፡ የተጣመረ ትርፍ በ 32.5% ላይ ተመቻችቷል'
                      : 'Commercial Bank of Ethiopia & Telebirr Core MVP: Blended Margin locked at 32.5%'}
                  </p>
                  <p className="t-meta m-0 mt-1 text-neutral-600 dark:text-neutral-300">
                    {lang === 'am'
                      ? `በአጠቃላይ ${tasks.length} የቴክኒክ ተግባራት ተመዝግበዋል፤ የሰው ኃይል ወጪ በ 11% የጡረታ መዋጮ ተሰልቷል።`
                      : `${tasks.length} WBS engineering tasks estimated with 10% risk contingency and 11% POESSA pension reserve.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('balancer')}
                  className="btn border border-black/[0.1] text-neutral-800 hover:bg-black/[0.04] dark:border-white/[0.14] dark:text-neutral-100 dark:hover:bg-white/[0.08]"
                >
                  <span>{lang === 'am' ? 'ትርፍ አስተካክል' : 'Adjust Margins'}</span>
                </button>
              </div>

              {/* Four Settle-941 Metric Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Metric 1: Net Pipeline */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">
                      {lang === 'am' ? 'ጠቅላላ የፕሮጀክት ዋጋ' : 'GROSS ESTIMATE'}
                    </p>
                    <span className="text-emerald-500">
                      <svg viewBox="0 0 72 20" className="h-5 w-16 overflow-visible" fill="none">
                        <path d="M0 16 Q18 2, 36 10 T72 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="t-display m-0 mt-4 tabular-nums text-neutral-950 dark:text-neutral-50">
                    ETB {(discountedPriceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="badge whitespace-nowrap bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300">
                      <ArrowUpRight className="h-3 w-3" />
                      14.2%
                    </span>
                    <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      ~ ${(discountedPriceMinor / 100 / 128.5).toFixed(0)} USD
                    </span>
                  </div>
                </div>

                {/* Metric 2: Blended Margin */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">
                      {lang === 'am' ? 'የተጣመረ ትርፍ' : 'BLENDED MARGIN'}
                    </p>
                    <span className={isFloorViolated ? 'text-rose-500' : 'text-emerald-500'}>
                      <svg viewBox="0 0 72 20" className="h-5 w-16 overflow-visible" fill="none">
                        <path d="M0 12 Q20 18, 40 8 T72 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <p className={`t-display m-0 mt-4 tabular-nums ${isFloorViolated ? 'text-rose-600' : 'text-neutral-950 dark:text-neutral-50'}`}>
                    {effectiveMargin.toFixed(1)}%
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`badge whitespace-nowrap ${isFloorViolated ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/[0.12] dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300'}`}>
                      {isFloorViolated ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {isFloorViolated ? 'Floor breached' : 'Healthy'}
                    </span>
                    <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      Target: {targetMarginPercent}% · Floor: 15%
                    </span>
                  </div>
                </div>

                {/* Metric 3: Total Labor Hours */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">
                      {lang === 'am' ? 'የሚጠበቅ የሰው ኃይል' : 'EXPECTED LABOR'}
                    </p>
                    <span className="text-amber-500">
                      <svg viewBox="0 0 72 20" className="h-5 w-16 overflow-visible" fill="none">
                        <path d="M0 8 Q25 2, 50 14 T72 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="t-display m-0 mt-4 tabular-nums text-neutral-950 dark:text-neutral-50">
                    {totalExpectedHours.toFixed(0)} hrs
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="badge bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200">
                      <Clock className="h-3 w-3 shrink-0" />
                      PERT 3-Point
                    </span>
                    <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      {tasks.length} modules
                    </span>
                  </div>
                </div>

                {/* Metric 4: Statutory Tax (15% VAT) */}
                <div className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4">
                    <p className="t-label m-0 text-neutral-500 dark:text-neutral-400">
                      {lang === 'am' ? '15% ተ.እ.ታ እና ግብር' : '15% VAT RECEIVABLE'}
                    </p>
                    <span className="text-neutral-400">
                      <svg viewBox="0 0 72 20" className="h-5 w-16 overflow-visible" fill="none">
                        <path d="M0 14 Q20 6, 40 10 T72 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="t-display m-0 mt-4 tabular-nums text-neutral-950 dark:text-neutral-50">
                    ETB {(vatMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300">
                      Proc 1341/2016
                    </span>
                    <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      2% WHT: ETB {(whtMinor / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Chart Section & Side Waterfalls */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                {/* Main Graph (xl:col-span-8) */}
                <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-8 2xl:col-span-9 dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4">
                    <div className="min-w-0">
                      <h2 className="t-h2 m-0">
                        {lang === 'am' ? 'የወጪ እና የትርፍ ስርጭት' : 'Cost Rollup & Pricing Volume'}
                      </h2>
                      <p className="t-meta m-0 mt-1 text-neutral-600 dark:text-neutral-300">
                        {lang === 'am'
                          ? 'የሰው ኃይል ወጪ ከትርፍ እና ከግብር አንጻር · በወራት ስሌት'
                          : 'Direct Labor vs Overhead & Risk vs Net Margin, by month'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex min-w-0 flex-1 items-center px-4 pt-4">
                      <div className="w-full min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-6 items-center gap-1.5 rounded-[7px] px-2 text-[11.5px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/[0.06]">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span>{lang === 'am' ? 'የተጣራ ዋጋ' : 'Gross Price'}</span>
                            </span>
                            <span className="inline-flex h-6 items-center gap-1.5 rounded-[7px] px-2 text-[11.5px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/[0.06]">
                              <span className="h-2 w-2 rounded-full bg-rose-400" />
                              <span>{lang === 'am' ? 'ቀጥተኛ ወጪ' : 'Direct Cost'}</span>
                            </span>
                          </div>

                          <div className="ml-auto">
                            <div className="flex items-center gap-1 rounded-[9px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
                              {(['7d', '30d', '90d'] as const).map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setActiveTimeRange(r)}
                                  className={`seg ${activeTimeRange === r ? 'seg-on' : ''}`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Settle-941 SVG Curve */}
                        <div className="relative w-full">
                          <svg viewBox="0 0 720 220" className="h-auto w-full touch-none" role="img">
                            <defs>
                              <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                                <stop offset="55%" stopColor="#10b981" stopOpacity="0.07" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            <g className="text-neutral-400 dark:text-neutral-600" fontSize="10.5" fontFamily="monospace">
                              <line x1="60" y1="190" x2="700" y2="190" stroke="currentColor" strokeOpacity="0.2" />
                              <text x="50" y="193" textAnchor="end" fill="currentColor">ETB 0</text>
                              <line x1="60" y1="130" x2="700" y2="130" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 4" />
                              <text x="50" y="133" textAnchor="end" fill="currentColor">500k</text>
                              <line x1="60" y1="70" x2="700" y2="70" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 4" />
                              <text x="50" y="73" textAnchor="end" fill="currentColor">1.0M</text>
                              <line x1="60" y1="15" x2="700" y2="15" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 4" />
                              <text x="50" y="18" textAnchor="end" fill="currentColor">1.5M</text>

                              <text x="60" y="210" textAnchor="start" fill="currentColor">መስከረም 1</text>
                              <text x="380" y="210" textAnchor="middle" fill="currentColor">ጥቅምት 1</text>
                              <text x="700" y="210" textAnchor="end" fill="currentColor">ኅዳር 1</text>
                            </g>

                            {/* Area fill */}
                            <path
                              d="M60 140 Q160 50, 260 80 T460 30 T700 65 L700 190 L60 190 Z"
                              fill="url(#emeraldArea)"
                            />
                            {/* Green Main Line */}
                            <path
                              d="M60 140 Q160 50, 260 80 T460 30 T700 65"
                              fill="none"
                              stroke="#00bb7f"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            {/* Rose Cost Line */}
                            <path
                              d="M60 175 Q160 150, 260 160 T460 135 T700 145"
                              fill="none"
                              stroke="#ff667f"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeDasharray="4 4"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

                    {/* 4 Footer Stat Columns */}
                    <div className="grid grid-cols-2 divide-x divide-black/[0.06] sm:grid-cols-4 dark:divide-white/[0.08]">
                      <div className="px-4 py-4">
                        <p className="m-0 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {lang === 'am' ? 'የሰው ኃይል ወጪ' : 'Direct Labor Cost'}
                        </p>
                        <p className="m-0 mt-1 text-[14px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          ETB {(Number(totalLaborCostMinor) / 100).toLocaleString()}
                        </p>
                        <p className="m-0 mt-1 text-[10.5px] text-neutral-500 dark:text-neutral-400">
                          {totalExpectedHours.toFixed(0)} PERT hrs
                        </p>
                      </div>

                      <div className="px-4 py-4">
                        <p className="m-0 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {lang === 'am' ? 'የአደጋ ተቀማጭ (10%)' : 'Contingency Risk (10%)'}
                        </p>
                        <p className="m-0 mt-1 text-[14px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          ETB {(Number(riskCostMinor) / 100).toLocaleString()}
                        </p>
                        <p className="m-0 mt-1 text-[10.5px] text-neutral-500 dark:text-neutral-400">
                          PERT beta variance
                        </p>
                      </div>

                      <div className="px-4 py-4">
                        <p className="m-0 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {lang === 'am' ? 'ተጓዳኝ ወጪ (10%)' : 'Overhead (10%)'}
                        </p>
                        <p className="m-0 mt-1 text-[14px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          ETB {(Number(overheadCostMinor) / 100).toLocaleString()}
                        </p>
                        <p className="m-0 mt-1 text-[10.5px] text-neutral-500 dark:text-neutral-400">
                          Office & tools buffer
                        </p>
                      </div>

                      <div className="px-4 py-4">
                        <p className="m-0 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {lang === 'am' ? 'የተጣራ ትርፍ መጠን' : 'Net Gross Margin'}
                        </p>
                        <p className="m-0 mt-1 text-[14px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                          {effectiveMargin.toFixed(1)}%
                        </p>
                        <p className="m-0 mt-1 text-[10.5px] text-neutral-500 dark:text-neutral-400">
                          ETB {((discountedPriceMinor - Number(totalDirectCostMinor)) / 100).toLocaleString()} profit
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right Side Column (xl:col-span-4) */}
                <div className="flex flex-col gap-4 xl:col-span-4 2xl:col-span-3">
                  {/* Balance / Statutory Waterfall Card */}
                  <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4">
                      <div className="min-w-0">
                        <h2 className="t-h2 m-0">
                          {lang === 'am' ? 'የግብርና ተ.እ.ታ ተዋረድ' : 'Ethiopian Statutory Waterfall'}
                        </h2>
                        <p className="t-meta m-0 mt-1 text-neutral-600 dark:text-neutral-300">
                          VAT Proc 1341/2016 · WHT Proc 979/2016
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      {/* Tri-color progress bar */}
                      <div className="flex w-full overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07] h-2">
                        <span className="h-full bg-neutral-900 dark:bg-neutral-100" style={{ width: '60%' }} />
                        <span className="h-full bg-emerald-500" style={{ width: '28%' }} />
                        <span className="h-full bg-amber-400" style={{ width: '12%' }} />
                      </div>

                      <ul className="m-0 mt-4 list-none space-y-2 p-0">
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                          <span className="t-body min-w-0 truncate text-neutral-700 dark:text-neutral-200">
                            {lang === 'am' ? 'የፕሮጀክት ጠቅላላ ዋጋ' : 'Contracted Base Price'}
                          </span>
                          <span className="ml-auto text-[12.5px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                            ETB {(discountedPriceMinor / 100).toLocaleString()}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          <span className="t-body min-w-0 truncate text-emerald-700 dark:text-emerald-400">
                            {lang === 'am' ? '+ 15% ተ.እ.ታ (ተጨማሪ እሴት)' : '+ 15% VAT (Invoice Add-on)'}
                          </span>
                          <span className="ml-auto text-[12.5px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                            + ETB {(vatMinor / 100).toLocaleString()}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          <span className="t-body min-w-0 truncate text-amber-700 dark:text-amber-400">
                            {lang === 'am' ? '- 2% ቅድመ ግብር (ከምንጭ)' : '- 2% Withholding Tax (Source)'}
                          </span>
                          <span className="ml-auto text-[12.5px] font-medium tabular-nums text-amber-700 dark:text-amber-400">
                            - ETB {(whtMinor / 100).toLocaleString()}
                          </span>
                        </li>
                      </ul>

                      <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                        <span className="text-[12px] font-bold text-neutral-900 dark:text-neutral-100">
                          {lang === 'am' ? 'የተጣራ የጥሬ ገንዘብ ገቢ' : 'Net Cash Realized'}
                        </span>
                        <span className="text-[13px] font-bold tabular-nums text-[#007a55] dark:text-[#5ee9b5]">
                          ETB {(netReceivableMinor / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* What-If Discount Simulator */}
                  <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                      <h2 className="t-h2 m-0">
                        {lang === 'am' ? 'የዋጋ ቅናሽ መሞከሪያ' : 'What-If Discount Simulator'}
                      </h2>
                      <span className="rounded-[6px] bg-black/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-bold dark:bg-white/[0.09]">
                        {discountPercent}%
                      </span>
                    </div>
                    <p className="t-meta m-0 mt-1 text-neutral-600 dark:text-neutral-300">
                      {lang === 'am'
                        ? 'የደንበኛ ቅናሽ በትርፍ ህዳግ ላይ ያለውን ተፅዕኖ ወዲያውኑ ይመልከቱ'
                        : 'Simulate client discount impact on organization floor'}
                    </p>

                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="1"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="mt-4 w-full accent-[#007a55]"
                    />

                    <div className="mt-2 flex items-center justify-between text-[11.5px] text-neutral-500">
                      <span>0%</span>
                      <span>10%</span>
                      <span>25% Max</span>
                    </div>

                    <div
                      className={`mt-3 flex items-center gap-2 rounded-[8px] p-2.5 text-[11.5px] leading-snug ${
                        isFloorViolated
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/[0.12] dark:text-rose-200'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/[0.12] dark:text-emerald-200'
                      }`}
                    >
                      {isFloorViolated ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      ) : (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      <span>
                        {isFloorViolated
                          ? lang === 'am'
                            ? `ማስጠንቀቂያ፡ ትርፉ ${effectiveMargin.toFixed(1)}% ሆኗል፤ ከ 15% ወለል በታች ነው!`
                            : `Warning: Effective margin dropped to ${effectiveMargin.toFixed(1)}% (below 15% floor)!`
                          : lang === 'am'
                          ? `አስተማማኝ፡ የተጣራ ትርፍ ${effectiveMargin.toFixed(1)}% (ከ 15% ወለል በላይ ነው)`
                          : `Safe: Effective margin is ${effectiveMargin.toFixed(1)}% (above 15% floor)`}
                      </span>
                    </div>
                  </section>
                </div>
              </div>

              {/* Bottom Two Settle-941 Panels: Interactive WBS Matrix & Quotes Feed */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                {/* Panel 1: Interactive WBS Task Editor (xl:col-span-7) */}
                <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-7 dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
                    <div>
                      <h2 className="t-h2 m-0">
                        {lang === 'am' ? 'የስራ ተግባራት ዝርዝር (WBS)' : 'Active WBS Tasks & PERT Hours'}
                      </h2>
                      <p className="t-meta m-0 mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {lang === 'am'
                          ? 'የሰው ኃይል ሰዓት እና የዋጋ ቀመር (O, M, P)'
                          : 'Three-point estimation: (O + 4M + P)/6'}
                      </p>
                    </div>
                    <span className="badge bg-black/[0.06] text-neutral-700 dark:bg-white/[0.09] dark:text-neutral-300">
                      {tasks.length} tasks
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] max-h-[360px] overflow-y-auto">
                    {tasks.map((task) => {
                      const exp = pertExpected(task.o, task.m, task.p);
                      const cost = BigInt(Math.round(exp * 100)) * (task.hourlyRateMinor / 100n);
                      return (
                        <div key={task.id} className="flex items-center justify-between py-3 text-[12.5px] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] px-2 rounded-[8px]">
                          <div className="min-w-0 pr-3">
                            <p className="m-0 font-medium text-neutral-900 dark:text-neutral-100 truncate">
                              {task.name}
                            </p>
                            <p className="m-0 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                              {task.role} · <span className="font-mono">ETB {(Number(task.hourlyRateMinor) / 100).toFixed(0)}/hr</span> · O:{task.o}h / M:{task.m}h / P:{task.p}h
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="m-0 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                                ETB {(Number(cost) / 100).toLocaleString()}
                              </p>
                              <span className="text-[11px] font-mono text-neutral-500">
                                {exp.toFixed(1)} hrs
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="ibtn-sm text-neutral-400 hover:text-rose-600"
                              title="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Task Quick Form */}
                  <form onSubmit={handleAddTask} className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder={lang === 'am' ? 'አዲስ የስራ ተግባር ስም...' : 'New feature or task name...'}
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="h-8 flex-1 min-w-[180px] rounded-[7px] border border-black/[0.1] bg-transparent px-2.5 text-[12px] focus:outline-none dark:border-white/[0.14]"
                    />
                    <input
                      type="number"
                      placeholder="Rate (ETB)"
                      value={newTaskRate}
                      onChange={(e) => setNewTaskRate(Number(e.target.value))}
                      className="h-8 w-24 rounded-[7px] border border-black/[0.1] bg-transparent px-2 text-[12px] focus:outline-none dark:border-white/[0.14]"
                      title="Hourly Rate in ETB"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="O"
                        value={newTaskO}
                        onChange={(e) => setNewTaskO(Number(e.target.value))}
                        className="h-8 w-12 rounded-[7px] border border-black/[0.1] bg-transparent px-1.5 text-center text-[12px] focus:outline-none dark:border-white/[0.14]"
                        title="Optimistic Hours"
                      />
                      <input
                        type="number"
                        placeholder="M"
                        value={newTaskM}
                        onChange={(e) => setNewTaskM(Number(e.target.value))}
                        className="h-8 w-12 rounded-[7px] border border-black/[0.1] bg-transparent px-1.5 text-center text-[12px] focus:outline-none dark:border-white/[0.14]"
                        title="Likely Hours"
                      />
                      <input
                        type="number"
                        placeholder="P"
                        value={newTaskP}
                        onChange={(e) => setNewTaskP(Number(e.target.value))}
                        className="h-8 w-12 rounded-[7px] border border-black/[0.1] bg-transparent px-1.5 text-center text-[12px] focus:outline-none dark:border-white/[0.14]"
                        title="Pessimistic Hours"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn h-8 bg-neutral-900 text-white hover:bg-neutral-800 text-[12px] px-3 dark:bg-neutral-50 dark:text-neutral-900"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{lang === 'am' ? 'አክል' : 'Add Task'}</span>
                    </button>
                  </form>
                </section>

                {/* Panel 2: Live Enterprise Clients & Proformas (xl:col-span-5) */}
                <section className="flex flex-col rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:col-span-5 dark:border-white/[0.08] dark:bg-neutral-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
                    <div>
                      <h2 className="t-h2 m-0">
                        {lang === 'am' ? 'የቅርብ ጊዜ የዋጋ ማቅረቢያዎች' : 'Latest Enterprise Quotes'}
                      </h2>
                      <p className="t-meta m-0 mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {lang === 'am' ? 'የኢትዮጵያ ተቋማት እና ባንኮች' : 'Commercial clients & contract status'}
                      </p>
                    </div>
                    <span className="text-[11.5px] font-medium text-neutral-500">Live feed</span>
                  </div>

                  <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] mt-1">
                    {[
                      {
                        client: 'Commercial Bank of Ethiopia (CBE)',
                        project: 'Mobile Banking Core Re-platform',
                        amount: 'ETB 3,450,000',
                        status: 'ISSUED',
                        date: 'ጥቅምት 12',
                      },
                      {
                        client: 'Ethio Telecom Enterprise',
                        project: 'Telebirr SuperApp Merchant API Suite',
                        amount: 'ETB 2,180,000',
                        status: 'ACCEPTED',
                        date: 'ጥቅምት 8',
                      },
                      {
                        client: 'Ministry of Innovation & Tech (MInT)',
                        project: 'National Citizen Portal Phase 2',
                        amount: 'ETB 4,850,000',
                        status: 'IN REVIEW',
                        date: 'ጥቅምት 2',
                      },
                      {
                        client: 'Ethiopian Airlines Group',
                        project: 'Crew Rostering & Crew Portal',
                        amount: 'ETB 1,920,000',
                        status: 'DRAFT',
                        date: 'መስከረም 26',
                      },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 text-[12px]">
                        <div className="min-w-0 pr-3">
                          <p className="m-0 font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {row.client}
                          </p>
                          <p className="m-0 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {row.project}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="m-0 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                            {row.amount}
                          </p>
                          <span
                            className={`badge text-[10px] ${
                              row.status === 'ACCEPTED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300'
                                : row.status === 'ISSUED'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/[0.12] dark:text-blue-300'
                                : row.status === 'IN REVIEW'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/[0.12] dark:text-amber-200'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-400'
                            }`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
