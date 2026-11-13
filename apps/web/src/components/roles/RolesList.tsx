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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.jobRoles}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              {roles.length} {locale === 'am' ? 'መደቦች' : 'Roles'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {locale === 'am'
              ? 'ለፕሮጀክት ግምት እና ለክፍያ ተመን የሚያገለግሉ የሙያ መደቦች'
              : 'Standardized job roles used for project estimations and rate cards.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRole}</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-indigo-50/50 border-b border-indigo-100 space-y-4"
        >
          <h4 className="text-sm font-bold text-indigo-900">{t.addRole}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Cloud DevOps Specialist"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Responsibilities, tools"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            {isOwner && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Default Cost Floor (ETB / hr)
                </label>
                <input
                  type="number"
                  min="0"
                  value={hourlyCostMajor}
                  onChange={(e) => setHourlyCostMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono text-right"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-md hover:bg-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700"
            >
              {t.save}
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        {roles.map((role) => (
          <div
            key={role.id}
            className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{role.name}</h3>
              {role.description && (
                <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isOwner ? (
                <div className="text-right">
                  <div className="text-xs text-slate-400">Default Cost Floor</div>
                  <div className="font-mono text-xs font-semibold text-slate-700">
                    {formatCurrencyMinor(role.defaultHourlyCostMinor, role.currency)}/hr
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
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
