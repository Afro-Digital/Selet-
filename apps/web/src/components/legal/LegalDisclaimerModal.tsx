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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-desc"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="disclaimer-title" className="text-base sm:text-lg font-bold tracking-tight">
                {t.legalDisclaimerTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'am' ? 'የኢትዮጵያ የህግ ማዕቀፍ እና ገደቦች' : 'Ethiopian Statutory Framework & Scope of Use'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Main Scope Callout */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p id="disclaimer-desc" className="font-semibold text-xs sm:text-sm">
                {t.legalDisclaimerSummary}
              </p>
              <p className="text-xs text-amber-800 mt-1">
                {t.verificationResponsibility}
              </p>
            </div>
          </div>

          {/* Statutory Breakdown Cards */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {locale === 'am' ? 'የህግ ማጣቀሻዎች እና ተፈጻሚነት' : 'Statutory Basis & Reference Framework'}
            </h3>

            {/* Item 1: VAT 15% */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Value Added Tax (VAT 15%)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    Proc. 1341/2016
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{t.vatProclamationNotice}</p>
              </div>
            </div>

            {/* Item 2: Withholding Tax 3% & 10% */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Withholding Tax (3% Domestic / 10% Non-Resident)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                    Proc. 979/2016
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{t.withholdingNotice}</p>
              </div>
            </div>

            {/* Item 3: POESSA Pension 11% */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Employer Social Security (POESSA 11%)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                    Proc. 1268/2022
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{t.pensionPoessaNotice}</p>
              </div>
            </div>

            {/* Item 4: Foreign Exchange NBE */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Scale className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    NBE Foreign Exchange Conversion
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                    NBE FXD/01/2024
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{t.forexDisclaimerNotice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Ministry of Revenue (MoR) & NBE</span>
            <ExternalLink className="w-3 h-3" />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {t.iUnderstand}
          </button>
        </div>
      </div>
    </div>
  );
};
