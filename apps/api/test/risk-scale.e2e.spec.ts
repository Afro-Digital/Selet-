import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, EstimationMethod, CatalogCategory, Payer } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 8 - Risk, Overhead, Scale Estimator & Recurring Costs', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-8',
    name: 'Addis Scale Software',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15,
    targetMargin: 0.3,
    stretchMargin: 0.4,
    defaultOverheadRate: 0.1, // 10% default overhead
    defaultContingencyRate: 0.1, // 10% default contingency
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const storedUsers: any[] = [
    {
      id: 'owner-id',
      email: 'owner@addis.dev',
      role: UserRole.OWNER,
      organizationId: mockOrg.id,
      name: 'Owner User',
    },
    {
      id: 'pm-id',
      email: 'pm@addis.dev',
      role: UserRole.PM,
      organizationId: mockOrg.id,
      name: 'Project Manager User',
    },
    {
      id: 'dev-id',
      email: 'dev@addis.dev',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Developer User',
    },
  ];

  const storedRoles: any[] = [
    {
      id: 'role-fullstack',
      organizationId: mockOrg.id,
      name: 'Fullstack Engineer',
      defaultHourlyCostMinor: 50000n, // 500 ETB/hr
    },
  ];

  const storedExchangeRates: any[] = [
    {
      id: 'rate-usd',
      organizationId: mockOrg.id,
      fromCurrency: 'USD',
      toCurrency: 'ETB',
      rate: 128.5,
      source: 'NBE',
      isManualOverride: false,
    },
  ];

  let storedProjects: any[] = [];
  let storedVersions: any[] = [];
  let storedModules: any[] = [];
  let storedFeatures: any[] = [];
  let storedFeatureRoleHours: any[] = [];

  const mockPrismaService = {
    organization: {
      findUnique: async ({ where }: any) => {
        if (where.id === mockOrg.id) return mockOrg;
        return null;
      },
    },
    user: {
      findUnique: async ({ where }: any) => {
        return storedUsers.find((u) => u.id === where.id) || null;
      },
      findFirst: async ({ where }: any) => {
        return storedUsers.find((u) => !where.id || u.id === where.id) || null;
      },
    },
    role: {
      findMany: async ({ where }: any) => {
        return storedRoles.filter(
          (r) => !where.organizationId || r.organizationId === where.organizationId,
        );
      },
      findFirst: async ({ where }: any) => {
        return storedRoles.find((r) => !where.id || r.id === where.id) || null;
      },
    },
    exchangeRate: {
      findFirst: async ({ where }: any) => {
        return (
          storedExchangeRates.find(
            (r) =>
              r.fromCurrency === where.fromCurrency &&
              r.toCurrency === where.toCurrency &&
              r.organizationId === where.organizationId,
          ) || null
        );
      },
    },
    project: {
      findMany: async ({ where }: any) => {
        return storedProjects.filter(
          (p) => !where.organizationId || p.organizationId === where.organizationId,
        );
      },
      findFirst: async ({ where }: any) => {
        const p = storedProjects.find((proj) => proj.id === where.id);
        if (!p) return null;

        const pMods = storedModules
          .filter((m) => m.projectId === p.id)
          .map((m) => {
            const mFeats = storedFeatures
              .filter((f) => f.moduleId === m.id)
              .map((f) => {
                const assignedUser = storedUsers.find((u) => u.id === f.assignedUserId) || null;
                const roleHours = storedFeatureRoleHours
                  .filter((rh) => rh.featureId === f.id)
                  .map((rh) => {
                    const r = storedRoles.find((role) => role.id === rh.roleId);
                    return { ...rh, role: r };
                  });
                return { ...f, assignedUser, roleHours };
              });
            return { ...m, features: mFeats };
          });

        const pVers = storedVersions.filter((v) => v.projectId === p.id);
        return { ...p, modules: pMods, versions: pVers, client: null };
      },
      create: async ({ data }: any) => {
        const id = `proj-${Date.now()}-${Math.random()}`;
        const newProj = {
          id,
          organizationId: data.organizationId,
          name: data.name,
          currency: data.currency || 'ETB',
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedProjects.push(newProj);

        if (data.versions?.create) {
          const v = {
            id: `ver-${Date.now()}`,
            projectId: id,
            versionNumber: 1,
            name: 'Initial Draft',
            status: 'DRAFT',
            contingencyRate: 0.1,
            overheadRate: null,
            riskFactors: null,
            scaleInputs: null,
            scaleItems: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          storedVersions.push(v);
        }
        return { ...newProj, versions: storedVersions.filter((v) => v.projectId === id) };
      },
    },
    estimateVersion: {
      findFirst: async ({ where }: any) => {
        return (
          storedVersions.find(
            (v) =>
              (!where.id || v.id === where.id) &&
              (!where.projectId || v.projectId === where.projectId),
          ) || null
        );
      },
      update: async ({ where, data }: any) => {
        const idx = storedVersions.findIndex((v) => v.id === where.id);
        if (idx === -1) throw new Error('Version not found');
        storedVersions[idx] = { ...storedVersions[idx], ...data, updatedAt: new Date() };
        return storedVersions[idx];
      },
    },
    module: {
      findUnique: async ({ where }: any) => {
        const m = storedModules.find((mod) => mod.id === where.id);
        if (!m) return null;
        const project = storedProjects.find((p) => p.id === m.projectId);
        return { ...m, project };
      },
      create: async ({ data }: any) => {
        const id = `mod-${Date.now()}`;
        const newMod = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        storedModules.push(newMod);
        return newMod;
      },
    },
    feature: {
      findUnique: async ({ where }: any) => {
        const f = storedFeatures.find((feat) => feat.id === where.id);
        if (!f) return null;
        const module = storedModules.find((m) => m.id === f.moduleId);
        const project = module ? storedProjects.find((p) => p.id === module.projectId) : null;
        return {
          ...f,
          module: module
            ? {
                ...module,
                project: {
                  ...project,
                  versions: storedVersions.filter((v) => v.projectId === project?.id),
                },
              }
            : null,
          roleHours: storedFeatureRoleHours.filter((rh) => rh.featureId === f.id),
        };
      },
      create: async ({ data }: any) => {
        const id = `feat-${Date.now()}`;
        const newFeat = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        storedFeatures.push(newFeat);
        return newFeat;
      },
    },
    featureRoleHours: {
      create: async ({ data }: any) => {
        const id = `rh-${Date.now()}`;
        const newRh = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        storedFeatureRoleHours.push(newRh);
        return newRh;
      },
      upsert: async ({ where, update, create }: any) => {
        const { featureId, roleId } = where.featureId_roleId;
        const idx = storedFeatureRoleHours.findIndex(
          (rh) => rh.featureId === featureId && rh.roleId === roleId,
        );
        if (idx >= 0) {
          storedFeatureRoleHours[idx] = {
            ...storedFeatureRoleHours[idx],
            ...update,
            updatedAt: new Date(),
          };
          return storedFeatureRoleHours[idx];
        } else {
          const newRh = {
            id: `rh-${Date.now()}`,
            ...create,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          storedFeatureRoleHours.push(newRh);
          return newRh;
        }
      },
    },
    auditLog: {
      create: async () => ({ id: 'mock-audit' }),
    },
  };

  const createToken = (user: (typeof storedUsers)[0]) => {
    return jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });
  };

  let testProjectId: string;
  let testVersionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
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

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Setup an E-Commerce Project with hours for testing
    const pmToken = createToken(storedUsers[1]);
    const pRes = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Chapa E-Commerce Store' })
      .set('Authorization', `Bearer ${pmToken}`);
    testProjectId = pRes.body.id;
    testVersionId = pRes.body.versions[0].id;

    const mRes = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/modules`)
      .send({ name: 'E-Commerce Core' })
      .set('Authorization', `Bearer ${pmToken}`);
    const modId = mRes.body.id;

    const fRes = await request(app.getHttpServer())
      .post(`/projects/modules/${modId}/features`)
      .send({
        name: 'Storefront & Checkout Feature',
        method: EstimationMethod.SINGLE_VALUE,
      })
      .set('Authorization', `Bearer ${pmToken}`);
    const featId = fRes.body.id;

    // Add 100 hours of Fullstack Engineer (100h * 500 ETB = 50,000 ETB labor cost)
    await request(app.getHttpServer())
      .put(`/projects/features/${featId}/hours`)
      .send({
        roleHours: [
          {
            roleId: storedRoles[0].id,
            singleHours: 100,
          },
        ],
      })
      .set('Authorization', `Bearer ${pmToken}`);
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // 1. SCALE ESTIMATOR MAPPING & ASSUMPTIONS
  // =========================================================================
  describe('Scale Estimator (5,000 Monthly Users E-Commerce)', () => {
    it('suggests infrastructure, bandwidth, storage, and payment gateway fees with visible assumptions', async () => {
      const pmToken = createToken(storedUsers[1]);

      const res = await request(app.getHttpServer())
        .post(`/projects/${testProjectId}/versions/${testVersionId}/scale/estimate`)
        .send({
          monthlyUsers: 5000,
          storageGb: 50,
          trafficGb: 200,
          monthlyPaymentVolumeMinor: 50000000, // 500,000 ETB
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(res.body.monthlyUsers).toBe(5000);
      expect(res.body.items.length).toBeGreaterThanOrEqual(5);

      // 1. Hosting Tier: 5,000 users => Medium AWS EC2 t4g.medium
      const hosting = res.body.items.find((i: any) => i.category === CatalogCategory.HOSTING);
      expect(hosting).toBeDefined();
      expect(hosting.name).toContain('AWS EC2 t4g.medium');
      expect(hosting.payer).toBe(Payer.CLIENT);
      expect(hosting.assumption).toContain('5,000');
      // $35 USD * 128.5 ETB = 4,497.50 ETB = 449,750 santim
      expect(hosting.amountMinor).toBe(449750);

      // 2. CDN: 200 GB traffic => Cloudflare Pro
      const cdn = res.body.items.find((i: any) => i.category === CatalogCategory.CDN);
      expect(cdn).toBeDefined();
      expect(cdn.name).toContain('Cloudflare Pro');
      expect(cdn.payer).toBe(Payer.CLIENT);
      expect(cdn.assumption).toContain('200 GB');

      // 3. Payment Gateway: 3.5% on 500,000 ETB = 17,500 ETB = 1,750,000 minor units
      const gateway = res.body.items.find(
        (i: any) => i.category === CatalogCategory.PAYMENT_GATEWAY,
      );
      expect(gateway).toBeDefined();
      expect(gateway.name).toContain('3.5%');
      expect(gateway.payer).toBe(Payer.CLIENT);
      expect(gateway.amountMinor).toBe(1750000); // 17,500 ETB
      expect(gateway.assumption).toContain('500,000.00');

      // 4. Domain & SSL
      const domain = res.body.items.find((i: any) => i.category === CatalogCategory.DOMAIN);
      expect(domain).toBeDefined();
      expect(domain.name).toContain('.et');
      expect(domain.payer).toBe(Payer.CLIENT);

      const ssl = res.body.items.find((i: any) => i.category === CatalogCategory.SSL);
      expect(ssl).toBeDefined();
      expect(ssl.payer).toBe(Payer.AGENCY);
      expect(ssl.amountMinor).toBe(0);

      // Totals
      expect(res.body.totalClientMonthlyMinor).toBeGreaterThan(0);
      expect(res.body.totalAgencyMonthlyMinor).toBeGreaterThanOrEqual(0);
    });

    it('allows updating and overriding scale items (changing payer and amounts)', async () => {
      const pmToken = createToken(storedUsers[1]);

      const updatedItems = [
        {
          id: 'scale-hosting-custom',
          name: 'Custom Agency Dedicated Cloud Node',
          category: CatalogCategory.HOSTING,
          amountMinor: 600000, // 6,000 ETB
          currency: 'ETB',
          payer: Payer.AGENCY, // Changed payer to AGENCY
          isIncluded: true,
          assumption: 'Custom agency node override',
          isUserOverridden: true,
        },
        {
          id: 'scale-domain-et',
          name: '.et Country Code Domain',
          category: CatalogCategory.DOMAIN,
          amountMinor: 12500,
          currency: 'ETB',
          payer: Payer.CLIENT,
          isIncluded: true,
          assumption: 'Standard domain',
          isUserOverridden: false,
        },
      ];

      const res = await request(app.getHttpServer())
        .put(`/projects/${testProjectId}/versions/${testVersionId}/scale/items`)
        .send({ items: updatedItems })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(res.body.totalAgencyMonthlyMinor).toBe(600000);
      expect(res.body.totalClientMonthlyMinor).toBe(12500);
      expect(res.body.totalRecurringMonthlyMinor).toBe(612500);
    });
  });

  // =========================================================================
  // 2. RISK MULTIPLIERS & OVERHEAD
  // =========================================================================
  describe('Risk Multipliers & Overhead', () => {
    it('retrieves default risk factors and rates', async () => {
      const devToken = createToken(storedUsers[2]);
      const res = await request(app.getHttpServer())
        .get(`/projects/${testProjectId}/versions/${testVersionId}/risk`)
        .set('Authorization', `Bearer ${devToken}`)
        .expect(200);

      expect(res.body.contingencyRate).toBe(0.1); // 10%
      expect(res.body.overheadRate).toBe(0.1); // 10% from org
      expect(res.body.riskFactors.length).toBe(4);
      expect(res.body.riskFactors.some((rf: any) => rf.id === 'unclear_reqs')).toBe(true);
    });

    it('allows PM and Owner to configure contingency rate, overhead rate and enable multipliers', async () => {
      const pmToken = createToken(storedUsers[1]);

      const res = await request(app.getHttpServer())
        .put(`/projects/${testProjectId}/versions/${testVersionId}/risk`)
        .send({
          contingencyRate: 0.12, // 12% contingency
          overheadRate: 0.15, // 15% overhead
          riskFactors: [
            {
              id: 'unclear_reqs',
              name: 'Unclear or Evolving Requirements',
              multiplier: 0.05,
              isEnabled: true, // +5%
            },
            {
              id: 'new_technology',
              name: 'New / Unfamiliar Technology Stack',
              multiplier: 0.08,
              isEnabled: true, // +8%
            },
            {
              id: 'tight_deadline',
              name: 'Tight Deadline',
              multiplier: 0.05,
              isEnabled: false,
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(res.body.contingencyRate).toBe(0.12);
      expect(res.body.overheadRate).toBe(0.15);
      expect(res.body.riskFactors.length).toBe(3);
    });

    it('rejects Developer attempting to update risk configuration (403 Forbidden)', async () => {
      const devToken = createToken(storedUsers[2]);
      await request(app.getHttpServer())
        .put(`/projects/${testProjectId}/versions/${testVersionId}/risk`)
        .send({ contingencyRate: 0.25 })
        .set('Authorization', `Bearer ${devToken}`)
        .expect(403);
    });
  });

  // =========================================================================
  // 3. FULL COST SUMMARY & DEVELOPER PRIVACY
  // =========================================================================
  describe('Full Cost Summary & Privacy', () => {
    it('computes full breakdown: labor + infra + risk + overhead with exact math for Owner', async () => {
      const ownerToken = createToken(storedUsers[0]);
      const res = await request(app.getHttpServer())
        .get(`/projects/${testProjectId}/versions/${testVersionId}/cost-summary`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      // Labor: 100h * 500 ETB = 50,000 ETB = 5,000,000 minor units
      expect(res.body.laborCostMinor).toBe(5000000);

      // Agency Infrastructure from scale items: 6,000 ETB = 600,000 minor units
      expect(res.body.agencyInfrastructureCostMinor).toBe(600000);

      // Direct Cost = labor (5,000,000) + agencyInfra (600,000) = 5,600,000
      expect(res.body.directCostMinor).toBe(5600000);

      // Risk: Contingency 12% + enabled multipliers (5% + 8% = 13%) => Total Risk Rate = 25% (0.25)
      expect(res.body.totalRiskRate).toBe(0.25);
      // Risk Cost = 5,600,000 * 0.25 = 1,400,000
      expect(res.body.riskCostMinor).toBe(1400000);

      // Subtotal with Risk = 5,600,000 + 1,400,000 = 7,000,000
      expect(res.body.subtotalWithRiskMinor).toBe(7000000);

      // Overhead: 15% on subtotalWithRisk = 7,000,000 * 0.15 = 1,050,000
      expect(res.body.overheadCostMinor).toBe(1050000);

      // Total Project Cost = 7,000,000 + 1,050,000 = 8,050,000
      expect(res.body.totalCostMinor).toBe(8050000);

      // Client recurring monthly cost = 12,500 minor units (125 ETB)
      expect(res.body.clientRecurringMonthlyMinor).toBe(12500);
    });

    it('returns hours and item names only (NO monetary amounts or costs) for Developer', async () => {
      const devToken = createToken(storedUsers[2]);
      const res = await request(app.getHttpServer())
        .get(`/projects/${testProjectId}/versions/${testVersionId}/cost-summary`)
        .set('Authorization', `Bearer ${devToken}`)
        .expect(200);

      expect(res.body.totalHours).toBe(100);
      expect(res.body.scaleItems.length).toBeGreaterThan(0);
      expect(res.body.scaleItems[0].name).toBeDefined();

      // Ensure all monetary fields are absent
      expect(res.body.laborCostMinor).toBeUndefined();
      expect(res.body.directCostMinor).toBeUndefined();
      expect(res.body.riskCostMinor).toBeUndefined();
      expect(res.body.overheadCostMinor).toBeUndefined();
      expect(res.body.totalCostMinor).toBeUndefined();
      expect(res.body.scaleItems[0].amountMinor).toBeUndefined();
    });
  });
});
