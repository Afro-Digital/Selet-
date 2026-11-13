'use client';

import React from 'react';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🛡️</span> {t.riskFactors}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Apply project risk multipliers and contingency to guard margin against requirement
            uncertainty and technical debt.
          </p>
        </div>

        {/* Live Total Risk Multiplier Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
          <span className="text-[11px] font-semibold uppercase text-amber-800 tracking-wider block">
            {t.totalRiskRate}
          </span>
          <span className="text-xl font-extrabold text-amber-900">
            {(totalRiskRate * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-amber-700 block">
            {(contingencyRate * 100).toFixed(0)}% contingency +{' '}
            {(enabledMultipliersSum * 100).toFixed(1)}% multipliers
          </span>
        </div>
      </div>

      {/* Contingency & Overhead Global Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-100">
        {/* Contingency Rate */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-800">{t.contingencyRate}</label>
            <span className="text-xs font-bold text-indigo-600">
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
            className="w-full accent-indigo-600 disabled:opacity-50"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline buffer for project scope creep & unforeseen delays.
          </span>
        </div>

        {/* Overhead Rate */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-800">{t.overheadRate}</label>
            <span className="text-xs font-bold text-indigo-600">
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
            className="w-full accent-indigo-600 disabled:opacity-50"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Organization setting (office, management, administrative overhead).
          </span>
        </div>
      </div>

      {/* Risk Multipliers Checklist */}
      <div className="mt-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Project Uncertainty Multipliers
        </h3>

        {riskFactors.map((rf) => (
          <div
            key={rf.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              rf.isEnabled
                ? 'bg-amber-50/60 border-amber-300/80'
                : 'bg-white border-slate-200 hover:border-slate-300'
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
                className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 disabled:opacity-50 cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`rf-${rf.id}`}
                  className={`text-sm font-semibold block cursor-pointer ${
                    rf.isEnabled ? 'text-amber-950' : 'text-slate-800'
                  }`}
                >
                  {rf.name}
                </label>
              </div>
            </div>

            {/* Editable multiplier rate */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Multiplier:</span>
              <input
                type="number"
                min="0"
                max="0.50"
                step="0.01"
                disabled={isDeveloper}
                value={rf.multiplier}
                onChange={(e) => handleMultiplierChange(rf.id, parseFloat(e.target.value) || 0)}
                className="w-20 bg-white border border-slate-300 disabled:opacity-50 rounded-lg px-2 py-1 text-xs font-mono font-bold text-right text-slate-800"
              />
              <span className="text-xs font-bold text-amber-700">
                +{(rf.multiplier * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
