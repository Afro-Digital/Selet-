import { Injectable } from '@nestjs/common';
import { CatalogCategory, Payer } from '@prisma/client';
import { ScaleEstimateInputDto } from './dto/scale-estimate.dto';
import { ScaleItemEntryDto } from './dto/update-scale-items.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface ScaleEstimationResult {
  monthlyUsers: number;
  peakConcurrency: number;
  storageGb: number;
  trafficGb: number;
  monthlyPaymentVolumeMinor: number;
  currency: string;
  usdToEtbRate: number;
  totalClientMonthlyMinor: number;
  totalAgencyMonthlyMinor: number;
  totalRecurringMonthlyMinor: number;
  items: ScaleItemEntryDto[];
}

@Injectable()
export class ScaleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates suggested recurring infrastructure, gateway fees, and tooling based on scale inputs.
   */
  async estimateScale(
    dto: ScaleEstimateInputDto,
    organizationId: string,
    targetCurrency = 'ETB',
  ): Promise<ScaleEstimationResult> {
    const monthlyUsers = dto.monthlyUsers;
    const peakConcurrency = dto.peakConcurrency ?? Math.max(5, Math.ceil(monthlyUsers * 0.005));
    const storageGb = dto.storageGb ?? Math.max(10, Math.ceil(monthlyUsers * 0.01));
    const trafficGb = dto.trafficGb ?? Math.max(20, Math.ceil(monthlyUsers * 0.04));
    const paymentVolumeMinor = dto.monthlyPaymentVolumeMinor ?? 0;

    // Fetch live USD/ETB rate from organization
    let usdRate = 128.5;
    try {
      const dbRate = await this.prisma.exchangeRate.findFirst({
        where: { organizationId, fromCurrency: 'USD', toCurrency: 'ETB' },
      });
      if (dbRate) {
        usdRate = dbRate.rate;
      }
    } catch {
      // fallback
    }

    const usdToMinor = (usd: number): number => {
      if (targetCurrency === 'USD') {
        return Math.round(usd * 100);
      }
      return Math.round(usd * usdRate * 100);
    };

    const etbToMinor = (etb: number): number => {
      if (targetCurrency === 'USD') {
        return Math.round((etb / usdRate) * 100);
      }
      return Math.round(etb * 100);
    };

    const items: ScaleItemEntryDto[] = [];

    // 1. HOSTING TIER
    if (monthlyUsers <= 1000) {
      items.push({
        id: 'scale-hosting-small',
        name: 'DigitalOcean Basic Droplet (1 vCPU, 2GB RAM)',
        category: CatalogCategory.HOSTING,
        amountMinor: usdToMinor(12),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Lightweight single-server hosting sufficient for up to 1,000 monthly users (peak ~${peakConcurrency} concurrent requests).`,
        isUserOverridden: false,
      });
    } else if (monthlyUsers <= 10000) {
      items.push({
        id: 'scale-hosting-medium',
        name: 'AWS EC2 t4g.medium (2 vCPU, 4GB RAM)',
        category: CatalogCategory.HOSTING,
        amountMinor: usdToMinor(35),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Recommended for 1,000–10,000 monthly users (current: ${monthlyUsers.toLocaleString()}) with moderate database queries & peak ~${peakConcurrency} concurrent requests.`,
        isUserOverridden: false,
      });
    } else if (monthlyUsers <= 50000) {
      items.push({
        id: 'scale-hosting-ha',
        name: 'Clustered Application Servers (2x AWS EC2 + Managed Database)',
        category: CatalogCategory.HOSTING,
        amountMinor: usdToMinor(120),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Multi-instance redundant deployment for 10,000–50,000 monthly active users with automated failover.`,
        isUserOverridden: false,
      });
    } else {
      items.push({
        id: 'scale-hosting-cluster',
        name: 'Auto-scaling Container Cluster (ECS / Kubernetes + RDS Multi-AZ)',
        category: CatalogCategory.HOSTING,
        amountMinor: usdToMinor(350),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Enterprise auto-scaling cluster with high concurrency handling for >50,000 monthly active users.`,
        isUserOverridden: false,
      });
    }

    // 2. CDN & EDGE CACHING
    if (trafficGb > 50 || monthlyUsers > 2000) {
      items.push({
        id: 'scale-cdn-pro',
        name: 'Cloudflare Pro CDN & Web Application Firewall (WAF)',
        category: CatalogCategory.CDN,
        amountMinor: usdToMinor(20),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Edge caching, DDoS protection, and image optimization for ${trafficGb} GB monthly bandwidth.`,
        isUserOverridden: false,
      });
    }

    // 3. STORAGE & MEDIA ASSETS
    if (storageGb > 10) {
      const storageUsd = Math.max(5, Math.ceil(storageGb * 0.02));
      items.push({
        id: 'scale-storage-s3',
        name: 'Cloudflare R2 / AWS S3 Object Storage',
        category: CatalogCategory.HOSTING,
        amountMinor: usdToMinor(storageUsd),
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Scalable object storage for ${storageGb} GB of product media, uploads, and automated daily backups ($0.02/GB).`,
        isUserOverridden: false,
      });
    }

    // 4. DOMAIN & SSL
    items.push({
      id: 'scale-domain-et',
      name: '.et Country Code Domain (.et Registrar)',
      category: CatalogCategory.DOMAIN,
      amountMinor: etbToMinor(125), // 1,500 ETB / year = 125 ETB / month
      currency: targetCurrency,
      payer: Payer.CLIENT,
      isIncluded: true,
      assumption:
        'Annual Ethiopian national ccTLD domain registration (~1,500 ETB/yr, amortized to 125 ETB/mo).',
      isUserOverridden: false,
    });

    items.push({
      id: 'scale-ssl-free',
      name: "Automated Let's Encrypt TLS / SSL",
      category: CatalogCategory.SSL,
      amountMinor: 0,
      currency: targetCurrency,
      payer: Payer.AGENCY,
      isIncluded: true,
      assumption: 'Automated 90-day zero-cost SSL certificate renewal via Certbot.',
      isUserOverridden: false,
    });

    // 5. PAYMENT GATEWAY PERCENTAGE FEES
    if (paymentVolumeMinor > 0) {
      // 3.5% transaction fee (Telebirr / Chapa blended rate)
      const feeMinor = Math.round(paymentVolumeMinor * 0.035);
      const volumeFormatted = (paymentVolumeMinor / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      items.push({
        id: 'scale-payment-gateway-fee',
        name: 'Telebirr & Chapa Payment Gateway Processing Fee (3.5%)',
        category: CatalogCategory.PAYMENT_GATEWAY,
        amountMinor: feeMinor,
        currency: targetCurrency,
        payer: Payer.CLIENT,
        isIncluded: true,
        assumption: `Estimated 3.5% transaction fee on monthly payment processing volume of ${volumeFormatted} ${targetCurrency}.`,
        isUserOverridden: false,
      });
    }

    // 6. MONITORING & TOOLING
    if (monthlyUsers > 1000) {
      items.push({
        id: 'scale-tool-sentry',
        name: 'Sentry Performance Monitoring & Error Tracking',
        category: CatalogCategory.TOOL,
        amountMinor: usdToMinor(26),
        currency: targetCurrency,
        payer: Payer.AGENCY,
        isIncluded: true,
        assumption:
          'Application crash monitoring and error tracing team license for production monitoring.',
        isUserOverridden: false,
      });
    }

    // Totals calculation
    let totalClientMonthlyMinor = 0;
    let totalAgencyMonthlyMinor = 0;

    for (const it of items) {
      if (it.isIncluded) {
        if (it.payer === Payer.CLIENT) {
          totalClientMonthlyMinor += it.amountMinor;
        } else {
          totalAgencyMonthlyMinor += it.amountMinor;
        }
      }
    }

    return {
      monthlyUsers,
      peakConcurrency,
      storageGb,
      trafficGb,
      monthlyPaymentVolumeMinor: paymentVolumeMinor,
      currency: targetCurrency,
      usdToEtbRate: usdRate,
      totalClientMonthlyMinor,
      totalAgencyMonthlyMinor,
      totalRecurringMonthlyMinor: totalClientMonthlyMinor + totalAgencyMonthlyMinor,
      items,
    };
  }
}
