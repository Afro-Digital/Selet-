'use client';

import React, { useState } from 'react';
import { CatalogCategory, CatalogItem, Payer, PriceModel, UserRole } from '../../types';
import { Locale, translations } from '../../lib/i18n';
import { formatCurrencyMinor } from '../../lib/person-cost';
import {
  Package,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Sparkles,
  Trash2,
  X,
  Filter,
} from 'lucide-react';

interface CatalogListProps {
  items: CatalogItem[];
  userRole: UserRole;
  locale: Locale;
  onAddItem: (item: CatalogItem) => void;
  onVerifyItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSeedExamples: () => void;
  onRemoveExamples: () => void;
}

export function CatalogList({
  items,
  userRole,
  locale,
  onAddItem,
  onVerifyItem,
  onDeleteItem,
  onSeedExamples,
  onRemoveExamples,
}: CatalogListProps) {
  const t = translations[locale];
  const isAuthorized = userRole === 'OWNER' || userRole === 'PM';
  const isOwner = userRole === 'OWNER';

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [payerFilter, setPayerFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CatalogCategory>('HOSTING');
  const [priceModel, setPriceModel] = useState<PriceModel>('PER_MONTH');
  const [amountMajor, setAmountMajor] = useState('25');
  const [percentageRate, setPercentageRate] = useState('3.5');
  const [currency, setCurrency] = useState('USD');
  const [sourceUrl, setSourceUrl] = useState('');
  const [payer, setPayer] = useState<Payer>('CLIENT');
  const [staleAfterDays, setStaleAfterDays] = useState('60');

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (payerFilter !== 'ALL' && item.payer !== payerFilter) return false;
    return true;
  });

  const staleItemsCount = items.filter((item) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(item.verifiedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays > item.staleAfterDays;
  }).length;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const amountMinor = BigInt(
      Math.max(0, Math.round(parseFloat(amountMajor || '0') * 100)),
    ).toString();

    const newItem: CatalogItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      category,
      priceModel,
      amountMinor: priceModel === 'PERCENTAGE' ? '0' : amountMinor,
      percentageRate: priceModel === 'PERCENTAGE' ? parseFloat(percentageRate) / 100 : undefined,
      currency,
      sourceUrl: sourceUrl.trim() || undefined,
      verifiedAt: new Date().toISOString(),
      payer,
      staleAfterDays: parseInt(staleAfterDays, 10) || 90,
      isExample: false,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
    setName('');
    setSourceUrl('');
  };

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t.costCatalog}</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 rounded-[5px]">
              {items.length} {locale === 'am' ? 'እቃዎች' : 'Items'}
            </span>
            {staleItemsCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-[5px] border border-amber-500/20 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>
                  {staleItemsCount} {t.staleNotice}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {locale === 'am'
              ? 'የደመና፣ የሰርቨር፣ የዶሜይን እና የሶፍትዌር መሣሪያዎች ወጪ ካታሎግ'
              : 'Pass-through infrastructure, licenses, and tooling costs with stale price tracking.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {isOwner && (
            <>
              <button
                onClick={onSeedExamples}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-[7px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.seedExamples}</span>
              </button>
              <button
                onClick={onRemoveExamples}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold rounded-[7px] hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.removeExamples}</span>
              </button>
            </>
          )}

          {isAuthorized && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold rounded-[7px] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addItem}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-black/[0.02] dark:bg-white/[0.02] px-5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">{t.category}:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-black/[0.08] dark:border-white/[0.12] rounded-[6px] px-2 py-1 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none text-xs"
          >
            <option value="ALL" className="dark:bg-neutral-900">All Categories</option>
            <option value="HOSTING" className="dark:bg-neutral-900">Hosting</option>
            <option value="CDN" className="dark:bg-neutral-900">CDN</option>
            <option value="DOMAIN" className="dark:bg-neutral-900">Domain</option>
            <option value="SSL" className="dark:bg-neutral-900">SSL</option>
            <option value="PAYMENT_GATEWAY" className="dark:bg-neutral-900">Payment Gateway</option>
            <option value="TOOL" className="dark:bg-neutral-900">Tool & License</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">{t.payer}:</span>
          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="border border-black/[0.08] dark:border-white/[0.12] rounded-[6px] px-2 py-1 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none text-xs"
          >
            <option value="ALL" className="dark:bg-neutral-900">All Payers</option>
            <option value="CLIENT" className="dark:bg-neutral-900">Client Direct</option>
            <option value="AGENCY" className="dark:bg-neutral-900">Agency Internal</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <th className="py-2.5 px-3.5">{t.name}</th>
              <th className="py-2.5 px-3.5">{t.category}</th>
              <th className="py-2.5 px-3.5">{t.priceModel}</th>
              <th className="py-2.5 px-3.5 text-right">Cost / Rate</th>
              <th className="py-2.5 px-3.5">{t.payer}</th>
              <th className="py-2.5 px-3.5">{t.verifiedAt}</th>
              {isAuthorized && <th className="py-2.5 px-3.5 text-center">{t.actions}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-neutral-700 dark:text-neutral-300">
            {filteredItems.map((item) => {
              const diffDays = Math.floor(
                (Date.now() - new Date(item.verifiedAt).getTime()) / (1000 * 60 * 60 * 24),
              );
              const isStale = diffDays > item.staleAfterDays;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
                    isStale ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]' : ''
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                    <div className="flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="View source pricing"
                          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3.5">
                    <span className="text-[11px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-[5px] font-medium">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-2.5 px-3.5 text-neutral-500 dark:text-neutral-400">
                    {item.priceModel.replace('_', ' ')}
                  </td>

                  <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.priceModel === 'PERCENTAGE'
                      ? `${((item.percentageRate || 0) * 100).toFixed(1)}%`
                      : formatCurrencyMinor(item.amountMinor, item.currency)}
                  </td>

                  <td className="py-2.5 px-3.5">
                    {item.payer === 'CLIENT' ? (
                      <span className="text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-[5px] border border-sky-500/20 font-medium">
                        {t.clientPayer}
                      </span>
                    ) : (
                      <span className="text-[11px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-[5px] font-medium">
                        {t.agencyPayer}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3.5">
                    {isStale ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-[5px] border border-amber-500/20 text-[11px]">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Stale ({diffDays}d ago)</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{new Date(item.verifiedAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </td>

                  {isAuthorized && (
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isStale && (
                          <button
                            onClick={() => onVerifyItem(item.id)}
                            className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold underline-offset-2"
                          >
                            {t.verifyNow}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-[5px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-[14px] shadow-xl max-w-lg w-full p-5 border border-black/[0.08] dark:border-white/[0.12] text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{t.addItem}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Supabase Pro Database"
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    {t.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                    className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="HOSTING" className="dark:bg-neutral-900">Hosting</option>
                    <option value="CDN" className="dark:bg-neutral-900">CDN</option>
                    <option value="DOMAIN" className="dark:bg-neutral-900">Domain</option>
                    <option value="SSL" className="dark:bg-neutral-900">SSL</option>
                    <option value="PAYMENT_GATEWAY" className="dark:bg-neutral-900">Payment Gateway</option>
                    <option value="LICENSE" className="dark:bg-neutral-900">License</option>
                    <option value="TOOL" className="dark:bg-neutral-900">Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    {t.priceModel}
                  </label>
                  <select
                    value={priceModel}
                    onChange={(e) => setPriceModel(e.target.value as PriceModel)}
                    className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="PER_MONTH" className="dark:bg-neutral-900">Per Month</option>
                    <option value="FIXED" className="dark:bg-neutral-900">Fixed (One-Off)</option>
                    <option value="PER_USER" className="dark:bg-neutral-900">Per User / Mo</option>
                    <option value="PERCENTAGE" className="dark:bg-neutral-900">Percentage Fee</option>
                  </select>
                </div>
              </div>

              {priceModel === 'PERCENTAGE' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={percentageRate}
                    onChange={(e) => setPercentageRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-right focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                      Price Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountMajor}
                      onChange={(e) => setAmountMajor(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-right focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                      {t.currency}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                    >
                      <option value="USD" className="dark:bg-neutral-900">USD ($)</option>
                      <option value="ETB" className="dark:bg-neutral-900">ETB (ብር)</option>
                      <option value="EUR" className="dark:bg-neutral-900">EUR (€)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    {t.payer}
                  </label>
                  <select
                    value={payer}
                    onChange={(e) => setPayer(e.target.value as Payer)}
                    className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="CLIENT" className="dark:bg-neutral-900">Client (Pass-Through)</option>
                    <option value="AGENCY" className="dark:bg-neutral-900">Agency (Overhead)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    {t.staleAfterDays}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={staleAfterDays}
                    onChange={(e) => setStaleAfterDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-right focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                  Pricing Source URL
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 border border-black/[0.12] dark:border-white/[0.16] rounded-[6px] text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
      )}
    </div>
  );
}
