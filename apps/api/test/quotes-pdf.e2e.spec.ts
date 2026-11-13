import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, QuoteStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 10 - Quote Builder, Immutable Snapshots, Milestones & PDF', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-10',
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
  ];

  const storedRoles: any[] = [
    {
      id: 'role-dev',
      organizationId: mockOrg.id,
      name: 'Senior Fullstack Engineer',
      defaultHourlyCostMinor: 60000n, // 600 ETB/hr
    },
  ];

  const storedProjects: any[] = [];
  const storedVersions: any[] = [];
  const storedModules: any[] = [];
  const storedFeatures: any[] = [];
  const storedFeatureHours: any[] = [];
  const storedQuotes: any[] = [];
  const auditLogs: any[] = [];

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
    role: {
      findMany: async () => storedRoles,
      findFirst: async (args: any) => storedRoles.find((r) => r.id === args.where.id) || null,
    },
    project: {
      create: async (args: any) => {
        const projId = `proj-${Date.now()}`;
        const v = {
          id: `ver-${Date.now()}`,
          projectId: projId,
          versionNumber: args.data.versions?.create?.versionNumber || 1,
          name: args.data.versions?.create?.name || 'Initial Draft',
          pointsToHoursRatio: 8.0,
          contingencyRate: 0.1,
          overheadRate: 0.1,
          riskFactors: null,
          scaleInputs: null,
          scaleItems: null,
          targetMargin: 0.3,
          minimumMargin: 0.15,
          stretchMargin: 0.4,
          pricingMode: 'TARGET_MARGIN',
          ownerApprovedBelowFloor: false,
          ownerApprovalUserId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedVersions.push(v);

        const proj = {
          id: projId,
          organizationId: args.data.organizationId,
          name: args.data.name,
          description: args.data.description,
          currency: args.data.currency || 'ETB',
          isTemplate: false,
          client: {
            id: 'client-1',
            name: 'Ethiopian Airlines Enterprise',
            tin: '0012345678',
            contactName: 'Tewodros Kassahun',
            contactEmail: 'tewodros@ethiopianairlines.com',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          versions: [v],
          modules: [],
        };
        storedProjects.push(proj);
        return proj;
      },
      findMany: async () => storedProjects,
      findFirst: async (args: any) => {
        const p = storedProjects.find(
          (proj) =>
            proj.id === args.where.id &&
            (!args.where.organizationId || proj.organizationId === args.where.organizationId),
        );
        if (!p) return null;
        const versions = storedVersions.filter((v) => v.projectId === p.id);
        const modules = storedModules
          .filter((m) => m.projectId === p.id)
          .map((m) => {
            const features = storedFeatures
              .filter((f) => f.moduleId === m.id)
              .map((f) => {
                const roleHours = storedFeatureHours
                  .filter((rh) => rh.featureId === f.id)
                  .map((rh) => ({
                    ...rh,
                    role: storedRoles.find((r) => r.id === rh.roleId) || null,
                  }));
                return { ...f, roleHours };
              });
            return { ...m, features };
          });
        return { ...p, versions, modules, client: p.client };
      },
    },
    estimateVersion: {
      findFirst: async (args: any) =>
        storedVersions.find((v) => v.id === args.where.id) || null,
      findUnique: async (args: any) =>
        storedVersions.find((v) => v.id === args.where.id) || null,
    },
    module: {
      create: async (args: any) => {
        const m = {
          id: `mod-${Date.now()}-${Math.random()}`,
          projectId: args.data.projectId,
          name: args.data.name,
          description: args.data.description,
          orderIndex: args.data.orderIndex ?? 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          features: [],
        };
        storedModules.push(m);
        return m;
      },
      findMany: async (args: any) =>
        storedModules.filter((m) => m.projectId === args.where?.projectId),
      findUnique: async (args: any) => {
        const m = storedModules.find((mod) => mod.id === args.where.id);
        if (!m) return null;
        const project = storedProjects.find((p) => p.id === m.projectId);
        return { ...m, project };
      },
    },
    feature: {
      create: async (args: any) => {
        const f = {
          id: `feat-${Date.now()}-${Math.random()}`,
          moduleId: args.data.moduleId,
          name: args.data.name,
          description: args.data.description,
          method: args.data.method,
          assignedUserId: args.data.assignedUserId,
          orderIndex: args.data.orderIndex ?? 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          roleHours: [],
        };
        storedFeatures.push(f);
        return f;
      },
      findUnique: async (args: any) => {
        const f = storedFeatures.find((feat) => feat.id === args.where.id);
        if (!f) return null;
        const mod = storedModules.find((m) => m.id === f.moduleId);
        const project = mod ? storedProjects.find((p) => p.id === mod.projectId) : null;
        return {
          ...f,
          module: mod ? { ...mod, project } : null,
        };
      },
    },
    featureRoleHours: {
      upsert: async (args: any) => {
        const existingIdx = storedFeatureHours.findIndex(
          (rh) =>
            rh.featureId === args.where.featureId_roleId.featureId &&
            rh.roleId === args.where.featureId_roleId.roleId,
        );
        const entry = {
          id: `frh-${Date.now()}-${Math.random()}`,
          featureId: args.create.featureId,
          roleId: args.create.roleId,
          expectedHours: args.create.expectedHours,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (existingIdx >= 0) {
          storedFeatureHours[existingIdx] = entry;
        } else {
          storedFeatureHours.push(entry);
        }
        return entry;
      },
    },
    exchangeRate: {
      findFirst: async (args: any) => ({
        id: 'rate-usd',
        organizationId: args.where.organizationId,
        fromCurrency: args.where.fromCurrency || 'USD',
        toCurrency: 'ETB',
        rate: 155.0,
        source: 'NBE',
        effectiveAt: new Date(),
      }),
      findUnique: async (args: any) => ({
        id: 'rate-usd',
        organizationId: args.where.organizationId_fromCurrency_toCurrency.organizationId,
        fromCurrency: args.where.organizationId_fromCurrency_toCurrency.fromCurrency,
        toCurrency: 'ETB',
        rate: 155.0,
        source: 'NBE',
        effectiveAt: new Date(),
      }),
      findMany: async () => [
        {
          id: 'rate-usd',
          organizationId: mockOrg.id,
          fromCurrency: 'USD',
          toCurrency: 'ETB',
          rate: 155.0,
          source: 'NBE',
          effectiveAt: new Date(),
        },
      ],
    },
    quote: {
      create: async (args: any) => {
        const q = {
          id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedQuotes.push(q);
        return q;
      },
      findFirst: async (args: any) =>
        storedQuotes.find(
          (q) =>
            q.id === args.where.id &&
            (!args.where.organizationId || q.organizationId === args.where.organizationId),
        ) || null,
      findMany: async (args: any) =>
        storedQuotes.filter(
          (q) =>
            (!args.where.projectId || q.projectId === args.where.projectId) &&
            (!args.where.organizationId || q.organizationId === args.where.organizationId),
        ),
      update: async (args: any) => {
        const idx = storedQuotes.findIndex((q) => q.id === args.where.id);
        if (idx === -1) throw new Error('Quote not found');
        const updated = {
          ...storedQuotes[idx],
          ...args.data,
          updatedAt: new Date(),
        };
        storedQuotes[idx] = updated;
        return updated;
      },
      count: async (args: any) =>
        storedQuotes.filter(
          (q) =>
            q.organizationId === args.where.organizationId &&
            (!args.where.quoteNumber?.startsWith ||
              q.quoteNumber.startsWith(args.where.quoteNumber.startsWith)),
        ).length,
    },
    auditLog: {
      create: async (args: any) => {
        auditLogs.push(args.data);
        return args.data;
      },
    },
    notification: {
      findMany: async () => [],
      create: async (args: any) => args.data,
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
    await app.close();
  });

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
  let testQuoteId: string;

  it('1. Prepares test project with modules and features', async () => {
    const token = createToken(storedUsers[0]);

    const projRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Enterprise Cargo Logistics Portal',
        description: 'Real-time air cargo booking & tracking platform for Ethiopian Airlines',
        currency: 'ETB',
      })
      .expect(201);

    testProjectId = projRes.body.id;
    testVersionId = projRes.body.versions[0].id;

    // Create Module A (Booking Engine)
    const modA = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/modules`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Air Cargo Booking Engine', description: 'Core booking pipeline' })
      .expect(201);

    // Create Feature in Mod A (80 hours)
    const featA = await request(app.getHttpServer())
      .post(`/projects/modules/${modA.body.id}/features`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Flight Schedule & Cargo Space Search' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/projects/features/${featA.body.id}/hours`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        roleHours: [{ roleId: 'role-dev', hours: 80 }],
      })
      .expect(200);

    // Create Module B (Tracking & Telemetry)
    const modB = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/modules`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cargo Telemetry & Live Tracking', description: 'IoT sensor integration' })
      .expect(201);

    // Create Feature in Mod B (120 hours)
    const featB = await request(app.getHttpServer())
      .post(`/projects/modules/${modB.body.id}/features`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Real-Time AWB Status Updates' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/projects/features/${featB.body.id}/hours`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        roleHours: [{ roleId: 'role-dev', hours: 120 }],
      })
      .expect(200);

    expect(testProjectId).toBeDefined();
    expect(testVersionId).toBeDefined();
  });

  it('2. Rejects quote milestone schedules that do not sum to 100%', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    // 40% + 40% = 80% (invalid!)
    const res = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/versions/${testVersionId}/quotes`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        title: 'Draft Quotation with Incomplete Milestones',
        clientName: 'Ethiopian Airlines Enterprise',
        milestones: [
          { title: 'Deposit', percentage: 40 },
          { title: 'Delivery', percentage: 40 },
        ],
      })
      .expect(400);

    expect(res.body.message).toContain('Payment milestones must sum to 100%');
  });

  it('3. Developers are forbidden from creating or reading quotes (403 Forbidden)', async () => {
    const devToken = createToken(storedUsers[2]); // Developer

    await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/versions/${testVersionId}/quotes`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        title: 'Developer Quote Attempt',
        clientName: 'Test Client',
      })
      .expect(403);
  });

  it('4. Successfully creates Quote with 30/40/30 milestone preset, 15% VAT, 3% Withholding & USD Snapshot', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    const res = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/versions/${testVersionId}/quotes`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        title: 'Commercial Quotation for Cargo System',
        clientName: 'Ethiopian Airlines Enterprise',
        clientTin: '0012345678',
        clientContact: 'Tewodros Kassahun',
        clientEmail: 'tewodros@ethiopianairlines.com',
        presetName: '30/40/30',
        secondaryCurrency: 'USD',
        validDays: 30,
        executiveSummary: 'Turnkey enterprise air cargo management system with tracking and integrations.',
        termsAndConditions: 'Standard 30-day commercial proposal.',
      })
      .expect(201);

    const quote = res.body;
    testQuoteId = quote.id;

    expect(quote.quoteNumber).toMatch(/^QT-\d{4}-\d{4}$/);
    expect(quote.status).toBe('DRAFT');
    expect(quote.clientName).toBe('Ethiopian Airlines Enterprise');
    expect(quote.taxPackVersion).toBe('2026.1');
    expect(quote.vatRate).toBe(0.15);

    // Subtotal must be positive BigInt string
    const subtotal = BigInt(quote.subtotalMinor);
    expect(subtotal).toBeGreaterThan(0n);

    // VAT must be exactly 15% of subtotal
    const expectedVat = (subtotal * 15n) / 100n;
    expect(BigInt(quote.vatAmountMinor)).toBe(expectedVat);

    // Total must be subtotal + VAT
    expect(BigInt(quote.totalPriceMinor)).toBe(subtotal + expectedVat);

    // Withholding must be 3% of subtotal
    const expectedWithholding = (subtotal * 3n) / 100n;
    expect(BigInt(quote.withholdingAmountMinor)).toBe(expectedWithholding);

    // Expected cash must be total - withholding
    expect(BigInt(quote.expectedCashMinor)).toBe(BigInt(quote.totalPriceMinor) - expectedWithholding);

    // Secondary USD snapshot
    expect(quote.secondaryCurrency).toBe('USD');
    expect(quote.exchangeRateSnapshot).toBe(155.0);
    expect(BigInt(quote.secondaryTotalPriceMinor)).toBeGreaterThan(0n);

    // Milestones must match 30/40/30 preset
    expect(quote.milestonesSnapshot).toHaveLength(3);
    expect(quote.milestonesSnapshot[0].percentage).toBe(30);
    expect(quote.milestonesSnapshot[1].percentage).toBe(40);
    expect(quote.milestonesSnapshot[2].percentage).toBe(30);
  });

  it('5. Supports per-line visibility toggles (SHOW_PRICE, DESCRIPTION_ONLY, MERGE_GROUP)', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    // Update quote with customized line item visibilities:
    // Line 1: SHOW_PRICE
    // Line 2: DESCRIPTION_ONLY (hidden price)
    // Line 3 & 4: MERGE_GROUP (aggregated under single package)
    const updateRes = await request(app.getHttpServer())
      .put(`/quotes/${testQuoteId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        lineItems: [
          {
            id: 'line-mod-a',
            title: 'Air Cargo Booking Engine',
            description: 'Core reservation workflows and flight schedule integration',
            visibility: 'SHOW_PRICE',
            priceMinor: '60000000', // 600,000 ETB
          },
          {
            id: 'line-qa',
            title: 'End-to-End Automated QA & Stress Testing',
            description: 'Automated test suite and performance stress testing',
            visibility: 'DESCRIPTION_ONLY',
            priceMinor: '15000000', // 150,000 ETB (included in scope)
          },
          {
            id: 'line-grp-1',
            title: 'Telemetry GPS Streamer',
            description: 'Real-time telemetry intake pipeline',
            visibility: 'MERGE_GROUP',
            groupName: 'IoT & Telemetry Integration Suite',
            priceMinor: '25000000', // 250,000 ETB
          },
          {
            id: 'line-grp-2',
            title: 'Telemetry Analytics Dashboard',
            description: 'Operations control center mapping and dashboard',
            visibility: 'MERGE_GROUP',
            groupName: 'IoT & Telemetry Integration Suite',
            priceMinor: '20000000', // 200,000 ETB
          },
        ],
      })
      .expect(200);

    const updated = updateRes.body;
    // Subtotal: 600k + 150k + 250k + 200k = 1,200,000 ETB (120,000,000 minor)
    expect(updated.subtotalMinor).toBe('120000000');
    // VAT 15%: 180,000 ETB (18,000,000 minor)
    expect(updated.vatAmountMinor).toBe('18000000');
    // Total: 1,380,000 ETB (138,000,000 minor)
    expect(updated.totalPriceMinor).toBe('138000000');

    // Render HTML and verify visibility rules:
    const htmlRes = await request(app.getHttpServer())
      .get(`/quotes/${testQuoteId}/html`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    const html = htmlRes.text;

    // Line 1: Show price
    expect(html).toContain('Air Cargo Booking Engine');
    expect(html).toContain('ETB 600,000.00');

    // Line 2: Description only
    expect(html).toContain('End-to-End Automated QA &amp; Stress Testing');
    expect(html).toContain('Included in Scope');

    // Lines 3 & 4: Merged into group
    expect(html).toContain('IoT &amp; Telemetry Integration Suite');
    expect(html).toContain('Package Group');
    // Merged price: 250k + 200k = 450,000 ETB
    expect(html).toContain('ETB 450,000.00');

    // Client Privacy Guarantee: NO internal hours, internal costs, or developer salaries in HTML
    expect(html).not.toContain('600 ETB/hr');
    expect(html).not.toContain('defaultHourlyCostMinor');
    expect(html).not.toContain('roleHours');
    expect(html).not.toContain('margin: 0.3');
  });

  it('6. Issues quote: freezes status to ISSUED and blocks further modifications', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    const issueRes = await request(app.getHttpServer())
      .post(`/quotes/${testQuoteId}/issue`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(201);

    expect(issueRes.body.status).toBe('ISSUED');
    expect(issueRes.body.issuedAt).toBeDefined();

    // Any attempt to update an ISSUED quote must be rejected (immutable snapshot!)
    const failUpdate = await request(app.getHttpServer())
      .put(`/quotes/${testQuoteId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ title: 'Tampered Quote Title' })
      .expect(400);

    expect(failUpdate.body.message).toContain('Issued quotes are immutable');
  });

  it('7. Immutability guarantee: issued quote regenerates identically years later even after rates and taxes change', async () => {
    const ownerToken = createToken(storedUsers[0]); // Owner

    // Verify initial snapshot values
    const verifyBefore = await request(app.getHttpServer())
      .get(`/quotes/${testQuoteId}/verify-immutability`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(verifyBefore.body.isImmutable).toBe(true);
    expect(verifyBefore.body.snapshotValues.subtotalMinor).toBe('120000000');
    expect(verifyBefore.body.snapshotValues.vatRate).toBe(0.15);
    expect(verifyBefore.body.snapshotValues.totalPriceMinor).toBe('138000000');
    expect(verifyBefore.body.snapshotValues.taxPackVersion).toBe('2026.1');
    expect(verifyBefore.body.snapshotValues.exchangeRateSnapshot).toBe(155.0);

    // Simulate future environment changes:
    // Org default margins change
    mockOrg.targetMargin = 0.5;
    mockOrg.minimumFloorMargin = 0.25;
    mockOrg.defaultContingencyRate = 0.2;

    // Fetch issued quote again
    const quoteAfter = await request(app.getHttpServer())
      .get(`/quotes/${testQuoteId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    // Numbers must remain 100% IDENTICAL to snapshot
    expect(quoteAfter.body.subtotalMinor).toBe('120000000');
    expect(quoteAfter.body.vatRate).toBe(0.15);
    expect(quoteAfter.body.totalPriceMinor).toBe('138000000');
    expect(quoteAfter.body.taxPackVersion).toBe('2026.1');
    expect(quoteAfter.body.exchangeRateSnapshot).toBe(155.0);
    expect(quoteAfter.body.status).toBe('ISSUED');
  });

  it('8. Renders branded Afro Digital PDF via Playwright', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    const pdfRes = await request(app.getHttpServer())
      .get(`/quotes/${testQuoteId}/pdf`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(pdfRes.headers['content-type']).toBe('application/pdf');
    expect(pdfRes.headers['content-disposition']).toMatch(/attachment; filename="QT-\d{4}-\d{4}\.pdf"/);

    // PDF buffer verification: PDF header must start with "%PDF-"
    const buffer = Buffer.from(pdfRes.body);
    expect(buffer.length).toBeGreaterThan(1000);
    const pdfHeader = buffer.subarray(0, 5).toString('ascii');
    expect(pdfHeader).toBe('%PDF-');
  });

  it('9. Stage 11: Creates Amharic quote with Ethiopian calendar dates and verifies localized HTML', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    // Create quote with language: 'am' and calendar: 'ETHIOPIAN'
    const createRes = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/versions/${testVersionId}/quotes`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        title: 'የኢትዮጵያ አየር መንገድ የካርጎ ስርዓት ማዘመኛ (Ethiopian Airlines Cargo Modernization)',
        clientName: 'የኢትዮጵያ አየር መንገድ (Ethiopian Airlines)',
        clientTin: '0012345678',
        language: 'am',
        calendar: 'ETHIOPIAN',
        executiveSummary: 'ይህ ፕሮጀክት የአየር ካርጎ አስተዳደርን በዘመናዊ የዲጂታል ቴክኖሎጂ የሚያሳድግ ሲሆን በራስ-ሰር የሚሰሩ የክፍያ እና የክትትል ሞጁሎችን ያካትታል።',
        validDays: 30,
        presetName: '30/40/30',
      })
      .expect(201);

    const amharicQuote = createRes.body;
    expect(amharicQuote.language).toBe('am');
    expect(amharicQuote.calendar).toBe('ETHIOPIAN');

    // Retrieve HTML template
    const htmlRes = await request(app.getHttpServer())
      .get(`/quotes/${amharicQuote.id}/html`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    const html = htmlRes.text;

    // Verify Amharic headers & Ge'ez fonts
    expect(html).toContain('ኦፊሴላዊ የዋጋ ማቅረቢያ');
    expect(html).toContain('Noto Sans Ethiopic');
    expect(html).toContain('የፕሮጀክት ክፍሎች እና የዋጋ ዝርዝር');
    expect(html).toContain('ለደንበኛ የቀረበ');
    expect(html).toContain('የኢትዮጵያ አየር መንገድ');

    // Verify Ethiopian Calendar formatting (ዓ.ም.)
    expect(html).toContain('ዓ.ም.');
    expect(html).toContain('እ.ኤ.አ'); // Dual date indicator

    // Verify Statutory Tax citation in Amharic (Proclamation 1341/2016)
    expect(html).toContain('ተጨማሪ እሴት ታክስ');
    expect(html).toContain('1341/2016');
    expect(html).toContain('የቅድመ ግብር ተቀናሽ ማስታወሻ');

    // Verify currency formatted with Birr symbol
    expect(html).toContain('ብር');

    // Verify Payment milestones in Amharic
    expect(html).toContain('የክፍያ ደረጃዎች እና የጊዜ ሰሌዳ');
    expect(html).toContain('ደረጃ 1');
    expect(html).toContain('ደረጃ 2');
    expect(html).toContain('ደረጃ 3');

    // Verify Commercial terms and sign-offs in Amharic
    expect(html).toContain('የውል ስምምነት እና ቅድመ ሁኔታዎች');
    expect(html).toContain('በአፍሮ ዲጂታል ኃላፊ የተፈረመ');
    expect(html).toContain('በደንበኛ ተቀባይነት ማረጋገጫ እና ፊርማ');
  });

  it('10. Stage 11: Renders Amharic quote with Ethiopian calendar as binary PDF via Playwright', async () => {
    const pmToken = createToken(storedUsers[1]); // PM

    // Create Amharic quote
    const createRes = await request(app.getHttpServer())
      .post(`/projects/${testProjectId}/versions/${testVersionId}/quotes`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        title: 'የኢንተርፕራይዝ የክፍያ እና የሂሳብ አያያዝ ሥርዓት',
        clientName: 'የኢትዮጵያ ንግድ ባንክ (Commercial Bank of Ethiopia)',
        language: 'am',
        calendar: 'ETHIOPIAN',
        validDays: 45,
      })
      .expect(201);

    const quoteId = createRes.body.id;

    const pdfRes = await request(app.getHttpServer())
      .get(`/quotes/${quoteId}/pdf`)
      .set('Authorization', `Bearer ${pmToken}`)
      .expect(200);

    expect(pdfRes.headers['content-type']).toBe('application/pdf');
    const buffer = Buffer.from(pdfRes.body);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});
