'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, HardDrive, Globe, CreditCard, Zap, Lock } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#141414] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-6 mb-8 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> {t.scaleEstimator}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Map project traffic and user volume to suggested infrastructure tiers, gateway fees, and
            recurring costs.
          </p>
        </div>
      </div>

      {/* Scale Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        {/* Monthly Users */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <label
            htmlFor="scale-monthly-users"
            className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-1.5"
          >
            <Users className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.monthlyUsers}</span>
          </label>
          <input
            id="scale-monthly-users"
            type="number"
            min="100"
            step="500"
            value={monthlyUsers}
            onChange={(e) => setMonthlyUsers(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Peak concurrency: ~{Math.max(5, Math.ceil(monthlyUsers * 0.005))} requests
          </span>
        </div>

        {/* Storage */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <label
            htmlFor="scale-storage-gb"
            className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-1.5"
          >
            <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.storageGb}</span>
          </label>
          <input
            id="scale-storage-gb"
            type="number"
            min="0"
            step="10"
            value={storageGb}
            onChange={(e) => setStorageGb(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">Media assets & database</span>
        </div>

        {/* Bandwidth / Traffic */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <label
            htmlFor="scale-traffic-gb"
            className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.trafficGb}</span>
          </label>
          <input
            id="scale-traffic-gb"
            type="number"
            min="0"
            step="50"
            value={trafficGb}
            onChange={(e) => setTrafficGb(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">CDN edge egress</span>
        </div>

        {/* Payment Volume */}
        <div className="bg-black/[0.015] dark:bg-white/[0.02] p-3.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <label
            htmlFor="scale-payment-volume"
            className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.paymentVolume}</span>
          </label>
          <input
            id="scale-payment-volume"
            type="number"
            min="0"
            step="10000"
            value={monthlyPaymentVolume}
            onChange={(e) => setMonthlyPaymentVolume(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
          />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 block">Telebirr & Chapa 3.5% fee</span>
        </div>
      </div>

      <div className="flex justify-end py-3">
        <button
          onClick={handleRecalculate}
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold px-4 py-2 rounded-[7px] text-xs shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{t.calculateSuggestions}</span>
        </button>
      </div>

      {/* Suggested Items Table */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono mb-3">
          {t.suggestedInfrastructure}
        </h3>

        <div className="overflow-x-auto rounded-[10px] border border-black/[0.06] dark:border-white/[0.08]">
          <table className="min-w-full divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3.5 text-left w-12">Inc.</th>
                <th className="py-2.5 px-3.5 text-left">Service / Item</th>
                <th className="py-2.5 px-3.5 text-left">Category</th>
                <th className="py-2.5 px-3.5 text-left">{t.assumptions}</th>
                <th className="py-2.5 px-3.5 text-left">{t.payer}</th>
                <th className="py-2.5 px-3.5 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] bg-white dark:bg-[#141414]">
              {items.map((it) => (
                <tr
                  key={it.id}
                  className={`hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors ${
                    !it.isIncluded ? 'opacity-40 line-through bg-black/[0.01] dark:bg-white/[0.01]' : ''
                  }`}
                >
                  {/* Inclusion Checkbox */}
                  <td className="py-2.5 px-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={it.isIncluded}
                      disabled={isDeveloper}
                      onChange={() => handleToggleItem(it.id)}
                      className="rounded-[4px] accent-neutral-900 dark:accent-white"
                    />
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-3.5 font-medium text-neutral-900 dark:text-neutral-100">{it.name}</td>

                  {/* Category */}
                  <td className="py-2.5 px-3.5">
                    <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08]">
                      {it.category}
                    </span>
                  </td>

                  {/* Assumption (Visible Callout) */}
                  <td className="py-2.5 px-3.5 text-neutral-500 dark:text-neutral-400 text-xs max-w-xs">{it.assumption}</td>

                  {/* Payer Toggle */}
                  <td className="py-2.5 px-3.5">
                    {isDeveloper ? (
                      <span
                        className={`px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold ${
                          it.payer === 'CLIENT'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08]'
                        }`}
                      >
                        {it.payer === 'CLIENT' ? 'Client (Pass-Through)' : 'Agency (Internal)'}
                      </span>
                    ) : (
                      <select
                        value={it.payer}
                        onChange={(e) => handlePayerChange(it.id, e.target.value as Payer)}
                        className={`text-[10px] font-mono font-semibold rounded-[7px] px-2 py-1 border cursor-pointer focus:outline-none ${
                          it.payer === 'CLIENT'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 border-black/[0.08] dark:border-white/[0.08]'
                        }`}
                      >
                        <option value="CLIENT" className="bg-white dark:bg-[#141414] text-neutral-900 dark:text-neutral-100">Client (Pass-Through)</option>
                        <option value="AGENCY" className="bg-white dark:bg-[#141414] text-neutral-900 dark:text-neutral-100">Agency (Internal)</option>
                      </select>
                    )}
                  </td>

                  {/* Monthly Cost */}
                  <td className="py-2.5 px-3.5 text-right font-mono font-semibold">
                    {isDeveloper ? (
                      <span className="text-neutral-400 dark:text-neutral-500 italic">Redacted</span>
                    ) : (
                      <span
                        className={it.payer === 'CLIENT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'}
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
          <div className="bg-emerald-500/[0.06] dark:bg-emerald-500/[0.1] border border-emerald-500/20 rounded-[10px] p-4">
            <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              {t.clientMonthlyRecurring}
            </span>
            <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              {(clientMonthlyMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-500 block mt-0.5 font-sans">
                Pass-through directly billed to client
              </span>
            </div>
          </div>

          <div className="bg-indigo-500/[0.06] dark:bg-indigo-500/[0.1] border border-indigo-500/20 rounded-[10px] p-4">
            <span className="text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              {t.agencyMonthlyRecurring}
            </span>
            <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">
              {(agencyMonthlyMinor / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-indigo-600 dark:text-indigo-500 block mt-0.5 font-sans">
                Internal tool & SSL agency overhead
              </span>
            </div>
          </div>

          <div className="bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-[10px] p-4">
            <span className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              {t.totalMonthlyRecurring}
            </span>
            <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1 font-mono">
              {((clientMonthlyMinor + agencyMonthlyMinor) / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 block mt-0.5 font-sans">
                Combined monthly recurring run rate
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-[7px] p-3 text-xs font-mono text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" /> {t.developerHoursOnlyNotice}
        </div>
      )}
    </div>
  );
};
