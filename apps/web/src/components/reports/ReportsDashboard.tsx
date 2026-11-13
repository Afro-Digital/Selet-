'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Users,
  Building2,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { TranslationDictionary, Locale } from '../../lib/i18n';

export interface ProjectReportUi {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  quoteNumber: string;
  quoteStatus: 'ISSUED' | 'DRAFT' | 'ACCEPTED';
  currency: string;
  revenueMinor: number; // Quote subtotal
  laborCostMinor: number;
  overheadCostMinor: number;
  totalCostMinor: number;
  profitMinor: number;
  margin: number;
  totalHours: number;
  date: string;
}

export interface ReportsDashboardProps {
  t: TranslationDictionary;
  locale?: Locale;
  userRole: 'OWNER' | 'PM' | 'DEVELOPER';
  initialProjects?: ProjectReportUi[];
}

const DEFAULT_REPORT_DATA: ProjectReportUi[] = [
  {
    id: 'rep-1',
    projectId: 'proj-1',
    projectName: 'Telebirr SuperApp Mini-App & Core Billing',
    clientName: 'Ethio Telecom',
    quoteNumber: 'QT-2026-0001',
    quoteStatus: 'ISSUED',
    currency: 'ETB',
    revenueMinor: 100000000, // 1,000,000 ETB
    laborCostMinor: 10800000, // 108,000 ETB
    overheadCostMinor: 1080000, // 10,800 ETB
    totalCostMinor: 11880000, // 118,800 ETB
    profitMinor: 88120000, // 881,200 ETB
    margin: 0.8812,
    totalHours: 200,
    date: '2026-01-15',
  },
  {
    id: 'rep-2',
    projectId: 'proj-2',
    projectName: 'Ethiopian Airlines Cargo Tracking System',
    clientName: 'Ethiopian Airlines Enterprise',
    quoteNumber: 'QT-2026-0002',
    quoteStatus: 'ISSUED',
    currency: 'ETB',
    revenueMinor: 80000000, // 800,000 ETB
    laborCostMinor: 9000000, // 90,000 ETB
    overheadCostMinor: 900000, // 9,000 ETB
    totalCostMinor: 9900000, // 99,000 ETB
    profitMinor: 70100000, // 701,000 ETB
    margin: 0.8763,
    totalHours: 150,
    date: '2026-02-01',
  },
  {
    id: 'rep-3',
    projectId: 'proj-3',
    projectName: 'CBE Birr Agent Management Portal',
    clientName: 'Commercial Bank of Ethiopia',
    quoteNumber: 'QT-2026-0003',
    quoteStatus: 'DRAFT',
    currency: 'ETB',
    revenueMinor: 50000000, // 500,000 ETB
    laborCostMinor: 4500000, // 45,000 ETB
    overheadCostMinor: 450000, // 4,500 ETB
    totalCostMinor: 4950000, // 49,500 ETB
    profitMinor: 45050000, // 450,500 ETB
    margin: 0.901,
    totalHours: 100,
    date: '2026-02-15',
  },
];

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  t,
  locale = 'en',
  userRole,
  initialProjects = DEFAULT_REPORT_DATA,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'clients' | 'team'>('projects');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'DRAFT'>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    initialProjects.forEach((p) => set.add(p.clientName));
    return Array.from(set);
  }, [initialProjects]);

  const formatMoney = (minor: number, curr = 'ETB') => {
    const val = (minor / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (locale === 'am' && curr === 'ETB') {
      return `ብር ${val}`;
    }
    return `${curr} ${val}`;
  };

  // Filtered Project Items
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((item) => {
      if (statusFilter !== 'ALL' && item.quoteStatus !== statusFilter) return false;
      if (clientFilter !== 'ALL' && item.clientName !== clientFilter) return false;
      return true;
    });
  }, [initialProjects, statusFilter, clientFilter]);

  // Summary Totals
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalHours = 0;
    const clients = new Set<string>();

    for (const p of filteredProjects) {
      totalRevenue += p.revenueMinor;
      totalCost += p.totalCostMinor;
      totalProfit += p.profitMinor;
      totalHours += p.totalHours;
      clients.add(p.clientName);
    }

    const blendedMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      blendedMargin,
      totalHours,
      clientCount: clients.size,
      quoteCount: filteredProjects.length,
    };
  }, [filteredProjects]);

  // Client Aggregations
  const clientReports = useMemo(() => {
    const map = new Map<
      string,
      {
        clientName: string;
        quoteCount: number;
        revenueMinor: number;
        totalCostMinor: number;
        profitMinor: number;
        totalHours: number;
      }
    >();

    for (const p of filteredProjects) {
      const existing = map.get(p.clientName) || {
        clientName: p.clientName,
        quoteCount: 0,
        revenueMinor: 0,
        totalCostMinor: 0,
        profitMinor: 0,
        totalHours: 0,
      };

      existing.quoteCount += 1;
      existing.revenueMinor += p.revenueMinor;
      existing.totalCostMinor += p.totalCostMinor;
      existing.profitMinor += p.profitMinor;
      existing.totalHours += p.totalHours;

      map.set(p.clientName, existing);
    }

    return Array.from(map.values()).map((c) => ({
      ...c,
      blendedMargin: c.revenueMinor > 0 ? c.profitMinor / c.revenueMinor : 0,
    }));
  }, [filteredProjects]);

  // Team Member Allocations
  const teamReports = useMemo(() => {
    return [
      {
        name: 'Dagmawi Tesfaye (Alex)',
        roleName: 'Lead Architect / Backend Lead',
        hourlyCostMinor: 60000, // 600 ETB/hr
        allocatedHours: 270,
        laborCostMinor: 16200000, // 162,000 ETB
        attributedRevenueMinor: 135000000,
        profitMinor: 118800000,
        margin: 0.88,
        projectCount: 2,
      },
      {
        name: 'Selamawit Kebede (Betty)',
        roleName: 'Frontend Engineer',
        hourlyCostMinor: 45000, // 450 ETB/hr
        allocatedHours: 180,
        laborCostMinor: 8100000, // 81,000 ETB
        attributedRevenueMinor: 95000000,
        profitMinor: 86900000,
        margin: 0.91,
        projectCount: 2,
      },
    ];
  }, []);

  // CSV Export
  const handleExportCsv = () => {
    let csvContent = '';
    if (activeSubTab === 'projects') {
      const headers = [
        'Quote Number',
        'Project Name',
        'Client Name',
        'Status',
        'Revenue',
        'Labor Cost',
        'Overhead Cost',
        'Total Cost',
        'Net Profit',
        'Margin %',
        'Hours',
      ];
      const rows = filteredProjects.map((p) => [
        `"${p.quoteNumber}"`,
        `"${p.projectName}"`,
        `"${p.clientName}"`,
        `"${p.quoteStatus}"`,
        (p.revenueMinor / 100).toFixed(2),
        (p.laborCostMinor / 100).toFixed(2),
        (p.overheadCostMinor / 100).toFixed(2),
        (p.totalCostMinor / 100).toFixed(2),
        (p.profitMinor / 100).toFixed(2),
        `${(p.margin * 100).toFixed(1)}%`,
        p.totalHours,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (activeSubTab === 'clients') {
      const headers = ['Client Name', 'Quotes Count', 'Total Revenue', 'Total Cost', 'Net Profit', 'Blended Margin %', 'Total Hours'];
      const rows = clientReports.map((c) => [
        `"${c.clientName}"`,
        c.quoteCount,
        (c.revenueMinor / 100).toFixed(2),
        (c.totalCostMinor / 100).toFixed(2),
        (c.profitMinor / 100).toFixed(2),
        `${(c.blendedMargin * 100).toFixed(1)}%`,
        c.totalHours,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const headers = ['Team Member', 'Role', 'Allocated Hours', 'Labor Cost', 'Attributed Revenue', 'Profit Contribution', 'Margin %', 'Projects Active'];
      const rows = teamReports.map((tItem) => [
        `"${tItem.name}"`,
        `"${tItem.roleName}"`,
        tItem.allocatedHours,
        (tItem.laborCostMinor / 100).toFixed(2),
        (tItem.attributedRevenueMinor / 100).toFixed(2),
        (tItem.profitMinor / 100).toFixed(2),
        `${(tItem.margin * 100).toFixed(1)}%`,
        tItem.projectCount,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `selet-report-${activeSubTab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Developer Role Restriction
  if (userRole === 'DEVELOPER') {
    return (
      <div className="p-6 rounded-[14px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-sm">{locale === 'am' ? 'ሪፖርቶች የተከለከሉ ናቸው' : 'Access Restricted'}</div>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-sans">
            {t.developerRestrictedReports}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-900 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-[7px] bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold tracking-tight">{t.reports}</h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">{t.reportsTagline}</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.reconciledWithQuotes}</span>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t.totalRevenue}</span>
            <div className="w-8 h-8 rounded-[7px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mt-2 font-mono tracking-tight">
            {formatMoney(summary.totalRevenue)}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">{summary.quoteCount} Quotes • 100% Stored Snapshot Match</p>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t.totalProjectCost}</span>
            <div className="w-8 h-8 rounded-[7px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mt-2 font-mono tracking-tight">
            {formatMoney(summary.totalCost)}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">{summary.totalHours} Allocated Engineering Hours</p>
        </div>

        {/* Total Gross Profit */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t.totalGrossProfit}</span>
            <div className="w-8 h-8 rounded-[7px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2 font-mono tracking-tight">
            {formatMoney(summary.totalProfit)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1 font-mono">Net Commercial Margin Surplus</p>
        </div>

        {/* Blended Margin */}
        <div className="bg-white dark:bg-[#141414] p-5 rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t.blendedMargin}</span>
            <div className="w-8 h-8 rounded-[7px] bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-2 font-mono tracking-tight">
            {(summary.blendedMargin * 100).toFixed(1)}%
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">Weighted Portfolio Blended Margin</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-[10px] bg-white dark:bg-[#141414] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{t.filterByStatus}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ISSUED' | 'DRAFT')}
            className="bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-2.5 py-1 font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
          >
            <option value="ALL">{t.allQuotes}</option>
            <option value="ISSUED">{t.issuedOnly}</option>
            <option value="DRAFT">{t.draftOnly}</option>
          </select>

          <span className="font-semibold text-neutral-800 dark:text-neutral-200 ml-2">{locale === 'am' ? 'ደንበኛ' : 'Client'}:</span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-[7px] px-2.5 py-1 font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
          >
            <option value="ALL">{locale === 'am' ? 'ሁሉም ደንበኞች' : 'All Clients'}</option>
            {clientOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Report Sub-Tabs Navigation */}
        <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-[7px] border border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`px-3 py-1 rounded-[5px] font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === 'projects'
                ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t.profitPerProject}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`px-3 py-1 rounded-[5px] font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === 'clients'
                ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.profitPerClient}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('team')}
            className={`px-3 py-1 rounded-[5px] font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === 'team'
                ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.profitPerTeamMember}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white dark:bg-[#141414] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden">
        {/* 1. Projects View */}
        {activeSubTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3.5">Quote Ref</th>
                  <th className="py-2.5 px-3.5">Project & Client</th>
                  <th className="py-2.5 px-3.5 text-right">Revenue (Subtotal)</th>
                  <th className="py-2.5 px-3.5 text-right">Labor Cost</th>
                  <th className="py-2.5 px-3.5 text-right">Overhead (10%)</th>
                  <th className="py-2.5 px-3.5 text-right">Total Cost</th>
                  <th className="py-2.5 px-3.5 text-right">Net Profit</th>
                  <th className="py-2.5 px-3.5 text-center">Margin %</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-neutral-900 dark:text-neutral-100">{p.quoteNumber}</td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.projectName}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{p.clientName}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatMoney(p.revenueMinor)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400">
                      {formatMoney(p.laborCostMinor)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400">
                      {formatMoney(p.overheadCostMinor)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                      {formatMoney(p.totalCostMinor)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(p.profitMinor)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {(p.margin * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-[7px] text-[10px] font-mono font-semibold uppercase tracking-wider ${
                          p.quoteStatus === 'ISSUED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.quoteStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Clients View */}
        {activeSubTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4 text-center">Quotes Count</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-center">Blended Margin</th>
                  <th className="py-3 px-4 text-right">Allocated Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientReports.map((c, idx) => (
                  <tr key={c.clientName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.clientName}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">{c.quoteCount}</td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                      {formatMoney(c.revenueMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {formatMoney(c.totalCostMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatMoney(c.profitMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {(c.blendedMargin * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">{c.totalHours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Team Members View */}
        {activeSubTab === 'team' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Job Role</th>
                  {userRole === 'OWNER' && <th className="py-3 px-4 text-right">Hourly Cost</th>}
                  <th className="py-3 px-4 text-center">Allocated Hours</th>
                  <th className="py-3 px-4 text-right">Labor Cost</th>
                  <th className="py-3 px-4 text-right">Attributed Revenue</th>
                  <th className="py-3 px-4 text-right">Profit Contribution</th>
                  <th className="py-3 px-4 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamReports.map((m, idx) => (
                  <tr key={m.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.roleName}</td>
                    {userRole === 'OWNER' && (
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatMoney(m.hourlyCostMinor)}/hr
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{m.allocatedHours} hrs</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatMoney(m.laborCostMinor)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatMoney(m.attributedRevenueMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatMoney(m.profitMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {(m.margin * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
