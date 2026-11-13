'use client';

import React from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { UserRole } from '../../types';

export interface ProjectCostSummaryData {
  currency: string;
  totalHours: number;
  laborCostMinor: number;
  toolsCostMinor: number;
  agencyInfrastructureCostMinor: number;
  thirdPartyCostMinor: number;
  directCostMinor: number;
  totalRiskRate: number;
  riskCostMinor: number;
  subtotalWithRiskMinor: number;
  overheadRate: number;
  overheadCostMinor: number;
  totalCostMinor: number;
  clientRecurringMonthlyMinor: number;
}

interface ProjectCostSummaryCardProps {
  t: TranslationDictionary;
  userRole: UserRole;
  data: ProjectCostSummaryData;
}

export const ProjectCostSummaryCard: React.FC<ProjectCostSummaryCardProps> = ({
  t,
  userRole,
  data,
}) => {
  const isDeveloper = userRole === 'DEVELOPER';

  const formatMoney = (minor: number) => {
    return (minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl mb-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📊</span> {t.costBreakdown}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full project cost formula: Direct + Risk (Contingency + Multipliers) + Overhead
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">
            {t.totalEstimateHours}
          </span>
          <span className="text-2xl font-black text-indigo-400 font-mono">
            {data.totalHours} hrs
          </span>
        </div>
      </div>

      {!isDeveloper ? (
        <div className="mt-5 space-y-4">
          {/* Step 1: Direct Costs Breakdown */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. {t.directCost}
              </span>
              <span className="text-base font-bold text-white font-mono">
                {formatMoney(data.directCostMinor)} {data.currency}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  Direct Labor ({data.totalHours}h):
                </span>
                <span className="font-semibold text-white font-mono">
                  {formatMoney(data.laborCostMinor)} {data.currency}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Agency Infra & Tools:</span>
                <span className="font-semibold text-white font-mono">
                  {formatMoney(data.toolsCostMinor + data.agencyInfrastructureCostMinor)}{' '}
                  {data.currency}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Third-Party & Domain:</span>
                <span className="font-semibold text-white font-mono">
                  {formatMoney(data.thirdPartyCostMinor)} {data.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Risk & Contingency */}
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-amber-300 uppercase tracking-wider block">
                2. {t.riskContingencyCost} (+{(data.totalRiskRate * 100).toFixed(1)}%)
              </span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                Direct Cost × Total Risk Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-amber-400 font-mono">
                +{formatMoney(data.riskCostMinor)} {data.currency}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Subtotal with risk: {formatMoney(data.subtotalWithRiskMinor)} {data.currency}
              </span>
            </div>
          </div>

          {/* Step 3: Overhead Allocation */}
          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-300 uppercase tracking-wider block">
                3. {t.overheadCost} (+{(data.overheadRate * 100).toFixed(0)}%)
              </span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">
                (Direct Cost + Risk) × Overhead Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-indigo-400 font-mono">
                +{formatMoney(data.overheadCostMinor)} {data.currency}
              </span>
            </div>
          </div>

          {/* Grand Total Project Cost */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-teal-950/70 to-slate-900 border border-emerald-500/50 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                {t.totalProjectCost}
              </span>
              <span className="text-xs text-slate-300 mt-1 block">
                Total agency project cost basis before target pricing margin.
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {formatMoney(data.totalCostMinor)}{' '}
                <span className="text-lg font-bold text-slate-300">{data.currency}</span>
              </div>
            </div>
          </div>

          {/* Separate Client Pass-Through Monthly Total */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Pass-through recurring infrastructure (Client billed):</span>
            <span className="font-bold text-slate-200 font-mono">
              {formatMoney(data.clientRecurringMonthlyMinor)} {data.currency} / month
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-950/40 border border-amber-900/60 rounded-xl p-4 text-xs text-amber-300 flex items-center gap-2">
          <span>🔒</span> {t.developerHoursOnlyNotice}
        </div>
      )}
    </div>
  );
};
