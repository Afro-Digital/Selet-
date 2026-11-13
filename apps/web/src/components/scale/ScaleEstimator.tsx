'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { CatalogCategory, Payer, UserRole } from '../../types';

export interface ScaleItemUi {
  id: string;
  name: string;
  category: CatalogCategory;
  amountMinor: number;
  currency: string;
  payer: Payer;
  isIncluded: boolean;
  assumption: string;
  isUserOverridden?: boolean;
}

interface ScaleEstimatorProps {
  t: TranslationDictionary;
  userRole: UserRole;
  currency: string;
  usdRate?: number;
  onScaleItemsChange?: (items: ScaleItemUi[]) => void;
  onMonthlyRecurringChange?: (clientMonthlyMinor: number, agencyMonthlyMinor: number) => void;
}

export const ScaleEstimator: React.FC<ScaleEstimatorProps> = ({
  t,
  userRole,
  currency,
  usdRate = 128.5,
  onScaleItemsChange,
  onMonthlyRecurringChange,
}) => {
  const isDeveloper = userRole === 'DEVELOPER';

  // Scale inputs state
  const [monthlyUsers, setMonthlyUsers] = useState<number>(5000);
  const [storageGb, setStorageGb] = useState<number>(50);
  const [trafficGb, setTrafficGb] = useState<number>(200);
  const [monthlyPaymentVolume, setMonthlyPaymentVolume] = useState<number>(500000); // 500,000 ETB

  const computeSuggestedItems = (
    users: number,
    storage: number,
    traffic: number,
    volume: number,
  ): ScaleItemUi[] => {
    const peakConcurrency = Math.max(5, Math.ceil(users * 0.005));
    const usdToMinor = (usd: number) => Math.round(usd * usdRate * 100);
    const etbToMinor = (etb: number) => Math.round(etb * 100);

    const items: ScaleItemUi[] = [];

    // 1. HOSTING
    if (users <= 1000) {
      items.push({
        id: 'scale-hosting-small',
        name: 'DigitalOcean Basic Droplet (1 vCPU, 2GB RAM)',
        category: 'HOSTING',
        amountMinor: usdToMinor(12),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Lightweight single-server hosting sufficient for up to 1,000 monthly users (peak ~${peakConcurrency} concurrent requests).`,
        isUserOverridden: false,
      });
    } else if (users <= 10000) {
      items.push({
        id: 'scale-hosting-medium',
        name: 'AWS EC2 t4g.medium (2 vCPU, 4GB RAM)',
        category: 'HOSTING',
        amountMinor: usdToMinor(35),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Recommended for 1,000–10,000 monthly users (current: ${users.toLocaleString()}) with moderate database queries & peak ~${peakConcurrency} concurrent requests.`,
        isUserOverridden: false,
      });
    } else if (users <= 50000) {
      items.push({
        id: 'scale-hosting-ha',
        name: 'Clustered Application Servers (2x AWS EC2 + Managed Database)',
        category: 'HOSTING',
        amountMinor: usdToMinor(120),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Multi-instance redundant deployment for 10,000–50,000 monthly active users with automated failover.`,
        isUserOverridden: false,
      });
    } else {
      items.push({
        id: 'scale-hosting-cluster',
        name: 'Auto-scaling Container Cluster (ECS / Kubernetes + RDS Multi-AZ)',
        category: 'HOSTING',
        amountMinor: usdToMinor(350),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Enterprise auto-scaling cluster with high concurrency handling for >50,000 monthly active users.`,
        isUserOverridden: false,
      });
    }

    // 2. CDN & EDGE
    if (traffic > 50 || users > 2000) {
      items.push({
        id: 'scale-cdn-pro',
        name: 'Cloudflare Pro CDN & Web Application Firewall (WAF)',
        category: 'CDN',
        amountMinor: usdToMinor(20),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Edge caching, DDoS protection, and image optimization for ${traffic} GB monthly bandwidth.`,
        isUserOverridden: false,
      });
    }

    // 3. STORAGE & MEDIA
    if (storage > 10) {
      const storageUsd = Math.max(5, Math.ceil(storage * 0.02));
      items.push({
        id: 'scale-storage-s3',
        name: 'Cloudflare R2 / AWS S3 Object Storage',
        category: 'HOSTING',
        amountMinor: usdToMinor(storageUsd),
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Scalable object storage for ${storage} GB of product media, uploads, and automated daily backups ($0.02/GB).`,
        isUserOverridden: false,
      });
    }

    // 4. DOMAIN & SSL
    items.push({
      id: 'scale-domain-et',
      name: '.et Country Code Domain (.et Registrar)',
      category: 'DOMAIN',
      amountMinor: etbToMinor(125), // 125 ETB/mo
      currency,
      payer: 'CLIENT',
      isIncluded: true,
      assumption:
        'Annual Ethiopian national ccTLD domain registration (~1,500 ETB/yr, amortized to 125 ETB/mo).',
      isUserOverridden: false,
    });

    items.push({
      id: 'scale-ssl-free',
      name: "Automated Let's Encrypt TLS / SSL",
      category: 'SSL',
      amountMinor: 0,
      currency,
      payer: 'AGENCY',
      isIncluded: true,
      assumption: 'Automated 90-day zero-cost SSL certificate renewal via Certbot.',
      isUserOverridden: false,
    });

    // 5. PAYMENT GATEWAY PERCENTAGE FEES
    if (volume > 0) {
      const feeMinor = Math.round(volume * 0.035 * 100);
      items.push({
        id: 'scale-payment-gateway-fee',
        name: 'Telebirr & Chapa Payment Gateway Processing Fee (3.5%)',
        category: 'PAYMENT_GATEWAY',
        amountMinor: feeMinor,
        currency,
        payer: 'CLIENT',
        isIncluded: true,
        assumption: `Estimated 3.5% transaction fee on monthly payment processing volume of ${volume.toLocaleString()} ${currency}.`,
        isUserOverridden: false,
      });
    }

    // 6. MONITORING
    if (users > 1000) {
      items.push({
        id: 'scale-tool-sentry',
        name: 'Sentry Performance Monitoring & Error Tracking',
        category: 'TOOL',
        amountMinor: usdToMinor(26),
        currency,
        payer: 'AGENCY',
        isIncluded: true,
        assumption:
          'Application crash monitoring and error tracing team license for production monitoring.',
        isUserOverridden: false,
      });
    }

    return items;
  };

  const [items, setItems] = useState<ScaleItemUi[]>(() =>
    computeSuggestedItems(5000, 50, 200, 500000),
  );

  const handleRecalculate = () => {
    const newItems = computeSuggestedItems(
      monthlyUsers,
      storageGb,
      trafficGb,
      monthlyPaymentVolume,
    );
    setItems(newItems);
    onScaleItemsChange?.(newItems);

    let clientSum = 0;
    let agencySum = 0;
    for (const it of newItems) {
      if (it.isIncluded) {
        if (it.payer === 'CLIENT') clientSum += it.amountMinor;
        else agencySum += it.amountMinor;
      }
    }
    onMonthlyRecurringChange?.(clientSum, agencySum);
  };

  const handleToggleItem = (id: string) => {
    if (isDeveloper) return;
    const updated = items.map((it) => (it.id === id ? { ...it, isIncluded: !it.isIncluded } : it));
    setItems(updated);
    onScaleItemsChange?.(updated);
    notifyTotals(updated);
  };

  const handlePayerChange = (id: string, payer: Payer) => {
    if (isDeveloper) return;
    const updated = items.map((it) =>
      it.id === id ? { ...it, payer, isUserOverridden: true } : it,
    );
    setItems(updated);
    onScaleItemsChange?.(updated);
    notifyTotals(updated);
  };

  const notifyTotals = (itemList: ScaleItemUi[]) => {
    let clientSum = 0;
    let agencySum = 0;
    for (const it of itemList) {
      if (it.isIncluded) {
        if (it.payer === 'CLIENT') clientSum += it.amountMinor;
        else agencySum += it.amountMinor;
      }
    }
    onMonthlyRecurringChange?.(clientSum, agencySum);
  };

  let clientMonthlyMinor = 0;
  let agencyMonthlyMinor = 0;
  for (const it of items) {
    if (it.isIncluded) {
      if (it.payer === 'CLIENT') clientMonthlyMinor += it.amountMinor;
      else agencyMonthlyMinor += it.amountMinor;
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📈</span> {t.scaleEstimator}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map project traffic and user volume to suggested infrastructure tiers, gateway fees, and
            recurring costs.
          </p>
        </div>
      </div>

      {/* Scale Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-b border-slate-100">
        {/* Monthly Users */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <label
            htmlFor="scale-monthly-users"
            className="text-xs font-semibold text-slate-700 block mb-1.5"
          >
            👥 {t.monthlyUsers}
          </label>
          <input
            id="scale-monthly-users"
            type="number"
            min="100"
            step="500"
            value={monthlyUsers}
            onChange={(e) => setMonthlyUsers(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Peak concurrency: ~{Math.max(5, Math.ceil(monthlyUsers * 0.005))} requests
          </span>
        </div>

        {/* Storage */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <label
            htmlFor="scale-storage-gb"
            className="text-xs font-semibold text-slate-700 block mb-1.5"
          >
            💾 {t.storageGb}
          </label>
          <input
            id="scale-storage-gb"
            type="number"
            min="0"
            step="10"
            value={storageGb}
            onChange={(e) => setStorageGb(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Media assets & database</span>
        </div>

        {/* Bandwidth / Traffic */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <label
            htmlFor="scale-traffic-gb"
            className="text-xs font-semibold text-slate-700 block mb-1.5"
          >
            🌐 {t.trafficGb}
          </label>
          <input
            id="scale-traffic-gb"
            type="number"
            min="0"
            step="50"
            value={trafficGb}
            onChange={(e) => setTrafficGb(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">CDN edge egress</span>
        </div>

        {/* Payment Volume */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <label
            htmlFor="scale-payment-volume"
            className="text-xs font-semibold text-slate-700 block mb-1.5"
          >
            💳 {t.paymentVolume}
          </label>
          <input
            id="scale-payment-volume"
            type="number"
            min="0"
            step="10000"
            value={monthlyPaymentVolume}
            onChange={(e) => setMonthlyPaymentVolume(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Telebirr & Chapa 3.5% fee</span>
        </div>
      </div>

      <div className="flex justify-end py-3">
        <button
          onClick={handleRecalculate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>⚡</span> {t.calculateSuggestions}
        </button>
      </div>

      {/* Suggested Items Table */}
      <div className="mt-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          {t.suggestedInfrastructure}
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-3 text-left w-12">Inc.</th>
                <th className="py-3 px-3 text-left">Service / Item</th>
                <th className="py-3 px-3 text-left">Category</th>
                <th className="py-3 px-3 text-left">{t.assumptions}</th>
                <th className="py-3 px-3 text-left">{t.payer}</th>
                <th className="py-3 px-3 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((it) => (
                <tr
                  key={it.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !it.isIncluded ? 'opacity-40 line-through bg-slate-50/50' : ''
                  }`}
                >
                  {/* Inclusion Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={it.isIncluded}
                      disabled={isDeveloper}
                      onChange={() => handleToggleItem(it.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Name */}
                  <td className="py-3 px-3 font-semibold text-slate-900">{it.name}</td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {it.category}
                    </span>
                  </td>

                  {/* Assumption (Visible Callout) */}
                  <td className="py-3 px-3 text-slate-600 text-xs max-w-xs">{it.assumption}</td>

                  {/* Payer Toggle */}
                  <td className="py-3 px-3">
                    {isDeveloper ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          it.payer === 'CLIENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {it.payer === 'CLIENT' ? 'Client (Pass-Through)' : 'Agency (Internal)'}
                      </span>
                    ) : (
                      <select
                        value={it.payer}
                        onChange={(e) => handlePayerChange(it.id, e.target.value as Payer)}
                        className={`text-[10px] font-bold rounded px-2 py-1 border cursor-pointer focus:outline-none ${
                          it.payer === 'CLIENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <option value="CLIENT">Client (Pass-Through)</option>
                        <option value="AGENCY">Agency (Internal)</option>
                      </select>
                    )}
                  </td>

                  {/* Monthly Cost */}
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {isDeveloper ? (
                      <span className="text-slate-400 italic">Redacted</span>
                    ) : (
                      <span
                        className={it.payer === 'CLIENT' ? 'text-emerald-700' : 'text-slate-800'}
                      >
                        {(it.amountMinor / 100).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {currency}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {!isDeveloper ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              {t.clientMonthlyRecurring}
            </span>
            <div className="text-xl font-bold text-emerald-800 mt-1 font-mono">
              {(clientMonthlyMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-emerald-600 block mt-0.5">
                Pass-through directly billed to client
              </span>
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider block">
              {t.agencyMonthlyRecurring}
            </span>
            <div className="text-xl font-bold text-indigo-800 mt-1 font-mono">
              {(agencyMonthlyMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-indigo-600 block mt-0.5">
                Internal tool & SSL agency overhead
              </span>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {t.totalMonthlyRecurring}
            </span>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {((clientMonthlyMinor + agencyMonthlyMinor) / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
                Combined monthly recurring run rate
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
          <span>🔒</span> {t.developerHoursOnlyNotice}
        </div>
      )}
    </div>
  );
};
