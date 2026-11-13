import { Injectable, Logger } from '@nestjs/common';
import { ExchangeRate, NotificationSeverity, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SetManualOverrideDto } from './dto/set-manual-override.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

export interface EnrichedExchangeRate extends ExchangeRate {
  isStale: boolean;
  daysOld: number;
}

const DEFAULT_NBE_RATES: Record<string, number> = {
  USD: 128.5,
  EUR: 138.2,
};

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  private enrichRate(rate: ExchangeRate): EnrichedExchangeRate {
    const now = Date.now();
    const effectiveTime = new Date(rate.effectiveAt).getTime();
    const daysOld = Math.floor((now - effectiveTime) / (1000 * 60 * 60 * 24));
    // Exchange rates older than 7 days without refresh are considered stale
    const isStale = daysOld > 7;

    return {
      ...rate,
      isStale,
      daysOld,
    };
  }

  async getRates(organizationId: string): Promise<EnrichedExchangeRate[]> {
    const rates = await this.prisma.exchangeRate.findMany({
      where: { organizationId },
      orderBy: { fromCurrency: 'asc' },
    });

    if (rates.length === 0) {
      // Initialize with default NBE rates
      await this.initializeDefaultRates(organizationId);
      return this.getRates(organizationId);
    }

    return rates.map((r) => this.enrichRate(r));
  }

  async getRate(
    fromCurrency: string,
    organizationId: string,
    toCurrency = 'ETB',
  ): Promise<EnrichedExchangeRate> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return {
        id: 'identity',
        organizationId,
        fromCurrency: from,
        toCurrency: to,
        rate: 1.0,
        source: 'IDENTITY',
        isManualOverride: false,
        effectiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isStale: false,
        daysOld: 0,
      };
    }

    let rate = await this.prisma.exchangeRate.findUnique({
      where: {
        organizationId_fromCurrency_toCurrency: {
          organizationId,
          fromCurrency: from,
          toCurrency: to,
        },
      },
    });

    if (!rate) {
      const fallbackRate = DEFAULT_NBE_RATES[from] || 1.0;
      rate = await this.prisma.exchangeRate.create({
        data: {
          organizationId,
          fromCurrency: from,
          toCurrency: to,
          rate: fallbackRate,
          source: 'NBE_BASELINE',
          isManualOverride: false,
          effectiveAt: new Date(),
        },
      });

      await this.prisma.exchangeRateHistory.create({
        data: {
          organizationId,
          fromCurrency: from,
          toCurrency: to,
          rate: fallbackRate,
          source: 'NBE_BASELINE',
          isManualOverride: false,
          capturedAt: new Date(),
        },
      });
    }

    return this.enrichRate(rate);
  }

  async setManualOverride(dto: SetManualOverrideDto, user: AuthenticatedUser) {
    const from = dto.fromCurrency.toUpperCase();
    const to = 'ETB';

    const existing = await this.prisma.exchangeRate.findUnique({
      where: {
        organizationId_fromCurrency_toCurrency: {
          organizationId: user.organizationId,
          fromCurrency: from,
          toCurrency: to,
        },
      },
    });

    const updated = await this.prisma.exchangeRate.upsert({
      where: {
        organizationId_fromCurrency_toCurrency: {
          organizationId: user.organizationId,
          fromCurrency: from,
          toCurrency: to,
        },
      },
      create: {
        organizationId: user.organizationId,
        fromCurrency: from,
        toCurrency: to,
        rate: dto.rate,
        source: 'MANUAL_OVERRIDE',
        isManualOverride: true,
        effectiveAt: new Date(),
      },
      update: {
        rate: dto.rate,
        source: 'MANUAL_OVERRIDE',
        isManualOverride: true,
        effectiveAt: new Date(),
      },
    });

    // Record snapshot history
    await this.prisma.exchangeRateHistory.create({
      data: {
        organizationId: user.organizationId,
        fromCurrency: from,
        toCurrency: to,
        rate: dto.rate,
        source: 'MANUAL_OVERRIDE',
        isManualOverride: true,
        capturedAt: new Date(),
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'SET_MANUAL_EXCHANGE_RATE',
      entityType: 'ExchangeRate',
      entityId: updated.id,
      oldValue: { rate: existing?.rate, source: existing?.source },
      newValue: { rate: updated.rate, source: 'MANUAL_OVERRIDE' },
    });

    return this.enrichRate(updated);
  }

  async clearManualOverride(fromCurrency: string, user: AuthenticatedUser) {
    const from = fromCurrency.toUpperCase();
    const to = 'ETB';

    const baseline = DEFAULT_NBE_RATES[from] || 1.0;

    const updated = await this.prisma.exchangeRate.update({
      where: {
        organizationId_fromCurrency_toCurrency: {
          organizationId: user.organizationId,
          fromCurrency: from,
          toCurrency: to,
        },
      },
      data: {
        rate: baseline,
        source: 'NBE_AUTOMATIC',
        isManualOverride: false,
        effectiveAt: new Date(),
      },
    });

    await this.prisma.exchangeRateHistory.create({
      data: {
        organizationId: user.organizationId,
        fromCurrency: from,
        toCurrency: to,
        rate: baseline,
        source: 'NBE_AUTOMATIC',
        isManualOverride: false,
        capturedAt: new Date(),
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CLEAR_MANUAL_EXCHANGE_RATE',
      entityType: 'ExchangeRate',
      entityId: updated.id,
      newValue: { rate: updated.rate, source: updated.source },
    });

    return this.enrichRate(updated);
  }

  async refreshRates(organizationId: string, simulateFailure = false) {
    if (simulateFailure) {
      // Requirement: If the source cannot be reached, keep the last rate and create a notification.
      this.logger.warn(`Source NBE exchange rate feed unreachable for org: ${organizationId}`);

      await this.notificationsService.create(
        {
          type: NotificationType.STALE_EXCHANGE_RATE,
          severity: NotificationSeverity.WARNING,
          title: 'Exchange Rate Refresh Failed',
          message:
            'Could not reach the National Bank of Ethiopia (NBE) rate service. Existing exchange rates have been preserved.',
          entityType: 'ExchangeRate',
          entityId: organizationId,
        },
        organizationId,
      );

      return {
        success: false,
        message: 'Could not reach exchange rate source. Existing rates kept.',
        rates: await this.getRates(organizationId),
      };
    }

    const currencies = ['USD', 'EUR'];
    const results = [];

    for (const cur of currencies) {
      const existing = await this.prisma.exchangeRate.findUnique({
        where: {
          organizationId_fromCurrency_toCurrency: {
            organizationId,
            fromCurrency: cur,
            toCurrency: 'ETB',
          },
        },
      });

      // If manual override is active, do not overwrite the manual rate
      if (existing?.isManualOverride) {
        results.push(this.enrichRate(existing));
        continue;
      }

      // Fetch new simulated rate from NBE feed
      const newRate = (DEFAULT_NBE_RATES[cur] || 100) + (Math.random() * 0.4 - 0.2);
      const rounded = Math.round(newRate * 10000) / 10000;

      const updated = await this.prisma.exchangeRate.upsert({
        where: {
          organizationId_fromCurrency_toCurrency: {
            organizationId,
            fromCurrency: cur,
            toCurrency: 'ETB',
          },
        },
        create: {
          organizationId,
          fromCurrency: cur,
          toCurrency: 'ETB',
          rate: rounded,
          source: 'NBE_FEED',
          isManualOverride: false,
          effectiveAt: new Date(),
        },
        update: {
          rate: rounded,
          source: 'NBE_FEED',
          isManualOverride: false,
          effectiveAt: new Date(),
        },
      });

      // Record snapshot
      await this.prisma.exchangeRateHistory.create({
        data: {
          organizationId,
          fromCurrency: cur,
          toCurrency: 'ETB',
          rate: rounded,
          source: 'NBE_FEED',
          isManualOverride: false,
          capturedAt: new Date(),
        },
      });

      results.push(this.enrichRate(updated));
    }

    return {
      success: true,
      message: 'Exchange rates successfully refreshed from NBE.',
      rates: results,
    };
  }

  async getHistory(organizationId: string, fromCurrency?: string, limit = 50) {
    return this.prisma.exchangeRateHistory.findMany({
      where: {
        organizationId,
        ...(fromCurrency ? { fromCurrency: fromCurrency.toUpperCase() } : {}),
      },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  }

  private async initializeDefaultRates(organizationId: string) {
    for (const [currency, rate] of Object.entries(DEFAULT_NBE_RATES)) {
      await this.prisma.exchangeRate.upsert({
        where: {
          organizationId_fromCurrency_toCurrency: {
            organizationId,
            fromCurrency: currency,
            toCurrency: 'ETB',
          },
        },
        create: {
          organizationId,
          fromCurrency: currency,
          toCurrency: 'ETB',
          rate,
          source: 'NBE_BASELINE',
          isManualOverride: false,
          effectiveAt: new Date(),
        },
        update: {},
      });

      await this.prisma.exchangeRateHistory.create({
        data: {
          organizationId,
          fromCurrency: currency,
          toCurrency: 'ETB',
          rate,
          source: 'NBE_BASELINE',
          isManualOverride: false,
          capturedAt: new Date(),
        },
      });
    }
  }
}
