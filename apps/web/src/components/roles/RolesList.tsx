'use client';

import React, { useState } from 'react';
import { Role, UserRole } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import { formatCurrencyMinor } from '../../lib/person-cost';
import { Briefcase, Plus, Lock } from 'lucide-react';

interface RolesListProps {
  roles: Role[];
  userRole: UserRole;
  locale: Locale;
  onAddRole: (newRole: Role) => void;
}

export function RolesList({ roles, userRole, locale, onAddRole }: RolesListProps) {
  const t = translations[locale];
  const isOwner = userRole === 'OWNER';

  const [isAdding, setIsAdding] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyCostMajor, setHourlyCostMajor] = useState('400');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    const defaultHourlyCostMinor = BigInt(
      Math.max(0, Math.round(parseFloat(hourlyCostMajor || '0') * 100)),
    ).toString();

    onAddRole({
      id: `role-${Date.now()}`,
      name: roleName.trim(),
      description: description.trim() || undefined,
      defaultHourlyCostMinor,
      currency: 'ETB',
    });

    setRoleName('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
      <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t.jobRoles}</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 rounded-[5px]">
              {roles.length} {locale === 'am' ? 'መደቦች' : 'Roles'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {locale === 'am'
              ? 'ለፕሮጀክት ግምት እና ለክፍያ ተመን የሚያገለግሉ የሙያ መደቦች'
              : 'Standardized job roles used for project estimations and rate cards.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold rounded-[7px] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addRole}</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] space-y-4"
        >
          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">{t.addRole}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Cloud DevOps Specialist"
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Responsibilities, tools"
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            {isOwner && (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Default Cost Floor (ETB / hr)
                </label>
                <input
                  type="number"
                  min="0"
                  value={hourlyCostMajor}
                  onChange={(e) => setHourlyCostMajor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-right focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-[6px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold rounded-[6px]"
            >
              {t.save}
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
        {roles.map((role) => (
          <div
            key={role.id}
            className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">{role.name}</h3>
              {role.description && (
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{role.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isOwner ? (
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400">Default Cost Floor</div>
                  <div className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatCurrencyMinor(role.defaultHourlyCostMinor, role.currency)}/hr
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-[5px]">
                  <Lock className="w-3 h-3" />
                  <span>Cost Floor Redacted</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
