import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRateCardDto } from './dto/create-rate-card.dto';
import { UpdateRateCardDto } from './dto/update-rate-card.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RateCardsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.rateCard.findMany({
      where: { organizationId },
      include: {
        items: {
          include: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const rateCard = await this.prisma.rateCard.findFirst({
      where: { id, organizationId },
      include: {
        items: {
          include: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!rateCard) {
      throw new NotFoundException(`Rate card with ID '${id}' not found`);
    }

    return rateCard;
  }

  async create(dto: CreateRateCardDto, user: AuthenticatedUser) {
    if (dto.isDefault) {
      await this.prisma.rateCard.updateMany({
        where: { organizationId: user.organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const rateCard = await this.prisma.rateCard.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        currency: dto.currency || 'ETB',
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        isDefault: dto.isDefault ?? false,
        items: dto.items?.length
          ? {
              create: dto.items.map((item) => ({
                roleId: item.roleId,
                hourlyRateMinor: BigInt(item.hourlyRateMinor),
                currency: item.currency || dto.currency || 'ETB',
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_RATE_CARD',
      entityType: 'RateCard',
      entityId: rateCard.id,
      newValue: { name: rateCard.name, isDefault: rateCard.isDefault },
    });

    return rateCard;
  }

  async update(id: string, dto: UpdateRateCardDto, user: AuthenticatedUser) {
    const existing = await this.findOne(id, user.organizationId);

    if (dto.isDefault) {
      await this.prisma.rateCard.updateMany({
        where: { organizationId: user.organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // If items are provided, replace them transactionally
    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.rateCardItem.deleteMany({
          where: { rateCardId: id },
        });

        await tx.rateCardItem.createMany({
          data: dto.items.map((item) => ({
            rateCardId: id,
            roleId: item.roleId,
            hourlyRateMinor: BigInt(item.hourlyRateMinor),
            currency: item.currency || dto.currency || existing.currency,
          })),
        });
      }

      return tx.rateCard.update({
        where: { id },
        data: {
          name: dto.name,
          currency: dto.currency,
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
          isDefault: dto.isDefault,
        },
        include: {
          items: {
            include: {
              role: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_RATE_CARD',
      entityType: 'RateCard',
      entityId: updated.id,
      oldValue: { name: existing.name, isDefault: existing.isDefault },
      newValue: { name: updated.name, isDefault: updated.isDefault },
    });

    return updated;
  }

  async delete(id: string, user: AuthenticatedUser) {
    const existing = await this.findOne(id, user.organizationId);

    await this.prisma.rateCard.delete({
      where: { id: existing.id },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE_RATE_CARD',
      entityType: 'RateCard',
      entityId: id,
      oldValue: { name: existing.name },
    });

    return { success: true, message: `Rate card '${existing.name}' deleted successfully` };
  }
}
