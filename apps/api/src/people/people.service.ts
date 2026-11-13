import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, Person, Role } from '@prisma/client';
import { hourlyCost } from '@selet/pricing-engine';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

type PersonWithRole = Person & {
  role?: Pick<Role, 'id' | 'name'> | Role | null;
};

@Injectable()
export class PeopleService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  private enrichIfOwner(person: PersonWithRole, isOwner: boolean) {
    if (!isOwner) {
      return person;
    }

    const computed = hourlyCost({
      payType: person.payType,
      currency: person.currency || 'ETB',
      basicSalaryMinor: person.basicSalaryMinor,
      allowancesMinor: person.allowancesMinor,
      benefitsMinor: person.benefitsMinor,
      directHourlyRateMinor: person.directHourlyRateMinor,
      paidHoursPerMonth: person.paidHoursPerMonth,
      utilizationRate: person.utilizationRate,
      isEthiopianNational: person.isEthiopianNational,
      pensionRate: person.pensionRate,
      pensionBase: person.pensionBase,
      pensionCeilingMinor: person.pensionCeilingMinor ?? undefined,
    });

    return {
      ...person,
      computedHourlyCost: {
        hourlyCostMinor: computed.hourlyCost.amount.toString(),
        totalMonthlyCostMinor: computed.totalMonthlyCost.amount.toString(),
        monthlyEmployerPensionMinor: computed.monthlyEmployerPension.amount.toString(),
        productiveHoursPerMonth: computed.productiveHoursPerMonth,
        currency: computed.hourlyCost.currency,
      },
    };
  }

  async findAll(user: AuthenticatedUser) {
    const people = await this.prisma.person.findMany({
      where: { organizationId: user.organizationId },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const isOwner = user.role === UserRole.OWNER;
    return people.map((person) => this.enrichIfOwner(person, isOwner));
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const person = await this.prisma.person.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { role: true },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID '${id}' not found`);
    }

    return this.enrichIfOwner(person, user.role === UserRole.OWNER);
  }

  async create(dto: CreatePersonDto, user: AuthenticatedUser) {
    const person = await this.prisma.person.create({
      data: {
        organizationId: user.organizationId,
        roleId: dto.roleId,
        name: dto.name,
        email: dto.email,
        payType: dto.payType,
        currency: dto.currency || 'ETB',
        basicSalaryMinor: dto.basicSalaryMinor ? BigInt(dto.basicSalaryMinor) : 0n,
        allowancesMinor: dto.allowancesMinor ? BigInt(dto.allowancesMinor) : 0n,
        benefitsMinor: dto.benefitsMinor ? BigInt(dto.benefitsMinor) : 0n,
        directHourlyRateMinor: dto.directHourlyRateMinor ? BigInt(dto.directHourlyRateMinor) : 0n,
        paidHoursPerMonth: dto.paidHoursPerMonth ?? 160,
        utilizationRate: dto.utilizationRate ?? 0.7,
        isEthiopianNational: dto.isEthiopianNational ?? true,
        pensionRate: dto.pensionRate ?? 0.11,
        pensionBase: dto.pensionBase ?? 'BASIC',
        pensionCeilingMinor: dto.pensionCeilingMinor ? BigInt(dto.pensionCeilingMinor) : null,
      },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_PERSON',
      entityType: 'Person',
      entityId: person.id,
      newValue: { name: person.name, roleId: person.roleId, payType: person.payType },
    });

    return this.enrichIfOwner(person, user.role === UserRole.OWNER);
  }

  async update(id: string, dto: UpdatePersonDto, user: AuthenticatedUser) {
    const existing = await this.prisma.person.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Person with ID '${id}' not found`);
    }

    const updated = await this.prisma.person.update({
      where: { id },
      data: {
        roleId: dto.roleId,
        name: dto.name,
        email: dto.email,
        payType: dto.payType,
        currency: dto.currency,
        basicSalaryMinor:
          dto.basicSalaryMinor !== undefined ? BigInt(dto.basicSalaryMinor) : undefined,
        allowancesMinor:
          dto.allowancesMinor !== undefined ? BigInt(dto.allowancesMinor) : undefined,
        benefitsMinor: dto.benefitsMinor !== undefined ? BigInt(dto.benefitsMinor) : undefined,
        directHourlyRateMinor:
          dto.directHourlyRateMinor !== undefined ? BigInt(dto.directHourlyRateMinor) : undefined,
        paidHoursPerMonth: dto.paidHoursPerMonth,
        utilizationRate: dto.utilizationRate,
        isEthiopianNational: dto.isEthiopianNational,
        pensionRate: dto.pensionRate,
        pensionBase: dto.pensionBase,
        pensionCeilingMinor:
          dto.pensionCeilingMinor !== undefined
            ? dto.pensionCeilingMinor
              ? BigInt(dto.pensionCeilingMinor)
              : null
            : undefined,
      },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'UPDATE_PERSON',
      entityType: 'Person',
      entityId: updated.id,
      oldValue: { name: existing.name, payType: existing.payType },
      newValue: { name: updated.name, payType: updated.payType },
    });

    return this.enrichIfOwner(updated, user.role === UserRole.OWNER);
  }

  async delete(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.person.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Person with ID '${id}' not found`);
    }

    await this.prisma.person.delete({
      where: { id },
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DELETE_PERSON',
      entityType: 'Person',
      entityId: id,
      oldValue: { name: existing.name },
    });

    return { success: true, message: `Person '${existing.name}' deleted successfully` };
  }
}
