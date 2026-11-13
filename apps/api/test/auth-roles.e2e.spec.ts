import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import request from 'supertest';
import { UserRole, PayType } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('E2E: Authentication, Roles & Server-Side Field Filtering', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-test-123',
    name: 'Afro Digital Test Org',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15,
    targetMargin: 0.3,
    stretchMargin: 0.4,
    defaultOverheadRate: 0.1,
    defaultContingencyRate: 0.1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole = {
    id: 'role-dev-1',
    organizationId: mockOrg.id,
    name: 'Senior Developer',
    description: 'Backend',
    defaultHourlyCostMinor: 35000n,
    currency: 'ETB',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPerson = {
    id: 'person-abebe-1',
    organizationId: mockOrg.id,
    roleId: mockRole.id,
    name: 'Abebe Kebede',
    email: 'abebe@agency.et',
    payType: PayType.MONTHLY_SALARY,
    currency: 'ETB',
    basicSalaryMinor: 3000000n, // 30,000 ETB
    allowancesMinor: 500000n, // 5,000 ETB
    benefitsMinor: 0n,
    directHourlyRateMinor: 0n,
    paidHoursPerMonth: 160,
    utilizationRate: 0.7,
    isEthiopianNational: true,
    pensionRate: 0.11,
    pensionBase: 'BASIC',
    pensionCeilingMinor: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: mockRole.id, name: mockRole.name },
  };

  // In-memory mock PrismaService
  const mockPrisma = {
    organization: {
      findUnique: async ({ where }: any) => {
        if (where.id === mockOrg.id) return { ...mockOrg };
        return null;
      },
      update: async ({ data }: any) => {
        if (data.minimumFloorMargin !== undefined) {
          mockOrg.minimumFloorMargin = data.minimumFloorMargin;
        }
        return { ...mockOrg, ...data };
      },
      create: async ({ data }: any) => {
        return {
          id: 'new-org-id',
          name: data.name,
          defaultCurrency: 'ETB',
          users: [
            {
              id: 'new-owner-id',
              name: data.users.create.name,
              email: data.users.create.email,
              role: UserRole.OWNER,
              organizationId: 'new-org-id',
            },
          ],
        };
      },
    },
    user: {
      findFirst: async () => null, // Allows first-run setup
      findUnique: async ({ where }: any) => {
        if (where.id === 'user-owner') {
          return {
            id: 'user-owner',
            email: 'owner@afrodigital.dev',
            name: 'Owner User',
            role: UserRole.OWNER,
            organizationId: mockOrg.id,
            isActive: true,
          };
        }
        if (where.id === 'user-pm') {
          return {
            id: 'user-pm',
            email: 'pm@afrodigital.dev',
            name: 'PM User',
            role: UserRole.PM,
            organizationId: mockOrg.id,
            isActive: true,
          };
        }
        if (where.id === 'user-dev') {
          return {
            id: 'user-dev',
            email: 'dev@afrodigital.dev',
            name: 'Dev User',
            role: UserRole.DEVELOPER,
            organizationId: mockOrg.id,
            isActive: true,
          };
        }
        return null;
      },
    },
    person: {
      findMany: async () => [{ ...mockPerson }],
      findFirst: async () => ({ ...mockPerson }),
      create: async ({ data }: any) => ({ id: 'new-person', ...data }),
    },
    auditLog: {
      create: async ({ data }: any) => ({ id: 'audit-log-id', ...data }),
      findMany: async () => [],
    },
    $connect: async () => {},
    $disconnect: async () => {},
  };

  let ownerToken: string;
  let pmToken: string;
  let devToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    // OpenAPI test document
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Selet API Test')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);

    // Generate tokens for test roles
    ownerToken = jwtService.sign({
      sub: 'user-owner',
      email: 'owner@afrodigital.dev',
      role: UserRole.OWNER,
      organizationId: mockOrg.id,
    });

    pmToken = jwtService.sign({
      sub: 'user-pm',
      email: 'pm@afrodigital.dev',
      role: UserRole.PM,
      organizationId: mockOrg.id,
    });

    devToken = jwtService.sign({
      sub: 'user-dev',
      email: 'dev@afrodigital.dev',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Health endpoint is public and operational', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('selet-api');
  });

  it('First-run setup registers owner and returns JWT tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/setup-owner')
      .send({
        organizationName: 'First Run Org',
        name: 'Initial Owner',
        email: 'init@afrodigital.dev',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe(UserRole.OWNER);
  });

  describe('Server-Side Field Filtering & Role Serialization (Rule 5)', () => {
    it('DEVELOPER token NEVER receives salary, cost, or margin fields on GET /people', async () => {
      const res = await request(app.getHttpServer())
        .get('/people')
        .set('Authorization', `Bearer ${devToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const devView = res.body[0];

      // Developer sees name, email, role, etc.
      expect(devView.name).toBe('Abebe Kebede');
      expect(devView.role).toBeDefined();

      // STRICTLY HIDDEN: salary, allowances, computed hourly costs, internal margins
      expect(devView.basicSalaryMinor).toBeUndefined();
      expect(devView.allowancesMinor).toBeUndefined();
      expect(devView.benefitsMinor).toBeUndefined();
      expect(devView.directHourlyRateMinor).toBeUndefined();
      expect(devView.hourlyCostMinor).toBeUndefined();
      expect(devView.computedHourlyCost).toBeUndefined();
      expect(devView.hourlyCost).toBeUndefined();
      expect(devView.margin).toBeUndefined();
    });

    it('PM token does NOT receive internal salary fields on GET /people', async () => {
      const res = await request(app.getHttpServer())
        .get('/people')
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const pmView = res.body[0];
      expect(pmView.name).toBe('Abebe Kebede');
      expect(pmView.basicSalaryMinor).toBeUndefined();
      expect(pmView.allowancesMinor).toBeUndefined();
      expect(pmView.directHourlyRateMinor).toBeUndefined();
    });

    it('OWNER token receives complete data with computed hourly costs from pricing engine', async () => {
      const res = await request(app.getHttpServer())
        .get('/people')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const ownerView = res.body[0];
      expect(ownerView.name).toBe('Abebe Kebede');
      expect(ownerView.basicSalaryMinor).toBe('3000000');
      expect(ownerView.allowancesMinor).toBe('500000');
      expect(ownerView.computedHourlyCost).toBeDefined();
      expect(ownerView.computedHourlyCost.hourlyCostMinor).toBeDefined();
      expect(ownerView.computedHourlyCost.totalMonthlyCostMinor).toBe('3830000'); // 30k + 5k + 3.3k pension
    });
  });

  describe('Margin Floor Permissions & Role Guards', () => {
    it('PM token attempting to change margin floors is REJECTED with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .patch('/organization/floors')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ minimumFloorMargin: 0.1 }) // Attempting to lower floor
        .expect(403);

      expect(res.body.message).toMatch(/lacks sufficient privileges/i);
    });

    it('DEVELOPER token attempting to change margin floors is REJECTED with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .patch('/organization/floors')
        .set('Authorization', `Bearer ${devToken}`)
        .send({ minimumFloorMargin: 0.1 })
        .expect(403);
    });

    it('OWNER token can successfully update margin floors and changes are saved', async () => {
      const res = await request(app.getHttpServer())
        .patch('/organization/floors')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          minimumFloorMargin: 0.2,
          targetMargin: 0.35,
        })
        .expect(200);

      expect(res.body.minimumFloorMargin).toBe(0.2);
      expect(res.body.targetMargin).toBe(0.35);
    });

    it('Unauthorized requests without JWT are rejected with 401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/organization').expect(401);
      await request(app.getHttpServer()).get('/people').expect(401);
    });
  });
});
