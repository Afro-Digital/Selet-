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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.currencyService}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {locale === 'am'
              ? 'የኢትዮጵያ ብር (ETB) መሠረት ያደረገ ይፋዊ እና የእጅ ምንዛሬ ተመን አስተዳደር'
              : 'Base currency ETB with automated NBE daily rate feed and manual override capabilities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.exchangeRateSnapshots}</span>
          </button>

          {isAuthorized && (
            <button
              onClick={handleTriggerRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.refreshFeed}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Exchange Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rates.map((rate) => {
          const isOverridden = rate.isManualOverride;
          return (
            <div
              key={rate.id}
              className={`p-5 rounded-xl border transition-all ${
                isOverridden
                  ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">1 {rate.fromCurrency}</span>
                    <span className="text-slate-400 font-medium">=</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">
                      {rate.rate.toFixed(2)} ETB
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {isOverridden ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Manual Override Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white bg-slate-100 rounded border border-slate-200 transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                        <span>Override</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-200/60 flex justify-between">
                <span>Effective Date: {new Date(rate.effectiveAt).toLocaleDateString()}</span>
                {isOverridden && (
                  <span className="text-amber-700 font-medium">Beats automatic feed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                Override {selectedCurrency}/ETB Rate
              </h3>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Exchange Rate (ETB per 1 {selectedCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Manual overrides supersede automated feeds until cleared.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">{t.exchangeRateSnapshots}</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto flex-1 divide-y divide-slate-100">
              {history.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No rate snapshot records found.
                </p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">
                        1 {h.fromCurrency} = {h.rate.toFixed(2)} ETB
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">({h.source})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
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
