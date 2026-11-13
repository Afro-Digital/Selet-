'use client';

import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Scale,
  FileCheck2,
  X,
  ShieldAlert,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { TranslationDictionary, Locale } from '../../lib/i18n';

export interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
  locale?: Locale;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  t,
  locale = 'en',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-desc"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-[#141414] rounded-[14px] shadow-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-neutral-900 text-white flex items-start justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[7px] bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 id="disclaimer-title" className="text-base font-semibold tracking-tight">
                {t.legalDisclaimerTitle}
              </h2>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                {locale === 'am' ? 'የኢትዮጵያ የህግ ማዕቀፍ እና ገደቦች' : 'Ethiopian Statutory Framework & Scope of Use'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[7px] text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {/* Main Scope Callout */}
          <div className="p-4 rounded-[10px] bg-amber-500/[0.08] border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p id="disclaimer-desc" className="font-semibold text-xs sm:text-sm">
                {t.legalDisclaimerSummary}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                {t.verificationResponsibility}
              </p>
            </div>
          </div>

          {/* Statutory Breakdown Cards */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold font-mono text-neutral-500 dark:text-neutral-400 text-[10px] uppercase tracking-wider">
              {locale === 'am' ? 'የህግ ማጣቀሻዎች እና ተፈጻሚነት' : 'Statutory Basis & Reference Framework'}
            </h3>

            {/* Item 1: VAT 15% */}
            <div className="p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex items-start gap-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Value Added Tax (VAT 15%)
                  </span>
                  <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Proc. 1341/2016
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t.vatProclamationNotice}</p>
              </div>
            </div>

            {/* Item 2: Withholding Tax 3% & 10% */}
            <div className="p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Withholding Tax (3% Domestic / 10% Non-Resident)
                  </span>
                  <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    Proc. 979/2016
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t.withholdingNotice}</p>
              </div>
            </div>

            {/* Item 3: POESSA Pension 11% */}
            <div className="p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex items-start gap-3">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    Employer Social Security (POESSA 11%)
                  </span>
                  <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                    Proc. 1268/2022
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t.pensionPoessaNotice}</p>
              </div>
            </div>

            {/* Item 4: Foreign Exchange NBE */}
            <div className="p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex items-start gap-3">
              <Scale className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                    NBE Foreign Exchange Conversion
                  </span>
                  <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08]">
                    NBE FXD/01/2024
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t.forexDisclaimerNotice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <span>Ministry of Revenue (MoR) & NBE</span>
            <ExternalLink className="w-3 h-3" />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-[7px] transition-all shadow-sm focus:outline-none cursor-pointer"
          >
            {t.iUnderstand}
          </button>
        </div>
      </div>
    </div>
  );
};
