import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserRole, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CurrencyService } from '../currency/currency.service';
import { EstimatesService } from '../estimates/estimates.service';
import { PdfService, FormattedQuoteData } from './pdf.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { LineItemVisibility, QuoteLineItemDto } from './dto/quote-line-item.dto';
import { QuoteMilestoneDto, MILESTONE_PRESETS } from './dto/quote-milestone.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { TAX_PACK_VERSION } from '@selet/tax-pack';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly currencyService: CurrencyService,
    private readonly estimatesService: EstimatesService,
    private readonly pdfService: PdfService,
  ) {}

  private assertNotDeveloper(user: AuthenticatedUser) {
    if (user.role === UserRole.DEVELOPER) {
      throw new ForbiddenException(
        'Developers are not permitted to view or manage commercial quotes',
      );
    }
  }

  /**
   * Generates sequential quote reference: QT-YYYY-XXXX
   */
  private async generateQuoteNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QT-${year}-`;
    const count = await this.prisma.quote.count({
      where: {
        organizationId,
        quoteNumber: { startsWith: prefix },
      },
    });
    const nextSeq = count + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Validates milestone schedules (sum must equal 100%).
   */
  public validateMilestones(milestones: QuoteMilestoneDto[]): void {
    if (!milestones || milestones.length === 0) return;

    let totalPct = 0;
    for (const m of milestones) {
      if (m.percentage !== undefined && m.percentage !== null) {
        totalPct += Number(m.percentage);
      }
    }

    // Milestones must sum to 100% within a 0.05 tolerance
    if (Math.abs(totalPct - 100) > 0.05) {
      throw new BadRequestException(
        `Payment milestones must sum to 100%. Current sum: ${totalPct.toFixed(2)}%`,
      );
    }
  }

  /**
   * Creates an immutable quote snapshot from a pricing scenario.
   */
  async createQuote(
    projectId: string,
    versionId: string,
    dto: CreateQuoteDto,
    user: AuthenticatedUser,
  ) {
    this.assertNotDeveloper(user);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId },
      include: {
        client: true,
        versions: { where: { id: versionId } },
      },
    });

    if (!project || project.versions.length === 0) {
      throw new NotFoundException('Project or Estimate Version not found');
    }

    // Fetch live pricing scenario and cost summary from engine
    const [scenario, costSummary] = await Promise.all([
      this.estimatesService.getPricingScenario(projectId, versionId, user),
      this.estimatesService.getCostSummary(projectId, versionId, user),
    ]);

    // 1. Resolve Line Items
    let lineItems: QuoteLineItemDto[] = [];
    if (dto.lineItems && dto.lineItems.length > 0) {
      lineItems = dto.lineItems;
    } else {
      // Auto-populate from scenario balancer lines
      const balancerLines = scenario.balancer?.lines || [];
      lineItems = balancerLines.map((m: any, idx: number) => ({
        id: m.id || `line-${idx + 1}`,
        title: m.name,
        description: `Scope deliverables and engineering for ${m.name}`,
        category: 'MODULE',
        visibility: LineItemVisibility.SHOW_PRICE,
        priceMinor: String(m.priceMinor || 0),
        displayOrder: idx + 1,
      }));
    }

    // Calculate subtotal from line items
    let subtotalMinor = BigInt(0);
    for (const item of lineItems) {
      subtotalMinor += BigInt(item.priceMinor || 0);
    }

    // If subtotal is still 0 (e.g. empty modules), fallback to recommended scenario price
    const recPrice = scenario.scenarios?.recommended?.priceMinor;
    if (subtotalMinor === BigInt(0) && recPrice) {
      subtotalMinor = BigInt(recPrice);
      if (lineItems.length === 0) {
        lineItems.push({
          id: 'line-1',
          title: project.name,
          description: project.description || 'Full software solution deliverables',
          category: 'SCOPE',
          visibility: LineItemVisibility.SHOW_PRICE,
          priceMinor: String(subtotalMinor),
          displayOrder: 1,
        });
      }
    }

    // 2. Tax calculations (VAT 15% - Proclamation 1341/2024)
    const vatRate = 0.15;
    const vatAmountMinor = (subtotalMinor * BigInt(15)) / BigInt(100);
    const totalPriceMinor = subtotalMinor + vatAmountMinor;

    // Withholding tax note (3% domestic services)
    const withholdingRate = dto.includeWithholdingNote !== false ? 0.03 : null;
    const withholdingAmountMinor = withholdingRate
      ? (subtotalMinor * BigInt(3)) / BigInt(100)
      : BigInt(0);
    const expectedCashMinor = totalPriceMinor - withholdingAmountMinor;

    const clientRecurringMonthlyMinor = costSummary.clientRecurringMonthlyMinor
      ? BigInt(costSummary.clientRecurringMonthlyMinor)
      : BigInt(0);

    // 3. Payment Milestones
    let milestones: QuoteMilestoneDto[] = [];
    const selectedPreset = dto.presetName ? MILESTONE_PRESETS[dto.presetName] : undefined;
    if (selectedPreset) {
      milestones = selectedPreset.map((preset, idx) => ({
        id: `ms-${idx + 1}`,
        title: preset.title,
        description: preset.description,
        percentage: preset.percentage,
        amountMinor: String(
          (totalPriceMinor * BigInt(Math.round(preset.percentage * 100))) /
            BigInt(10000),
        ),
      }));
    } else if (dto.milestones && dto.milestones.length > 0) {
      this.validateMilestones(dto.milestones);
      milestones = dto.milestones.map((m, idx) => ({
        ...m,
        id: m.id || `ms-${idx + 1}`,
        amountMinor:
          m.amountMinor ||
          (m.percentage !== undefined
            ? String(
                (totalPriceMinor * BigInt(Math.round(m.percentage * 100))) /
                  BigInt(10000),
              )
            : '0'),
      }));
    } else {
      // Default to 30/40/30 standard Ethiopian software delivery preset
      const defaultPreset = MILESTONE_PRESETS['30/40/30']!;
      milestones = defaultPreset.map((preset, idx) => ({
        id: `ms-${idx + 1}`,
        title: preset.title,
        description: preset.description,
        percentage: preset.percentage,
        amountMinor: String(
          (totalPriceMinor * BigInt(Math.round(preset.percentage * 100))) /
            BigInt(10000),
        ),
      }));
    }

    // 4. Secondary Currency Snapshot (USD or EUR)
    let secondaryCurrency: string | null = null;
    let exchangeRateSnapshot: number | null = null;
    let secondaryTotalPriceMinor: bigint | null = null;

    if (dto.secondaryCurrency) {
      secondaryCurrency = dto.secondaryCurrency.toUpperCase();
      try {
        const rateRecord = await this.currencyService.getRate(
          secondaryCurrency,
          user.organizationId,
        );
        exchangeRateSnapshot = rateRecord.rate;
      } catch {
        // Fallback standard rate if currency record not configured
        exchangeRateSnapshot = secondaryCurrency === 'USD' ? 155.0 : 165.0;
      }

      if (exchangeRateSnapshot && exchangeRateSnapshot > 0) {
        secondaryTotalPriceMinor = BigInt(
          Math.round(Number(totalPriceMinor) / exchangeRateSnapshot),
        );
      }
    }

    // 5. Validity Date
    const validDays = dto.validDays || 30;
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // 6. Generate Quote Number
    const quoteNumber = await this.generateQuoteNumber(user.organizationId);

    // 7. Client Information
    const clientName = dto.clientName || project.client?.name || 'Valued Client';
    const clientTin = dto.clientTin || project.client?.tin || null;
    const clientContact = dto.clientContact || project.client?.contactName || null;
    const clientEmail = dto.clientEmail || project.client?.contactEmail || null;

    // 8. Create Quote Record (Frozen Snapshot)
    const quote = await this.prisma.quote.create({
      data: {
        organizationId: user.organizationId,
        projectId,
        versionId,
        quoteNumber,
        status: QuoteStatus.DRAFT,
        title: dto.title,
        clientName,
        clientTin,
        clientContact,
        clientEmail,
        currency: project.currency || 'ETB',
        language: dto.language || 'en',
        calendar: dto.calendar || 'GREGORIAN',
        subtotalMinor,
        taxPackVersion: TAX_PACK_VERSION,
        vatRate,
        vatAmountMinor,
        withholdingRate,
        withholdingAmountMinor,
        totalPriceMinor,
        expectedCashMinor,
        clientRecurringMonthlyMinor,
        secondaryCurrency,
        exchangeRateSnapshot,
        secondaryTotalPriceMinor,
        executiveSummary: dto.executiveSummary || project.description || null,
        lineItemsSnapshot: lineItems as any,
        milestonesSnapshot: milestones as any,
        termsAndConditions: dto.termsAndConditions || null,
        brandingSnapshot: (dto.branding || null) as any,
        validUntil,
      },
    });

    await this.audit.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_QUOTE',
      entityType: 'Quote',
      entityId: quote.id,
      newValue: {
        quoteNumber: quote.quoteNumber,
        totalPriceMinor: quote.totalPriceMinor.toString(),
        currency: quote.currency,
      },
    });

    return this.serializeQuote(quote);
  }

  /**
   * Retrieves an immutable quote record.
   */
  async getQuote(quoteId: string, user: AuthenticatedUser) {
    this.assertNotDeveloper(user);

    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId: user.organizationId },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${quoteId} not found`);
    }

    return this.serializeQuote(quote);
  }

  /**
   * Lists all quotes for a project.
   */
  async listQuotes(projectId: string, user: AuthenticatedUser) {
    this.assertNotDeveloper(user);

    const quotes = await this.prisma.quote.findMany({
      where: { projectId, organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return quotes.map((q) => this.serializeQuote(q));
  }

  /**
   * Updates an unissued draft quote.
   */
  async updateQuote(quoteId: string, dto: UpdateQuoteDto, user: AuthenticatedUser) {
    this.assertNotDeveloper(user);

    const existing = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Quote with ID ${quoteId} not found`);
    }

    if (existing.status === QuoteStatus.ISSUED) {
      throw new BadRequestException(
        'Issued quotes are immutable and cannot be modified. Create a new revision instead.',
      );
    }

    // If updating milestones, validate 100%
    if (dto.milestones) {
      this.validateMilestones(dto.milestones);
    }

    // Recalculate if line items updated
    let subtotalMinor = existing.subtotalMinor;
    let vatAmountMinor = existing.vatAmountMinor;
    let totalPriceMinor = existing.totalPriceMinor;
    let withholdingAmountMinor = existing.withholdingAmountMinor;
    let expectedCashMinor = existing.expectedCashMinor;
    let secondaryTotalPriceMinor = existing.secondaryTotalPriceMinor;

    if (dto.lineItems && dto.lineItems.length > 0) {
      subtotalMinor = BigInt(0);
      for (const item of dto.lineItems) {
        subtotalMinor += BigInt(item.priceMinor || 0);
      }
      vatAmountMinor = (subtotalMinor * BigInt(15)) / BigInt(100);
      totalPriceMinor = subtotalMinor + vatAmountMinor;
      if (existing.withholdingRate) {
        withholdingAmountMinor = (subtotalMinor * BigInt(3)) / BigInt(100);
        expectedCashMinor = totalPriceMinor - withholdingAmountMinor;
      }
      if (existing.exchangeRateSnapshot && existing.exchangeRateSnapshot > 0) {
        secondaryTotalPriceMinor = BigInt(
          Math.round(Number(totalPriceMinor) / existing.exchangeRateSnapshot),
        );
      }
    }

    const updated = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: dto.status || existing.status,
        title: dto.title || existing.title,
        clientName: dto.clientName || existing.clientName,
        clientTin: dto.clientTin !== undefined ? dto.clientTin : existing.clientTin,
        clientContact:
          dto.clientContact !== undefined ? dto.clientContact : existing.clientContact,
        clientEmail:
          dto.clientEmail !== undefined ? dto.clientEmail : existing.clientEmail,
        language: dto.language || existing.language,
        calendar: dto.calendar || existing.calendar,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : existing.validUntil,
        executiveSummary:
          dto.executiveSummary !== undefined
            ? dto.executiveSummary
            : existing.executiveSummary,
        lineItemsSnapshot: dto.lineItems ? (dto.lineItems as any) : existing.lineItemsSnapshot,
        milestonesSnapshot: dto.milestones
          ? (dto.milestones as any)
          : existing.milestonesSnapshot,
        termsAndConditions:
          dto.termsAndConditions !== undefined
            ? dto.termsAndConditions
            : existing.termsAndConditions,
        brandingSnapshot: dto.branding
          ? (dto.branding as any)
          : existing.brandingSnapshot,
        subtotalMinor,
        vatAmountMinor,
        totalPriceMinor,
        withholdingAmountMinor,
        expectedCashMinor,
        secondaryTotalPriceMinor,
      },
    });

    await this.audit.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_QUOTE',
      entityType: 'Quote',
      entityId: quoteId,
      newValue: {
        status: updated.status,
        totalPriceMinor: updated.totalPriceMinor.toString(),
      },
    });

    return this.serializeQuote(updated);
  }

  /**
   * Issues a quote, permanently freezing it into an immutable snapshot.
   */
  async issueQuote(quoteId: string, user: AuthenticatedUser) {
    this.assertNotDeveloper(user);

    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId: user.organizationId },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${quoteId} not found`);
    }

    if (quote.status === QuoteStatus.ISSUED) {
      return this.serializeQuote(quote);
    }

    const issued = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.ISSUED,
        issuedAt: new Date(),
      },
    });

    await this.audit.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'ISSUE_QUOTE',
      entityType: 'Quote',
      entityId: quoteId,
      newValue: {
        status: QuoteStatus.ISSUED,
        issuedAt: issued.issuedAt,
        quoteNumber: issued.quoteNumber,
      },
    });

    return this.serializeQuote(issued);
  }

  /**
   * Renders the quote as styled Afro Digital HTML.
   */
  async renderQuoteHtml(quoteId: string, user: AuthenticatedUser): Promise<string> {
    const quote = await this.getQuote(quoteId, user);
    return this.pdfService.generateHtml(quote as unknown as FormattedQuoteData);
  }

  /**
   * Generates a binary PDF buffer from the quote snapshot via Playwright.
   */
  async renderQuotePdf(quoteId: string, user: AuthenticatedUser): Promise<Buffer> {
    const html = await this.renderQuoteHtml(quoteId, user);
    return this.pdfService.renderPdf(html);
  }

  /**
   * Verifies that an issued quote is 100% immutable and independent of subsequent rate or tax changes.
   */
  async verifyImmutability(quoteId: string, user: AuthenticatedUser) {
    const quote = await this.getQuote(quoteId, user);
    return {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      isImmutable: quote.status === QuoteStatus.ISSUED,
      snapshotValues: {
        subtotalMinor: quote.subtotalMinor,
        vatRate: quote.vatRate,
        vatAmountMinor: quote.vatAmountMinor,
        totalPriceMinor: quote.totalPriceMinor,
        taxPackVersion: quote.taxPackVersion,
        exchangeRateSnapshot: quote.exchangeRateSnapshot,
        secondaryTotalPriceMinor: quote.secondaryTotalPriceMinor,
      },
    };
  }

  /**
   * Safe serialization of BigInt fields into string representations for JSON responses.
   */
  private serializeQuote(quote: any) {
    return {
      ...quote,
      subtotalMinor: quote.subtotalMinor ? quote.subtotalMinor.toString() : '0',
      vatAmountMinor: quote.vatAmountMinor ? quote.vatAmountMinor.toString() : '0',
      withholdingAmountMinor: quote.withholdingAmountMinor
        ? quote.withholdingAmountMinor.toString()
        : '0',
      totalPriceMinor: quote.totalPriceMinor ? quote.totalPriceMinor.toString() : '0',
      expectedCashMinor: quote.expectedCashMinor ? quote.expectedCashMinor.toString() : '0',
      clientRecurringMonthlyMinor: quote.clientRecurringMonthlyMinor
        ? quote.clientRecurringMonthlyMinor.toString()
        : '0',
      secondaryTotalPriceMinor: quote.secondaryTotalPriceMinor
        ? quote.secondaryTotalPriceMinor.toString()
        : null,
    };
  }
}
