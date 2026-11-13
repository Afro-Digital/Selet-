import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CatalogCategory,
  CatalogItem,
  NotificationSeverity,
  NotificationType,
  Payer,
  PriceModel,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

export interface EnrichedCatalogItem extends CatalogItem {
  isStale: boolean;
  daysSinceVerification: number;
}

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  private enrichItem(item: CatalogItem): EnrichedCatalogItem {
    const now = Date.now();
    const verifiedTime = new Date(item.verifiedAt).getTime();
    const diffDays = Math.floor((now - verifiedTime) / (1000 * 60 * 60 * 24));
    const isStale = diffDays > item.staleAfterDays;

    return {
      ...item,
      isStale,
      daysSinceVerification: diffDays,
    };
  }

  async findAll(
    organizationId: string,
    filters?: { category?: CatalogCategory; payer?: Payer; isExample?: boolean },
  ) {
    const items = await this.prisma.catalogItem.findMany({
      where: {
        organizationId,
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.payer ? { payer: filters.payer } : {}),
        ...(filters?.isExample !== undefined ? { isExample: filters.isExample } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return items.map((item) => this.enrichItem(item));
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id, organizationId },
    });

    if (!item) {
      throw new NotFoundException(`Catalog item with ID '${id}' not found`);
    }

    return this.enrichItem(item);
  }

  async create(dto: CreateCatalogItemDto, user: AuthenticatedUser) {
    const item = await this.prisma.catalogItem.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        category: dto.category,
        priceModel: dto.priceModel,
        amountMinor: dto.amountMinor ? BigInt(dto.amountMinor) : 0n,
        percentageRate: dto.percentageRate,
        currency: dto.currency || 'ETB',
        sourceUrl: dto.sourceUrl,
        payer: dto.payer || Payer.CLIENT,
        staleAfterDays: dto.staleAfterDays ?? 90,
        isExample: dto.isExample ?? false,
        verifiedAt: new Date(),
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_CATALOG_ITEM',
      entityType: 'CatalogItem',
      entityId: item.id,
      newValue: {
        name: item.name,
        category: item.category,
        amountMinor: item.amountMinor.toString(),
      },
    });

    return this.enrichItem(item);
  }

  async update(id: string, dto: UpdateCatalogItemDto, user: AuthenticatedUser) {
    const existing = await this.findOne(id, user.organizationId);

    const updated = await this.prisma.catalogItem.update({
      where: { id: existing.id },
      data: {
        name: dto.name,
        category: dto.category,
        priceModel: dto.priceModel,
        amountMinor: dto.amountMinor !== undefined ? BigInt(dto.amountMinor) : undefined,
        percentageRate: dto.percentageRate,
        currency: dto.currency,
        sourceUrl: dto.sourceUrl,
        payer: dto.payer,
        staleAfterDays: dto.staleAfterDays,
        verifiedAt: dto.markVerified ? new Date() : undefined,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_CATALOG_ITEM',
      entityType: 'CatalogItem',
      entityId: updated.id,
      oldValue: { name: existing.name },
      newValue: { name: updated.name },
    });

    return this.enrichItem(updated);
  }

  async delete(id: string, user: AuthenticatedUser) {
    const existing = await this.findOne(id, user.organizationId);

    await this.prisma.catalogItem.delete({
      where: { id: existing.id },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE_CATALOG_ITEM',
      entityType: 'CatalogItem',
      entityId: id,
      oldValue: { name: existing.name },
    });

    return { success: true, message: `Catalog item '${existing.name}' deleted successfully` };
  }

  async deleteExamples(user: AuthenticatedUser) {
    const result = await this.prisma.catalogItem.deleteMany({
      where: { organizationId: user.organizationId, isExample: true },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE_CATALOG_EXAMPLES',
      entityType: 'CatalogItem',
      newValue: { deletedCount: result.count },
    });

    return {
      success: true,
      count: result.count,
      message: `Removed ${result.count} example item(s)`,
    };
  }

  async seedExamples(user: AuthenticatedUser) {
    const examples = [
      {
        name: '[Example] AWS EC2 t4g.medium',
        category: CatalogCategory.HOSTING,
        priceModel: PriceModel.PER_MONTH,
        amountMinor: 3500n, // $35.00
        currency: 'USD',
        sourceUrl: 'https://aws.amazon.com/ec2/pricing/',
        payer: Payer.CLIENT,
        staleAfterDays: 60,
        isExample: true,
      },
      {
        name: '[Example] DigitalOcean Basic Droplet (2GB)',
        category: CatalogCategory.HOSTING,
        priceModel: PriceModel.PER_MONTH,
        amountMinor: 1200n, // $12.00
        currency: 'USD',
        sourceUrl: 'https://www.digitalocean.com/pricing/droplets',
        payer: Payer.CLIENT,
        staleAfterDays: 60,
        isExample: true,
      },
      {
        name: '[Example] Cloudflare Pro WAF & CDN',
        category: CatalogCategory.CDN,
        priceModel: PriceModel.PER_MONTH,
        amountMinor: 2000n, // $20.00
        currency: 'USD',
        sourceUrl: 'https://www.cloudflare.com/plans/',
        payer: Payer.AGENCY,
        staleAfterDays: 90,
        isExample: true,
      },
      {
        name: '[Example] .et Domain Annual Registration',
        category: CatalogCategory.DOMAIN,
        priceModel: PriceModel.FIXED,
        amountMinor: 120000n, // 1,200.00 ETB
        currency: 'ETB',
        sourceUrl: 'https://telecom.et/',
        payer: Payer.CLIENT,
        staleAfterDays: 180,
        isExample: true,
      },
      {
        name: '[Example] Wildcard SSL Certificate (Annual)',
        category: CatalogCategory.SSL,
        priceModel: PriceModel.FIXED,
        amountMinor: 250000n, // 2,500.00 ETB
        currency: 'ETB',
        sourceUrl: 'https://www.ssls.com/',
        payer: Payer.CLIENT,
        staleAfterDays: 180,
        isExample: true,
      },
      {
        name: '[Example] Telebirr & Chapa Payment Gateway Fee',
        category: CatalogCategory.PAYMENT_GATEWAY,
        priceModel: PriceModel.PERCENTAGE,
        amountMinor: 0n,
        percentageRate: 0.035, // 3.5%
        currency: 'ETB',
        sourceUrl: 'https://chapa.co/pricing',
        payer: Payer.CLIENT,
        staleAfterDays: 90,
        isExample: true,
      },
      {
        name: '[Example] GitHub Team Seat',
        category: CatalogCategory.TOOL,
        priceModel: PriceModel.PER_USER,
        amountMinor: 400n, // $4.00
        currency: 'USD',
        sourceUrl: 'https://github.com/pricing',
        payer: Payer.AGENCY,
        staleAfterDays: 90,
        isExample: true,
      },
      {
        name: '[Example] Sentry Error & Performance Monitoring',
        category: CatalogCategory.TOOL,
        priceModel: PriceModel.PER_MONTH,
        amountMinor: 2600n, // $26.00
        currency: 'USD',
        sourceUrl: 'https://sentry.io/pricing/',
        payer: Payer.AGENCY,
        staleAfterDays: 90,
        isExample: true,
      },
    ];

    const created = await this.prisma.catalogItem.createMany({
      data: examples.map((ex) => ({
        ...ex,
        organizationId: user.organizationId,
        verifiedAt: new Date(),
      })),
    });

    return { count: created.count, message: `Seeded ${created.count} example catalog items.` };
  }

  async auditStaleItems(organizationId: string) {
    const items = await this.prisma.catalogItem.findMany({
      where: { organizationId },
    });

    const now = Date.now();
    const staleItems: EnrichedCatalogItem[] = [];

    for (const item of items) {
      const verifiedTime = new Date(item.verifiedAt).getTime();
      const diffDays = Math.floor((now - verifiedTime) / (1000 * 60 * 60 * 24));
      if (diffDays > item.staleAfterDays) {
        const enriched = this.enrichItem(item);
        staleItems.push(enriched);

        // Generate in-app notification
        await this.notificationsService.create(
          {
            type: NotificationType.STALE_CATALOG_PRICE,
            severity: NotificationSeverity.WARNING,
            title: `Stale Catalog Price: ${item.name}`,
            message: `The price for '${item.name}' was last verified on ${new Date(item.verifiedAt).toISOString().slice(0, 10)} (${diffDays} days ago), exceeding the configured ${item.staleAfterDays}-day stale limit.`,
            entityType: 'CatalogItem',
            entityId: item.id,
          },
          organizationId,
        );
      }
    }

    return staleItems;
  }
}
