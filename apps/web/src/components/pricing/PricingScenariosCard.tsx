'use client';

import React from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { UserRole } from '../../types';
import { TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, Lock } from 'lucide-react';

export interface PricingScenarioItem {
  name: string;
  costMinor: number;
  priceMinor: number;
  profitMinor: number;
  margin: number;
}

interface PricingScenariosCardProps {
  t: TranslationDictionary;
  userRole: UserRole;
  currency: string;
  scenarios: {
    low: PricingScenarioItem;
    recommended: PricingScenarioItem;
    high: PricingScenarioItem;
  };
  marketRangeMin: number;
  marketRangeMax: number;
  onMarketRangeChange?: (min: number, max: number) => void;
}

export const PricingScenariosCard: React.FC<PricingScenariosCardProps> = ({
  t,
  userRole,
  currency,
  scenarios,
  marketRangeMin,
  marketRangeMax,
  onMarketRangeChange,
}) => {
  const isDeveloper = userRole === 'DEVELOPER';

  const formatMoney = (minor: number) => {
    return (minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const recommendedPrice = scenarios.recommended.priceMinor / 100;

  let marketStatus: 'BELOW' | 'WITHIN' | 'ABOVE' | 'NOT_SET' = 'NOT_SET';
  if (marketRangeMin > 0 && marketRangeMax > 0) {
    if (recommendedPrice < marketRangeMin) {
      marketStatus = 'BELOW';
    } else if (recommendedPrice > marketRangeMax) {
      marketStatus = 'ABOVE';
    } else {
      marketStatus = 'WITHIN';
    }
  }

  return (
    <div className="bg-white dark:bg-[#141414] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-6 mb-8 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>🏷️</span> {t.pricingAndMargins}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Defensible price modeling: Low (optimistic), Recommended (target margin), and High
            (stretch) calibrated against Ethiopia market baselines.
          </p>
        </div>
      </div>

      {!isDeveloper ? (
        <>
          {/* 3 Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Low / Conservative */}
            <div className="bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t.lowScenario}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[7px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 border border-black/[0.06] dark:border-white/[0.08]">
                    {(scenarios.low.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Optimistic hours & minimum acceptable margin floor.
                </p>

                <div className="mt-4">
                  <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight block">
                    {formatMoney(scenarios.low.priceMinor)} {currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    {formatMoney(scenarios.low.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Profit:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                    +{formatMoney(scenarios.low.profitMinor)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Scenario (Hero) */}
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-[10px] border-2 border-neutral-900 dark:border-white p-5 flex flex-col justify-between shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] uppercase font-mono font-semibold px-3 py-0.5 rounded-[7px] shadow-sm">
                Recommended Quote
              </div>

              <div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-mono font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    {t.recommendedScenario}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[7px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {(scenarios.recommended.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Likely hours with target organization margin.
                </p>

                <div className="mt-4">
                  <span className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight block">
                    {formatMoney(scenarios.recommended.priceMinor)}{' '}
                    <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 font-sans">{currency}</span>
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-xs space-y-1">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    {formatMoney(scenarios.recommended.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-900 dark:text-neutral-100 font-semibold">
                  <span>Projected Net Profit:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(scenarios.recommended.profitMinor)}
                  </span>
                </div>
              </div>
            </div>

            {/* High / Stretch */}
            <div className="bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t.highScenario}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[7px] bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                    {(scenarios.high.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Pessimistic hours with stretch target margin.
                </p>

                <div className="mt-4">
                  <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight block">
                    {formatMoney(scenarios.high.priceMinor)} {currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    {formatMoney(scenarios.high.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Profit:</span>
                  <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                    +{formatMoney(scenarios.high.profitMinor)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Comparison Widget */}
          <div className="mt-6 bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  {t.marketRange}
                </span>
              </div>

              {/* Status Badge */}
              {marketStatus === 'WITHIN' && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-[7px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Within Market Range</span>
                </div>
              )}
              {marketStatus === 'BELOW' && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-[7px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Below Market Baseline (Underpricing Risk)</span>
                </div>
              )}
              {marketStatus === 'ABOVE' && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-700 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-[7px]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Premium / Above Market Baseline</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                  Market Minimum (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={marketRangeMin}
                  onChange={(e) =>
                    onMarketRangeChange?.(parseFloat(e.target.value) || 0, marketRangeMax)
                  }
                  className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                  Market Maximum (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={marketRangeMax}
                  onChange={(e) =>
                    onMarketRangeChange?.(marketRangeMin, parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-[7px] p-4 text-xs font-mono text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>
            Financial margins, pricing scenarios, and profits are strictly hidden in Developer mode.
          </span>
        </div>
      )}
    </div>
  );
};
