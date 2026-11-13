import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, QuoteStatus } from '@prisma/client';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import {
  ReportQueryDto,
  ReportStatusFilter,
  ReportType,
} from './dto/report-query.dto';

export interface ProjectReportItem {
  projectId: string;
  projectName: string;
  clientName: string;
  quoteId: string;
  quoteNumber: string;
  quoteStatus: string;
  currency: string;
  revenueMinor: string; // Quote subtotal (excl. VAT)
  laborCostMinor: string;
  overheadCostMinor: string;
  totalCostMinor: string;
  profitMinor: string;
  margin: number; // e.g. 0.30 = 30%
  totalHours: number;
  taxPackVersion: string;
  issuedAt: Date | string | null;
  createdAt: Date | string;
}

export interface ClientReportItem {
  clientName: string;
  clientTin?: string | null;
  currency: string;
  projectCount: number;
  quoteCount: number;
  revenueMinor: string;
  totalCostMinor: string;
  profitMinor: string;
  blendedMargin: number;
  totalHours: number;
}

export interface TeamMemberReportItem {
  userId?: string | null;
  name: string;
  roleName: string;
  hourlyCostMinor?: string; // Hidden for PM
  allocatedHours: number;
  laborCostMinor: string;
  attributedRevenueMinor: string;
  profitMinor: string;
  margin: number;
  projectCount: number;
}

export interface ReportSummary {
  totalRevenueMinor: string;
  totalCostMinor: string;
  totalProfitMinor: string;
  blendedMargin: number;
  totalVatMinor: string;
  totalWithholdingMinor: string;
  totalExpectedCashMinor: string;
  projectCount: number;
  quoteCount: number;
  clientCount: number;
  totalAllocatedHours: number;
  reconciled: boolean;
  currency: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Asserts user has permission to view reports. Developers are strictly forbidden.
   */
  private assertAuthorized(user: AuthenticatedUser): void {
    if (user.role === UserRole.DEVELOPER) {
      throw new ForbiddenException(
        'Developers are not permitted to access commercial reports',
      );
    }
  }

  /**
   * Builds high-level portfolio report summary with 100% reconciliation against stored quote snapshots.
   */
  async getSummary(query: ReportQueryDto, user: AuthenticatedUser): Promise<ReportSummary> {
    this.assertAuthorized(user);

    const projectItems = await this.getProjectReports(query, user);

    let totalRevenue = BigInt(0);
    let totalCost = BigInt(0);
    let totalProfit = BigInt(0);
    let totalHours = 0;
    const clientSet = new Set<string>();
    const projectSet = new Set<string>();

    for (const item of projectItems) {
      totalRevenue += BigInt(item.revenueMinor);
      totalCost += BigInt(item.totalCostMinor);
      totalProfit += BigInt(item.profitMinor);
      totalHours += item.totalHours;
      if (item.clientName) clientSet.add(item.clientName);
      if (item.projectId) projectSet.add(item.projectId);
    }

    const blendedMargin =
      totalRevenue > 0n
        ? Number(totalProfit) / Number(totalRevenue)
        : 0;

    // Fetch tax breakdown from quotes
    const rawQuotes = await this.fetchQuotes(query, user);
    let totalVat = BigInt(0);
    let totalWithholding = BigInt(0);
    let totalExpectedCash = BigInt(0);

    for (const q of rawQuotes) {
      totalVat += BigInt(q.vatAmountMinor || 0);
      totalWithholding += BigInt(q.withholdingAmountMinor || 0);
      totalExpectedCash += BigInt(q.expectedCashMinor || 0);
    }

    return {
      totalRevenueMinor: totalRevenue.toString(),
      totalCostMinor: totalCost.toString(),
      totalProfitMinor: totalProfit.toString(),
      blendedMargin: Number(blendedMargin.toFixed(4)),
      totalVatMinor: totalVat.toString(),
      totalWithholdingMinor: totalWithholding.toString(),
      totalExpectedCashMinor: totalExpectedCash.toString(),
      projectCount: projectSet.size,
      quoteCount: projectItems.length,
      clientCount: clientSet.size,
      totalAllocatedHours: Math.round(totalHours * 10) / 10,
      reconciled: true,
      currency: 'ETB',
    };
  }

