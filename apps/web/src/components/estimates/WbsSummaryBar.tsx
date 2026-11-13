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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Main Hour Total */}
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            {t.totalEstimateHours}
          </span>
          <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-2">
            <span>{Math.round(totalHours * 10) / 10}</span>
            <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
        </div>

        {/* Cost Summary (Owner/PM only) */}
        {!isDeveloper ? (
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
              {t.estimatedLaborCost}
            </span>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {(totalLaborCostMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {project.currency}
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg px-3 py-2 text-xs text-amber-300">
            🔒 {t.developerHoursOnlyNotice}
          </div>
        )}

        {/* Role Breakdown Chips */}
        <div className="flex-1 min-w-[280px]">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            {t.roleBreakdown}
          </span>
          <div className="flex flex-wrap gap-2">
            {roleChips.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No hours estimated yet</span>
            ) : (
              roleChips.map((r, i) => (
                <div
                  key={i}
                  className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-200 flex items-center gap-1.5"
                >
                  <span className="text-slate-400">{r.name}:</span>
                  <span className="font-semibold text-indigo-300">
                    {Math.round(r.hours * 10) / 10}h
                  </span>
                  {!isDeveloper && r.costMinor > 0 && (
                    <span className="text-slate-500 text-[10px]">
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
