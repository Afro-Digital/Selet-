import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, PayType } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 5 - People and Rate Cards CRUD & Cost Privacy', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-5',
    name: 'Afro Digital Dev Studio',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15,
    targetMargin: 0.3,
    stretchMargin: 0.4,
    defaultOverheadRate: 0.1,
    defaultContingencyRate: 0.1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const storedRoles: any[] = [
    {
      id: 'role-backend-lead',
      organizationId: mockOrg.id,
      name: 'Backend Lead',
      description: 'Senior NestJS & Distributed Systems',
      defaultHourlyCostMinor: 40000n,
      currency: 'ETB',
      createdAt: new Date(),
      updatedAt: new Date(),
      people: [],
    },
  ];

  const storedPeople: any[] = [
    {
      id: 'person-dagi',
      organizationId: mockOrg.id,
      roleId: 'role-backend-lead',
      name: 'Dagmawi Tesfaye',
      email: 'dagi@afrodigital.dev',
      payType: PayType.MONTHLY_SALARY,
      currency: 'ETB',
      basicSalaryMinor: 4500000n, // 45,000 ETB
      allowancesMinor: 500000n, // 5,000 ETB
      benefitsMinor: 200000n, // 2,000 ETB
      directHourlyRateMinor: 0n,
      paidHoursPerMonth: 160,
      utilizationRate: 0.75, // 75% utilization = 120 productive hours
      isEthiopianNational: true,
      pensionRate: 0.11, // 11% POESSA employer pension
      pensionBase: 'BASIC',
      pensionCeilingMinor: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: { id: 'role-backend-lead', name: 'Backend Lead' },
    },
  ];

  const storedRateCards: any[] = [
    {
      id: 'rc-2026-default',
      organizationId: mockOrg.id,
      name: 'Standard Agency Card 2026',
      currency: 'ETB',
      effectiveFrom: new Date('2026-01-01'),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          rateCardId: 'rc-2026-default',
          roleId: 'role-backend-lead',
          hourlyRateMinor: 95000n, // 950 ETB/hr billing rate
          currency: 'ETB',
          role: { id: 'role-backend-lead', name: 'Backend Lead' },
        },
      ],
    },
  ];

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
        if (where.id === 'user-dev') {
          return {
            id: 'user-dev',
            organizationId: mockOrg.id,
            email: 'dev@afrodigital.dev',
            role: UserRole.DEVELOPER,
            isActive: true,
          };
        }
        return null;
      },
    },
    role: {
      findMany: async () =>
        storedRoles.map((r) => ({ ...r, _count: { people: r.people?.length || 0 } })),
      findFirst: async ({ where }: any) => {
        const found = storedRoles.find(
          (r) => r.id === where.id && r.organizationId === where.organizationId,
        );
        return found ? { ...found } : null;
      },
      findUnique: async ({ where }: any) => {
        if (where.organizationId_name) {
          return (
            storedRoles.find(
              (r) =>
                r.organizationId === where.organizationId_name.organizationId &&
                r.name.toLowerCase() === where.organizationId_name.name.toLowerCase(),
            ) || null
          );
        }
        return null;
      },
      create: async ({ data }: any) => {
        const newRole = {
          id: `role-${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          people: [],
        };
        storedRoles.push(newRole);
        return newRole;
      },
      update: async ({ where, data }: any) => {
        const index = storedRoles.findIndex((r) => r.id === where.id);
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined),
        );
        storedRoles[index] = { ...storedRoles[index], ...cleanData, updatedAt: new Date() };
        return storedRoles[index];
      },
      delete: async ({ where }: any) => {
        const index = storedRoles.findIndex((r) => r.id === where.id);
        const [deleted] = storedRoles.splice(index, 1);
        return deleted;
      },
    },
    person: {
      count: async ({ where }: any) => storedPeople.filter((p) => p.roleId === where.roleId).length,
      findMany: async ({ where }: any) =>
        storedPeople.filter((p) => p.organizationId === where.organizationId),
      findFirst: async ({ where }: any) => {
        const found = storedPeople.find(
          (p) => p.id === where.id && p.organizationId === where.organizationId,
        );
        return found ? { ...found } : null;
      },
      create: async ({ data }: any) => {
        const newPerson = {
          id: `person-${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: storedRoles.find((r) => r.id === data.roleId) || {
            id: data.roleId,
            name: 'Assigned Role',
          },
        };
        storedPeople.push(newPerson);
        return newPerson;
      },
      update: async ({ where, data }: any) => {
        const index = storedPeople.findIndex((p) => p.id === where.id);
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined),
        );
        storedPeople[index] = { ...storedPeople[index], ...cleanData, updatedAt: new Date() };
        return storedPeople[index];
      },
      delete: async ({ where }: any) => {
        const index = storedPeople.findIndex((p) => p.id === where.id);
        const [deleted] = storedPeople.splice(index, 1);
        return deleted;
      },
    },
    rateCard: {
      findMany: async ({ where }: any) =>
        storedRateCards.filter((rc) => rc.organizationId === where.organizationId),
      findFirst: async ({ where }: any) => {
        const found = storedRateCards.find(
          (rc) => rc.id === where.id && rc.organizationId === where.organizationId,
        );
        return found ? { ...found } : null;
      },
      updateMany: async () => ({ count: 1 }),
      create: async ({ data }: any) => {
        const newRc = {
          id: `rc-${Date.now()}`,
          name: data.name,
          currency: data.currency,
          effectiveFrom: data.effectiveFrom,
          isDefault: data.isDefault,
          organizationId: data.organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: data.items?.create || [],
        };
        storedRateCards.push(newRc);
        return newRc;
      },
      update: async ({ where, data }: any) => {
        const index = storedRateCards.findIndex((rc) => rc.id === where.id);
        storedRateCards[index] = { ...storedRateCards[index], ...data, updatedAt: new Date() };
        return storedRateCards[index];
      },
      delete: async ({ where }: any) => {
        const index = storedRateCards.findIndex((rc) => rc.id === where.id);
        const [deleted] = storedRateCards.splice(index, 1);
        return deleted;
      },
    },
    rateCardItem: {
      deleteMany: async () => ({ count: 1 }),
      createMany: async ({ data }: any) => ({ count: data.length }),
    },
    $transaction: async (fn: any) => fn(mockPrisma),
    auditLog: {
      create: async () => ({ id: 'log-1' }),
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

  const getDevToken = () =>
    jwtService.sign({
      sub: 'user-dev',
      email: 'dev@afrodigital.dev',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
    });

  describe('Job Roles Management (/roles)', () => {
    it('Owner can create a new job role', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .send({
          name: 'UI/UX Designer',
          description: 'Figma and Design Systems',
          defaultHourlyCostMinor: '30000',
          currency: 'ETB',
        })
        .expect(201);

      expect(res.body.name).toBe('UI/UX Designer');
      expect(res.body.defaultHourlyCostMinor).toBe('30000');
    });

    it('Developer token can list roles but defaultHourlyCostMinor is stripped', async () => {
      const res = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${getDevToken()}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      for (const role of res.body) {
        expect(role.defaultHourlyCostMinor).toBeUndefined();
        expect(role.name).toBeDefined();
      }
    });

    it('Developer cannot create a role (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${getDevToken()}`)
        .send({ name: 'Hacker Role' })
        .expect(403);
    });
  });

  describe('People Management & Hourly Cost Computation (/people)', () => {
    it('Owner sees computed hourly cost matching pricing engine formula', async () => {
      const res = await request(app.getHttpServer())
        .get('/people')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      const dagi = res.body.find((p: any) => p.name === 'Dagmawi Tesfaye');
      expect(dagi).toBeDefined();
      expect(dagi.computedHourlyCost).toBeDefined();

      // Monthly basic: 45,000 ETB, Allowances: 5,000 ETB, Benefits: 2,000 ETB
      // POESSA Pension (11% of 45,000) = 4,950 ETB
      // Total monthly cost = 45,000 + 5,000 + 2,000 + 4,950 = 56,950 ETB
      // Productive hours = 160 * 0.75 = 120 hrs
      // Hourly cost = 56,950 / 120 = 474.5833... -> 47,458 santim
      expect(dagi.computedHourlyCost.monthlyEmployerPensionMinor).toBe('495000');
      expect(dagi.computedHourlyCost.totalMonthlyCostMinor).toBe('5695000');
      expect(dagi.computedHourlyCost.productiveHoursPerMonth).toBe(120);
      expect(dagi.computedHourlyCost.hourlyCostMinor).toBe('47458');
    });

    it('Developer token sees team members with all sensitive salary and cost fields STRIPPED', async () => {
      const res = await request(app.getHttpServer())
        .get('/people')
        .set('Authorization', `Bearer ${getDevToken()}`)
        .expect(200);

      const dagi = res.body.find((p: any) => p.name === 'Dagmawi Tesfaye');
      expect(dagi).toBeDefined();
      expect(dagi.name).toBe('Dagmawi Tesfaye');
      expect(dagi.payType).toBe('MONTHLY_SALARY');
      expect(dagi.utilizationRate).toBe(0.75);
      expect(dagi.isEthiopianNational).toBe(true);

      // Sensitive fields must NOT exist in the response payload
      expect(dagi.basicSalaryMinor).toBeUndefined();
      expect(dagi.allowancesMinor).toBeUndefined();
      expect(dagi.benefitsMinor).toBeUndefined();
      expect(dagi.directHourlyRateMinor).toBeUndefined();
      expect(dagi.computedHourlyCost).toBeUndefined();
      expect(dagi.hourlyCostMinor).toBeUndefined();
    });

    it('Developer cannot add a team member (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/people')
        .set('Authorization', `Bearer ${getDevToken()}`)
        .send({
          roleId: 'role-backend-lead',
          name: 'Unauthorized User',
          payType: PayType.MONTHLY_SALARY,
        })
        .expect(403);
    });

    it('Owner can update team member details', async () => {
      const res = await request(app.getHttpServer())
        .patch('/people/person-dagi')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .send({
          utilizationRate: 0.8, // Raised to 80%
        })
        .expect(200);

      expect(res.body.utilizationRate).toBe(0.8);
      // 160 * 0.8 = 128 productive hours -> 56,950 / 128 = 444.92 ETB -> 44,492 santim
      expect(res.body.computedHourlyCost.productiveHoursPerMonth).toBe(128);
      expect(res.body.computedHourlyCost.hourlyCostMinor).toBe('44492');
    });
  });

  describe('Rate Cards Management (/rate-cards)', () => {
    it('Owner can create and list rate cards with role billing rates', async () => {
      const res = await request(app.getHttpServer())
        .get('/rate-cards')
        .set('Authorization', `Bearer ${getOwnerToken()}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Standard Agency Card 2026');
      expect(res.body[0].items[0].hourlyRateMinor).toBe('95000');
    });

    it('Developer cannot delete a rate card (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .delete('/rate-cards/rc-2026-default')
        .set('Authorization', `Bearer ${getDevToken()}`)
        .expect(403);
    });
  });
});
