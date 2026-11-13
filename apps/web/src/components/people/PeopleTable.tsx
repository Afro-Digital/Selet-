'use client';

import React, { useState } from 'react';
import { Person, Role, UserRole, PayType } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import { formatCurrencyMinor, computePersonCost } from '../../lib/person-cost';
import {
  ShieldAlert,
  UserCheck,
  Edit2,
  Trash2,
  Check,
  X,
  UserPlus,
  Lock,
  Percent,
  Clock,
} from 'lucide-react';

interface PeopleTableProps {
  people: Person[];
  roles: Role[];
  userRole: UserRole;
  locale: Locale;
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (id: string) => void;
  onOpenAddModal: () => void;
}

interface EditFormState {
  name: string;
  roleId: string;
  payType: PayType;
  basicSalaryMajor: string;
  allowancesMajor: string;
  benefitsMajor: string;
  directHourlyRateMajor: string;
  utilizationPercent: string;
  isEthiopianNational: boolean;
}

export function PeopleTable({
  people,
  roles,
  userRole,
  locale,
  onUpdatePerson,
  onDeletePerson,
  onOpenAddModal,
}: PeopleTableProps) {
  const t = translations[locale];
  const isOwner = userRole === 'OWNER';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const startEdit = (person: Person) => {
    setEditingId(person.id);
    setValidationError(null);
    setEditForm({
      name: person.name,
      roleId: person.roleId,
      payType: person.payType,
      basicSalaryMajor: person.basicSalaryMinor
        ? (Number(person.basicSalaryMinor) / 100).toString()
        : '0',
      allowancesMajor: person.allowancesMinor
        ? (Number(person.allowancesMinor) / 100).toString()
        : '0',
      benefitsMajor: person.benefitsMinor ? (Number(person.benefitsMinor) / 100).toString() : '0',
      directHourlyRateMajor: person.directHourlyRateMinor
        ? (Number(person.directHourlyRateMinor) / 100).toString()
        : '0',
      utilizationPercent: Math.round(person.utilizationRate * 100).toString(),
      isEthiopianNational: person.isEthiopianNational,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setValidationError(null);
  };

  const saveEdit = (original: Person) => {
    if (!editForm) return;

    if (!editForm.name.trim()) {
      setValidationError(t.validationRequired);
      return;
    }

    const utilNum = parseFloat(editForm.utilizationPercent);
    if (isNaN(utilNum) || utilNum < 1 || utilNum > 100) {
      setValidationError(t.validationUtilization);
      return;
    }

    const basicSalaryMinor = isOwner
      ? BigInt(
          Math.max(0, Math.round(parseFloat(editForm.basicSalaryMajor || '0') * 100)),
        ).toString()
      : original.basicSalaryMinor;

    const allowancesMinor = isOwner
      ? BigInt(
          Math.max(0, Math.round(parseFloat(editForm.allowancesMajor || '0') * 100)),
        ).toString()
      : original.allowancesMinor;

    const benefitsMinor = isOwner
      ? BigInt(Math.max(0, Math.round(parseFloat(editForm.benefitsMajor || '0') * 100))).toString()
      : original.benefitsMinor;

    const directHourlyRateMinor = isOwner
      ? BigInt(
          Math.max(0, Math.round(parseFloat(editForm.directHourlyRateMajor || '0') * 100)),
        ).toString()
      : original.directHourlyRateMinor;

    const updatedPerson: Person = {
      ...original,
      name: editForm.name.trim(),
      roleId: editForm.roleId,
      role: roles.find((r) => r.id === editForm.roleId) || original.role,
      payType: editForm.payType,
      basicSalaryMinor,
      allowancesMinor,
      benefitsMinor,
      directHourlyRateMinor,
      utilizationRate: utilNum / 100,
      isEthiopianNational: editForm.isEthiopianNational,
    };

    if (isOwner) {
      updatedPerson.computedHourlyCost = computePersonCost(updatedPerson);
    }

    onUpdatePerson(updatedPerson);
    setEditingId(null);
    setEditForm(null);
    setValidationError(null);
  };

  const getPayTypeLabel = (pt: PayType) => {
    switch (pt) {
      case 'MONTHLY_SALARY':
        return t.monthlySalary;
      case 'HOURLY':
        return t.hourly;
      case 'PER_PROJECT':
        return t.perProject;
      case 'CONTRACTOR':
        return t.contractor;
      default:
        return pt;
    }
  };

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
      {/* Header bar */}
      <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t.teamMembers}</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-[5px] border border-emerald-500/20">
              {people.length} {locale === 'am' ? 'አባላት' : 'Members'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {locale === 'am'
              ? 'የደመወዝ፣ የወጪ አጠቃቀም እና የሰዓት ተመን አስተዳደር'
              : 'Manage salaries, utilization, pension eligibility, and computed hourly costs.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold rounded-[7px] transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addMember}</span>
          </button>
        )}
      </div>

      {/* Redacted Notice for Non-Owners */}
      {!isOwner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p>{t.redactedNotice}</p>
        </div>
      )}

      {/* Inline Validation Alert */}
      {validationError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-5 py-2.5 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <th className="py-2.5 px-3.5">{t.name}</th>
              <th className="py-2.5 px-3.5">{t.role}</th>
              <th className="py-2.5 px-3.5">{t.payType}</th>
              <th className="py-2.5 px-3.5">{t.utilization}</th>
              <th className="py-2.5 px-3.5">{t.nationalFlag}</th>
              {isOwner && (
                <>
                  <th className="py-2.5 px-3.5 text-right">{t.basicSalary}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.poessaPension}</th>
                  <th className="py-2.5 px-3.5 text-right">{t.monthlyCost}</th>
                  <th className="py-2.5 px-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {t.hourlyCost}
                  </th>
                </>
              )}
              {!isOwner && (
                <th className="py-2.5 px-3.5 text-center">
                  <span className="flex items-center justify-center gap-1 text-neutral-400">
                    <Lock className="w-3.5 h-3.5" />
                    {t.hourlyCost}
                  </span>
                </th>
              )}
              {userRole !== 'DEVELOPER' && <th className="py-2.5 px-3.5 text-center">{t.actions}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs text-neutral-700 dark:text-neutral-300">
            {people.map((person) => {
              const isEditing = editingId === person.id;

              if (isEditing && editForm) {
                return (
                  <tr key={person.id} className="bg-neutral-50 dark:bg-neutral-900/40">
                    {/* Name Input */}
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] focus:ring-1 focus:ring-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        placeholder="Full Name"
                      />
                    </td>

                    {/* Role Select */}
                    <td className="py-2.5 px-3.5">
                      <select
                        value={editForm.roleId}
                        onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] focus:ring-1 focus:ring-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id} className="dark:bg-neutral-900">
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Pay Type Select */}
                    <td className="py-2.5 px-3.5">
                      <select
                        value={editForm.payType}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            payType: e.target.value as PayType,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] focus:ring-1 focus:ring-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="MONTHLY_SALARY" className="dark:bg-neutral-900">{t.monthlySalary}</option>
                        <option value="CONTRACTOR" className="dark:bg-neutral-900">{t.contractor}</option>
                        <option value="HOURLY" className="dark:bg-neutral-900">{t.hourly}</option>
                        <option value="PER_PROJECT" className="dark:bg-neutral-900">{t.perProject}</option>
                      </select>
                    </td>

                    {/* Utilization % */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editForm.utilizationPercent}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              utilizationPercent: e.target.value,
                            })
                          }
                          className="w-14 px-2 py-1 text-xs border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-right"
                        />
                        <span className="text-neutral-400 text-xs">%</span>
                      </div>
                    </td>

                    {/* Nationality Checkbox */}
                    <td className="py-2.5 px-3.5">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={editForm.isEthiopianNational}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isEthiopianNational: e.target.checked,
                            })
                          }
                          className="rounded-[4px] border-black/[0.2] dark:border-white/[0.2] text-neutral-900 focus:ring-neutral-400"
                        />
                        <span className="text-xs">{editForm.isEthiopianNational ? 'ET (11%)' : 'Foreign (0%)'}</span>
                      </label>
                    </td>

                    {/* Financial Inputs for Owner */}
                    {isOwner && (
                      <>
                        <td className="py-2.5 px-3.5 text-right">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={editForm.basicSalaryMajor}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                basicSalaryMajor: e.target.value,
                              })
                            }
                            className="w-24 px-2 py-1 text-xs border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-right font-mono"
                            placeholder="ETB"
                          />
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-xs text-neutral-400 font-mono">
                          {editForm.isEthiopianNational
                            ? `${Math.round(
                                parseFloat(editForm.basicSalaryMajor || '0') * 0.11,
                              ).toLocaleString()} ETB`
                            : '0 ETB'}
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-xs text-neutral-400 font-mono">Auto-calc</td>
                        <td className="py-2.5 px-3.5 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          Auto-calc
                        </td>
                      </>
                    )}

                    {!isOwner && (
                      <td className="py-2.5 px-3.5 text-center text-xs text-neutral-400">
                        {t.confidentialHidden}
                      </td>
                    )}

                    {/* Save / Cancel buttons */}
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(person)}
                          title={t.save}
                          className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-[5px]"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          title={t.cancel}
                          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-[5px]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={person.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  {/* Name & Email */}
                  <td className="py-2.5 px-3.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{person.name}</div>
                    {person.email && <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">{person.email}</div>}
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300">
                      {person.role?.name ||
                        roles.find((r) => r.id === person.roleId)?.name ||
                        'Team Member'}
                    </span>
                  </td>

                  {/* Pay Type */}
                  <td className="py-2.5 px-3.5">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                      {getPayTypeLabel(person.payType)}
                    </span>
                  </td>

                  {/* Utilization */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 font-mono">
                        {Math.round(person.utilizationRate * 100)}%
                      </span>
                      {person.computedHourlyCost && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          ({person.computedHourlyCost.productiveHoursPerMonth}h)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Nationality */}
                  <td className="py-2.5 px-3.5">
                    {person.isEthiopianNational ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[5px] border border-emerald-500/20">
                        <UserCheck className="w-3 h-3" />
                        <span>{locale === 'am' ? 'ኢትዮጵያዊ (11%)' : 'ET National (11%)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-[5px]">
                        <span>{locale === 'am' ? 'የውጭ ዜጋ (0%)' : 'Foreign (0%)'}</span>
                      </span>
                    )}
                  </td>

                  {/* Owner-Only Financial Columns */}
                  {isOwner && (
                    <>
                      <td className="py-2.5 px-3.5 text-right font-mono text-neutral-800 dark:text-neutral-200 text-xs">
                        {formatCurrencyMinor(person.basicSalaryMinor, person.currency)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400 text-xs">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.monthlyEmployerPensionMinor,
                          person.currency,
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.totalMonthlyCostMinor,
                          person.currency,
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.hourlyCostMinor,
                          person.currency,
                        )}
                        <span className="text-[10px] font-normal text-neutral-400 ml-1">/hr</span>
                      </td>
                    </>
                  )}

                  {/* Non-Owner Confidential Column */}
                  {!isOwner && (
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-[5px]">
                        <Lock className="w-3 h-3 text-neutral-400" />
                        <span>{t.confidentialHidden}</span>
                      </span>
                    </td>
                  )}

                  {/* Actions */}
                  {userRole !== 'DEVELOPER' && (
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(person)}
                          title={t.edit}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-[5px]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  locale === 'am'
                                    ? `እርግጠኛ ነዎት '${person.name}'ን ማስወገድ ይፈልጋሉ?`
                                    : `Are you sure you want to remove ${person.name}?`,
                                )
                              ) {
                                onDeletePerson(person.id);
                              }
                            }}
                            title={t.delete}
                            className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-[5px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary for Owner */}
      {isOwner && people.length > 0 && (
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.08] p-4 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {locale === 'am' ? 'አጠቃላይ ወርሃዊ ውጤታማ ሰዓታት:' : 'Total Productive Hours/Mo:'}
              </span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {people.reduce(
                  (sum, p) => sum + (p.computedHourlyCost?.productiveHoursPerMonth || 0),
                  0,
                )}{' '}
                hrs
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>
              {locale === 'am' ? 'ወርሃዊ የጡረታ ድምር:' : 'Total POESSA Pension:'}{' '}
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {formatCurrencyMinor(
                  people
                    .reduce(
                      (acc, p) =>
                        acc + BigInt(p.computedHourlyCost?.monthlyEmployerPensionMinor || '0'),
                      0n,
                    )
                    .toString(),
                )}
              </strong>
            </span>
            <span>
              {locale === 'am' ? 'ወርሃዊ የወጪ ድምር:' : 'Total Monthly Labor Cost:'}{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                {formatCurrencyMinor(
                  people
                    .reduce(
                      (acc, p) => acc + BigInt(p.computedHourlyCost?.totalMonthlyCostMinor || '0'),
                      0n,
                    )
                    .toString(),
                )}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
