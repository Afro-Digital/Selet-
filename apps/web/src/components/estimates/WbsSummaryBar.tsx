'use client';

import React from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { ProjectItem, RoleOption } from './types';

interface WbsSummaryBarProps {
  t: TranslationDictionary;
  project: ProjectItem;
  roles: RoleOption[];
  simulatedRole: 'OWNER' | 'PM' | 'DEVELOPER';
}

export const WbsSummaryBar: React.FC<WbsSummaryBarProps> = ({
  t,
  project,
  roles,
  simulatedRole,
}) => {
  const isDeveloper = simulatedRole === 'DEVELOPER';

  // Calculate totals
  let totalHours = 0;
  const roleHoursMap: Record<string, { name: string; hours: number; costMinor: number }> = {};

  for (const r of roles) {
    roleHoursMap[r.id] = {
      name: r.name,
      hours: 0,
      costMinor: r.defaultHourlyCostMinor || 0,
    };
  }

  const collectModuleHours = (modules: typeof project.modules) => {
    for (const mod of modules) {
      for (const feat of mod.features) {
        for (const rh of feat.roleHours) {
          const h = rh.expectedHours || 0;
          totalHours += h;

          let roleEntry = roleHoursMap[rh.roleId];
          if (!roleEntry) {
            roleEntry = {
              name: rh.roleName || 'Role',
              hours: 0,
              costMinor: rh.defaultHourlyCostMinor || 0,
            };
            roleHoursMap[rh.roleId] = roleEntry;
          }
          roleEntry.hours += h;
        }
      }
      if (mod.children) {
        collectModuleHours(mod.children);
      }
    }
  };

  collectModuleHours(project.modules);

  let totalLaborCostMinor = 0;
  if (!isDeveloper) {
    for (const r of Object.values(roleHoursMap)) {
      totalLaborCostMinor += r.hours * r.costMinor;
    }
  }

  const roleChips = Object.values(roleHoursMap).filter((r) => r.hours > 0);

  return (
    <div className="bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] p-5 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Main Hour Total */}
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold block mb-1">
            {t.totalEstimateHours}
          </span>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight flex items-baseline gap-2">
            <span>{Math.round(totalHours * 10) / 10}</span>
            <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 font-sans">hrs</span>
          </div>
        </div>

        {/* Cost Summary (Owner/PM only) */}
        {!isDeveloper ? (
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
              {t.estimatedLaborCost}
            </span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {(totalLaborCostMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {project.currency}
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[7px] px-3 py-2 text-xs font-mono text-amber-700 dark:text-amber-300">
            🔒 {t.developerHoursOnlyNotice}
          </div>
        )}

        {/* Role Breakdown Chips */}
        <div className="flex-1 min-w-[280px]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold block mb-2">
            {t.roleBreakdown}
          </span>
          <div className="flex flex-wrap gap-2">
            {roleChips.length === 0 ? (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">No hours estimated yet</span>
            ) : (
              roleChips.map((r, i) => (
                <div
                  key={i}
                  className="bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-[7px] px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 font-mono"
                >
                  <span className="text-neutral-400 dark:text-neutral-500 font-sans">{r.name}:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {Math.round(r.hours * 10) / 10}h
                  </span>
                  {!isDeveloper && r.costMinor > 0 && (
                    <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">
                      ({Math.round((r.hours * r.costMinor) / 100).toLocaleString()}{' '}
                      {project.currency})
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
