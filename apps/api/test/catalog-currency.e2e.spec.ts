import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, CatalogCategory, PriceModel, Payer, NotificationType } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 6 - Cost Catalog, Currency Service & Notifications', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-6',
    name: 'Afro Digital Software Studio',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15,
    targetMargin: 0.3,
    stretchMargin: 0.4,
    defaultOverheadRate: 0.1,
    defaultContingencyRate: 0.1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const storedCatalog: any[] = [];
  const storedRates: any[] = [
    {
      id: 'rate-usd-1',
      organizationId: mockOrg.id,
      fromCurrency: 'USD',
      toCurrency: 'ETB',
      rate: 128.5,
      source: 'NBE_BASELINE',
      isManualOverride: false,
      effectiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'rate-eur-1',
      organizationId: mockOrg.id,
      fromCurrency: 'EUR',
      toCurrency: 'ETB',
      rate: 138.2,
      source: 'NBE_BASELINE',
      isManualOverride: false,
      effectiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const storedRateHistories: any[] = [];
  const storedNotifications: any[] = [];

  const mockPrisma = {
    organization: {
      findUnique: async ({ where }: any) => (where.id === mockOrg.id ? { ...mockOrg } : null),
    },
    user: {
      findUnique: async ({ where }: any) => {
        if (where.id === 'user-owner') {
          return {
            id: 'user-owner',
            organizationId: mockOrg.id,
            email: 'owner@afrodigital.dev',
            role: UserRole.OWNER,
            isActive: true,
          };
        }
        return null;
      },
    },
    catalogItem: {
      findMany: async ({ where }: any) => {
        return storedCatalog.filter((item) => {
          if (item.organizationId !== where.organizationId) return false;
          if (where.category && item.category !== where.category) return false;
          if (where.payer && item.payer !== where.payer) return false;
          if (where.isExample !== undefined && item.isExample !== where.isExample) return false;
          return true;
        });
      },
      findFirst: async ({ where }: any) => {
        return (
          storedCatalog.find(
            (item) => item.id === where.id && item.organizationId === where.organizationId,
          ) || null
        );
      },
      create: async ({ data }: any) => {
        const item = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedCatalog.push(item);
        return item;
      },
      createMany: async ({ data }: any) => {
        for (const d of data) {
          storedCatalog.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            ...d,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return { count: data.length };
      },
      update: async ({ where, data }: any) => {
        const idx = storedCatalog.findIndex((i) => i.id === where.id);
        const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        storedCatalog[idx] = { ...storedCatalog[idx], ...clean, updatedAt: new Date() };
        return storedCatalog[idx];
      },
      delete: async ({ where }: any) => {
        const idx = storedCatalog.findIndex((i) => i.id === where.id);
        const [deleted] = storedCatalog.splice(idx, 1);
        return deleted;
      },
      deleteMany: async ({ where }: any) => {
        const before = storedCatalog.length;
        const remaining = storedCatalog.filter(
          (i) => !(i.organizationId === where.organizationId && i.isExample === where.isExample),
        );
        const count = before - remaining.length;
        storedCatalog.length = 0;
        storedCatalog.push(...remaining);
        return { count };
      },
    },
    exchangeRate: {
      findMany: async ({ where }: any) =>
        storedRates.filter((r) => r.organizationId === where.organizationId),
      findUnique: async ({ where }: any) => {
        const cond = where.organizationId_fromCurrency_toCurrency;
        if (!cond) return null;
        return (
          storedRates.find(
            (r) =>
              r.organizationId === cond.organizationId &&
              r.fromCurrency === cond.fromCurrency &&
              r.toCurrency === cond.toCurrency,
          ) || null
        );
      },
      upsert: async ({ where, create, update }: any) => {
        const cond = where.organizationId_fromCurrency_toCurrency;
        const idx = storedRates.findIndex(
          (r) =>
            r.organizationId === cond.organizationId &&
            r.fromCurrency === cond.fromCurrency &&
            r.toCurrency === cond.toCurrency,
        );
        if (idx >= 0) {
          storedRates[idx] = { ...storedRates[idx], ...update, updatedAt: new Date() };
          return storedRates[idx];
        }
        const created = {
          id: `rate-${Date.now()}`,
          ...create,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedRates.push(created);
        return created;
      },
      update: async ({ where, data }: any) => {
        const cond = where.organizationId_fromCurrency_toCurrency;
        const idx = storedRates.findIndex(
          (r) =>
            r.organizationId === cond.organizationId &&
            r.fromCurrency === cond.fromCurrency &&
            r.toCurrency === cond.toCurrency,
        );
        storedRates[idx] = { ...storedRates[idx], ...data, updatedAt: new Date() };
        return storedRates[idx];
      },
    },
    exchangeRateHistory: {
      create: async ({ data }: any) => {
        const h = { id: `hist-${Date.now()}`, ...data, capturedAt: new Date() };
        storedRateHistories.push(h);
        return h;
      },
      findMany: async ({ where }: any) =>
        storedRateHistories.filter((h) => {
          if (h.organizationId !== where.organizationId) return false;
          if (where.fromCurrency && h.fromCurrency !== where.fromCurrency) return false;
          return true;
        }),
    },
    notification: {
      findMany: async ({ where }: any) =>
        storedNotifications.filter((n) => {
          if (n.organizationId !== where.organizationId) return false;
          if (where.isRead !== undefined && n.isRead !== where.isRead) return false;
          return true;
        }),
      findFirst: async ({ where }: any) =>
        storedNotifications.find((n) => {
          if (n.organizationId !== where.organizationId) return false;
          if (where.type && n.type !== where.type) return false;
          if (where.entityType && n.entityType !== where.entityType) return false;
          if (where.entityId && n.entityId !== where.entityId) return false;
          if (where.isRead !== undefined && n.isRead !== where.isRead) return false;
          return true;
        }) || null,
      create: async ({ data }: any) => {
        const notif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          ...data,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedNotifications.push(notif);
        return notif;
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        for (const n of storedNotifications) {
          if (n.organizationId === where.organizationId && (!where.id || n.id === where.id)) {
            Object.assign(n, data);
            count++;
          }
        }
        return { count };
      },
      deleteMany: async ({ where }: any) => {
        const before = storedNotifications.length;
        const rem = storedNotifications.filter(
          (n) => !(n.organizationId === where.organizationId && n.id === where.id),
        );
        storedNotifications.length = 0;
        storedNotifications.push(...rem);
        return { count: before - rem.length };
      },
    },
    auditLog: {
      create: async () => ({ id: 'log-audit' }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  const getOwnerToken = () =>
    jwtService.sign({
      sub: 'user-owner',
      email: 'owner@afrodigital.dev',
      role: UserRole.OWNER,
      organizationId: mockOrg.id,
    });

  describe('Cost Catalog (/catalog)', () => {
    it('Owner can seed removable example items and delete them', async () => {
      // 1. Seed examples
      const seedRes = await request(app.getHttpServer())
        .post('/catalog/seed-examples')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(201);

      expect(seedRes.body.count).toBe(8);

      // Verify items are seeded
      const listRes = await request(app.getHttpServer())
        .get('/catalog?isExample=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(listRes.body.length).toBe(8);
      expect(listRes.body.some((i: any) => i.name.includes('AWS EC2'))).toBe(true);

      // 2. Delete examples
      const delRes = await request(app.getHttpServer())
        .delete('/catalog/examples')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(delRes.body.count).toBe(8);

      const emptyRes = await request(app.getHttpServer())
        .get('/catalog?isExample=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(emptyRes.body.length).toBe(0);
    });

    it('A stale catalog item produces an in-app notification', async () => {
      // Create a deliberately stale item (verified 120 days ago with staleAfterDays = 60)
      const hundredTwentyDaysAgo = new Date(Date.now() - 120 * 86400000);
      storedCatalog.push({
        id: 'item-stale-do-1',
        organizationId: mockOrg.id,
        name: 'DigitalOcean Stale Cluster',
        category: CatalogCategory.HOSTING,
        priceModel: PriceModel.PER_MONTH,
        amountMinor: 4800n,
        currency: 'USD',
        payer: Payer.CLIENT,
        staleAfterDays: 60,
        isExample: false,
        verifiedAt: hundredTwentyDaysAgo,
        createdAt: hundredTwentyDaysAgo,
        updatedAt: hundredTwentyDaysAgo,
      });

      // Run stale audit
      const auditRes = await request(app.getHttpServer())
        .get('/catalog/audit-stale')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(auditRes.body.length).toBeGreaterThan(0);
      const stale = auditRes.body.find((i: any) => i.id === 'item-stale-do-1');
      expect(stale).toBeDefined();
      expect(stale.isStale).toBe(true);
      expect(stale.daysSinceVerification).toBeGreaterThanOrEqual(120);

      // Verify in-app notification was created
      const notifRes = await request(app.getHttpServer())
        .get('/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const matchingNotif = notifRes.body.find(
        (n: any) =>
          n.type === NotificationType.STALE_CATALOG_PRICE && n.entityId === 'item-stale-do-1',
      );
      expect(matchingNotif).toBeDefined();
      expect(matchingNotif.title).toContain('DigitalOcean Stale Cluster');
      expect(matchingNotif.severity).toBe('WARNING');
    });
  });

  describe('Currency Service (/currency)', () => {
    it('Manual override beats automatic exchange rate feed', async () => {
      // Baseline USD rate is 128.5
      const initial = await request(app.getHttpServer())
        .get('/currency/rates')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const initialUsd = initial.body.find((r: any) => r.fromCurrency === 'USD');
      expect(initialUsd.rate).toBe(128.5);
      expect(initialUsd.isManualOverride).toBe(false);

      // Set manual override to 135.0 ETB
      const overrideRes = await request(app.getHttpServer())
        .post('/currency/override')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .send({
          fromCurrency: 'USD',
          rate: 135.0,
        })
        .expect(201);

      expect(overrideRes.body.rate).toBe(135.0);
      expect(overrideRes.body.isManualOverride).toBe(true);
      expect(overrideRes.body.source).toBe('MANUAL_OVERRIDE');

      // Trigger automated refresh - manual override must beat feed and stay 135.0
      const refreshRes = await request(app.getHttpServer())
        .post('/currency/refresh')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(201);

      const afterRefreshUsd = refreshRes.body.rates.find((r: any) => r.fromCurrency === 'USD');
      expect(afterRefreshUsd.rate).toBe(135.0);
      expect(afterRefreshUsd.isManualOverride).toBe(true);

      // Clear manual override - should revert to baseline
      await request(app.getHttpServer())
        .delete('/currency/override/USD')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const revertedRates = await request(app.getHttpServer())
        .get('/currency/rates')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const revertedUsd = revertedRates.body.find((r: any) => r.fromCurrency === 'USD');
      expect(revertedUsd.rate).toBe(128.5);
      expect(revertedUsd.isManualOverride).toBe(false);
    });

    it('Tests cover rate snapshots in history table', async () => {
      const historyRes = await request(app.getHttpServer())
        .get('/currency/history?fromCurrency=USD')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(Array.isArray(historyRes.body)).toBe(true);
      expect(historyRes.body.length).toBeGreaterThan(0);
      expect(historyRes.body.some((h: any) => h.source === 'MANUAL_OVERRIDE')).toBe(true);
      expect(historyRes.body.some((h: any) => h.rate === 135.0)).toBe(true);
    });

    it('If source cannot be reached, keep the last rate and create a notification', async () => {
      const failRes = await request(app.getHttpServer())
        .post('/currency/refresh?simulateFailure=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(201);

      expect(failRes.body.success).toBe(false);
      expect(failRes.body.rates.length).toBeGreaterThan(0);

      // Verify STALE_EXCHANGE_RATE notification was created
      const notifRes = await request(app.getHttpServer())
        .get('/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const feedFailNotif = notifRes.body.find(
        (n: any) => n.type === NotificationType.STALE_EXCHANGE_RATE,
      );
      expect(feedFailNotif).toBeDefined();
      expect(feedFailNotif.title).toContain('Exchange Rate Refresh Failed');
    });
  });

  describe('Notifications (/notifications)', () => {
    it('User can mark notifications as read', async () => {
      const notifs = await request(app.getHttpServer())
        .get('/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(notifs.body.length).toBeGreaterThan(0);
      const firstId = notifs.body[0].id;

      await request(app.getHttpServer())
        .patch(`/notifications/${firstId}/read`)
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      // Mark all read
      await request(app.getHttpServer())
        .post('/notifications/mark-all-read')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(201);

      const after = await request(app.getHttpServer())
        .get('/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(after.body.length).toBe(0);
    });
  });
});
