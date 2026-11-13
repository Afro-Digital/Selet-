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
import { Sliders, Target, Percent, AlertCircle, Lock, ArrowRight, Scale } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#141414] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-6 mb-8 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" /> {t.marginBalancer}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Dynamic margin redistribution engine. Lock project margin, model client budgets, and
            test what-if discounts without margin leakage.
          </p>
        </div>

        {/* Live Blended Margin Badge */}
        {!isDeveloper && (
          <div
            className={`border rounded-[10px] px-4 py-2 text-right font-mono ${
              isFloorBreached
                ? 'bg-rose-500/[0.08] border-rose-500/30 text-rose-700 dark:text-rose-400'
                : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.1] text-neutral-900 dark:text-neutral-100'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider block">
              {t.blendedMargin}
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              {(blendedMargin * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
              Floor: {(floorMargin * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {!isDeveloper ? (
        <div className="mt-6 space-y-6">
          {/* Mode Tabs */}
          <div className="flex border-b border-black/[0.06] dark:border-white/[0.08] gap-3">
            <button
              onClick={() => setBalancerMode('LOCK_BLENDED')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'LOCK_BLENDED'
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.lockBlendedMargin}</span>
            </button>

            <button
              onClick={() => setBalancerMode('TARGET_PRICE')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'TARGET_PRICE'
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{t.targetPriceMode}</span>
            </button>

            <button
              onClick={() => setBalancerMode('DISCOUNT')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                balancerMode === 'DISCOUNT'
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>{t.whatIfDiscount}</span>
            </button>
          </div>

          {/* Mode 1: Lock Blended Controls */}
          {balancerMode === 'LOCK_BLENDED' && (
            <div className="bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] p-4 border border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="target-blended-slider" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Target Blended Margin: {(lockedBlendedMargin * 100).toFixed(0)}%
                </label>
                <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
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
                className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
              />
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                Adjust any module margin below. The other modules will automatically flex to
                maintain this blended margin.
              </span>
            </div>
          )}

          {/* Mode 2: Target Price (Client Budget) Controls */}
          {balancerMode === 'TARGET_PRICE' && (
            <div className="bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] p-4 border border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="client-budget-input"
                    className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1"
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
                    className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleApplyBudget}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs rounded-[7px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Calculate Line Distribution</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: What-If Discount Controls */}
          {balancerMode === 'DISCOUNT' && (
            <div className="bg-black/[0.015] dark:bg-white/[0.02] rounded-[10px] p-4 border border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="discount-slider" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
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
                    className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discount-target-select"
                    className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1"
                  >
                    Apply Discount To
                  </label>
                  <select
                    id="discount-target-select"
                    value={discountTargetLineId}
                    onChange={(e) => setDiscountTargetLineId(e.target.value)}
                    className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-2.5 py-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none cursor-pointer"
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
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs rounded-[7px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Apply What-If Discount</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Callout Banner */}
          {explanation && (
            <div className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-[10px] p-3.5 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2 font-mono">
              <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>{explanation}</span>
            </div>
          )}

          {/* Infeasibility / Guardrail Warning */}
          {balancerResult && !balancerResult.isFeasible && (
            <div className="bg-rose-500/[0.08] border border-rose-500/30 rounded-[10px] p-4 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-xs">{t.infeasibleMarginGap}</span>
                <p className="mt-0.5 text-rose-800 dark:text-rose-300">
                  {balancerResult.infeasibilityReason ||
                    'One or more balancing lines breached commercial margin floors or ceilings.'}
                </p>
                {balancerResult.gapPrice && (
                  <span className="font-mono font-semibold mt-1 block">
                    Unabsorbed Margin Gap: {formatMoney(Number(balancerResult.gapPrice.amount))}{' '}
                    {currency}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Module Lines Balancer Table */}
          <div className="overflow-x-auto rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3.5">Module / Line Item</th>
                  <th className="py-2.5 px-3.5 text-right">Cost Basis</th>
                  <th className="py-2.5 px-3.5 text-center">Margin</th>
                  <th className="py-2.5 px-3.5 text-right">Selling Price</th>
                  <th className="py-2.5 px-3.5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] bg-white dark:bg-[#141414]">
                {lines.map((line) => {
                  const lineCostMinor = Number(line.cost.amount);
                  const linePriceMinor = Number(line.price.amount);
                  const lineProfitMinor = linePriceMinor - lineCostMinor;

                  return (
                    <tr key={line.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                        {line.name}
                        {activeChangedLineId === line.id && (
                          <span className="ml-2 text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 bg-black/[0.06] dark:bg-white/[0.08] text-neutral-800 dark:text-neutral-200 rounded-[5px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400 text-xs">
                        {formatMoney(lineCostMinor)} {currency}
                      </td>
                      <td className="py-3 px-3.5">
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
                            className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
                          />
                          <span className="w-12 text-right font-mono font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                            {(line.margin * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                        {formatMoney(linePriceMinor)} {currency}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        +{formatMoney(lineProfitMinor)} {currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-black/[0.02] dark:bg-white/[0.02] font-semibold border-t border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <td className="py-3 px-3.5 text-neutral-900 dark:text-neutral-100">Total Project</td>
                  <td className="py-3 px-3.5 text-right font-mono text-neutral-700 dark:text-neutral-300 text-xs">
                    {formatMoney(totalCostMinor)} {currency}
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-neutral-900 dark:text-neutral-100 text-xs">
                    {(blendedMargin * 100).toFixed(1)}% Blended
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-neutral-900 dark:text-neutral-50 text-xs font-semibold">
                    {formatMoney(totalPriceMinor)} {currency}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                    +{formatMoney(totalPriceMinor - totalCostMinor)} {currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-[7px] p-4 text-xs font-mono text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Margin Balancer and financial levers are hidden in Developer mode.</span>
        </div>
      )}
    </div>
  );
};
