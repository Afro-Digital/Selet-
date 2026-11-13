'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { UserRole } from '../../types';
import {
  createBalancerLine,
  lockBlended,
  targetPriceMode,
  applyDiscount,
  money,
  BalancerLine,
  BalancerResult,
} from '@selet/pricing-engine';
import { Sliders, Target, Percent, AlertCircle, Lock, ArrowRight } from 'lucide-react';

export interface ModuleLineItem {
  id: string;
  name: string;
  costMinor: number;
  margin: number;
  floorMargin?: number;
  ceilingMargin?: number;
}

interface MarginBalancerProps {
  t: TranslationDictionary;
  userRole: UserRole;
  currency: string;
  initialLines: ModuleLineItem[];
  initialBlendedMargin?: number;
  floorMargin?: number;
  onBlendedMarginChange?: (blended: number, totalPriceMinor: number) => void;
}

export const MarginBalancer: React.FC<MarginBalancerProps> = ({
  t,
  userRole,
  currency,
  initialLines,
  initialBlendedMargin = 0.3,
  floorMargin = 0.15,
  onBlendedMarginChange,
}) => {
  const isDeveloper = userRole === 'DEVELOPER';

  const [balancerMode, setBalancerMode] = useState<'LOCK_BLENDED' | 'TARGET_PRICE' | 'DISCOUNT'>(
    'LOCK_BLENDED',
  );
  const [lockedBlendedMargin, setLockedBlendedMargin] = useState<number>(initialBlendedMargin);

  // Initialize Balancer Lines from pricing-engine
  const [lines, setLines] = useState<BalancerLine[]>(() => {
    return initialLines.map((l) =>
      createBalancerLine(l.id, l.name, money(BigInt(l.costMinor), currency), l.margin, {
        floorMargin: l.floorMargin ?? floorMargin,
        ceilingMargin: l.ceilingMargin ?? 0.7,
      }),
    );
  });

  const [activeChangedLineId, setActiveChangedLineId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [balancerResult, setBalancerResult] = useState<BalancerResult | null>(null);

  // Target Budget state
  const totalCostMinor = lines.reduce((acc, l) => acc + Number(l.cost.amount), 0);
  const [targetBudget, setTargetBudget] = useState<number>(
    Math.round((totalCostMinor * 1.45) / 100),
  );

  // Discount state
  const [discountPercent, setDiscountPercent] = useState<number>(0.1); // 10%
  const [discountTargetLineId, setDiscountTargetLineId] = useState<string>('ALL');

  const formatMoney = (minor: number) => {
    return (minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 1. Handle Module Margin Change in Lock-Blended Mode
  const handleLineMarginChange = (lineId: string, newMargin: number) => {
    if (isDeveloper) return;

    setActiveChangedLineId(lineId);

    // Call pure pricing-engine lockBlended
    const result = lockBlended(lines, lineId, newMargin, lockedBlendedMargin);
    setBalancerResult(result);
    setLines(result.lines);

    const changed = result.lines.find((l) => l.id === lineId);
    const balancing = result.lines.find((l) => l.id !== lineId);

    if (balancing && changed) {
      setExplanation(
        `Adjusted ${changed.name} margin to ${(newMargin * 100).toFixed(1)}%. ${balancing.name} margin shifted to ${(balancing.margin * 100).toFixed(1)}% to maintain ${(lockedBlendedMargin * 100).toFixed(1)}% blended margin.`,
      );
    }

    onBlendedMarginChange?.(result.blendedMargin, Number(result.totalPrice.amount));
  };

  // 2. Handle Locked Target Blended Margin Change
  const handleTargetBlendedChange = (newTarget: number) => {
    if (isDeveloper) return;
    setLockedBlendedMargin(newTarget);

    const firstLineId = lines[0]?.id;
    if (!firstLineId) return;

    const result = lockBlended(lines, firstLineId, lines[0]!.margin, newTarget);
    setBalancerResult(result);
    setLines(result.lines);
    onBlendedMarginChange?.(result.blendedMargin, Number(result.totalPrice.amount));
  };

  // 3. Handle Target Budget Mode
  const handleApplyBudget = () => {
    if (isDeveloper) return;
    const budgetMoney = money(BigInt(Math.round(targetBudget * 100)), currency);
    const result = targetPriceMode(lines, budgetMoney, floorMargin);
    setBalancerResult(result);
    setLines(result.lines);
    setExplanation(
      `Distributed client budget of ${targetBudget.toLocaleString()} ${currency} proportionally across modules. Resulting blended margin: ${(result.blendedMargin * 100).toFixed(1)}%.`,
    );
    onBlendedMarginChange?.(result.blendedMargin, Number(result.totalPrice.amount));
  };

  // 4. Handle What-If Discount
  const handleApplyDiscount = () => {
    if (isDeveloper) return;
    const targetId = discountTargetLineId === 'ALL' ? undefined : discountTargetLineId;
    const result = applyDiscount(lines, discountPercent, targetId, floorMargin);
    setBalancerResult(result);
    setLines(result.lines);
    setExplanation(
      `Applied ${(discountPercent * 100).toFixed(0)}% discount ${targetId ? 'to line' : 'to entire project'}. Resulting blended margin: ${(result.blendedMargin * 100).toFixed(1)}%.`,
    );
    onBlendedMarginChange?.(result.blendedMargin, Number(result.totalPrice.amount));
  };

  const totalPriceMinor = lines.reduce((acc, l) => acc + Number(l.price.amount), 0);
  const blendedMargin =
    totalPriceMinor > 0 ? (totalPriceMinor - totalCostMinor) / totalPriceMinor : 0;
  const isFloorBreached = blendedMargin < floorMargin;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>⚖️</span> {t.marginBalancer}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic margin redistribution engine. Lock project margin, model client budgets, and
            test what-if discounts without margin leakage.
          </p>
        </div>

        {/* Live Blended Margin Badge */}
        {!isDeveloper && (
          <div
            className={`border rounded-xl px-4 py-2 text-right ${
              isFloorBreached
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-indigo-50 border-indigo-200 text-indigo-950'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block">
              {t.blendedMargin}
            </span>
            <span className="text-2xl font-black font-mono">
              {(blendedMargin * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Floor: {(floorMargin * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {!isDeveloper ? (
        <div className="mt-6 space-y-6">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 gap-3">
            <button
              onClick={() => setBalancerMode('LOCK_BLENDED')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'LOCK_BLENDED'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{t.lockBlendedMargin}</span>
            </button>

            <button
              onClick={() => setBalancerMode('TARGET_PRICE')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'TARGET_PRICE'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{t.targetPriceMode}</span>
            </button>

            <button
              onClick={() => setBalancerMode('DISCOUNT')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'DISCOUNT'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>{t.whatIfDiscount}</span>
            </button>
          </div>

          {/* Mode 1: Lock Blended Controls */}
          {balancerMode === 'LOCK_BLENDED' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="target-blended-slider" className="text-xs font-bold text-slate-800">
                  Target Blended Margin: {(lockedBlendedMargin * 100).toFixed(0)}%
                </label>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  Locked Total: {formatMoney(totalPriceMinor)} {currency}
                </span>
              </div>
              <input
                id="target-blended-slider"
                type="range"
                min="0.10"
                max="0.60"
                step="0.01"
                value={lockedBlendedMargin}
                onChange={(e) => handleTargetBlendedChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Adjust any module margin below. The other modules will automatically flex to
                maintain this blended margin.
              </span>
            </div>
          )}

          {/* Mode 2: Target Price (Client Budget) Controls */}
          {balancerMode === 'TARGET_PRICE' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="client-budget-input"
                    className="text-xs font-bold text-slate-800 block mb-1"
                  >
                    Client Fixed Budget ({currency})
                  </label>
                  <input
                    id="client-budget-input"
                    type="number"
                    min="1000"
                    step="5000"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleApplyBudget}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Target className="w-4 h-4" />
                    <span>Calculate Line Distribution</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: What-If Discount Controls */}
          {balancerMode === 'DISCOUNT' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="discount-slider" className="text-xs font-bold text-slate-800">
                      Discount: {(discountPercent * 100).toFixed(0)}%
                    </label>
                  </div>
                  <input
                    id="discount-slider"
                    type="range"
                    min="0.01"
                    max="0.40"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discount-target-select"
                    className="text-xs font-bold text-slate-800 block mb-1"
                  >
                    Apply Discount To
                  </label>
                  <select
                    id="discount-target-select"
                    value={discountTargetLineId}
                    onChange={(e) => setDiscountTargetLineId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">Entire Project</option>
                    {lines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Percent className="w-4 h-4" />
                    <span>Apply What-If Discount</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Callout Banner */}
          {explanation && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{explanation}</span>
            </div>
          )}

          {/* Infeasibility / Guardrail Warning */}
          {balancerResult && !balancerResult.isFeasible && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">{t.infeasibleMarginGap}</span>
                <p className="mt-0.5 text-rose-800">
                  {balancerResult.infeasibilityReason ||
                    'One or more balancing lines breached commercial margin floors or ceilings.'}
                </p>
                {balancerResult.gapPrice && (
                  <span className="font-mono font-bold mt-1 block">
                    Unabsorbed Margin Gap: {formatMoney(Number(balancerResult.gapPrice.amount))}{' '}
                    {currency}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Module Lines Balancer Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Module / Line Item</th>
                  <th className="py-3 px-4 text-right">Cost Basis</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lines.map((line) => {
                  const lineCostMinor = Number(line.cost.amount);
                  const linePriceMinor = Number(line.price.amount);
                  const lineProfitMinor = linePriceMinor - lineCostMinor;

                  return (
                    <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {line.name}
                        {activeChangedLineId === line.id && (
                          <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 text-xs">
                        {formatMoney(lineCostMinor)} {currency}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-xs mx-auto">
                          <input
                            aria-label={`${line.name} Margin`}
                            type="range"
                            min="0.10"
                            max="0.65"
                            step="0.01"
                            value={line.margin}
                            onChange={(e) =>
                              handleLineMarginChange(line.id, parseFloat(e.target.value))
                            }
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                          <span className="w-12 text-right font-mono font-bold text-xs text-indigo-600">
                            {(line.margin * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        {formatMoney(linePriceMinor)} {currency}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-xs">
                        +{formatMoney(lineProfitMinor)} {currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
                <tr>
                  <td className="py-3 px-4 text-slate-800">Total Project</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800 text-xs">
                    {formatMoney(totalCostMinor)} {currency}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-700 text-xs">
                    {(blendedMargin * 100).toFixed(1)}% Blended
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-900 text-sm">
                    {formatMoney(totalPriceMinor)} {currency}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 text-xs">
                    +{formatMoney(totalPriceMinor - totalCostMinor)} {currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-700" />
          <span>Margin Balancer and financial levers are hidden in Developer mode.</span>
        </div>
      )}
    </div>
  );
};