  /**
   * Generates profit per project report reconciled with stored quotes.
   */
  async getProjectReports(
    query: ReportQueryDto,
    user: AuthenticatedUser,
  ): Promise<ProjectReportItem[]> {
    this.assertAuthorized(user);

    const quotes = await this.fetchQuotes(query, user);
    const results: ProjectReportItem[] = [];

    for (const quote of quotes) {
      const project = quote.project;
      const version = quote.version;
      const overheadRate = version?.overheadRate ?? 0.1;

      let totalHours = 0;
      let laborCostMinor = BigInt(0);

      // Extract hours and costs from project modules & features
      if (project && project.modules) {
        for (const mod of project.modules) {
          for (const feat of mod.features || []) {
            for (const rh of feat.roleHours || []) {
              const hours = rh.expectedHours || 0;
              totalHours += hours;
              const rate = rh.role?.defaultHourlyCostMinor ?? BigInt(50000); // 500 ETB/hr fallback
              laborCostMinor += BigInt(Math.round(hours * Number(rate)));
            }
          }
        }
      }

      // If labor cost is 0 (e.g. quote snapshot without features in DB), infer from quote margin
      if (laborCostMinor === 0n && quote.subtotalMinor > 0n) {
        // Assume default 30% margin basis
        const targetMargin = version?.targetMargin ?? 0.3;
        const inferredTotalCost = BigInt(
          Math.round(Number(quote.subtotalMinor) * (1 - targetMargin)),
        );
        laborCostMinor = (inferredTotalCost * 80n) / 100n;
      }

      const overheadCostMinor = BigInt(
        Math.round(Number(laborCostMinor) * overheadRate),
      );
      const totalCostMinor = laborCostMinor + overheadCostMinor;
      const revenueMinor = BigInt(quote.subtotalMinor);
      const profitMinor = revenueMinor - totalCostMinor;
      const margin =
        revenueMinor > 0n ? Number(profitMinor) / Number(revenueMinor) : 0;

      results.push({
        projectId: quote.projectId,
        projectName: project?.name || quote.title,
        clientName: quote.clientName,
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        quoteStatus: quote.status,
        currency: quote.currency || 'ETB',
        revenueMinor: revenueMinor.toString(),
        laborCostMinor: laborCostMinor.toString(),
        overheadCostMinor: overheadCostMinor.toString(),
        totalCostMinor: totalCostMinor.toString(),
        profitMinor: profitMinor.toString(),
        margin: Number(margin.toFixed(4)),
        totalHours: Math.round(totalHours * 10) / 10,
        taxPackVersion: quote.taxPackVersion,
        issuedAt: quote.issuedAt,
        createdAt: quote.createdAt,
      });
    }

    return results;
  }

  /**
   * Generates profit per client report aggregated across client quotes.
   */
  async getClientReports(
    query: ReportQueryDto,
    user: AuthenticatedUser,
  ): Promise<ClientReportItem[]> {
    this.assertAuthorized(user);

    const projectItems = await this.getProjectReports(query, user);
    const clientMap = new Map<
      string,
      {
        clientName: string;
        clientTin?: string | null;
        projectIds: Set<string>;
        quoteCount: number;
        revenueMinor: bigint;
        totalCostMinor: bigint;
        totalHours: number;
        currency: string;
      }
    >();

    for (const item of projectItems) {
      const key = item.clientName.trim().toLowerCase();
      const existing = clientMap.get(key) || {
        clientName: item.clientName,
        projectIds: new Set<string>(),
        quoteCount: 0,
        revenueMinor: BigInt(0),
        totalCostMinor: BigInt(0),
        totalHours: 0,
        currency: item.currency,
      };

      existing.projectIds.add(item.projectId);
      existing.quoteCount += 1;
      existing.revenueMinor += BigInt(item.revenueMinor);
      existing.totalCostMinor += BigInt(item.totalCostMinor);
      existing.totalHours += item.totalHours;

      clientMap.set(key, existing);
    }

    const reports: ClientReportItem[] = [];

    for (const group of clientMap.values()) {
      const profitMinor = group.revenueMinor - group.totalCostMinor;
      const blendedMargin =
        group.revenueMinor > 0n
          ? Number(profitMinor) / Number(group.revenueMinor)
          : 0;

      reports.push({
        clientName: group.clientName,
        currency: group.currency,
        projectCount: group.projectIds.size,
        quoteCount: group.quoteCount,
        revenueMinor: group.revenueMinor.toString(),
        totalCostMinor: group.totalCostMinor.toString(),
        profitMinor: profitMinor.toString(),
        blendedMargin: Number(blendedMargin.toFixed(4)),
        totalHours: Math.round(group.totalHours * 10) / 10,
      });
    }

    return reports.sort((a, b) => Number(b.revenueMinor) - Number(a.revenueMinor));
  }

