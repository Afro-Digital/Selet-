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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🏷️</span> {t.pricingAndMargins}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
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
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t.lowScenario}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {(scenarios.low.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optimistic hours & minimum acceptable margin floor.
                </p>

                <div className="mt-4">
                  <span className="text-2xl font-black text-slate-800 font-mono block">
                    {formatMoney(scenarios.low.priceMinor)} {currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/80 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-semibold">
                    {formatMoney(scenarios.low.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Profit:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    +{formatMoney(scenarios.low.profitMinor)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Scenario (Hero) */}
            <div className="bg-gradient-to-b from-indigo-50/80 to-white rounded-2xl border-2 border-indigo-500 p-5 flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-black px-3 py-0.5 rounded-full shadow-xs">
                Recommended Quote
              </div>

              <div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    {t.recommendedScenario}
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {(scenarios.recommended.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Likely hours with target organization margin.
                </p>

                <div className="mt-4">
                  <span className="text-3xl font-black text-indigo-900 font-mono block">
                    {formatMoney(scenarios.recommended.priceMinor)}{' '}
                    <span className="text-base font-bold text-slate-600">{currency}</span>
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-indigo-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-semibold">
                    {formatMoney(scenarios.recommended.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between text-indigo-950 font-bold">
                  <span>Projected Net Profit:</span>
                  <span className="font-mono text-emerald-700">
                    +{formatMoney(scenarios.recommended.profitMinor)}
                  </span>
                </div>
              </div>
            </div>

            {/* High / Stretch */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t.highScenario}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {(scenarios.high.margin * 100).toFixed(0)}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pessimistic hours with stretch target margin.
                </p>

                <div className="mt-4">
                  <span className="text-2xl font-black text-slate-800 font-mono block">
                    {formatMoney(scenarios.high.priceMinor)} {currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/80 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Cost Basis:</span>
                  <span className="font-mono font-semibold">
                    {formatMoney(scenarios.high.costMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Profit:</span>
                  <span className="font-mono font-semibold text-purple-700">
                    +{formatMoney(scenarios.high.profitMinor)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Comparison Widget */}
          <div className="mt-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t.marketRange}
                </span>
              </div>

              {/* Status Badge */}
              {marketStatus === 'WITHIN' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Within Market Range</span>
                </div>
              )}
              {marketStatus === 'BELOW' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Below Market Baseline (Underpricing Risk)</span>
                </div>
              )}
              {marketStatus === 'ABOVE' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Premium / Above Market Baseline</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-700" />
          <span>
            Financial margins, pricing scenarios, and profits are strictly hidden in Developer mode.
          </span>
        </div>
      )}
    </div>
  );
};
