'use client';

import React, { useState } from 'react';
import { RateCard, Role, UserRole } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import { formatCurrencyMinor } from '../../lib/person-cost';
import { CreditCard, Plus, CheckCircle2 } from 'lucide-react';

interface RateCardsListProps {
  rateCards: RateCard[];
  roles: Role[];
  userRole: UserRole;
  locale: Locale;
  onAddRateCard: (newCard: RateCard) => void;
  onSetDefault: (id: string) => void;
}

export function RateCardsList({
  rateCards,
  roles,
  userRole,
  locale,
  onAddRateCard,
  onSetDefault,
}: RateCardsListProps) {
  const t = translations[locale];

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [defaultRateMajor, setDefaultRateMajor] = useState('800');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const hourlyRateMinor = BigInt(
      Math.max(0, Math.round(parseFloat(defaultRateMajor || '0') * 100)),
    ).toString();

    const newCard: RateCard = {
      id: `rc-${Date.now()}`,
      name: name.trim(),
      currency: 'ETB',
      effectiveFrom: effectiveFrom || new Date().toISOString(),
      isDefault: false,
      items: roles.map((r, i) => ({
        id: `item-${Date.now()}-${i}`,
        roleId: r.id,
        role: { id: r.id, name: r.name },
        hourlyRateMinor,
        currency: 'ETB',
      })),
    };

    onAddRateCard(newCard);
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
      <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t.rateCards}</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-[5px] border border-emerald-500/20">
              {rateCards.length} {locale === 'am' ? 'ካርዶች' : 'Cards'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {locale === 'am'
              ? 'ለደንበኞች የሚቀርብ የሰዓት ክፍያ ተመን ማውጫ'
              : 'Client-facing hourly billing rate cards used in project pricing & quotes.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold rounded-[7px] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addRateCard}</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] space-y-4"
        >
          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">{t.addRateCard}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Government & Enterprise Card"
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                {t.effectiveFrom}
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                Base Hourly Billing Rate (ETB / hr)
              </label>
              <input
                type="number"
                min="0"
                value={defaultRateMajor}
                onChange={(e) => setDefaultRateMajor(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-right focus:ring-1 focus:ring-neutral-400"
              />
            </div>
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

      <div className="p-5 space-y-4">
        {rateCards.map((card) => (
          <div
            key={card.id}
            className="border border-black/[0.06] dark:border-white/[0.08] rounded-[12px] p-4 bg-white dark:bg-[#141414] hover:border-black/[0.12] dark:hover:border-white/[0.16] transition-colors shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{card.name}</h3>
                  {card.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-[5px] border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.defaultCard}</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  {t.effectiveFrom}: {card.effectiveFrom.slice(0, 10)} &bull; Currency: {card.currency}
                </div>
              </div>

              {!card.isDefault && userRole === 'OWNER' && (
                <button
                  onClick={() => onSetDefault(card.id)}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold underline-offset-2"
                >
                  {t.setDefault}
                </button>
              )}
            </div>

            {/* Role Billing Rates Grid */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {card.items.map((item) => {
                const roleName =
                  item.role?.name || roles.find((r) => r.id === item.roleId)?.name || 'Role';
                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-[8px] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[160px]">
                      {roleName}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrencyMinor(item.hourlyRateMinor, item.currency)}
                      <span className="text-[10px] font-normal text-neutral-400 ml-0.5">/hr</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