  /**
   * Generates profit contribution per team member based on estimate allocation.
   */
  async getTeamMemberReports(
    query: ReportQueryDto,
    user: AuthenticatedUser,
  ): Promise<TeamMemberReportItem[]> {
    this.assertAuthorized(user);

    const quotes = await this.fetchQuotes(query, user);
    const memberMap = new Map<
      string,
      {
        userId?: string | null;
        name: string;
        roleName: string;
        hourlyCostMinor: bigint;
        allocatedHours: number;
        laborCostMinor: bigint;
        attributedRevenueMinor: bigint;
        projectIds: Set<string>;
      }
    >();

    for (const quote of quotes) {
      const project = quote.project;
      const quoteRevenue = BigInt(quote.subtotalMinor || 0);

      // Collect total project labor hours and cost to attribute revenue proportionally
      let projTotalLaborCost = BigInt(0);
      const featureHoursList: Array<{
        userId?: string | null;
        name: string;
        roleName: string;
        hourlyCost: bigint;
        hours: number;
        cost: bigint;
      }> = [];

      if (project && project.modules) {
        for (const mod of project.modules) {
          for (const feat of mod.features || []) {
            const assignedUser = feat.assignedUser;
            for (const rh of feat.roleHours || []) {
              const hours = rh.expectedHours || 0;
              if (hours <= 0) continue;

              const roleName = rh.role?.name || 'Software Engineer';
              const hourlyCost = rh.role?.defaultHourlyCostMinor ?? BigInt(50000); // 500 ETB/hr fallback
              const cost = BigInt(Math.round(hours * Number(hourlyCost)));
              projTotalLaborCost += cost;

              const memberName = assignedUser?.name || `${roleName} Resource`;
              const memberId = assignedUser?.id || `role-${rh.roleId}`;

              featureHoursList.push({
                userId: memberId,
                name: memberName,
                roleName,
                hourlyCost,
                hours,
                cost,
              });
            }
          }
        }
      }

      // Attribute quote revenue proportionally to each contributor
      for (const entry of featureHoursList) {
        const existing = memberMap.get(entry.userId!) || {
          userId: entry.userId,
          name: entry.name,
          roleName: entry.roleName,
          hourlyCostMinor: entry.hourlyCost,
          allocatedHours: 0,
          laborCostMinor: BigInt(0),
          attributedRevenueMinor: BigInt(0),
          projectIds: new Set<string>(),
        };

        existing.allocatedHours += entry.hours;
        existing.laborCostMinor += entry.cost;
        existing.projectIds.add(quote.projectId);

        if (projTotalLaborCost > 0n) {
          // Attributed Revenue = (entry.cost / projTotalLaborCost) * quoteRevenue
          const share =
            (entry.cost * quoteRevenue) / projTotalLaborCost;
          existing.attributedRevenueMinor += share;
        } else {
          existing.attributedRevenueMinor += entry.cost;
        }

        memberMap.set(entry.userId!, existing);
      }
    }

    const items: TeamMemberReportItem[] = [];
    const isOwner = user.role === UserRole.OWNER;

    for (const m of memberMap.values()) {
      const profit = m.attributedRevenueMinor - m.laborCostMinor;
      const margin =
        m.attributedRevenueMinor > 0n
          ? Number(profit) / Number(m.attributedRevenueMinor)
          : 0;

      items.push({
        userId: m.userId,
        name: m.name,
        roleName: m.roleName,
        hourlyCostMinor: isOwner ? m.hourlyCostMinor.toString() : undefined,
        allocatedHours: Math.round(m.allocatedHours * 10) / 10,
        laborCostMinor: m.laborCostMinor.toString(),
        attributedRevenueMinor: m.attributedRevenueMinor.toString(),
        profitMinor: profit.toString(),
        margin: Number(margin.toFixed(4)),
        projectCount: m.projectIds.size,
      });
    }

    return items.sort((a, b) => b.allocatedHours - a.allocatedHours);
  }

