import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, EstimationMethod, TShirtSize } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { UpdateFeatureHoursDto, RoleHoursEntryDto } from './dto/update-feature-hours.dto';
import { ScaleEstimateInputDto } from './dto/scale-estimate.dto';
import { UpdateRiskDto, RiskFactorEntryDto } from './dto/update-risk.dto';
import { UpdateScaleItemsDto, ScaleItemEntryDto } from './dto/update-scale-items.dto';
import { ScaleService } from './scale.service';
import { threePointHours, calculateProjectCost, money } from '@selet/pricing-engine';

export const DEFAULT_RISK_FACTORS: RiskFactorEntryDto[] = [
  {
    id: 'unclear_reqs',
    name: 'Unclear or Evolving Requirements',
    multiplier: 0.05,
    isEnabled: false,
  },
  {
    id: 'frequent_changes',
    name: 'Frequent Scope Changes Expected',
    multiplier: 0.05,
    isEnabled: false,
  },
  {
    id: 'new_technology',
    name: 'New / Unfamiliar Technology Stack',
    multiplier: 0.08,
    isEnabled: false,
  },
  {
    id: 'tight_deadline',
    name: 'Tight Deadline / Urgent Delivery',
    multiplier: 0.05,
    isEnabled: false,
  },
];

export interface ModuleRollup {
  moduleId: string;
  moduleName: string;
  parentId: string | null;
  expectedHours: number;
  featuresCount: number;
  laborCost?: number;
}

export interface RoleRollup {
  roleId: string;
  roleName: string;
  expectedHours: number;
  hourlyCostMinor?: number;
  laborCost?: number;
}

export interface ProjectRollup {
  projectId: string;
  totalHours: number;
  totalLaborCost?: number;
  byRole: RoleRollup[];
  byModule: ModuleRollup[];
}

const DEFAULT_TSHIRT_MAP: Record<TShirtSize, number> = {
  [TShirtSize.XS]: 4,
  [TShirtSize.S]: 8,
  [TShirtSize.M]: 16,
  [TShirtSize.L]: 40,
  [TShirtSize.XL]: 80,
};

