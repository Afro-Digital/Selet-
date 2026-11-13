'use client';

import React, { useState } from 'react';
import { ExchangeRate, ExchangeRateHistory, UserRole } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import {
  Coins,
  RefreshCw,
  SlidersHorizontal,
  History,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface CurrencyWidgetProps {
  rates: ExchangeRate[];
  history: ExchangeRateHistory[];
  userRole: UserRole;
  locale: Locale;
  onSetOverride: (fromCurrency: string, rate: number) => void;
  onClearOverride: (fromCurrency: string) => void;
  onRefreshFeed: () => void;
}

export function CurrencyWidget({
  rates,
  history,
  userRole,
  locale,
  onSetOverride,
  onClearOverride,
  onRefreshFeed,
}: CurrencyWidgetProps) {
  const t = translations[locale];
  const isAuthorized = userRole === 'OWNER' || userRole === 'PM';

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [overrideRateInput, setOverrideRateInput] = useState('135.0');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(overrideRateInput);
    if (!isNaN(val) && val > 0) {
      onSetOverride(selectedCurrency, val);
      setIsOverrideModalOpen(false);
    }
  };

  const handleTriggerRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshFeed();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t.currencyService}</h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {locale === 'am'
              ? 'የኢትዮጵያ ብር (ETB) መሠረት ያደረገ ይፋዊ እና የእጅ ምንዛሬ ተመን አስተዳደር'
              : 'Base currency ETB with automated NBE daily rate feed and manual override capabilities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-[7px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.exchangeRateSnapshots}</span>
          </button>

          {isAuthorized && (
            <button
              onClick={handleTriggerRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold rounded-[7px] transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.refreshFeed}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Exchange Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {rates.map((rate) => {
          const isOverridden = rate.isManualOverride;
          return (
            <div
              key={rate.id}
              className={`p-4 rounded-[12px] border transition-all ${
                isOverridden
                  ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border-amber-500/30 shadow-xs'
                  : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">1 {rate.fromCurrency}</span>
                    <span className="text-neutral-400 font-medium">=</span>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                      {rate.rate.toFixed(2)} ETB
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {isOverridden ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-[5px]">
                        <AlertCircle className="w-3 h-3" />
                        <span>Manual Override Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[5px] font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{rate.source}</span>
                      </span>
                    )}
                  </div>
                </div>

                {isAuthorized && (
                  <div className="flex items-center gap-1.5">
                    {isOverridden ? (
                      <button
                        onClick={() => onClearOverride(rate.fromCurrency)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-[6px] border border-rose-500/20 transition-colors"
                      >
                        {t.clearOverride}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCurrency(rate.fromCurrency);
                          setOverrideRateInput(rate.rate.toString());
                          setIsOverrideModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] bg-black/[0.04] dark:bg-white/[0.08] rounded-[6px] border border-black/[0.06] dark:border-white/[0.08] transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
                        <span>Override</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-neutral-400 mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-between font-mono">
                <span>Effective Date: {new Date(rate.effectiveAt).toLocaleDateString()}</span>
                {isOverridden && (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Beats automatic feed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-[14px] shadow-xl max-w-sm w-full p-5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                Override {selectedCurrency}/ETB Rate
              </h3>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Exchange Rate (ETB per 1 {selectedCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs font-mono text-right bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Manual overrides supersede automated feeds until cleared.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3 py-1.5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-[6px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold rounded-[6px]"
                >
                  {t.setOverride}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-[14px] shadow-xl max-w-lg w-full p-5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-900 dark:text-neutral-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{t.exchangeRateSnapshots}</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {history.length === 0 ? (
                <p className="text-center text-xs text-neutral-400 py-6">
                  No rate snapshot records found.
                </p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        1 {h.fromCurrency} = {h.rate.toFixed(2)} ETB
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-2">({h.source})</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(h.capturedAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
