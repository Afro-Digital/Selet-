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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">{t.teamMembers}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {people.length} {locale === 'am' ? 'አባላት' : 'Members'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {locale === 'am'
              ? 'የደመወዝ፣ የወጪ አጠቃቀም እና የሰዓት ተመን አስተዳደር'
              : 'Manage salaries, utilization, pension eligibility, and computed hourly costs.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addMember}</span>
          </button>
        )}
      </div>

      {/* Redacted Notice for Non-Owners */}
      {!isOwner && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3 text-amber-800 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <p>{t.redactedNotice}</p>
        </div>
      )}

      {/* Inline Validation Alert */}
      {validationError && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 text-rose-700 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">{t.name}</th>
              <th className="py-3 px-4">{t.role}</th>
              <th className="py-3 px-4">{t.payType}</th>
              <th className="py-3 px-4">{t.utilization}</th>
              <th className="py-3 px-4">{t.nationalFlag}</th>
              {isOwner && (
                <>
                  <th className="py-3 px-4 text-right">{t.basicSalary}</th>
                  <th className="py-3 px-4 text-right">{t.poessaPension}</th>
                  <th className="py-3 px-4 text-right">{t.monthlyCost}</th>
                  <th className="py-3 px-4 text-right font-bold text-emerald-700">
                    {t.hourlyCost}
                  </th>
                </>
              )}
              {!isOwner && (
                <th className="py-3 px-4 text-center">
                  <span className="flex items-center justify-center gap-1 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    {t.hourlyCost}
                  </span>
                </th>
              )}
              {userRole !== 'DEVELOPER' && <th className="py-3 px-4 text-center">{t.actions}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {people.map((person) => {
              const isEditing = editingId === person.id;

              if (isEditing && editForm) {
                return (
                  <tr key={person.id} className="bg-indigo-50/50">
                    {/* Name Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                        placeholder="Full Name"
                      />
                    </td>

                    {/* Role Select */}
                    <td className="py-3 px-4">
                      <select
                        value={editForm.roleId}
                        onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Pay Type Select */}
                    <td className="py-3 px-4">
                      <select
                        value={editForm.payType}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            payType: e.target.value as PayType,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        <option value="MONTHLY_SALARY">{t.monthlySalary}</option>
                        <option value="CONTRACTOR">{t.contractor}</option>
                        <option value="HOURLY">{t.hourly}</option>
                        <option value="PER_PROJECT">{t.perProject}</option>
                      </select>
                    </td>

                    {/* Utilization % */}
                    <td className="py-3 px-4">
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
                          className="w-16 px-2 py-1 text-sm border border-slate-300 rounded bg-white text-right"
                        />
                        <span className="text-slate-500 text-xs">%</span>
                      </div>
                    </td>

                    {/* Nationality Checkbox */}
                    <td className="py-3 px-4">
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
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{editForm.isEthiopianNational ? 'ET (11%)' : 'Foreign (0%)'}</span>
                      </label>
                    </td>

                    {/* Financial Inputs for Owner */}
                    {isOwner && (
                      <>
                        <td className="py-3 px-4 text-right">
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
                            className="w-24 px-2 py-1 text-sm border border-slate-300 rounded bg-white text-right"
                            placeholder="ETB"
                          />
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-slate-500">
                          {editForm.isEthiopianNational
                            ? `${Math.round(
                                parseFloat(editForm.basicSalaryMajor || '0') * 0.11,
                              ).toLocaleString()} ETB`
                            : '0 ETB'}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-slate-500">Auto-calc</td>
                        <td className="py-3 px-4 text-right text-xs font-semibold text-emerald-600">
                          Auto-calc
                        </td>
                      </>
                    )}

                    {!isOwner && (
                      <td className="py-3 px-4 text-center text-xs text-slate-400">
                        {t.confidentialHidden}
                      </td>
                    )}

                    {/* Save / Cancel buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(person)}
                          title={t.save}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          title={t.cancel}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Email */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{person.name}</div>
                    {person.email && <div className="text-xs text-slate-400">{person.email}</div>}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {person.role?.name ||
                        roles.find((r) => r.id === person.roleId)?.name ||
                        'Team Member'}
                    </span>
                  </td>

                  {/* Pay Type */}
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-600 font-medium">
                      {getPayTypeLabel(person.payType)}
                    </span>
                  </td>

                  {/* Utilization */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {Math.round(person.utilizationRate * 100)}%
                      </span>
                      {person.computedHourlyCost && (
                        <span className="text-xs text-slate-400">
                          ({person.computedHourlyCost.productiveHoursPerMonth}h)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Nationality */}
                  <td className="py-3 px-4">
                    {person.isEthiopianNational ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <UserCheck className="w-3 h-3" />
                        <span>{locale === 'am' ? 'ኢትዮጵያዊ (11%)' : 'ET National (11%)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <span>{locale === 'am' ? 'የውጭ ዜጋ (0%)' : 'Foreign (0%)'}</span>
                      </span>
                    )}
                  </td>

                  {/* Owner-Only Financial Columns */}
                  {isOwner && (
                    <>
                      <td className="py-3 px-4 text-right font-mono text-slate-800 text-xs">
                        {formatCurrencyMinor(person.basicSalaryMinor, person.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 text-xs">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.monthlyEmployerPensionMinor,
                          person.currency,
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 text-xs font-medium">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.totalMonthlyCostMinor,
                          person.currency,
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        {formatCurrencyMinor(
                          person.computedHourlyCost?.hourlyCostMinor,
                          person.currency,
                        )}
                        <span className="text-xs font-normal text-slate-400 ml-1">/hr</span>
                      </td>
                    </>
                  )}

                  {/* Non-Owner Confidential Column */}
                  {!isOwner && (
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{t.confidentialHidden}</span>
                      </span>
                    </td>
                  )}

                  {/* Actions */}
                  {userRole !== 'DEVELOPER' && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(person)}
                          title={t.edit}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
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
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
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
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {locale === 'am' ? 'አጠቃላይ ወርሃዊ ውጤታማ ሰዓታት:' : 'Total Productive Hours/Mo:'}
              </span>
              <strong className="text-slate-800">
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
              <strong className="text-slate-800 font-mono">
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
              <strong className="text-emerald-700 font-mono font-bold">
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
