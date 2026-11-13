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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.rateCards}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {rateCards.length} {locale === 'am' ? 'ካርዶች' : 'Cards'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {locale === 'am'
              ? 'ለደንበኞች የሚቀርብ የሰዓት ክፍያ ተመን ማውጫ'
              : 'Client-facing hourly billing rate cards used in project pricing & quotes.'}
          </p>
        </div>

        {userRole !== 'DEVELOPER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRateCard}</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-emerald-50/50 border-b border-emerald-100 space-y-4"
        >
          <h4 className="text-sm font-bold text-emerald-900">{t.addRateCard}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Government & Enterprise Card"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {t.effectiveFrom}
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Base Hourly Billing Rate (ETB / hr)
              </label>
              <input
                type="number"
                min="0"
                value={defaultRateMajor}
                onChange={(e) => setDefaultRateMajor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono text-right"
              />
            </div>
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
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700"
            >
              {t.save}
            </button>
          </div>
        </form>
      )}

      <div className="p-6 space-y-6">
        {rateCards.map((card) => (
          <div
            key={card.id}
            className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors bg-white shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{card.name}</h3>
                  {card.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t.defaultCard}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t.effectiveFrom}: {card.effectiveFrom.slice(0, 10)} &bull; Currency:{' '}
                  {card.currency}
                </div>
              </div>

              {!card.isDefault && userRole === 'OWNER' && (
                <button
                  onClick={() => onSetDefault(card.id)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
                >
                  {t.setDefault}
                </button>
              )}
            </div>

            {/* Role Billing Rates Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {card.items.map((item) => {
                const roleName =
                  item.role?.name || roles.find((r) => r.id === item.roleId)?.name || 'Role';
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[160px]">
                      {roleName}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {formatCurrencyMinor(item.hourlyRateMinor, item.currency)}
                      <span className="text-[10px] font-normal text-slate-400 ml-0.5">/hr</span>
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
