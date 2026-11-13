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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">{t.costCatalog}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {items.length} {locale === 'am' ? 'እቃዎች' : 'Items'}
            </span>
            {staleItemsCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>
                  {staleItemsCount} {t.staleNotice}
                </span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
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
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.seedExamples}</span>
              </button>
              <button
                onClick={onRemoveExamples}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.removeExamples}</span>
              </button>
            </>
          )}

          {isAuthorized && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addItem}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">{t.category}:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="HOSTING">Hosting</option>
            <option value="CDN">CDN</option>
            <option value="DOMAIN">Domain</option>
            <option value="SSL">SSL</option>
            <option value="PAYMENT_GATEWAY">Payment Gateway</option>
            <option value="TOOL">Tool & License</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">{t.payer}:</span>
          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Payers</option>
            <option value="CLIENT">Client Direct</option>
            <option value="AGENCY">Agency Internal</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">{t.name}</th>
              <th className="py-3 px-4">{t.category}</th>
              <th className="py-3 px-4">{t.priceModel}</th>
              <th className="py-3 px-4 text-right">Cost / Rate</th>
              <th className="py-3 px-4">{t.payer}</th>
              <th className="py-3 px-4">{t.verifiedAt}</th>
              {isAuthorized && <th className="py-3 px-4 text-center">{t.actions}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredItems.map((item) => {
              const diffDays = Math.floor(
                (Date.now() - new Date(item.verifiedAt).getTime()) / (1000 * 60 * 60 * 24),
              );
              const isStale = diffDays > item.staleAfterDays;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isStale ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="View source pricing"
                          className="text-slate-400 hover:text-emerald-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-500">
                    {item.priceModel.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                    {item.priceModel === 'PERCENTAGE'
                      ? `${((item.percentageRate || 0) * 100).toFixed(1)}%`
                      : formatCurrencyMinor(item.amountMinor, item.currency)}
                  </td>

                  <td className="py-3 px-4">
                    {item.payer === 'CLIENT' ? (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {t.clientPayer}
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {t.agencyPayer}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-xs">
                    {isStale ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Stale ({diffDays}d ago)</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{new Date(item.verifiedAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </td>

                  {isAuthorized && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isStale && (
                          <button
                            onClick={() => onVerifyItem(item.id)}
                            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
                          >
                            {t.verifyNow}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">{t.addItem}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Supabase Pro Database"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {t.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="HOSTING">Hosting</option>
                    <option value="CDN">CDN</option>
                    <option value="DOMAIN">Domain</option>
                    <option value="SSL">SSL</option>
                    <option value="PAYMENT_GATEWAY">Payment Gateway</option>
                    <option value="LICENSE">License</option>
                    <option value="TOOL">Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {t.priceModel}
                  </label>
                  <select
                    value={priceModel}
                    onChange={(e) => setPriceModel(e.target.value as PriceModel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="PER_MONTH">Per Month</option>
                    <option value="FIXED">Fixed (One-Off)</option>
                    <option value="PER_USER">Per User / Mo</option>
                    <option value="PERCENTAGE">Percentage Fee</option>
                  </select>
                </div>
              </div>

              {priceModel === 'PERCENTAGE' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={percentageRate}
                    onChange={(e) => setPercentageRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Price Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountMajor}
                      onChange={(e) => setAmountMajor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      {t.currency}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="ETB">ETB (ብር)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {t.payer}
                  </label>
                  <select
                    value={payer}
                    onChange={(e) => setPayer(e.target.value as Payer)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="CLIENT">Client (Pass-Through)</option>
                    <option value="AGENCY">Agency (Overhead)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {t.staleAfterDays}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={staleAfterDays}
                    onChange={(e) => setStaleAfterDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pricing Source URL
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs"
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