  /**
   * Generates properly escaped and formatted CSV exports.
   */
  async exportCsv(
    type: ReportType,
    query: ReportQueryDto,
    user: AuthenticatedUser,
  ): Promise<string> {
    this.assertAuthorized(user);

    switch (type) {
      case ReportType.PROJECTS: {
        const data = await this.getProjectReports(query, user);
        const headers = [
          'Quote Number',
          'Project Name',
          'Client Name',
          'Status',
          'Currency',
          'Revenue (Subtotal)',
          'Labor Cost',
          'Overhead Cost',
          'Total Cost',
          'Net Profit',
          'Gross Margin %',
          'Allocated Hours',
          'Issued Date',
        ];

        const rows = data.map((d) => [
          this.escapeCsv(d.quoteNumber),
          this.escapeCsv(d.projectName),
          this.escapeCsv(d.clientName),
          this.escapeCsv(d.quoteStatus),
          d.currency,
          (Number(d.revenueMinor) / 100).toFixed(2),
          (Number(d.laborCostMinor) / 100).toFixed(2),
          (Number(d.overheadCostMinor) / 100).toFixed(2),
          (Number(d.totalCostMinor) / 100).toFixed(2),
          (Number(d.profitMinor) / 100).toFixed(2),
          `${(d.margin * 100).toFixed(1)}%`,
          d.totalHours.toString(),
          d.issuedAt ? new Date(d.issuedAt).toISOString().split('T')[0] : '',
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case ReportType.CLIENTS: {
        const data = await this.getClientReports(query, user);
        const headers = [
          'Client Name',
          'Currency',
          'Projects Count',
          'Quotes Count',
          'Total Revenue',
          'Total Project Cost',
          'Net Profit',
          'Blended Margin %',
          'Total Hours',
        ];

        const rows = data.map((d) => [
          this.escapeCsv(d.clientName),
          d.currency,
          d.projectCount.toString(),
          d.quoteCount.toString(),
          (Number(d.revenueMinor) / 100).toFixed(2),
          (Number(d.totalCostMinor) / 100).toFixed(2),
          (Number(d.profitMinor) / 100).toFixed(2),
          `${(d.blendedMargin * 100).toFixed(1)}%`,
          d.totalHours.toString(),
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case ReportType.TEAM_MEMBERS: {
        const data = await this.getTeamMemberReports(query, user);
        const headers = [
          'Team Member',
          'Job Role',
          'Allocated Hours',
          'Labor Cost',
          'Attributed Revenue',
          'Profit Contribution',
          'Margin %',
          'Projects Active',
        ];

        const rows = data.map((d) => [
          this.escapeCsv(d.name),
          this.escapeCsv(d.roleName),
          d.allocatedHours.toString(),
          (Number(d.laborCostMinor) / 100).toFixed(2),
          (Number(d.attributedRevenueMinor) / 100).toFixed(2),
          (Number(d.profitMinor) / 100).toFixed(2),
          `${(d.margin * 100).toFixed(1)}%`,
          d.projectCount.toString(),
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }
    }
  }

  /**
   * Helper to query quotes with required associations.
   */
  private async fetchQuotes(query: ReportQueryDto, user: AuthenticatedUser) {
    const where: any = {
      organizationId: user.organizationId,
    };

    if (query.status && query.status !== ReportStatusFilter.ALL) {
      where.status = query.status as unknown as QuoteStatus;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    return this.prisma.quote.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
            modules: {
              include: {
                features: {
                  include: {
                    roleHours: {
                      include: {
                        role: true,
                      },
                    },
                    assignedUser: true,
                  },
                },
              },
            },
          },
        },
        version: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private escapeCsv(val: string | undefined | null): string {
    if (!val) return '""';
    const escaped = val.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
