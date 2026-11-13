'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  AtSign,
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
  const [email, setEmail] = useState('');
  const [config, setConfig] = useState<CompanyConfig>(DEFAULT_CONFIG);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from document
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);

      // Load existing config if available
      try {
        const stored = localStorage.getItem('selet_company_config');
        if (stored) {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
        }
      } catch {
        // use default
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

  const handleSignIn = (provider: string, userEmail?: string) => {
    const finalEmail = userEmail || `${provider.toLowerCase()}@afrodigital.et`;
    setEmail(finalEmail);

    // Save session: user is assigned higher role OWNER by default
    if (typeof window !== 'undefined') {
      const session = {
        role: 'OWNER',
        email: finalEmail,
        provider,
        name: finalEmail.split('@')[0],
        signedInAt: new Date().toISOString(),
      };
      localStorage.setItem('selet_auth_session', JSON.stringify(session));
    }

    // Advance to onboarding / configuration step
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
      {/* Left Branding / Hero Side */}
      <div className="bg-neutral-100 dark:bg-[#121212] relative hidden h-full flex-col border-r border-black/[0.06] dark:border-white/[0.08] p-10 lg:flex select-none overflow-hidden">
        <div className="from-neutral-50 dark:from-[#0c0c0c] absolute inset-0 z-10 bg-gradient-to-t to-transparent opacity-80" />
        
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
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
                (ስሌት)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 tracking-tight">
              Software Costing & Ethiopian Statutory Waterfall Engine
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="z-10 my-auto max-w-md space-y-4">
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

        {/* Quote Testimonial */}
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

        {/* Dynamic Animated Floating Vectors */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Side / Form Area */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Background Radial Glow */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        >
          <div className="bg-[radial-gradient(ellipse_at_top_right,rgba(0,122,85,0.08),transparent_60%)] absolute inset-0" />
        </div>

        {/* Top Controls: Return to Home & Theme Toggle */}
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
            className="w-8 h-8 rounded-full"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-600" />}
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

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Sign In or Join Now!
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sign in to initialize your organization workspace as Organization Owner (highest role).
              </p>
            </div>

            {/* Social Authentication Options */}
            <div className="space-y-2.5">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center text-xs font-semibold gap-2.5 h-10 hover:border-black/[0.2] dark:hover:border-white/[0.2]"
                onClick={() => handleSignIn('Google')}
              >
                <GoogleIcon className="size-4" />
                <span>Continue with Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center text-xs font-semibold gap-2.5 h-10 hover:border-black/[0.2] dark:hover:border-white/[0.2]"
                onClick={() => handleSignIn('Apple')}
              >
                <AppleIcon className="size-4" />
                <span>Continue with Apple</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center text-xs font-semibold gap-2.5 h-10 hover:border-black/[0.2] dark:hover:border-white/[0.2]"
                onClick={() => handleSignIn('GitHub')}
              >
                <GitHubIcon className="size-4" />
                <span>Continue with GitHub</span>
              </Button>
            </div>

            <AuthSeparator />

            {/* Email Authentication Form */}
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) handleSignIn('Email', email.trim());
              }}
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Email Address
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

              <Button type="submit" size="lg" className="w-full h-10 text-xs font-semibold">
                <span>Continue With Email</span>
              </Button>
            </form>

            <p className="text-neutral-500 dark:text-neutral-400 text-center text-[11px] leading-relaxed">
              By clicking continue, you agree to our{' '}
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

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-neutral-900 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 25 + (path.id % 5) * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669 C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62 c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401 c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
  </svg>
);

const AppleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.5 2.64-1.24z" />
  </svg>
);

const GitHubIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center my-1">
      <div className="bg-black/[0.08] dark:bg-white/[0.08] h-px w-full" />
      <span className="text-neutral-400 dark:text-neutral-500 px-3 text-[11px] font-mono uppercase tracking-wider">
        OR
      </span>
      <div className="bg-black/[0.08] dark:bg-white/[0.08] h-px w-full" />
    </div>
  );
};