@Injectable()
export class EstimatesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private scaleService: ScaleService,
  ) {}

  /**
   * Pure calculation of expected hours based on estimation method
   */
  calculateExpectedHours(
    method: EstimationMethod,
    entry: RoleHoursEntryDto,
    pointsToHoursRatio = 8.0,
    tshirtConfig?: Record<string, number>,
  ): number {
    switch (method) {
      case EstimationMethod.THREE_POINT: {
        const o = entry.optimisticHours;
        const l = entry.likelyHours;
        const p = entry.pessimisticHours;

        if (
          o === undefined ||
          l === undefined ||
          p === undefined ||
          o === null ||
          l === null ||
          p === null
        ) {
          return 0;
        }

        if (o < 0 || l < 0 || p < 0) {
          throw new BadRequestException('Hour estimates cannot be negative');
        }

        if (o > l || l > p) {
          throw new BadRequestException(
            `Invalid three-point estimate: expected O <= L <= P, but got O=${o}, L=${l}, P=${p}`,
          );
        }

        const pert = threePointHours(o, l, p);
        return Math.round(pert.expected * 100) / 100;
      }

      case EstimationMethod.SINGLE_VALUE: {
        return Math.max(0, entry.singleHours ?? 0);
      }

      case EstimationMethod.T_SHIRT: {
        if (!entry.tshirtSize) return 0;
        const config = { ...DEFAULT_TSHIRT_MAP, ...(tshirtConfig || {}) };
        return config[entry.tshirtSize] ?? 0;
      }

      case EstimationMethod.STORY_POINTS: {
        const points = entry.storyPoints ?? 0;
        const ratio = pointsToHoursRatio > 0 ? pointsToHoursRatio : 8.0;
        return Math.round(points * ratio * 100) / 100;
      }

      default:
        return 0;
    }
  }

  // ==========================================
  // PROJECTS CRUD
  // ==========================================

  async findAllProjects(user: AuthenticatedUser, isTemplate?: boolean) {
    const where: any = { organizationId: user.organizationId };
    if (isTemplate !== undefined) {
      where.isTemplate = isTemplate;
    }

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        _count: {
          select: { modules: true, versions: true },
        },
      },
    });
  }

  async findOneProject(id: string, user: AuthenticatedUser) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        client: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            features: {
              orderBy: { orderIndex: 'asc' },
              include: {
                assignedUser: {
                  select: { id: true, name: true, email: true, role: true },
                },
                roleHours: {
                  include: {
                    role: {
                      select: {
                        id: true,
                        name: true,
                        defaultHourlyCostMinor: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${id}' not found`);
    }

    return project;
  }

  async createProject(dto: CreateProjectDto, user: AuthenticatedUser) {
    const project = await this.prisma.project.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        description: dto.description,
        clientId: dto.clientId,
        currency: dto.currency || 'ETB',
        isTemplate: dto.isTemplate ?? false,
        templateCategory: dto.templateCategory,
        versions: {
          create: {
            versionNumber: 1,
            name: 'Initial Draft',
            pointsToHoursRatio: 8.0,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Project',
      entityId: project.id,
      newValue: { name: project.name, isTemplate: project.isTemplate },
    });

    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto, user: AuthenticatedUser) {
    await this.findOneProject(id, user);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        clientId: dto.clientId,
        currency: dto.currency,
        isTemplate: dto.isTemplate,
        templateCategory: dto.templateCategory,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'Project',
      entityId: id,
      newValue: dto,
    });

    return updated;
  }

  async deleteProject(id: string, user: AuthenticatedUser) {
    await this.findOneProject(id, user);

    await this.prisma.project.delete({ where: { id } });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'Project',
      entityId: id,
    });

    return { success: true, message: `Project ${id} deleted successfully` };
  }

  // ==========================================
  // MODULES CRUD
  // ==========================================

  async createModule(projectId: string, dto: CreateModuleDto, user: AuthenticatedUser) {
    await this.findOneProject(projectId, user);

    if (dto.parentId) {
      const parent = await this.prisma.module.findFirst({
        where: { id: dto.parentId, projectId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent module '${dto.parentId}' not found in this project`);
      }
    }

    return this.prisma.module.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        orderIndex: dto.orderIndex ?? 0,
      },
      include: {
        children: true,
        features: true,
      },
    });
  }

  async updateModule(id: string, dto: UpdateModuleDto, user: AuthenticatedUser) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!module || module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Module with ID '${id}' not found`);
    }

    if (dto.parentId === id) {
      throw new BadRequestException('A module cannot be its own parent');
    }

    return this.prisma.module.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        orderIndex: dto.orderIndex,
      },
    });
  }

  async deleteModule(id: string, user: AuthenticatedUser) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!module || module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Module with ID '${id}' not found`);
    }

    await this.prisma.module.delete({ where: { id } });

    return { success: true, message: `Module ${id} deleted successfully` };
  }

  // ==========================================
  // FEATURES CRUD
  // ==========================================

  async createFeature(moduleId: string, dto: CreateFeatureDto, user: AuthenticatedUser) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { project: true },
    });

    if (!module || module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Module with ID '${moduleId}' not found`);
    }

    if (dto.assignedUserId) {
      const assigned = await this.prisma.user.findFirst({
        where: { id: dto.assignedUserId, organizationId: user.organizationId },
      });
      if (!assigned) {
        throw new NotFoundException(
          `User with ID '${dto.assignedUserId}' not found in this organization`,
        );
      }
    }

    return this.prisma.feature.create({
      data: {
        moduleId,
        name: dto.name,
        description: dto.description,
        method: dto.method || EstimationMethod.THREE_POINT,
        assignedUserId: dto.assignedUserId,
        orderIndex: dto.orderIndex ?? 0,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        roleHours: true,
      },
    });
  }

  async updateFeature(id: string, dto: UpdateFeatureDto, user: AuthenticatedUser) {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
      include: { module: { include: { project: true } }, roleHours: true },
    });

    if (!feature || feature.module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Feature with ID '${id}' not found`);
    }

    if (dto.assignedUserId) {
      const assigned = await this.prisma.user.findFirst({
        where: { id: dto.assignedUserId, organizationId: user.organizationId },
      });
      if (!assigned) {
        throw new NotFoundException(
          `User with ID '${dto.assignedUserId}' not found in this organization`,
        );
      }
    }

    const updated = await this.prisma.feature.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        method: dto.method,
        assignedUserId: dto.assignedUserId,
        orderIndex: dto.orderIndex,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        roleHours: { include: { role: true } },
      },
    });

    // If method changed, recompute expected hours for existing roleHours
    if (dto.method && dto.method !== feature.method && feature.roleHours.length > 0) {
      const version = await this.prisma.estimateVersion.findFirst({
        where: { projectId: feature.module.projectId },
        orderBy: { versionNumber: 'desc' },
      });

      for (const rh of feature.roleHours) {
        const expected = this.calculateExpectedHours(
          dto.method,
          {
            roleId: rh.roleId,
            optimisticHours: rh.optimisticHours ?? undefined,
            likelyHours: rh.likelyHours ?? undefined,
            pessimisticHours: rh.pessimisticHours ?? undefined,
            singleHours: rh.singleHours ?? undefined,
            tshirtSize: rh.tshirtSize ?? undefined,
            storyPoints: rh.storyPoints ?? undefined,
          },
          version?.pointsToHoursRatio ?? 8.0,
          version?.tshirtSizeConfig as any,
        );

        await this.prisma.featureRoleHours.update({
          where: { id: rh.id },
          data: { expectedHours: expected },
        });
      }

      // Re-fetch with updated expectedHours
      return this.prisma.feature.findUnique({
        where: { id },
        include: {
          assignedUser: { select: { id: true, name: true, email: true, role: true } },
          roleHours: { include: { role: true } },
        },
      });
    }

    return updated;
  }

  async deleteFeature(id: string, user: AuthenticatedUser) {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
      include: { module: { include: { project: true } } },
    });

    if (!feature || feature.module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Feature with ID '${id}' not found`);
    }

    await this.prisma.feature.delete({ where: { id } });

    return { success: true, message: `Feature ${id} deleted successfully` };
  }

  // ==========================================
  // FEATURE HOURS (With Developer Guardrail)
  // ==========================================

  async updateFeatureHours(featureId: string, dto: UpdateFeatureHoursDto, user: AuthenticatedUser) {
    const feature = await this.prisma.feature.findUnique({
      where: { id: featureId },
      include: {
        module: {
          include: {
            project: {
              include: {
                versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!feature || feature.module.project.organizationId !== user.organizationId) {
      throw new NotFoundException(`Feature with ID '${featureId}' not found`);
    }

    // Role Guardrail: Developer can ONLY edit hours on features assigned to them
    if (user.role === UserRole.DEVELOPER) {
      if (!feature.assignedUserId || feature.assignedUserId !== user.id) {
        throw new ForbiddenException(
          'Developers can only enter hours on features assigned to them',
        );
      }
    }

    const version = feature.module.project.versions[0];
    const pointsToHoursRatio = version?.pointsToHoursRatio ?? 8.0;
    const tshirtConfig = (version?.tshirtSizeConfig as Record<string, number>) || undefined;

    for (const entry of dto.roleHours) {
      // Validate role exists in organization
      const role = await this.prisma.role.findFirst({
        where: { id: entry.roleId, organizationId: user.organizationId },
      });
      if (!role) {
        throw new NotFoundException(`Role '${entry.roleId}' not found in organization`);
      }

      const expectedHours = this.calculateExpectedHours(
        feature.method,
        entry,
        pointsToHoursRatio,
        tshirtConfig,
      );

      await this.prisma.featureRoleHours.upsert({
        where: {
          featureId_roleId: {
            featureId,
            roleId: entry.roleId,
          },
        },
        update: {
          optimisticHours: entry.optimisticHours,
          likelyHours: entry.likelyHours,
          pessimisticHours: entry.pessimisticHours,
          singleHours: entry.singleHours,
          tshirtSize: entry.tshirtSize,
          storyPoints: entry.storyPoints,
          expectedHours,
        },
        create: {
          featureId,
          roleId: entry.roleId,
          optimisticHours: entry.optimisticHours,
          likelyHours: entry.likelyHours,
          pessimisticHours: entry.pessimisticHours,
          singleHours: entry.singleHours,
          tshirtSize: entry.tshirtSize,
          storyPoints: entry.storyPoints,
          expectedHours,
        },
      });
    }

    return this.prisma.feature.findUnique({
      where: { id: featureId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, role: true } },
        roleHours: {
          include: {
            role: {
              select: { id: true, name: true, defaultHourlyCostMinor: true },
            },
          },
        },
      },
    });
  }

  // ==========================================
  // ROLLUP COMPUTATION (Hours & Costs)
  // ==========================================

  async getRollup(projectId: string, user: AuthenticatedUser): Promise<ProjectRollup> {
    const project = await this.findOneProject(projectId, user);

    const isDeveloper = user.role === UserRole.DEVELOPER;

    // Fetch rate card items / role default costs for labor cost estimation (for non-developers)
    const roles = await this.prisma.role.findMany({
      where: { organizationId: user.organizationId },
    });

    const roleCostMap = new Map<string, number>();
    for (const r of roles) {
      roleCostMap.set(r.id, Number(r.defaultHourlyCostMinor || 0));
    }

    const roleTotals = new Map<string, { name: string; hours: number }>();
    for (const r of roles) {
      roleTotals.set(r.id, { name: r.name, hours: 0 });
    }

    let projectTotalHours = 0;
    let projectTotalLaborCost = 0;

    const moduleRollups: ModuleRollup[] = [];

    // Map module hours
    for (const mod of project.modules) {
      let moduleHours = 0;
      let moduleLaborCost = 0;

      for (const feat of mod.features) {
        for (const rh of feat.roleHours) {
          const hours = rh.expectedHours || 0;
          moduleHours += hours;
          projectTotalHours += hours;

          // Role rollup
          const currentRole = roleTotals.get(rh.roleId) || {
            name: rh.role?.name || 'Unknown',
            hours: 0,
          };
          currentRole.hours = Math.round((currentRole.hours + hours) * 100) / 100;
          roleTotals.set(rh.roleId, currentRole);

          // Cost calculation (minor units)
          if (!isDeveloper) {
            const hourlyRate = roleCostMap.get(rh.roleId) || 0;
            const cost = Math.round(hours * hourlyRate);
            moduleLaborCost += cost;
            projectTotalLaborCost += cost;
          }
        }
      }

      moduleRollups.push({
        moduleId: mod.id,
        moduleName: mod.name,
        parentId: mod.parentId,
        expectedHours: Math.round(moduleHours * 100) / 100,
        featuresCount: mod.features.length,
        ...(isDeveloper ? {} : { laborCost: moduleLaborCost }),
      });
    }

    const roleRollups: RoleRollup[] = Array.from(roleTotals.entries())
      .filter(([, data]) => data.hours > 0)
      .map(([roleId, data]) => {
        const hourlyCostMinor = roleCostMap.get(roleId) || 0;
        return {
          roleId,
          roleName: data.name,
          expectedHours: data.hours,
          ...(isDeveloper
            ? {}
            : {
                hourlyCostMinor,
                laborCost: Math.round(data.hours * hourlyCostMinor),
              }),
        };
      });

    return {
      projectId: project.id,
      totalHours: Math.round(projectTotalHours * 100) / 100,
      ...(isDeveloper ? {} : { totalLaborCost: projectTotalLaborCost }),
      byRole: roleRollups,
      byModule: moduleRollups,
    };
  }

  // ==========================================
  // STARTER TEMPLATES
  // ==========================================

  async getStarterTemplates(user: AuthenticatedUser) {
    return this.prisma.project.findMany({
      where: {
        organizationId: user.organizationId,
        isTemplate: true,
      },
      include: {
        modules: {
          include: {
            features: {
              include: {
                roleHours: {
                  include: { role: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async seedStarterTemplates(user: AuthenticatedUser) {
    // Check if templates already exist
    const existing = await this.prisma.project.count({
      where: { organizationId: user.organizationId, isTemplate: true },
    });

    if (existing > 0) {
      return { seeded: 0, message: 'Templates already exist for this organization' };
    }

    // Ensure common roles exist in organization
    const roleDefinitions = [
      { name: 'Frontend Engineer', defaultHourlyCostMinor: 45000 },
      { name: 'Backend Engineer', defaultHourlyCostMinor: 50000 },
      { name: 'UI/UX Designer', defaultHourlyCostMinor: 40000 },
      { name: 'QA Engineer', defaultHourlyCostMinor: 35000 },
      { name: 'DevOps Engineer', defaultHourlyCostMinor: 55000 },
      { name: 'Project Manager', defaultHourlyCostMinor: 48000 },
    ];

    const rolesMap: Record<string, string> = {};
    for (const r of roleDefinitions) {
      const role = await this.prisma.role.upsert({
        where: {
          organizationId_name: {
            organizationId: user.organizationId,
            name: r.name,
          },
        },
        update: {},
        create: {
          organizationId: user.organizationId,
          name: r.name,
          defaultHourlyCostMinor: r.defaultHourlyCostMinor,
        },
      });
      rolesMap[r.name] = role.id;
    }

    interface StarterRoleHour {
      role: string;
      o?: number;
      l?: number;
      p?: number;
      single?: number;
      points?: number;
      size?: TShirtSize;
    }

    interface StarterFeature {
      name: string;
      method: EstimationMethod;
      roleHours: StarterRoleHour[];
    }

    interface StarterModule {
      name: string;
      features: StarterFeature[];
    }

    interface StarterTemplateItem {
      name: string;
      templateCategory: string;
      description: string;
      modules: StarterModule[];
    }

    const templateTemplates: StarterTemplateItem[] = [
      {
        name: 'E-Commerce Platform (Web & Mobile)',
        templateCategory: 'E_COMMERCE',
        description:
          'Full-featured Ethiopian e-commerce marketplace with Telebirr & Chapa payment integration [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Storefront & Product Catalog',
            features: [
              {
                name: 'Product Listing, Search & Filters',
                method: EstimationMethod.THREE_POINT,
                roleHours: [
                  { role: 'Frontend Engineer', o: 16, l: 24, p: 40 },
                  { role: 'Backend Engineer', o: 12, l: 20, p: 32 },
                  { role: 'UI/UX Designer', o: 8, l: 12, p: 16 },
                  { role: 'QA Engineer', o: 6, l: 8, p: 14 },
                ],
              },
              {
                name: 'Product Detail & Image Gallery',
                method: EstimationMethod.SINGLE_VALUE,
                roleHours: [
                  { role: 'Frontend Engineer', single: 16 },
                  { role: 'Backend Engineer', single: 8 },
                  { role: 'QA Engineer', single: 4 },
                ],
              },
            ],
          },
          {
            name: 'Cart & Checkout (Telebirr / Chapa)',
            features: [
              {
                name: 'Cart Management & Stock Reservation',
                method: EstimationMethod.STORY_POINTS,
                roleHours: [
                  { role: 'Frontend Engineer', points: 3 },
                  { role: 'Backend Engineer', points: 5 },
                  { role: 'QA Engineer', points: 2 },
                ],
              },
              {
                name: 'Telebirr & Chapa Payment Integration',
                method: EstimationMethod.THREE_POINT,
                roleHours: [
                  { role: 'Backend Engineer', o: 20, l: 32, p: 56 },
                  { role: 'Frontend Engineer', o: 12, l: 16, p: 28 },
                  { role: 'QA Engineer', o: 10, l: 16, p: 24 },
                ],
              },
            ],
          },
          {
            name: 'Orders & Admin Dashboard',
            features: [
              {
                name: 'Merchant Order Management & Status Updates',
                method: EstimationMethod.T_SHIRT,
                roleHours: [
                  { role: 'Frontend Engineer', size: TShirtSize.M },
                  { role: 'Backend Engineer', size: TShirtSize.M },
                  { role: 'QA Engineer', size: TShirtSize.S },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'B2B SaaS Application',
        templateCategory: 'SAAS',
        description:
          'Multi-tenant cloud platform with subscription billing, teams and audit log [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Authentication & Organization Workspaces',
            features: [
              {
                name: 'Multi-Tenant Isolation & Role-Based Access',
                method: EstimationMethod.THREE_POINT,
                roleHours: [
                  { role: 'Backend Engineer', o: 24, l: 40, p: 64 },
                  { role: 'Frontend Engineer', o: 16, l: 24, p: 40 },
                  { role: 'QA Engineer', o: 12, l: 16, p: 28 },
                ],
              },
            ],
          },
          {
            name: 'Subscription & Usage Metering',
            features: [
              {
                name: 'Subscription Plans & Invoicing',
                method: EstimationMethod.STORY_POINTS,
                roleHours: [
                  { role: 'Backend Engineer', points: 5 },
                  { role: 'Frontend Engineer', points: 3 },
                  { role: 'QA Engineer', points: 2 },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Cross-Platform Mobile App',
        templateCategory: 'MOBILE_APP',
        description:
          'iOS & Android application with offline sync and push notifications [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Mobile Core & Offline Sync',
            features: [
              {
                name: 'Offline Caching & Background Sync',
                method: EstimationMethod.THREE_POINT,
                roleHours: [
                  { role: 'Frontend Engineer', o: 24, l: 36, p: 60 },
                  { role: 'Backend Engineer', o: 16, l: 24, p: 40 },
                  { role: 'QA Engineer', o: 16, l: 24, p: 36 },
                ],
              },
              {
                name: 'Push Notifications (FCM / APNs)',
                method: EstimationMethod.SINGLE_VALUE,
                roleHours: [
                  { role: 'Frontend Engineer', single: 16 },
                  { role: 'Backend Engineer', single: 16 },
                  { role: 'QA Engineer', single: 8 },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Marketing Landing Page',
        templateCategory: 'LANDING_PAGE',
        description:
          'High-converting responsive landing page with contact form and analytics [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Public Website & SEO',
            features: [
              {
                name: 'Responsive Hero, Features & Pricing Sections',
                method: EstimationMethod.T_SHIRT,
                roleHours: [
                  { role: 'UI/UX Designer', size: TShirtSize.M },
                  { role: 'Frontend Engineer', size: TShirtSize.M },
                  { role: 'QA Engineer', size: TShirtSize.S },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Internal Operations Tool',
        templateCategory: 'INTERNAL_TOOL',
        description:
          'Custom operations portal with CRUD data tables, CSV exports and workflows [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Data Management & Workflows',
            features: [
              {
                name: 'Master Data CRUD & Excel Export',
                method: EstimationMethod.SINGLE_VALUE,
                roleHours: [
                  { role: 'Frontend Engineer', single: 24 },
                  { role: 'Backend Engineer', single: 20 },
                  { role: 'QA Engineer', single: 8 },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Support & Maintenance Retainer',
        templateCategory: 'MAINTENANCE',
        description:
          'Quarterly retainer for security patches, uptime monitoring and bug fixes [Example Hours - Adjust to Your Project Scope]',
        modules: [
          {
            name: 'Quarterly Maintenance Allocation',
            features: [
              {
                name: 'Security Updates, Dependency Patching & Backups',
                method: EstimationMethod.SINGLE_VALUE,
                roleHours: [
                  { role: 'DevOps Engineer', single: 20 },
                  { role: 'Backend Engineer', single: 16 },
                  { role: 'QA Engineer', single: 8 },
                ],
              },
            ],
          },
        ],
      },
    ];

    let count = 0;
    for (const tmpl of templateTemplates) {
      const project = await this.prisma.project.create({
        data: {
          organizationId: user.organizationId,
          name: tmpl.name,
          description: tmpl.description,
          isTemplate: true,
          templateCategory: tmpl.templateCategory,
          currency: 'ETB',
          versions: {
            create: {
              versionNumber: 1,
              name: 'Template Baseline',
              pointsToHoursRatio: 8.0,
            },
          },
        },
      });

      let mIdx = 0;
      for (const modData of tmpl.modules) {
        const module = await this.prisma.module.create({
          data: {
            projectId: project.id,
            name: modData.name,
            orderIndex: mIdx++,
          },
        });

        let fIdx = 0;
        for (const featData of modData.features) {
          const feature = await this.prisma.feature.create({
            data: {
              moduleId: module.id,
              name: featData.name,
              method: featData.method,
              orderIndex: fIdx++,
            },
          });

          for (const rh of featData.roleHours) {
            const roleId = rolesMap[rh.role];
            if (!roleId) continue;

            let expectedHours = 0;
            if (
              featData.method === EstimationMethod.THREE_POINT &&
              rh.o !== undefined &&
              rh.l !== undefined &&
              rh.p !== undefined
            ) {
              expectedHours = Math.round(((rh.o + 4 * rh.l + rh.p) / 6) * 100) / 100;
            } else if (
              featData.method === EstimationMethod.SINGLE_VALUE &&
              rh.single !== undefined
            ) {
              expectedHours = rh.single;
            } else if (
              featData.method === EstimationMethod.STORY_POINTS &&
              rh.points !== undefined
            ) {
              expectedHours = rh.points * 8.0;
            } else if (featData.method === EstimationMethod.T_SHIRT && rh.size !== undefined) {
              expectedHours = DEFAULT_TSHIRT_MAP[rh.size];
            }

            await this.prisma.featureRoleHours.create({
              data: {
                featureId: feature.id,
                roleId,
                optimisticHours: rh.o,
                likelyHours: rh.l,
                pessimisticHours: rh.p,
                singleHours: rh.single,
                storyPoints: rh.points,
                tshirtSize: rh.size,
                expectedHours,
              },
            });
          }
        }
      }
      count++;
    }

    return { seeded: count, message: `Successfully seeded ${count} starter templates` };
  }

  async createFromTemplate(
    templateId: string,
    newName: string | undefined,
    user: AuthenticatedUser,
  ) {
    const template = await this.prisma.project.findFirst({
      where: { id: templateId, organizationId: user.organizationId, isTemplate: true },
      include: {
        versions: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            features: {
              orderBy: { orderIndex: 'asc' },
              include: {
                roleHours: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID '${templateId}' not found`);
    }

    // 1. Create new cloned project
    const newProject = await this.prisma.project.create({
      data: {
        organizationId: user.organizationId,
        name: newName || `${template.name} (Copy)`,
        description: template.description
          ?.replace(/\[Example Hours - Adjust to Your Project Scope\]/g, '')
          .trim(),
        currency: template.currency,
        isTemplate: false,
        versions: {
          create: {
            versionNumber: 1,
            name: 'Initial Draft',
            pointsToHoursRatio: template.versions[0]?.pointsToHoursRatio ?? 8.0,
            tshirtSizeConfig: template.versions[0]?.tshirtSizeConfig ?? undefined,
          },
        },
      },
    });

    // 2. Clone modules preserving WBS hierarchy
    const oldToNewModuleMap = new Map<string, string>();

    // Pass 1: create root modules (parentId is null)
    const rootModules = template.modules.filter((m) => !m.parentId);
    const childModules = template.modules.filter((m) => m.parentId);

    for (const m of rootModules) {
      const cloned = await this.prisma.module.create({
        data: {
          projectId: newProject.id,
          name: m.name,
          description: m.description,
          orderIndex: m.orderIndex,
        },
      });
      oldToNewModuleMap.set(m.id, cloned.id);
    }

    // Pass 2: create child modules
    for (const m of childModules) {
      const newParentId = m.parentId ? oldToNewModuleMap.get(m.parentId) : undefined;
      const cloned = await this.prisma.module.create({
        data: {
          projectId: newProject.id,
          parentId: newParentId,
          name: m.name,
          description: m.description,
          orderIndex: m.orderIndex,
        },
      });
      oldToNewModuleMap.set(m.id, cloned.id);
    }

    // 3. Clone features and role hours
    for (const m of template.modules) {
      const newModuleId = oldToNewModuleMap.get(m.id);
      if (!newModuleId) continue;

      for (const f of m.features) {
        const clonedFeature = await this.prisma.feature.create({
          data: {
            moduleId: newModuleId,
            name: f.name,
            description: f.description,
            method: f.method,
            orderIndex: f.orderIndex,
          },
        });

        for (const rh of f.roleHours) {
          await this.prisma.featureRoleHours.create({
            data: {
              featureId: clonedFeature.id,
              roleId: rh.roleId,
              optimisticHours: rh.optimisticHours,
              likelyHours: rh.likelyHours,
              pessimisticHours: rh.pessimisticHours,
              singleHours: rh.singleHours,
              tshirtSize: rh.tshirtSize,
              storyPoints: rh.storyPoints,
              expectedHours: rh.expectedHours,
            },
          });
        }
      }
    }

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Project',
      entityId: newProject.id,
      newValue: { fromTemplateId: templateId, name: newProject.name },
    });

    return this.findOneProject(newProject.id, user);
  }

  async deleteTemplate(templateId: string, user: AuthenticatedUser) {
    const template = await this.prisma.project.findFirst({
      where: { id: templateId, organizationId: user.organizationId, isTemplate: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID '${templateId}' not found`);
    }

    await this.prisma.project.delete({ where: { id: templateId } });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE',
      entityType: 'ProjectTemplate',
      entityId: templateId,
    });

    return { success: true, message: `Template ${templateId} removed` };
  }

  // ==========================================
  // STAGE 8: RISK, OVERHEAD & SCALE ESTIMATOR
  // ==========================================

  async getRiskAndOverhead(
    projectId: string,
    versionId: string | undefined,
    user: AuthenticatedUser,
  ) {
    const project = await this.findOneProject(projectId, user);
    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    const version = versionId
      ? project.versions.find((v) => v.id === versionId)
      : project.versions[0];

    if (!version) {
      throw new NotFoundException('Estimate version not found for this project');
    }

    const contingencyRate = version.contingencyRate ?? 0.1;
    const overheadRate = version.overheadRate ?? org?.defaultOverheadRate ?? 0.1;

    let riskFactors: RiskFactorEntryDto[] = DEFAULT_RISK_FACTORS;
    if (
      version.riskFactors &&
      Array.isArray(version.riskFactors) &&
      version.riskFactors.length > 0
    ) {
      riskFactors = version.riskFactors as any;
    }

    const activeMultipliersSum = riskFactors
      .filter((rf) => rf.isEnabled)
      .reduce((sum, rf) => sum + rf.multiplier, 0);

    const totalRiskRate = Math.round((contingencyRate + activeMultipliersSum) * 1000) / 1000;

    return {
      projectId: project.id,
      versionId: version.id,
      versionName: version.name,
      contingencyRate,
      overheadRate,
      riskFactors,
      activeMultipliersSum,
      totalRiskRate,
    };
  }

  async updateRiskAndOverhead(
    projectId: string,
    versionId: string,
    dto: UpdateRiskDto,
    user: AuthenticatedUser,
  ) {
    await this.findOneProject(projectId, user);

    const version = await this.prisma.estimateVersion.findFirst({
      where: { id: versionId, projectId },
    });

    if (!version) {
      throw new NotFoundException(`Estimate version '${versionId}' not found`);
    }

    const updated = await this.prisma.estimateVersion.update({
      where: { id: versionId },
      data: {
        contingencyRate:
          dto.contingencyRate !== undefined ? dto.contingencyRate : version.contingencyRate,
        overheadRate: dto.overheadRate !== undefined ? dto.overheadRate : version.overheadRate,
        riskFactors: dto.riskFactors !== undefined ? (dto.riskFactors as any) : version.riskFactors,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'EstimateVersionRisk',
      entityId: versionId,
      newValue: dto,
    });

    return updated;
  }

  async estimateScale(
    projectId: string,
    versionId: string,
    dto: ScaleEstimateInputDto,
    user: AuthenticatedUser,
  ) {
    const project = await this.findOneProject(projectId, user);

    const version = await this.prisma.estimateVersion.findFirst({
      where: { id: versionId, projectId },
    });

    if (!version) {
      throw new NotFoundException(`Estimate version '${versionId}' not found`);
    }

    const result = await this.scaleService.estimateScale(
      dto,
      user.organizationId,
      project.currency,
    );

    await this.prisma.estimateVersion.update({
      where: { id: versionId },
      data: {
        scaleInputs: dto as any,
        scaleItems: result.items as any,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'EstimateVersionScale',
      entityId: versionId,
      newValue: { inputs: dto, itemsCount: result.items.length },
    });

    return result;
  }

  async updateScaleItems(
    projectId: string,
    versionId: string,
    dto: UpdateScaleItemsDto,
    user: AuthenticatedUser,
  ) {
    await this.findOneProject(projectId, user);

    const version = await this.prisma.estimateVersion.findFirst({
      where: { id: versionId, projectId },
    });

    if (!version) {
      throw new NotFoundException(`Estimate version '${versionId}' not found`);
    }

    await this.prisma.estimateVersion.update({
      where: { id: versionId },
      data: {
        scaleItems: dto.items as any,
      },
    });

    let totalClientMonthlyMinor = 0;
    let totalAgencyMonthlyMinor = 0;

    for (const it of dto.items) {
      if (it.isIncluded) {
        if (it.payer === 'CLIENT') {
          totalClientMonthlyMinor += it.amountMinor;
        } else {
          totalAgencyMonthlyMinor += it.amountMinor;
        }
      }
    }

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE',
      entityType: 'EstimateVersionScaleItems',
      entityId: versionId,
      newValue: { count: dto.items.length, totalClientMonthlyMinor, totalAgencyMonthlyMinor },
    });

    return {
      versionId,
      items: dto.items,
      totalClientMonthlyMinor,
      totalAgencyMonthlyMinor,
      totalRecurringMonthlyMinor: totalClientMonthlyMinor + totalAgencyMonthlyMinor,
    };
  }

  async getCostSummary(projectId: string, versionId: string | undefined, user: AuthenticatedUser) {
    const isDeveloper = user.role === UserRole.DEVELOPER;
    const project = await this.findOneProject(projectId, user);
    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    const version = versionId
      ? project.versions.find((v) => v.id === versionId)
      : project.versions[0];

    if (!version) {
      throw new NotFoundException('Estimate version not found for this project');
    }

    // 1. Rollup for labor
    const rollup = await this.getRollup(projectId, user);
    const laborCostMinor = BigInt(rollup.totalLaborCost || 0);

    // 2. Scale recurring items breakdown
    let toolsMonthlyMinor = 0n;
    let agencyInfraMonthlyMinor = 0n;
    let thirdPartyMonthlyMinor = 0n;
    let clientRecurringMonthlyMinor = 0n;

    const scaleItems: ScaleItemEntryDto[] = (version.scaleItems as any) || [];

    for (const it of scaleItems) {
      if (it.isIncluded) {
        const amt = BigInt(Math.round(it.amountMinor));
        if (it.payer === 'AGENCY') {
          if (it.category === 'TOOL' || it.category === 'LICENSE') {
            toolsMonthlyMinor += amt;
          } else if (it.category === 'HOSTING' || it.category === 'CDN') {
            agencyInfraMonthlyMinor += amt;
          } else {
            thirdPartyMonthlyMinor += amt;
          }
        } else {
          clientRecurringMonthlyMinor += amt;
        }
      }
    }

    // 3. Risk & Overhead rates
    const contingencyRate = version.contingencyRate ?? 0.1;
    const overheadRate = version.overheadRate ?? org?.defaultOverheadRate ?? 0.1;

    const riskFactors: RiskFactorEntryDto[] = (version.riskFactors as any) || DEFAULT_RISK_FACTORS;
    const enabledMultipliers = riskFactors.filter((rf) => rf.isEnabled).map((rf) => rf.multiplier);

    // 4. Calculate project cost via @selet/pricing-engine
    const costBreakdown = calculateProjectCost(
      {
        currency: project.currency,
        directLaborCost: money(laborCostMinor, project.currency),
        toolsCost: money(toolsMonthlyMinor, project.currency),
        agencyInfrastructureCost: money(agencyInfraMonthlyMinor, project.currency),
        thirdPartyCost: money(thirdPartyMonthlyMinor, project.currency),
      },
      {
        contingencyRate,
        riskMultipliers: enabledMultipliers,
        overheadRate,
      },
    );

    if (isDeveloper) {
      // Developer sees hours, scale item names, and payer tags only. Zero financial cost figures.
      return {
        projectId: project.id,
        versionId: version.id,
        totalHours: rollup.totalHours,
        currency: project.currency,
        scaleItems: scaleItems.map((it) => ({
          id: it.id,
          name: it.name,
          category: it.category,
          payer: it.payer,
          isIncluded: it.isIncluded,
          assumption: it.assumption,
        })),
        riskFactors: riskFactors.map((rf) => ({
          id: rf.id,
          name: rf.name,
          isEnabled: rf.isEnabled,
        })),
      };
    }

    return {
      projectId: project.id,
      versionId: version.id,
      currency: project.currency,
      totalHours: rollup.totalHours,
      laborCostMinor: Number(costBreakdown.laborCost.amount),
      toolsCostMinor: Number(costBreakdown.toolsCost.amount),
      agencyInfrastructureCostMinor: Number(costBreakdown.agencyInfrastructureCost.amount),
      thirdPartyCostMinor: Number(costBreakdown.thirdPartyCost.amount),
      directCostMinor: Number(costBreakdown.directCost.amount),
      riskCostMinor: Number(costBreakdown.riskCost.amount),
      subtotalWithRiskMinor: Number(costBreakdown.subtotalWithRisk.amount),
      overheadCostMinor: Number(costBreakdown.overheadCost.amount),
      totalCostMinor: Number(costBreakdown.totalCost.amount),
      clientRecurringMonthlyMinor: Number(clientRecurringMonthlyMinor),
      contingencyRate,
      overheadRate,
      totalRiskRate: contingencyRate + enabledMultipliers.reduce((a, b) => a + b, 0),
      riskFactors,
      scaleItems,
    };
  }
}
