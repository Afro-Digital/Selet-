import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateFloorsDto } from './dto/update-floors.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getOrganization(user: AuthenticatedUser) {
    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async updateFloors(dto: UpdateFloorsDto, user: AuthenticatedUser) {
    const existing = await this.getOrganization(user);

    const updated = await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        minimumFloorMargin: dto.minimumFloorMargin ?? existing.minimumFloorMargin,
        targetMargin: dto.targetMargin ?? existing.targetMargin,
        stretchMargin: dto.stretchMargin ?? existing.stretchMargin,
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_MARGIN_FLOORS',
      entityType: 'Organization',
      entityId: user.organizationId,
      oldValue: {
        minimumFloorMargin: existing.minimumFloorMargin,
        targetMargin: existing.targetMargin,
        stretchMargin: existing.stretchMargin,
      },
      newValue: {
        minimumFloorMargin: updated.minimumFloorMargin,
        targetMargin: updated.targetMargin,
        stretchMargin: updated.stretchMargin,
      },
    });

    return updated;
  }
}
