'use client';

import React from 'react';
import { User, Trash2, Lock } from 'lucide-react';
import { TranslationDictionary } from '../../lib/i18n';
import { Feature, EstimationMethod, TShirtSize, RoleOption, UserOption, RoleHours } from './types';

interface FeatureRowProps {
  t: TranslationDictionary;
  feature: Feature;
  roles: RoleOption[];
  users: UserOption[];
  simulatedRole: 'OWNER' | 'PM' | 'DEVELOPER';
  currentUserId: string;
  onUpdateFeature: (updated: Feature) => void;
  onDeleteFeature: (featureId: string) => void;
}

const TSHIRT_VALUES: Record<TShirtSize, number> = {
  XS: 4,
  S: 8,
  M: 16,
  L: 40,
  XL: 80,
};

export const FeatureRow: React.FC<FeatureRowProps> = ({
  t,
  feature,
  roles,
  users,
  simulatedRole,
  currentUserId,
  onUpdateFeature,
  onDeleteFeature,
}) => {
  const isDeveloper = simulatedRole === 'DEVELOPER';
  const isAssignedToCurrentUser = feature.assignedUserId === currentUserId;
  const canEditHours = !isDeveloper || isAssignedToCurrentUser;
  const canEditDetails = !isDeveloper;

  const assignedUser = users.find((u) => u.id === feature.assignedUserId);

  // Helper to calculate expected hours based on method
  const calcExpected = (method: EstimationMethod, rh: Partial<RoleHours>): number => {
    switch (method) {
      case 'THREE_POINT': {
        const o = rh.optimisticHours ?? 0;
        const l = rh.likelyHours ?? 0;
        const p = rh.pessimisticHours ?? 0;
        if (o === 0 && l === 0 && p === 0) return 0;
        return Math.round(((o + 4 * l + p) / 6) * 10) / 10;
      }
      case 'SINGLE_VALUE':
        return Math.max(0, rh.singleHours ?? 0);
      case 'T_SHIRT':
        return rh.tshirtSize ? TSHIRT_VALUES[rh.tshirtSize] || 0 : 0;
      case 'STORY_POINTS':
        return Math.round((rh.storyPoints ?? 0) * 8.0 * 10) / 10;
      default:
        return 0;
    }
  };

  const handleMethodChange = (newMethod: EstimationMethod) => {
    const updatedRoleHours = feature.roleHours.map((rh) => ({
      ...rh,
      expectedHours: calcExpected(newMethod, rh),
    }));

    onUpdateFeature({
      ...feature,
      method: newMethod,
      roleHours: updatedRoleHours,
    });
  };

  const handleRoleHourChange = (roleId: string, delta: Partial<RoleHours>) => {
    const existingIndex = feature.roleHours.findIndex((rh) => rh.roleId === roleId);
    let updatedRoleHours = [...feature.roleHours];

    if (existingIndex >= 0) {
      const merged = { ...updatedRoleHours[existingIndex], ...delta };
      merged.expectedHours = calcExpected(feature.method, merged);
      updatedRoleHours[existingIndex] = merged as RoleHours;
    } else {
      const role = roles.find((r) => r.id === roleId);
      const newEntry: RoleHours = {
        roleId,
        roleName: role?.name || 'Role',
        expectedHours: 0,
        defaultHourlyCostMinor: role?.defaultHourlyCostMinor || 0,
        ...delta,
      };
      newEntry.expectedHours = calcExpected(feature.method, newEntry);
      updatedRoleHours.push(newEntry);
    }

    onUpdateFeature({
      ...feature,
      roleHours: updatedRoleHours,
    });
  };

  const featureTotalHours = feature.roleHours.reduce((sum, rh) => sum + (rh.expectedHours || 0), 0);

  return (
    <div className="bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] rounded-[10px] p-4 mb-3 hover:border-black/[0.12] dark:hover:border-white/[0.14] transition-all">
      {/* Top Bar: Name, Method, Assignment, Total Hours */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex-1 min-w-[240px]">
          {canEditDetails ? (
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onUpdateFeature({ ...feature, name: e.target.value })}
              className="bg-transparent font-medium text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 rounded px-1.5 py-0.5 w-full"
              placeholder={t.featureName}
            />
          ) : (
            <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm px-1.5 py-0.5 block">
              {feature.name}
            </span>
          )}
          {feature.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 px-1.5 mt-0.5">{feature.description}</p>
          )}
        </div>

        {/* Method Selector */}
        <div className="flex items-center gap-2">
          {canEditDetails ? (
            <select
              value={feature.method}
              aria-label={t.estimationMethod}
              onChange={(e) => handleMethodChange(e.target.value as EstimationMethod)}
              className="bg-white dark:bg-[#181818] border border-black/[0.08] dark:border-white/[0.08] text-neutral-900 dark:text-neutral-100 text-xs rounded-[7px] px-2.5 py-1 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="THREE_POINT">PERT (O/L/P)</option>
              <option value="SINGLE_VALUE">Single Value (h)</option>
              <option value="T_SHIRT">T-Shirt Size</option>
              <option value="STORY_POINTS">Story Points</option>
            </select>
          ) : (
            <span className="text-xs bg-black/[0.04] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 px-2.5 py-1 rounded-[7px] border border-black/[0.06] dark:border-white/[0.08] font-mono">
              {feature.method}
            </span>
          )}

          {/* Assigned Developer */}
          {canEditDetails ? (
            <select
              value={feature.assignedUserId || ''}
              onChange={(e) =>
                onUpdateFeature({
                  ...feature,
                  assignedUserId: e.target.value || undefined,
                  assignedUserName: users.find((u) => u.id === e.target.value)?.name,
                })
              }
              className="bg-white dark:bg-[#181818] border border-black/[0.08] dark:border-white/[0.08] text-neutral-900 dark:text-neutral-100 text-xs rounded-[7px] px-2.5 py-1 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="">-- {t.unassigned} --</option>
              {users
                .filter((u) => u.role === 'DEVELOPER')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          ) : (
            <span
              className={`text-xs px-2.5 py-1 rounded-[7px] border flex items-center gap-1.5 ${
                isAssignedToCurrentUser
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <User className="w-3.5 h-3.5 inline text-neutral-500" />
              <span>{assignedUser ? assignedUser.name : t.unassigned}</span>
            </span>
          )}

          {/* Feature Hours Badge */}
          <div className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-[7px] px-2.5 py-1 text-xs font-mono font-semibold">
            {Math.round(featureTotalHours * 10) / 10}h
          </div>

          {/* Delete Feature (Owner/PM only) */}
          {canEditDetails && (
            <button
              onClick={() => onDeleteFeature(feature.id)}
              className="text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 text-sm rounded-[7px] transition-colors"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Developer Restricted Warning if not assigned */}
      {!canEditHours && (
        <div className="mb-2 text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-[7px] px-2.5 py-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 shrink-0" /> {t.onlyAssignedCanEdit}
        </div>
      )}

      {/* Role Hours Breakdown Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((role) => {
          const rh = feature.roleHours.find((r) => r.roleId === role.id) || {
            roleId: role.id,
            roleName: role.name,
            expectedHours: 0,
            defaultHourlyCostMinor: role.defaultHourlyCostMinor || 0,
          };

          return (
            <div
              key={role.id}
              className={`rounded-[7px] p-2.5 border transition-all text-xs ${
                rh.expectedHours > 0
                  ? 'bg-white dark:bg-[#181818] border-black/[0.1] dark:border-white/[0.12] shadow-sm'
                  : 'bg-black/[0.015] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{role.name}</span>
                <span className="font-semibold font-mono text-neutral-900 dark:text-neutral-100">
                  {Math.round((rh.expectedHours || 0) * 10) / 10}h
                </span>
              </div>

              {/* METHOD-SPECIFIC INPUTS */}
              {feature.method === 'THREE_POINT' && (
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  <div>
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block">O (min)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditHours}
                      value={rh.optimisticHours ?? ''}
                      onChange={(e) =>
                        handleRoleHourChange(role.id, {
                          optimisticHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-1.5 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                      placeholder="O"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block">L (likely)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditHours}
                      value={rh.likelyHours ?? ''}
                      onChange={(e) =>
                        handleRoleHourChange(role.id, {
                          likelyHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-1.5 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                      placeholder="L"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block">P (max)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditHours}
                      value={rh.pessimisticHours ?? ''}
                      onChange={(e) =>
                        handleRoleHourChange(role.id, {
                          pessimisticHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-1.5 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                      placeholder="P"
                    />
                  </div>
                </div>
              )}

              {feature.method === 'SINGLE_VALUE' && (
                <div className="font-mono">
                  <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block font-sans">{t.singleHours}</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEditHours}
                    value={rh.singleHours ?? ''}
                    onChange={(e) =>
                      handleRoleHourChange(role.id, {
                        singleHours: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-2 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                    placeholder="e.g. 16"
                  />
                </div>
              )}

              {feature.method === 'T_SHIRT' && (
                <div>
                  <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block">{t.tshirtSize}</label>
                  <select
                    disabled={!canEditHours}
                    value={rh.tshirtSize || ''}
                    onChange={(e) =>
                      handleRoleHourChange(role.id, {
                        tshirtSize: (e.target.value as TShirtSize) || undefined,
                      })
                    }
                    className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-2 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                  >
                    <option value="">-- Size --</option>
                    <option value="XS">XS (4 hrs)</option>
                    <option value="S">S (8 hrs)</option>
                    <option value="M">M (16 hrs)</option>
                    <option value="L">L (40 hrs)</option>
                    <option value="XL">XL (80 hrs)</option>
                  </select>
                </div>
              )}

              {feature.method === 'STORY_POINTS' && (
                <div className="font-mono">
                  <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block font-sans">{t.storyPoints}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    disabled={!canEditHours}
                    value={rh.storyPoints ?? ''}
                    onChange={(e) =>
                      handleRoleHourChange(role.id, {
                        storyPoints: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40 text-neutral-900 dark:text-neutral-100 px-2 py-1 rounded-[5px] text-xs focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                    placeholder="e.g. 3 (24h)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
