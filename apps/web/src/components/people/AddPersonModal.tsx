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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] rounded-[14px] shadow-xl max-w-lg w-full overflow-hidden border border-black/[0.08] dark:border-white/[0.12] text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">{t.addMember}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-[6px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs rounded-[6px] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
              {t.name} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abebe@agency.et"
              className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.role}
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-neutral-900">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.payType}
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              >
                <option value="MONTHLY_SALARY" className="dark:bg-neutral-900">{t.monthlySalary}</option>
                <option value="CONTRACTOR" className="dark:bg-neutral-900">{t.contractor}</option>
                <option value="HOURLY" className="dark:bg-neutral-900">{t.hourly}</option>
                <option value="PER_PROJECT" className="dark:bg-neutral-900">{t.perProject}</option>
              </select>
            </div>
          </div>

          {payType === 'MONTHLY_SALARY' ? (
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  {t.basicSalary} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={basicSalaryMajor}
                  onChange={(e) => setBasicSalaryMajor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs text-right font-mono bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  {t.allowances} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={allowancesMajor}
                  onChange={(e) => setAllowancesMajor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs text-right font-mono bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  {t.benefits} (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={benefitsMajor}
                  onChange={(e) => setBenefitsMajor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs text-right font-mono bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                Direct Hourly Rate (ETB / hr)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={directHourlyRateMajor}
                onChange={(e) => setDirectHourlyRateMajor(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs text-right font-mono bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.utilization} (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={utilizationPercent}
                onChange={(e) => setUtilizationPercent(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs font-mono text-right bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isEthiopianNational}
                  onChange={(e) => setIsEthiopianNational(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[4px] border-black/[0.2] dark:border-white/[0.2] text-neutral-900 focus:ring-neutral-400"
                />
                <span>{locale === 'am' ? 'ኢትዮጵያዊ (11% ፖኤሳ)' : 'ET National (11% Pension)'}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
}
