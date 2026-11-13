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
    <div className="bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] p-6 shadow-sm mb-8 text-neutral-900 dark:text-neutral-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <span>📊</span> {t.costBreakdown}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Full project cost formula: Direct + Risk (Contingency + Multipliers) + Overhead
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold block">
            {t.totalEstimateHours}
          </span>
          <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
            {data.totalHours} hrs
          </span>
        </div>
      </div>

      {!isDeveloper ? (
        <div className="mt-5 space-y-4">
          {/* Step 1: Direct Costs Breakdown */}
          <div className="bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-600 dark:text-neutral-400">
                1. {t.directCost}
              </span>
              <span className="text-sm font-semibold font-mono text-neutral-900 dark:text-neutral-100">
                {formatMoney(data.directCostMinor)} {data.currency}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-[#181818] p-3 rounded-[7px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <span className="text-neutral-500 dark:text-neutral-400 block mb-1">
                  Direct Labor ({data.totalHours}h):
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                  {formatMoney(data.laborCostMinor)} {data.currency}
                </span>
              </div>
              <div className="bg-white dark:bg-[#181818] p-3 rounded-[7px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <span className="text-neutral-500 dark:text-neutral-400 block mb-1">Agency Infra & Tools:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                  {formatMoney(data.toolsCostMinor + data.agencyInfrastructureCostMinor)}{' '}
                  {data.currency}
                </span>
              </div>
              <div className="bg-white dark:bg-[#181818] p-3 rounded-[7px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <span className="text-neutral-500 dark:text-neutral-400 block mb-1">Third-Party & Domain:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                  {formatMoney(data.thirdPartyCostMinor)} {data.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Risk & Contingency */}
          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-[10px] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                2. {t.riskContingencyCost} (+{(data.totalRiskRate * 100).toFixed(1)}%)
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 block">
                Direct Cost × Total Risk Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 font-mono block">
                +{formatMoney(data.riskCostMinor)} {data.currency}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono block">
                Subtotal with risk: {formatMoney(data.subtotalWithRiskMinor)} {data.currency}
              </span>
            </div>
          </div>

          {/* Step 3: Overhead Allocation */}
          <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-[10px] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold font-mono text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                3. {t.overheadCost} (+{(data.overheadRate * 100).toFixed(0)}%)
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 block">
                (Direct Cost + Risk) × Overhead Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 font-mono">
                +{formatMoney(data.overheadCostMinor)} {data.currency}
              </span>
            </div>
          </div>

          {/* Grand Total Project Cost */}
          <div className="bg-emerald-500/[0.06] dark:bg-emerald-500/[0.1] border border-emerald-500/25 rounded-[10px] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                {t.totalProjectCost}
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 block">
                Total agency project cost basis before target pricing margin.
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                {formatMoney(data.totalCostMinor)}{' '}
                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 font-sans">{data.currency}</span>
              </div>
            </div>
          </div>

          {/* Separate Client Pass-Through Monthly Total */}
          <div className="pt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span>Pass-through recurring infrastructure (Client billed):</span>
            <span className="font-semibold font-mono text-neutral-900 dark:text-neutral-100">
              {formatMoney(data.clientRecurringMonthlyMinor)} {data.currency} / month
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-[7px] p-3 text-xs font-mono text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <span>🔒</span> {t.developerHoursOnlyNotice}
        </div>
      )}
    </div>
  );
};
