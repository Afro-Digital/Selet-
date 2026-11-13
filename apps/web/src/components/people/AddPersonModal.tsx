'use client';

import React, { useState } from 'react';
import { Person, Role, PayType } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import { computePersonCost } from '../../lib/person-cost';
import { X, UserPlus, ShieldAlert } from 'lucide-react';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  locale: Locale;
  onAddPerson: (newPerson: Person) => void;
}

export function AddPersonModal({
  isOpen,
  onClose,
  roles,
  locale,
  onAddPerson,
}: AddPersonModalProps) {
  const t = translations[locale];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id || '');
  const [payType, setPayType] = useState<PayType>('MONTHLY_SALARY');
  const [basicSalaryMajor, setBasicSalaryMajor] = useState('35000');
  const [allowancesMajor, setAllowancesMajor] = useState('5000');
  const [benefitsMajor, setBenefitsMajor] = useState('1000');
  const [directHourlyRateMajor, setDirectHourlyRateMajor] = useState('0');
  const [utilizationPercent, setUtilizationPercent] = useState('70');
  const [isEthiopianNational, setIsEthiopianNational] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.validationRequired);
      return;
    }

    const utilNum = parseFloat(utilizationPercent);
    if (isNaN(utilNum) || utilNum < 1 || utilNum > 100) {
      setError(t.validationUtilization);
      return;
    }

    const basicSalaryMinor = BigInt(
      Math.max(0, Math.round(parseFloat(basicSalaryMajor || '0') * 100)),
    ).toString();
    const allowancesMinor = BigInt(
      Math.max(0, Math.round(parseFloat(allowancesMajor || '0') * 100)),
    ).toString();
    const benefitsMinor = BigInt(
      Math.max(0, Math.round(parseFloat(benefitsMajor || '0') * 100)),
    ).toString();
    const directHourlyRateMinor = BigInt(
      Math.max(0, Math.round(parseFloat(directHourlyRateMajor || '0') * 100)),
    ).toString();

    const selectedRole = roles.find((r) => r.id === roleId) || roles[0];

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || undefined,
      roleId: selectedRole?.id || 'role-1',
      role: selectedRole ? { id: selectedRole.id, name: selectedRole.name } : undefined,
      payType,
      currency: 'ETB',
      basicSalaryMinor,
      allowancesMinor,
      benefitsMinor,
      directHourlyRateMinor,
      paidHoursPerMonth: 160,
      utilizationRate: utilNum / 100,
      isEthiopianNational,
      pensionRate: isEthiopianNational ? 0.11 : 0.0,
      pensionBase: 'BASIC',
      pensionCeilingMinor: null,
      isActive: true,
    };

    newPerson.computedHourlyCost = computePersonCost(newPerson);

    onAddPerson(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">{t.addMember}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {t.name} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abebe@agency.et"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.role}
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.payType}
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MONTHLY_SALARY">{t.monthlySalary}</option>
                <option value="CONTRACTOR">{t.contractor}</option>
                <option value="HOURLY">{t.hourly}</option>
                <option value="PER_PROJECT">{t.perProject}</option>
              </select>
            </div>
          </div>

          {payType === 'MONTHLY_SALARY' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t.basicSalary} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={basicSalaryMajor}
                  onChange={(e) => setBasicSalaryMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t.allowances} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={allowancesMajor}
                  onChange={(e) => setAllowancesMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t.benefits} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={benefitsMajor}
                  onChange={(e) => setBenefitsMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Direct Hourly Rate (ETB / hr)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={directHourlyRateMajor}
                onChange={(e) => setDirectHourlyRateMajor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-right font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.utilization} (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={utilizationPercent}
                onChange={(e) => setUtilizationPercent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isEthiopianNational}
                  onChange={(e) => setIsEthiopianNational(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{locale === 'am' ? 'ኢትዮጵያዊ (11% ፖኤሳ)' : 'ET National (11% Pension)'}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
