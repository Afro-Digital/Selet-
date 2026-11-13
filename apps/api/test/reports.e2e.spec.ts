import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, QuoteStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 12 - Reports, Reconciliation & CSV Export', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-12',
    name: 'Afro Digital Technologies',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15,
    targetMargin: 0.3,
    stretchMargin: 0.4,
    defaultOverheadRate: 0.1,
    defaultContingencyRate: 0.1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const storedUsers: any[] = [
    {
      id: 'owner-id',
      email: 'owner@afrodigital.et',
      role: UserRole.OWNER,
      organizationId: mockOrg.id,
      name: 'Owner User',
    },
    {
      id: 'pm-id',
      email: 'pm@afrodigital.et',
      role: UserRole.PM,
      organizationId: mockOrg.id,
      name: 'Project Manager User',
    },
    {
      id: 'dev-id',
      email: 'dev@afrodigital.et',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Developer User',
    },
    {
      id: 'dev-alex',
      email: 'alex@afrodigital.et',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Alex Developer',
    },
    {
      id: 'dev-betty',
      email: 'betty@afrodigital.et',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Betty Engineer',
    },
  ];

  const storedRoles: any[] = [
    {
      id: 'role-backend',
      organizationId: mockOrg.id,
      name: 'Senior Backend Engineer',
      defaultHourlyCostMinor: 60000n, // 600 ETB/hr
    },
    {
      id: 'role-frontend',
      organizationId: mockOrg.id,
      name: 'Frontend Engineer',
      defaultHourlyCostMinor: 45000n, // 450 ETB/hr
    },
  ];

  // Projects, Clients, Quotes
  const storedProjects: any[] = [
    {
      id: 'proj-1',
      organizationId: mockOrg.id,
      name: 'Telebirr SuperApp Mini-App & Core Billing',
      currency: 'ETB',
      client: {
        id: 'client-1',
        name: 'Ethio Telecom',
        tin: '0011223344',
      },
      modules: [
        {
          id: 'mod-1',
          name: 'Core Payment Adapter',
          features: [
            {
              id: 'feat-1',
              name: 'Telebirr USSD & App Gateway',
              assignedUser: storedUsers[3], // Alex
              roleHours: [
                {
                  roleId: 'role-backend',
                  role: storedRoles[0],
                  expectedHours: 120, // 120 * 600 = 72,000 ETB
                },
              ],
            },
            {
              id: 'feat-2',
              name: 'Checkout UI Component',
              assignedUser: storedUsers[4], // Betty
              roleHours: [
                {
                  roleId: 'role-frontend',
                  role: storedRoles[1],
                  expectedHours: 80, // 80 * 450 = 36,000 ETB
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'proj-2',
      organizationId: mockOrg.id,
      name: 'Ethiopian Airlines Cargo Tracking System',
      currency: 'ETB',
      client: {
        id: 'client-2',
        name: 'Ethiopian Airlines Enterprise',
        tin: '0055667788',
      },
      modules: [
        {
          id: 'mod-2',
          name: 'Telemetry Processing',
          features: [
            {
              id: 'feat-3',
              name: 'Flight Radar Telemetry Intake',
              assignedUser: storedUsers[3], // Alex
              roleHours: [
                {
                  roleId: 'role-backend',
                  role: storedRoles[0],
                  expectedHours: 150, // 150 * 600 = 90,000 ETB
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'proj-3',
      organizationId: mockOrg.id,
      name: 'CBE Birr Agent Management Portal',
      currency: 'ETB',
      client: {
        id: 'client-3',
        name: 'Commercial Bank of Ethiopia',
        tin: '0099887766',
      },
      modules: [
        {
          id: 'mod-3',
          name: 'Agent KYC & Liquidity Monitor',
          features: [
            {
              id: 'feat-4',
              name: 'Agent Portal Web App',
              assignedUser: storedUsers[4], // Betty
              roleHours: [
                {
                  roleId: 'role-frontend',
                  role: storedRoles[1],
                  expectedHours: 100, // 100 * 450 = 45,000 ETB
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const storedVersions: any[] = [
    {
      id: 'ver-1',
      projectId: 'proj-1',
      overheadRate: 0.1,
      targetMargin: 0.3,
    },
    {
      id: 'ver-2',
      projectId: 'proj-2',
      overheadRate: 0.1,
      targetMargin: 0.3,
    },
    {
      id: 'ver-3',
      projectId: 'proj-3',
      overheadRate: 0.1,
      targetMargin: 0.3,
    },
  ];

  const storedQuotes: any[] = [
    {
      id: 'quote-1',
      organizationId: mockOrg.id,
      projectId: 'proj-1',
      versionId: 'ver-1',
      quoteNumber: 'QT-2026-0001',
      status: QuoteStatus.ISSUED,
      title: 'Commercial Proposal for Telebirr Integration',
      clientName: 'Ethio Telecom',
      clientTin: '0011223344',
      currency: 'ETB',
      subtotalMinor: 100000000n, // 1,000,000 ETB
      vatAmountMinor: 15000000n,  // 150,000 ETB (15%)
      withholdingAmountMinor: 3000000n, // 30,000 ETB (3%)
      totalPriceMinor: 115000000n,
      expectedCashMinor: 112000000n,
      taxPackVersion: '2026.1',
      issuedAt: new Date('2026-01-15T10:00:00Z'),
      validUntil: new Date('2026-02-15T10:00:00Z'),
      createdAt: new Date('2026-01-15T10:00:00Z'),
    },
    {
      id: 'quote-2',
      organizationId: mockOrg.id,
      projectId: 'proj-2',
      versionId: 'ver-2',
      quoteNumber: 'QT-2026-0002',
      status: QuoteStatus.ISSUED,
      title: 'Cargo Tracking Software Proposal',
      clientName: 'Ethiopian Airlines Enterprise',
      clientTin: '0055667788',
      currency: 'ETB',
      subtotalMinor: 80000000n, // 800,000 ETB
      vatAmountMinor: 12000000n, // 120,000 ETB (15%)
      withholdingAmountMinor: 2400000n, // 24,000 ETB (3%)
      totalPriceMinor: 92000000n,
      expectedCashMinor: 89600000n,
      taxPackVersion: '2026.1',
      issuedAt: new Date('2026-02-01T10:00:00Z'),
      validUntil: new Date('2026-03-01T10:00:00Z'),
      createdAt: new Date('2026-02-01T10:00:00Z'),
    },
    {
      id: 'quote-3',
      organizationId: mockOrg.id,
      projectId: 'proj-3',
      versionId: 'ver-3',
      quoteNumber: 'QT-2026-0003',
      status: QuoteStatus.DRAFT,
      title: 'Agent Portal Proposal Draft',
      clientName: 'Commercial Bank of Ethiopia',
      clientTin: '0099887766',
      currency: 'ETB',
      subtotalMinor: 50000000n, // 500,000 ETB
      vatAmountMinor: 7500000n,  // 75,000 ETB (15%)
      withholdingAmountMinor: 1500000n, // 15,000 ETB (3%)
      totalPriceMinor: 57500000n,
      expectedCashMinor: 56000000n,
      taxPackVersion: '2026.1',
      issuedAt: null,
      validUntil: new Date('2026-03-15T10:00:00Z'),
      createdAt: new Date('2026-02-15T10:00:00Z'),
    },
  ];

  const mockPrismaService = {
    organization: {
      findUnique: async (args: any) => (args.where.id === mockOrg.id ? mockOrg : null),
    },
    user: {
      findUnique: async (args: any) => storedUsers.find((u) => u.id === args.where.id) || null,
      findFirst: async (args: any) =>
        storedUsers.find(
          (u) =>
            (!args.where.id || u.id === args.where.id) &&
            (!args.where.email || u.email === args.where.email),
        ) || null,
    },
    quote: {
      findMany: async (args: any) => {
        let results = storedQuotes.filter(
          (q) =>
            q.organizationId === args.where.organizationId &&
            (!args.where.status || q.status === args.where.status) &&
            (!args.where.projectId || q.projectId === args.where.projectId),
        );

        if (args.where.createdAt) {
          if (args.where.createdAt.gte) {
            results = results.filter((q) => q.createdAt >= args.where.createdAt.gte);
          }
          if (args.where.createdAt.lte) {
            results = results.filter((q) => q.createdAt <= args.where.createdAt.lte);
          }
        }

        return results.map((q) => {
          const project = storedProjects.find((p) => p.id === q.projectId);
          const version = storedVersions.find((v) => v.id === q.versionId);
          return {
            ...q,
            project,
            version,
          };
        });
      },
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  const createToken = (u: any) =>
    jwtService.sign({
      sub: u.id,
      email: u.email,
      role: u.role,
      organizationId: u.organizationId,
    });

  it('1. Role filtering: Developer access to reports is strictly forbidden (403 Forbidden)', async () => {
    const devToken = createToken(storedUsers[2]); // Developer

    await request(app.getHttpServer())
      .get('/reports/summary')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/reports/projects')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/reports/clients')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/reports/team-members')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/reports/export-csv?type=projects')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);
  });

  it('2. Owner receives high-level summary and verifies exact reconciliation with stored quote snapshots', async () => {
    const ownerToken = createToken(storedUsers[0]); // Owner

    const res = await request(app.getHttpServer())
      .get('/reports/summary')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const summary = res.body;

    // Total Revenue must reconcile with sum of quote subtotals:
    // 1,000,000 + 800,000 + 500,000 = 2,300,000 ETB = 230,000,000 minor
    expect(summary.totalRevenueMinor).toBe('230000000');

    // Total Quotes and counts
    expect(summary.quoteCount).toBe(3);
    expect(summary.projectCount).toBe(3);
    expect(summary.clientCount).toBe(3);
    expect(summary.reconciled).toBe(true);
    expect(summary.currency).toBe('ETB');

    // VAT total: 150k + 120k + 75k = 345,000 ETB = 34,500,000 minor
    expect(summary.totalVatMinor).toBe('34500000');

    // Withholding total: 30k + 24k + 15k = 69,000 ETB = 6,900,000 minor
    expect(summary.totalWithholdingMinor).toBe('6900000');

    // Profit must be positive BigInt string
    const profitMinor = BigInt(summary.totalProfitMinor);
    expect(profitMinor).toBeGreaterThan(0n);
    expect(summary.blendedMargin).toBeGreaterThan(0.2);
  });

  it('3. Generates Profit per Project report and reconciles each line item with stored quote snapshot', async () => {
    const ownerToken = createToken(storedUsers[0]);

    const res = await request(app.getHttpServer())
      .get('/reports/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const projects = res.body;
    expect(projects.length).toBe(3);

    // Project 1 (Telebirr)
    const p1 = projects.find((p: any) => p.quoteNumber === 'QT-2026-0001');
    expect(p1).toBeDefined();
    expect(p1.clientName).toBe('Ethio Telecom');
    expect(p1.revenueMinor).toBe('100000000'); // 1,000,000 ETB exact match with quote
    // Labor cost: 120h * 600 + 80h * 450 = 72,000 + 36,000 = 108,000 ETB = 10,800,000 minor
    expect(p1.laborCostMinor).toBe('10800000');
    // Overhead 10%: 1,080,000 minor
    expect(p1.overheadCostMinor).toBe('1080000');
    // Total cost: 11,880,000 minor
    expect(p1.totalCostMinor).toBe('11880000');
    // Profit: 100,000,000 - 11,880,000 = 88,120,000 minor
    expect(p1.profitMinor).toBe('88120000');
    expect(p1.margin).toBe(0.8812);
    expect(p1.totalHours).toBe(200);

    // Project 2 (Ethiopian Airlines)
    const p2 = projects.find((p: any) => p.quoteNumber === 'QT-2026-0002');
    expect(p2).toBeDefined();
    expect(p2.clientName).toBe('Ethiopian Airlines Enterprise');
    expect(p2.revenueMinor).toBe('80000000'); // 800,000 ETB match
    expect(p2.totalHours).toBe(150);

    // Sum of project revenues must equal summary total
    const sumRevenue = projects.reduce((acc: bigint, p: any) => acc + BigInt(p.revenueMinor), 0n);
    expect(sumRevenue.toString()).toBe('230000000');
  });

  it('4. Generates Profit per Client report aggregated across clients', async () => {
    const ownerToken = createToken(storedUsers[0]);

    const res = await request(app.getHttpServer())
      .get('/reports/clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const clients = res.body;
    expect(clients.length).toBe(3);

    const ethioTelecom = clients.find((c: any) => c.clientName === 'Ethio Telecom');
    expect(ethioTelecom).toBeDefined();
    expect(ethioTelecom.revenueMinor).toBe('100000000');
    expect(ethioTelecom.quoteCount).toBe(1);
    expect(ethioTelecom.totalHours).toBe(200);

    const ethiopianAirlines = clients.find((c: any) => c.clientName === 'Ethiopian Airlines Enterprise');
    expect(ethiopianAirlines).toBeDefined();
    expect(ethiopianAirlines.revenueMinor).toBe('80000000');
  });

  it('5. Generates Profit per Team Member report based on estimate feature allocation', async () => {
    const ownerToken = createToken(storedUsers[0]);

    const res = await request(app.getHttpServer())
      .get('/reports/team-members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const team = res.body;
    expect(team.length).toBeGreaterThanOrEqual(2);

    // Alex: assigned to feat-1 (120h backend) in proj-1 and feat-3 (150h backend) in proj-2 -> 270h
    const alex = team.find((m: any) => m.name === 'Alex Developer');
    expect(alex).toBeDefined();
    expect(alex.roleName).toBe('Senior Backend Engineer');
    expect(alex.allocatedHours).toBe(270);
    // Owner can see hourly cost
    expect(alex.hourlyCostMinor).toBe('60000');
    expect(alex.projectCount).toBe(2);
    expect(BigInt(alex.attributedRevenueMinor)).toBeGreaterThan(0n);
    expect(BigInt(alex.profitMinor)).toBeGreaterThan(0n);

    // Betty: assigned to feat-2 (80h frontend) in proj-1 and feat-4 (100h frontend) in proj-3 -> 180h
    const betty = team.find((m: any) => m.name === 'Betty Engineer');
    expect(betty).toBeDefined();
    expect(betty.roleName).toBe('Frontend Engineer');
    expect(betty.allocatedHours).toBe(180);
    expect(betty.hourlyCostMinor).toBe('45000');
    expect(betty.projectCount).toBe(2);
  });

  it('6. PM View hides confidential team member hourly salaries in team report', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    const res = await request(app.getHttpServer())
      .get('/reports/team-members')
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    const team = res.body;
    expect(team.length).toBeGreaterThanOrEqual(2);

    // PM can see allocated hours and projects, but NOT personal hourlyCostMinor
    for (const member of team) {
      expect(member.hourlyCostMinor).toBeUndefined();
      expect(member.allocatedHours).toBeGreaterThan(0);
    }
  });

  it('7. Filters reports by date range and status (e.g. only ISSUED quotes)', async () => {
    const ownerToken = createToken(storedUsers[0]);

    // Filter by status=ISSUED (excludes the DRAFT quote of 500k ETB)
    const res = await request(app.getHttpServer())
      .get('/reports/summary?status=ISSUED')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    // 1,000,000 + 800,000 = 1,800,000 ETB = 180,000,000 minor
    expect(res.body.totalRevenueMinor).toBe('180000000');
    expect(res.body.quoteCount).toBe(2);
    expect(res.body.projectCount).toBe(2);

    // Filter by date range (January only -> only quote-1)
    const janRes = await request(app.getHttpServer())
      .get('/reports/summary?startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(janRes.body.totalRevenueMinor).toBe('100000000');
    expect(janRes.body.quoteCount).toBe(1);
  });

  it('8. Exports reports to downloadable CSV files with proper headers and data rows', async () => {
    const ownerToken = createToken(storedUsers[0]);

    // 1. Projects CSV Export
    const projCsvRes = await request(app.getHttpServer())
      .get('/reports/export-csv?type=projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(projCsvRes.headers['content-type']).toContain('text/csv');
    expect(projCsvRes.headers['content-disposition']).toContain('selet-report-projects');
    const projCsvText = projCsvRes.text;
    expect(projCsvText).toContain('Quote Number,Project Name,Client Name,Status,Currency');
    expect(projCsvText).toContain('"QT-2026-0001"');
    expect(projCsvText).toContain('"Ethio Telecom"');
    expect(projCsvText).toContain('1000000.00'); // 1M ETB

    // 2. Clients CSV Export
    const clientCsvRes = await request(app.getHttpServer())
      .get('/reports/export-csv?type=clients')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(clientCsvRes.headers['content-type']).toContain('text/csv');
    expect(clientCsvRes.headers['content-disposition']).toContain('selet-report-clients');
    const clientCsvText = clientCsvRes.text;
    expect(clientCsvText).toContain('Client Name,Currency,Projects Count,Quotes Count,Total Revenue');
    expect(clientCsvText).toContain('"Ethio Telecom"');

    // 3. Team Members CSV Export
    const teamCsvRes = await request(app.getHttpServer())
      .get('/reports/export-csv?type=team-members')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(teamCsvRes.headers['content-type']).toContain('text/csv');
    expect(teamCsvRes.headers['content-disposition']).toContain('selet-report-team-members');
    const teamCsvText = teamCsvRes.text;
    expect(teamCsvText).toContain('Team Member,Job Role,Allocated Hours,Labor Cost');
    expect(teamCsvText).toContain('"Alex Developer"');
    expect(teamCsvText).toContain('"Senior Backend Engineer"');
  });
});
