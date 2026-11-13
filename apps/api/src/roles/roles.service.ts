import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { people: true },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId },
      include: {
        people: {
          select: { id: true, name: true, payType: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async create(dto: CreateRoleDto, user: AuthenticatedUser) {
    const existing = await this.prisma.role.findUnique({
      where: {
        organizationId_name: {
          organizationId: user.organizationId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Role '${dto.name}' already exists in this organization`);
    }

    const role = await this.prisma.role.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        description: dto.description,
        defaultHourlyCostMinor: dto.defaultHourlyCostMinor
          ? BigInt(dto.defaultHourlyCostMinor)
          : 0n,
        currency: dto.currency || 'ETB',
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_ROLE',
      entityType: 'Role',
      entityId: role.id,
      newValue: { name: role.name },
    });

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, user: AuthenticatedUser) {
    const role = await this.findOne(id, user.organizationId);

    const updated = await this.prisma.role.update({
      where: { id: role.id },
      data: {
        name: dto.name,
        description: dto.description,
        defaultHourlyCostMinor: dto.defaultHourlyCostMinor
          ? BigInt(dto.defaultHourlyCostMinor)
          : undefined,
        currency: dto.currency,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_ROLE',
      entityType: 'Role',
      entityId: updated.id,
      oldValue: { name: role.name },
      newValue: { name: updated.name },
    });

    return updated;
  }

  async delete(id: string, user: AuthenticatedUser) {
    const role = await this.findOne(id, user.organizationId);

    // Check if people are assigned to this role
    const count = await this.prisma.person.count({
      where: { roleId: role.id },
    });

    if (count > 0) {
      throw new ConflictException(
        `Cannot delete role '${role.name}' because ${count} team member(s) are assigned to it`,
      );
    }

    await this.prisma.role.delete({
      where: { id: role.id },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE_ROLE',
      entityType: 'Role',
      entityId: role.id,
      oldValue: { name: role.name },
    });

    return { success: true, message: `Role '${role.name}' deleted successfully` };
  }
}
