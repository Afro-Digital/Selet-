'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { TranslationDictionary } from '../../lib/i18n';
import { UserRole } from '../../types';

export interface RiskFactorUi {
  id: string;
  name: string;
  multiplier: number;
  isEnabled: boolean;
}

interface RiskManagerProps {
  t: TranslationDictionary;
  userRole: UserRole;
  contingencyRate: number;
  overheadRate: number;
  riskFactors: RiskFactorUi[];
  onContingencyChange?: (rate: number) => void;
  onOverheadChange?: (rate: number) => void;
  onRiskFactorsChange?: (factors: RiskFactorUi[]) => void;
}

export const RiskManager: React.FC<RiskManagerProps> = ({
  t,
  userRole,
  contingencyRate,
  overheadRate,
  riskFactors,
  onContingencyChange,
  onOverheadChange,
  onRiskFactorsChange,
}) => {
  const isDeveloper = userRole === 'DEVELOPER';

  const handleToggleFactor = (id: string) => {
    if (isDeveloper) return;
    const updated = riskFactors.map((rf) =>
      rf.id === id ? { ...rf, isEnabled: !rf.isEnabled } : rf,
    );
    onRiskFactorsChange?.(updated);
  };

  const handleMultiplierChange = (id: string, multiplier: number) => {
    if (isDeveloper) return;
    const updated = riskFactors.map((rf) => (rf.id === id ? { ...rf, multiplier } : rf));
    onRiskFactorsChange?.(updated);
  };

  const enabledMultipliersSum = riskFactors
    .filter((rf) => rf.isEnabled)
    .reduce((sum, rf) => sum + rf.multiplier, 0);

  const totalRiskRate = Math.round((contingencyRate + enabledMultipliersSum) * 1000) / 1000;

  return (
    <div className="bg-white dark:bg-[#141414] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-6 mb-8 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> {t.riskFactors}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Apply project risk multipliers and contingency to guard margin against requirement
            uncertainty and technical debt.
          </p>
        </div>

        {/* Live Total Risk Multiplier Badge */}
        <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-[10px] px-4 py-2 text-right font-mono">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
            {t.totalRiskRate}
          </span>
          <span className="text-xl font-semibold text-amber-700 dark:text-amber-400">
            {(totalRiskRate * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
            {(contingencyRate * 100).toFixed(0)}% contingency +{' '}
            {(enabledMultipliersSum * 100).toFixed(1)}% multipliers
          </span>
        </div>
      </div>

      {/* Contingency & Overhead Global Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        {/* Contingency Rate */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-4 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{t.contingencyRate}</label>
            <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
              {(contingencyRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.30"
            step="0.01"
            disabled={isDeveloper}
            value={contingencyRate}
            onChange={(e) => onContingencyChange?.(parseFloat(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-white disabled:opacity-40"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Baseline buffer for project scope creep & unforeseen delays.
          </span>
        </div>

        {/* Overhead Rate */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-4 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{t.overheadRate}</label>
            <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
              {(overheadRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.30"
            step="0.01"
            disabled={isDeveloper}
            value={overheadRate}
            onChange={(e) => onOverheadChange?.(parseFloat(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-white disabled:opacity-40"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Organization setting (office, management, administrative overhead).
          </span>
        </div>
      </div>

      {/* Risk Multipliers Checklist */}
      <div className="mt-5 space-y-3">
        <h3 className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          Project Uncertainty Multipliers
        </h3>

        {riskFactors.map((rf) => (
          <div
            key={rf.id}
            className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-all ${
              rf.isEnabled
                ? 'bg-amber-500/[0.04] border-amber-500/30'
                : 'bg-white dark:bg-[#181818] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.12]'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                id={`rf-${rf.id}`}
                aria-label={rf.name}
                type="checkbox"
                checked={rf.isEnabled}
                disabled={isDeveloper}
                onChange={() => handleToggleFactor(rf.id)}
                className="h-4 w-4 rounded-[4px] accent-neutral-900 dark:accent-white disabled:opacity-40 cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`rf-${rf.id}`}
                  className={`text-xs font-medium block cursor-pointer ${
                    rf.isEnabled ? 'text-amber-900 dark:text-amber-300' : 'text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {rf.name}
                </label>
              </div>
            </div>

            {/* Editable multiplier rate */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">Multiplier:</span>
              <input
                type="number"
                min="0"
                max="0.50"
                step="0.01"
                disabled={isDeveloper}
                value={rf.multiplier}
                onChange={(e) => handleMultiplierChange(rf.id, parseFloat(e.target.value) || 0)}
                className="w-20 bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 rounded-[7px] px-2 py-1 text-xs font-mono font-semibold text-right text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
              <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
                +{(rf.multiplier * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
