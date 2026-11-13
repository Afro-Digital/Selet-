'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  AtSign,
  Lock,
  User,
  ChevronLeft,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  Sun,
  Moon,
  Coins,
  Percent,
} from 'lucide-react';

interface CompanyConfig {
  companyName: string;
  tin: string;
  currency: string;
  marginFloor: number;
  overheadRate: number;
  contingencyRate: number;
}

const DEFAULT_CONFIG: CompanyConfig = {
  companyName: 'Afro Digital Technologies PLC',
  tin: '0012345678',
  currency: 'ETB',
  marginFloor: 20,
  overheadRate: 10,
  contingencyRate: 15,
};

export function AuthPage() {
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<CompanyConfig>(DEFAULT_CONFIG);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);

      try {
        const stored = localStorage.getItem('selet_company_config');
        if (stored) {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
        }
      } catch {
        // fallback to default config
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark');
      setIsDarkMode(isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (typeof window !== 'undefined') {
      const session = {
        role: 'OWNER',
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        mode,
        signedInAt: new Date().toISOString(),
      };
      localStorage.setItem('selet_auth_session', JSON.stringify(session));
    }

    setStep('onboarding');
  };

  const handleSaveAndEnter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('selet_company_config', JSON.stringify(config));
      window.location.href = '/';
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selet_company_config', JSON.stringify(DEFAULT_CONFIG));
      window.location.href = '/';
    }
  };

  return (
    <main className="relative min-h-screen lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-2 bg-neutral-50 dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Left Column: Brand Hero & Statutory Compliance Showcase */}
      <div className="bg-neutral-100 dark:bg-[#121212] relative hidden h-full flex-col border-r border-black/[0.06] dark:border-white/[0.08] p-10 lg:flex select-none overflow-hidden">
        {/* Static Architectural Grid Blueprint */}
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
          <svg className="w-full h-full stroke-neutral-400 dark:stroke-neutral-700" fill="none">
            <defs>
              <pattern id="static-blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#static-blueprint-grid)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-100 dark:from-[#121212] via-transparent to-transparent" />
        </div>

        {/* Brand Header */}
        <div className="z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
            <Calculator className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Selet
              </span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                (ስሌት)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 tracking-tight">
              Software Costing & Ethiopian Statutory Waterfall Engine
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="z-10 my-auto max-w-md space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Defensible Software Pricing Standard</span>
          </div>

          <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight leading-snug">
            Precision engineering economics for Ethiopian software agencies.
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Full statutory waterfall compliance: Proclamation 979/2016, 15% VAT, and 2% Withholding.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Blended margin balancing with automated floor protection against commercial leakage.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Dual Ge&apos;ez numerals & Ethiopian Calendar (ዓ.ም.) bilingual quote generator.</span>
            </div>
          </div>
        </div>

        {/* Client Quote / Testimonial */}
        <div className="z-10 mt-auto pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
          <blockquote className="space-y-2">
            <p className="text-sm italic text-neutral-700 dark:text-neutral-300">
              &ldquo;Selet gave our engineering agency the rigor to bid defensibly, eliminate margin leakage, and comply with Ethiopian statutory waterfall rules.&rdquo;
            </p>
            <footer className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              ~ Dawi Tadesse, Lead Architect & Managing Director
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Column: Interactive Auth & Onboarding */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Subtle Static Accent Glow */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        >
          <div className="bg-[radial-gradient(ellipse_at_top_right,rgba(0,122,85,0.08),transparent_60%)] absolute inset-0" />
        </div>

        {/* Top Controls: Return to Workspace & Theme Toggle */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Button variant="ghost" size="sm" asChild>
            <a href="/" className="text-xs flex items-center gap-1.5 font-medium">
              <ChevronLeft className="size-4" />
              Back to Workspace
            </a>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border-black/[0.08] dark:border-white/[0.08]"
            title="Toggle theme"
          >
            {mounted && isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            )}
          </Button>
        </div>

        {/* Step 1: Authentication */}
        {step === 'auth' ? (
          <div className="mx-auto w-full max-w-sm space-y-6 pt-12 lg:pt-0">
            {/* Mobile Header Branding */}
            <div className="flex items-center gap-2.5 lg:hidden mb-4">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-lg font-bold tracking-tight">Selet (ስሌት)</span>
            </div>

            {/* Segmented Mode Switcher: Sign In vs Create Account */}
            <div role="tablist" aria-label="Authentication mode" className="grid grid-cols-2 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg border border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => setMode('login')}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#1c1c1c] text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => setMode('register')}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-[#1c1c1c] text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {mode === 'login' ? 'Sign In' : 'Create an Account'}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {mode === 'login'
                  ? 'Sign in to access your organization workspace as Organization Owner.'
                  : 'Register a new agency account with Owner administrative privileges.'}
              </p>
            </div>

            {/* Account Form */}
            <form className="space-y-3.5" onSubmit={handleAuthSubmit}>
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Dawi Tadesse"
                      className="ps-9 text-xs h-10"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <div className="text-neutral-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                      <User className="size-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {mode === 'register' ? 'Work Email Address' : 'Email Address'}
                </label>
                <div className="relative">
                  <Input
                    placeholder="architect@company.com"
                    className="ps-9 text-xs h-10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="text-neutral-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                    <AtSign className="size-4" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    className="ps-9 text-xs h-10"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="text-neutral-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                    <Lock className="size-4" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-10 text-xs font-semibold mt-2">
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Agency Account'}</span>
              </Button>
            </form>

            {/* Mode switch link */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <p className="text-neutral-500 dark:text-neutral-400 text-center text-[11px] leading-relaxed pt-2">
              By proceeding, you agree to Selet&apos;s{' '}
              <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        ) : (
          /* Step 2: Post-Login Organization & Pricing Baseline Setup */
          <div className="mx-auto w-full max-w-md space-y-6 pt-12 lg:pt-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
                <span>Organization Onboarding (Role: OWNER)</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Configure Pricing & Profile
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Define your agency details and baseline financial guardrails before entering the workspace.
              </p>
            </div>

            <form onSubmit={handleSaveAndEnter} className="space-y-4">
              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Company / Agency Name
                </label>
                <Input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  placeholder="e.g. Afro Digital Technologies PLC"
                  className="text-xs"
                  required
                />
              </div>

              {/* TIN */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Tax Identification Number (TIN)
                </label>
                <Input
                  type="text"
                  value={config.tin}
                  onChange={(e) => setConfig({ ...config, tin: e.target.value })}
                  placeholder="e.g. 0012345678"
                  className="text-xs font-mono"
                  required
                />
              </div>

              {/* Currency & Target Margin Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Currency</span>
                  </label>
                  <select
                    value={config.currency}
                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                    className="w-full h-9 rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141414] px-3 py-1 text-xs text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  >
                    <option value="ETB">ETB (Ethiopian Birr)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Margin Floor (%)</span>
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="80"
                    step="1"
                    value={config.marginFloor}
                    onChange={(e) => setConfig({ ...config, marginFloor: parseFloat(e.target.value) || 20 })}
                    className="text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Overhead Rate & Contingency Buffer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Overhead Rate (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={config.overheadRate}
                    onChange={(e) => setConfig({ ...config, overheadRate: parseFloat(e.target.value) || 10 })}
                    className="text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Contingency Rate (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={config.contingencyRate}
                    onChange={(e) => setConfig({ ...config, contingencyRate: parseFloat(e.target.value) || 15 })}
                    className="text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" size="lg" className="w-full text-xs font-semibold gap-2">
                  <span>Save & Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="w-full text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Skip for now (use defaults)
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
