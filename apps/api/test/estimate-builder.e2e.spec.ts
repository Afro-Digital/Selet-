import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserRole, EstimationMethod, TShirtSize } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E: Stage 7 - Estimate Builder, Multi-Method Estimation & Access Control', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockOrg = {
    id: 'org-stage-7',
    name: 'Addis Software Studio',
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
      id: 'dev-1-id',
      email: 'dev1@addis.dev',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Developer One (Assigned)',
    },
    {
      id: 'dev-2-id',
      email: 'dev2@addis.dev',
      role: UserRole.DEVELOPER,
      organizationId: mockOrg.id,
      name: 'Developer Two (Unassigned)',
    },
  ];

  const storedRoles: any[] = [
    {
      id: 'role-fe',
      organizationId: mockOrg.id,
      name: 'Frontend Engineer',
      defaultHourlyCostMinor: 45000n, // 450 ETB/hr
    },
    {
      id: 'role-be',
      organizationId: mockOrg.id,
      name: 'Backend Engineer',
      defaultHourlyCostMinor: 50000n, // 500 ETB/hr
    },
    {
      id: 'role-qa',
      organizationId: mockOrg.id,
      name: 'QA Engineer',
      defaultHourlyCostMinor: 35000n, // 350 ETB/hr
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
        return (
          storedUsers.find(
            (u) =>
              (!where.id || u.id === where.id) &&
              (!where.organizationId || u.organizationId === where.organizationId),
          ) || null
        );
      },
    },
    role: {
      findMany: async ({ where }: any) => {
        return storedRoles.filter(
          (r) => !where.organizationId || r.organizationId === where.organizationId,
        );
      },
      findFirst: async ({ where }: any) => {
        return (
          storedRoles.find(
            (r) =>
              (!where.id || r.id === where.id) &&
              (!where.organizationId || r.organizationId === where.organizationId),
          ) || null
        );
      },
      upsert: async ({ where, create }: any) => {
        const found = storedRoles.find(
          (r) =>
            r.organizationId === where.organizationId_name?.organizationId &&
            r.name === where.organizationId_name?.name,
        );
        if (found) return found;
        const newR = {
          id: `role-${Date.now()}-${Math.random()}`,
          ...create,
          defaultHourlyCostMinor: BigInt(create.defaultHourlyCostMinor),
        };
        storedRoles.push(newR);
        return newR;
      },
    },
    project: {
      findMany: async ({ where, include }: any) => {
        const list = storedProjects.filter((p) => {
          if (where?.organizationId && p.organizationId !== where.organizationId) return false;
          if (where?.isTemplate !== undefined && p.isTemplate !== where.isTemplate) return false;
          return true;
        });

        if (include?.modules) {
          return list.map((p) => {
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
            return { ...p, modules: pMods };
          });
        }
        return list;
      },
      count: async ({ where }: any) => {
        return storedProjects.filter((p) => {
          if (where.organizationId && p.organizationId !== where.organizationId) return false;
          if (where.isTemplate !== undefined && p.isTemplate !== where.isTemplate) return false;
          return true;
        }).length;
      },
      findFirst: async ({ where }: any) => {
        const p = storedProjects.find((proj) => {
          if (where.id && proj.id !== where.id) return false;
          if (where.organizationId && proj.organizationId !== where.organizationId) return false;
          if (where.isTemplate !== undefined && proj.isTemplate !== where.isTemplate) return false;
          return true;
        });
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
          description: data.description || null,
          clientId: data.clientId || null,
          currency: data.currency || 'ETB',
          isTemplate: data.isTemplate ?? false,
          templateCategory: data.templateCategory || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedProjects.push(newProj);

        if (data.versions?.create) {
          const v = {
            id: `ver-${Date.now()}`,
            projectId: id,
            versionNumber: data.versions.create.versionNumber || 1,
            name: data.versions.create.name || 'Initial Draft',
            status: 'DRAFT',
            pointsToHoursRatio: data.versions.create.pointsToHoursRatio || 8.0,
            tshirtSizeConfig: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          storedVersions.push(v);
        }

        return { ...newProj, versions: storedVersions.filter((v) => v.projectId === id) };
      },
      update: async ({ where, data }: any) => {
        const idx = storedProjects.findIndex((p) => p.id === where.id);
        if (idx === -1) throw new Error('Not found');
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, val]) => val !== undefined),
        );
        storedProjects[idx] = { ...storedProjects[idx], ...cleanData, updatedAt: new Date() };
        return storedProjects[idx];
      },
      delete: async ({ where }: any) => {
        storedProjects = storedProjects.filter((p) => p.id !== where.id);
        storedModules = storedModules.filter((m) => m.projectId !== where.id);
        return { id: where.id };
      },
    },
    estimateVersion: {
      findFirst: async ({ where }: any) => {
        return storedVersions.find((v) => v.projectId === where.projectId) || null;
      },
    },
    module: {
      findUnique: async ({ where }: any) => {
        const m = storedModules.find((mod) => mod.id === where.id);
        if (!m) return null;
        const project = storedProjects.find((p) => p.id === m.projectId);
        return { ...m, project };
      },
      findFirst: async ({ where }: any) => {
        return (
          storedModules.find(
            (m) =>
              (!where.id || m.id === where.id) &&
              (!where.projectId || m.projectId === where.projectId),
          ) || null
        );
      },
      create: async ({ data }: any) => {
        const id = `mod-${Date.now()}-${Math.random()}`;
        const newMod = {
          id,
          projectId: data.projectId,
          parentId: data.parentId || null,
          name: data.name,
          description: data.description || null,
          orderIndex: data.orderIndex ?? 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedModules.push(newMod);
        return { ...newMod, children: [], features: [] };
      },
      update: async ({ where, data }: any) => {
        const idx = storedModules.findIndex((m) => m.id === where.id);
        if (idx === -1) throw new Error('Not found');
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, val]) => val !== undefined),
        );
        storedModules[idx] = { ...storedModules[idx], ...cleanData, updatedAt: new Date() };
        return storedModules[idx];
      },
      delete: async ({ where }: any) => {
        storedModules = storedModules.filter((m) => m.id !== where.id);
        return { id: where.id };
      },
    },
    feature: {
      findUnique: async ({ where }: any) => {
        const f = storedFeatures.find((feat) => feat.id === where.id);
        if (!f) return null;
        const module = storedModules.find((m) => m.id === f.moduleId);
        const project = module ? storedProjects.find((p) => p.id === module.projectId) : null;
        const assignedUser = storedUsers.find((u) => u.id === f.assignedUserId) || null;
        const roleHours = storedFeatureRoleHours
          .filter((rh) => rh.featureId === f.id)
          .map((rh) => {
            const role = storedRoles.find((r) => r.id === rh.roleId);
            return { ...rh, role };
          });
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
          assignedUser,
          roleHours,
        };
      },
      create: async ({ data }: any) => {
        const id = `feat-${Date.now()}-${Math.random()}`;
        const newFeat = {
          id,
          moduleId: data.moduleId,
          name: data.name,
          description: data.description || null,
          method: data.method || EstimationMethod.THREE_POINT,
          assignedUserId: data.assignedUserId || null,
          orderIndex: data.orderIndex ?? 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        storedFeatures.push(newFeat);
        const assignedUser = storedUsers.find((u) => u.id === newFeat.assignedUserId) || null;
        return { ...newFeat, assignedUser, roleHours: [] };
      },
      update: async ({ where, data }: any) => {
        const idx = storedFeatures.findIndex((f) => f.id === where.id);
        if (idx === -1) throw new Error('Not found');
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, val]) => val !== undefined),
        );
        storedFeatures[idx] = { ...storedFeatures[idx], ...cleanData, updatedAt: new Date() };
        const f = storedFeatures[idx];
        const assignedUser = storedUsers.find((u) => u.id === f.assignedUserId) || null;
        const roleHours = storedFeatureRoleHours
          .filter((rh) => rh.featureId === f.id)
          .map((rh) => ({ ...rh, role: storedRoles.find((r) => r.id === rh.roleId) }));
        return { ...f, assignedUser, roleHours };
      },
      delete: async ({ where }: any) => {
        storedFeatures = storedFeatures.filter((f) => f.id !== where.id);
        storedFeatureRoleHours = storedFeatureRoleHours.filter((rh) => rh.featureId !== where.id);
        return { id: where.id };
      },
    },
    featureRoleHours: {
      create: async ({ data }: any) => {
        const id = `rh-${Date.now()}-${Math.random()}`;
        const newRh = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        storedFeatureRoleHours.push(newRh);
        return newRh;
      },
      update: async ({ where, data }: any) => {
        const idx = storedFeatureRoleHours.findIndex((rh) => rh.id === where.id);
        if (idx === -1) throw new Error('Not found');
        storedFeatureRoleHours[idx] = {
          ...storedFeatureRoleHours[idx],
          ...data,
          updatedAt: new Date(),
        };
        return storedFeatureRoleHours[idx];
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
            id: `rh-${Date.now()}-${Math.random()}`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // 1. STARTER TEMPLATES
  // =========================================================================
  describe('Starter Templates (E-Commerce, SaaS, etc.)', () => {
    it('seeds 6 starter templates with example hours', async () => {
      const ownerToken = createToken(storedUsers[0]);
      const res = await request(app.getHttpServer())
        .post('/projects/templates/seed')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(201);

      expect(res.body.seeded).toBe(6);
      expect(res.body.message).toContain('seeded 6 starter templates');
    });

    it('lists seeded templates including E-Commerce', async () => {
      const devToken = createToken(storedUsers[2]);
      const res = await request(app.getHttpServer())
        .get('/projects/templates')
        .set('Authorization', `Bearer ${devToken}`)
        .expect(200);

      expect(res.body.length).toBe(6);
      const ecommerce = res.body.find((t: any) => t.templateCategory === 'E_COMMERCE');
      expect(ecommerce).toBeDefined();
      expect(ecommerce.name).toContain('E-Commerce');
      expect(ecommerce.description).toContain('[Example Hours - Adjust to Your Project Scope]');
      expect(ecommerce.modules.length).toBeGreaterThan(0);
    });

    it('creates a new working project cloned from E-Commerce template', async () => {
      const pmToken = createToken(storedUsers[1]);
      const templatesRes = await request(app.getHttpServer())
        .get('/projects/templates')
        .set('Authorization', `Bearer ${pmToken}`);

      const ecommerceTmpl = templatesRes.body.find((t: any) => t.templateCategory === 'E_COMMERCE');

      const res = await request(app.getHttpServer())
        .post(`/projects/from-template/${ecommerceTmpl.id}`)
        .send({ name: 'Chapa Store Ethiopian Marketplace' })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(201);

      expect(res.body.name).toBe('Chapa Store Ethiopian Marketplace');
      expect(res.body.isTemplate).toBe(false);
      expect(res.body.modules.length).toBe(ecommerceTmpl.modules.length);

      // Verify that example hours were cloned into the new project
      const firstModule = res.body.modules[0];
      expect(firstModule.features.length).toBeGreaterThan(0);
      const firstFeature = firstModule.features[0];
      expect(firstFeature.roleHours.length).toBeGreaterThan(0);
      expect(firstFeature.roleHours[0].expectedHours).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. MULTI-METHOD ESTIMATION CALCULATIONS
  // =========================================================================
  describe('Estimation Methods & PERT Formula', () => {
    let testProjectId: string;
    let testModuleId: string;
    let testFeatureId: string;

    beforeAll(async () => {
      const pmToken = createToken(storedUsers[1]);
      const pRes = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Estimation Testing Project' })
        .set('Authorization', `Bearer ${pmToken}`);
      testProjectId = pRes.body.id;

      const mRes = await request(app.getHttpServer())
        .post(`/projects/${testProjectId}/modules`)
        .send({ name: 'Core Engine Module' })
        .set('Authorization', `Bearer ${pmToken}`);
      testModuleId = mRes.body.id;

      const fRes = await request(app.getHttpServer())
        .post(`/projects/modules/${testModuleId}/features`)
        .send({
          name: 'PERT Algorithm Feature',
          method: EstimationMethod.THREE_POINT,
          assignedUserId: storedUsers[2].id, // assigned to Dev 1
        })
        .set('Authorization', `Bearer ${pmToken}`);
      testFeatureId = fRes.body.id;
    });

    it('calculates PERT expected hours: (O + 4L + P) / 6', async () => {
      const pmToken = createToken(storedUsers[1]);
      // O=10, L=20, P=40 => (10 + 80 + 40)/6 = 130/6 = 21.67
      const res = await request(app.getHttpServer())
        .put(`/projects/features/${testFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[0].id,
              optimisticHours: 10,
              likelyHours: 20,
              pessimisticHours: 40,
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const rh = res.body.roleHours.find((r: any) => r.roleId === storedRoles[0].id);
      expect(rh.expectedHours).toBe(21.67);
    });

    it('rejects invalid PERT inputs where O > L or L > P with 400 Bad Request', async () => {
      const pmToken = createToken(storedUsers[1]);
      await request(app.getHttpServer())
        .put(`/projects/features/${testFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[0].id,
              optimisticHours: 30,
              likelyHours: 20, // Invalid: O > L
              pessimisticHours: 40,
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(400);
    });

    it('switches estimation method to SINGLE_VALUE and recalculates expected hours', async () => {
      const pmToken = createToken(storedUsers[1]);
      // 1. Update feature method to SINGLE_VALUE
      await request(app.getHttpServer())
        .patch(`/projects/features/${testFeatureId}`)
        .send({ method: EstimationMethod.SINGLE_VALUE })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      // 2. Put singleHours = 35
      const res = await request(app.getHttpServer())
        .put(`/projects/features/${testFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[0].id,
              singleHours: 35,
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const rh = res.body.roleHours.find((r: any) => r.roleId === storedRoles[0].id);
      expect(rh.expectedHours).toBe(35);
    });

    it('switches estimation method to STORY_POINTS (points * 8.0h)', async () => {
      const pmToken = createToken(storedUsers[1]);
      await request(app.getHttpServer())
        .patch(`/projects/features/${testFeatureId}`)
        .send({ method: EstimationMethod.STORY_POINTS })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .put(`/projects/features/${testFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[1].id,
              storyPoints: 5, // 5 * 8.0 = 40h
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const rh = res.body.roleHours.find((r: any) => r.roleId === storedRoles[1].id);
      expect(rh.expectedHours).toBe(40);
    });

    it('switches estimation method to T_SHIRT (size table: XS=4, S=8, M=16, L=40, XL=80)', async () => {
      const pmToken = createToken(storedUsers[1]);
      await request(app.getHttpServer())
        .patch(`/projects/features/${testFeatureId}`)
        .send({ method: EstimationMethod.T_SHIRT })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .put(`/projects/features/${testFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[2].id,
              tshirtSize: TShirtSize.L, // L = 40 hours
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      const rh = res.body.roleHours.find((r: any) => r.roleId === storedRoles[2].id);
      expect(rh.expectedHours).toBe(40);
    });
  });

  // =========================================================================
  // 3. ACCESS CONTROL: DEVELOPER HOURS ONLY & PRIVACY
  // =========================================================================
  describe('Developer Role Guardrails & Cost Privacy', () => {
    let projectId: string;
    let assignedFeatureId: string;
    let unassignedFeatureId: string;

    beforeAll(async () => {
      const pmToken = createToken(storedUsers[1]);

      const pRes = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Developer Security Test' })
        .set('Authorization', `Bearer ${pmToken}`);
      projectId = pRes.body.id;

      const mRes = await request(app.getHttpServer())
        .post(`/projects/${projectId}/modules`)
        .send({ name: 'Security Module' })
        .set('Authorization', `Bearer ${pmToken}`);
      const moduleId = mRes.body.id;

      const f1Res = await request(app.getHttpServer())
        .post(`/projects/modules/${moduleId}/features`)
        .send({
          name: 'Assigned Feature',
          method: EstimationMethod.SINGLE_VALUE,
          assignedUserId: storedUsers[2].id, // assigned to Dev 1
        })
        .set('Authorization', `Bearer ${pmToken}`);
      assignedFeatureId = f1Res.body.id;

      const f2Res = await request(app.getHttpServer())
        .post(`/projects/modules/${moduleId}/features`)
        .send({
          name: 'Unassigned Feature',
          method: EstimationMethod.SINGLE_VALUE,
          assignedUserId: storedUsers[3].id, // assigned to Dev 2
        })
        .set('Authorization', `Bearer ${pmToken}`);
      unassignedFeatureId = f2Res.body.id;
    });

    it('allows Developer to enter hours on a feature assigned to them', async () => {
      const dev1Token = createToken(storedUsers[2]); // Dev 1
      const res = await request(app.getHttpServer())
        .put(`/projects/features/${assignedFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[0].id,
              singleHours: 18,
            },
          ],
        })
        .set('Authorization', `Bearer ${dev1Token}`)
        .expect(200);

      const rh = res.body.roleHours.find((r: any) => r.roleId === storedRoles[0].id);
      expect(rh.expectedHours).toBe(18);
    });

    it('rejects Developer attempting to enter hours on an unassigned feature (403 Forbidden)', async () => {
      const dev1Token = createToken(storedUsers[2]); // Dev 1 attempting to edit Dev 2 feature
      const res = await request(app.getHttpServer())
        .put(`/projects/features/${unassignedFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[0].id,
              singleHours: 25,
            },
          ],
        })
        .set('Authorization', `Bearer ${dev1Token}`)
        .expect(403);

      expect(res.body.message).toContain(
        'Developers can only enter hours on features assigned to them',
      );
    });

    it('allows PM and Owner to enter hours on any feature', async () => {
      const pmToken = createToken(storedUsers[1]); // PM
      await request(app.getHttpServer())
        .put(`/projects/features/${unassignedFeatureId}/hours`)
        .send({
          roleHours: [
            {
              roleId: storedRoles[1].id,
              singleHours: 25,
            },
          ],
        })
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
    });

    it('returns hour totals only (NO costs, rates or margins) in Rollup for Developer', async () => {
      const dev1Token = createToken(storedUsers[2]);
      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}/rollup`)
        .set('Authorization', `Bearer ${dev1Token}`)
        .expect(200);

      // Verify hours are present
      expect(res.body.totalHours).toBeGreaterThan(0);
      expect(res.body.byRole.length).toBeGreaterThan(0);
      expect(res.body.byRole[0].expectedHours).toBeDefined();

      // Verify cost fields are completely stripped
      expect(res.body.totalLaborCost).toBeUndefined();
      expect(res.body.totalCost).toBeUndefined();
      expect(res.body.byRole[0].laborCost).toBeUndefined();
      expect(res.body.byRole[0].hourlyCostMinor).toBeUndefined();
      expect(res.body.byModule[0].laborCost).toBeUndefined();
    });

    it('returns full labor costs and hours in Rollup for Owner', async () => {
      const ownerToken = createToken(storedUsers[0]);
      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}/rollup`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.totalHours).toBeGreaterThan(0);
      expect(res.body.totalLaborCost).toBeDefined();
      expect(res.body.totalLaborCost).toBeGreaterThan(0);
      expect(res.body.byRole[0].laborCost).toBeDefined();
      expect(res.body.byRole[0].hourlyCostMinor).toBeDefined();
    });
  });
});
