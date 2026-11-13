import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, EstimationMethod } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 9 - Pricing Scenarios, Margin Balancer & Commercial Floors', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-9',
    name: 'Addis Pricing Solutions',
    defaultCurrency: 'ETB',
    minimumFloorMargin: 0.15, // 15% floor
    targetMargin: 0.3, // 30% target
    stretchMargin: 0.4, // 40% stretch
    defaultOverheadRate: 0.1,
    defaultContingencyRate: 0.1,
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
      id: 'role-dev',
      organizationId: mockOrg.id,
      name: 'Fullstack Engineer',
      defaultHourlyCostMinor: 50000n, // 500 ETB/hr
    },
  ];

  const storedProjects: any[] = [];
  const storedVersions: any[] = [];
  const storedModules: any[] = [];
  const storedFeatures: any[] = [];
  const storedFeatureHours: any[] = [];
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
        return { ...p, versions, modules };
      },
    },
    estimateVersion: {
      create: async (args: any) => {
        const v = {
          id: `ver-${Date.now()}`,
          projectId: args.data.projectId,
          versionNumber: args.data.versionNumber || 1,
          name: args.data.name || 'Initial Draft',
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
        return v;
      },
      findFirst: async (args: any) => storedVersions.find((v) => v.id === args.where.id) || null,
      update: async (args: any) => {
        const idx = storedVersions.findIndex((v) => v.id === args.where.id);
        if (idx !== -1) {
          storedVersions[idx] = { ...storedVersions[idx], ...args.data };
          return storedVersions[idx];
        }
        return null;
      },
    },
    module: {
      create: async (args: any) => {
        const m = {
          id: `mod-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          projectId: args.data.projectId,
          name: args.data.name,
          orderIndex: args.data.orderIndex || 0,
          features: [],
        };
        storedModules.push(m);
        return m;
      },
      findUnique: async (args: any) => {
        const m = storedModules.find((mod) => mod.id === args.where.id);
        if (!m) return null;
        const project = storedProjects.find((p) => p.id === m.projectId);
        return {
          ...m,
          project: {
            ...project,
            versions: storedVersions.filter((v) => v.projectId === m.projectId),
          },
        };
      },
    },
    feature: {
      create: async (args: any) => {
        const f = {
          id: `feat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          moduleId: args.data.moduleId,
          name: args.data.name,
          method: args.data.method || EstimationMethod.THREE_POINT,
          assignedUserId: null,
          roleHours: [],
        };
        storedFeatures.push(f);
        return f;
      },
      findUnique: async (args: any) => {
        const f = storedFeatures.find((feat) => feat.id === args.where.id);
        if (!f) return null;
        const module = storedModules.find((m) => m.id === f.moduleId);
        const project = storedProjects.find((p) => p.id === module?.projectId);
        return {
          ...f,
          module: {
            ...module,
            project: {
              ...project,
              versions: storedVersions.filter((v) => v.projectId === module?.projectId),
            },
          },
        };
      },
    },
    featureRoleHours: {
      upsert: async (args: any) => {
        const { featureId, roleId } = args.where.featureId_roleId;
        const idx = storedFeatureHours.findIndex(
          (rh) => rh.featureId === featureId && rh.roleId === roleId,
        );
        const data = {
          featureId,
          roleId,
          optimisticHours: args.create.optimisticHours,
          likelyHours: args.create.likelyHours,
          pessimisticHours: args.create.pessimisticHours,
          singleHours: args.create.singleHours,
          expectedHours: args.create.expectedHours,
        };
        if (idx !== -1) {
          storedFeatureHours[idx] = { ...storedFeatureHours[idx], ...args.update };
          return storedFeatureHours[idx];
        }
        storedFeatureHours.push(data);
        return data;
      },
    },
    auditLog: {
      create: async (args: any) => {
        auditLogs.push(args.data);
        return args.data;
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

  const getAuthHeader = (userId: string, role: UserRole) => {
    const user = storedUsers.find((u) => u.id === userId) || {
      id: userId,
      email: `${role.toLowerCase()}@addis.dev`,
      role,
      organizationId: mockOrg.id,
    };
    return `Bearer ${createToken(user)}`;
  };

  it('sets up a project with Module A and Module B for Margin Balancer tests', async () => {
    // 1. Create project
    const projRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({
        name: 'Margin Balancer Test Project',
        description: 'PRD Stage 9 test suite project',
      })
      .expect(201);

    const projectId = projRes.body.id;
    const versionId = projRes.body.versions[0].id;

    // 2. Create Module A (4 hours = 2,000 ETB labor cost at 500 ETB/hr)
    const modARes = await request(app.getHttpServer())
      .post(`/projects/${projectId}/modules`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({ name: 'Module A' })
      .expect(201);

    const featARes = await request(app.getHttpServer())
      .post(`/projects/modules/${modARes.body.id}/features`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({ name: 'Feature A1', method: 'SINGLE_VALUE' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/projects/features/${featARes.body.id}/hours`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({
        roleHours: [{ roleId: 'role-dev', singleHours: 4 }],
      })
      .expect(200);

    // 3. Create Module B (4 hours = 2,000 ETB labor cost at 500 ETB/hr)
    const modBRes = await request(app.getHttpServer())
      .post(`/projects/${projectId}/modules`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({ name: 'Module B' })
      .expect(201);

    const featBRes = await request(app.getHttpServer())
      .post(`/projects/modules/${modBRes.body.id}/features`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({ name: 'Feature B1', method: 'SINGLE_VALUE' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/projects/features/${featBRes.body.id}/hours`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({
        roleHours: [{ roleId: 'role-dev', singleHours: 4 }],
      })
      .expect(200);

    // 4. Retrieve pricing scenario
    const pricingRes = await request(app.getHttpServer())
      .get(`/projects/${projectId}/versions/${versionId}/pricing`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .expect(200);

    expect(pricingRes.body.scenarios.recommended).toBeDefined();
    expect(pricingRes.body.scenarios.low).toBeDefined();
    expect(pricingRes.body.scenarios.high).toBeDefined();
    expect(pricingRes.body.balancer.lines.length).toBe(2);
  });

  it('PRD Test: locks blended margin at 30%, lowers Module A from 25% to 20%, raises Module B', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];
    const modules = storedModules.filter((m) => m.projectId === project.id);

    const modAId = modules[0].id;
    const modBId = modules[1].id;

    const balanceRes = await request(app.getHttpServer())
      .post(`/projects/${project.id}/versions/${version.id}/pricing/balance`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({
        changedLineId: modAId,
        newMargin: 0.2,
        targetBlendedMargin: 0.3,
        balancingLineIds: [modBId],
      })
      .expect(200);

    expect(balanceRes.body.isFeasible).toBe(true);
    expect(balanceRes.body.blendedMargin).toBeCloseTo(0.3, 2);

    const lineA = balanceRes.body.lines.find((l: any) => l.id === modAId);
    const lineB = balanceRes.body.lines.find((l: any) => l.id === modBId);

    expect(lineA.margin).toBe(0.2);
    // Line B margin must be raised above 30% to maintain 30% blended margin
    expect(lineB.margin).toBeGreaterThan(0.35);
  });

  it('Target price mode evaluates client fixed budget and calculates resulting margin', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];

    // Client states budget of 70,000 ETB (7,000,000 minor)
    const targetRes = await request(app.getHttpServer())
      .post(`/projects/${project.id}/versions/${version.id}/pricing/target-price`)
      .set('Authorization', getAuthHeader('pm-id', UserRole.PM))
      .send({
        budgetMinor: 7000000,
        floorBlendedMargin: 0.15,
      })
      .expect(200);

    expect(targetRes.body.isFeasible).toBe(true);
    expect(targetRes.body.totalPriceMinor).toBe(7000000);
    expect(targetRes.body.blendedMargin).toBeGreaterThan(0.15);
  });

  it('What-if discount applies percentage discount to quote and checks floor feasibility', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];

    // Apply 10% discount to quote
    const discountRes = await request(app.getHttpServer())
      .post(`/projects/${project.id}/versions/${version.id}/pricing/discount`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .send({
        discountPercent: 0.1,
        projectFloorMargin: 0.15,
      })
      .expect(200);

    expect(discountRes.body.isFeasible).toBe(true);
    expect(discountRes.body.blendedMargin).toBeDefined();
  });

  it('PM is blocked from setting margin below owner floor (15%) without Owner approval', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];

    // PM tries to set 10% target margin (floor is 15%)
    await request(app.getHttpServer())
      .put(`/projects/${project.id}/versions/${version.id}/pricing`)
      .set('Authorization', getAuthHeader('pm-id', UserRole.PM))
      .send({
        targetMargin: 0.1,
      })
      .expect(403);

    // PM tries to self-approve below floor
    await request(app.getHttpServer())
      .put(`/projects/${project.id}/versions/${version.id}/pricing`)
      .set('Authorization', getAuthHeader('pm-id', UserRole.PM))
      .send({
        targetMargin: 0.1,
        ownerApprovedBelowFloor: true,
      })
      .expect(403);
  });

  it('Owner approves below-floor pricing, allowing quote saving below floor', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];

    // Owner approves
    const approveRes = await request(app.getHttpServer())
      .post(`/projects/${project.id}/versions/${version.id}/pricing/approve-below-floor`)
      .set('Authorization', getAuthHeader('owner-id', UserRole.OWNER))
      .expect(200);

    expect(approveRes.body.ownerApprovedBelowFloor).toBe(true);
    expect(approveRes.body.ownerApprovalUserId).toBe('owner-id');

    // Now PM can save with 10% target margin because owner approval is recorded
    const updateRes = await request(app.getHttpServer())
      .put(`/projects/${project.id}/versions/${version.id}/pricing`)
      .set('Authorization', getAuthHeader('pm-id', UserRole.PM))
      .send({
        targetMargin: 0.1,
      })
      .expect(200);

    expect(updateRes.body.targetMargin).toBe(0.1);
  });

  it('Developer is strictly blocked from accessing pricing screen and margins', async () => {
    const project = storedProjects[0];
    const version = storedVersions[0];

    // Developer cannot view pricing scenarios
    await request(app.getHttpServer())
      .get(`/projects/${project.id}/versions/${version.id}/pricing`)
      .set('Authorization', getAuthHeader('dev-id', UserRole.DEVELOPER))
      .expect(403);

    // Developer cannot use margin balancer
    await request(app.getHttpServer())
      .post(`/projects/${project.id}/versions/${version.id}/pricing/balance`)
      .set('Authorization', getAuthHeader('dev-id', UserRole.DEVELOPER))
      .send({
        changedLineId: 'mod-1',
        newMargin: 0.2,
        targetBlendedMargin: 0.3,
      })
      .expect(403);
  });
});
