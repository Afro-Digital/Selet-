import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { hourlyCost } from '@selet/pricing-engine';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class PeopleService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

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

    // If caller is OWNER, enrich with computed hourly costs from pricing engine
    if (user.role === UserRole.OWNER) {
      return people.map((person) => {
        const computed = hourlyCost({
          payType: person.payType,
          currency: person.currency,
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
      });
    }

    return people;
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const person = await this.prisma.person.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { role: true },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID '${id}' not found`);
    }

    if (user.role === UserRole.OWNER) {
      const computed = hourlyCost({
        payType: person.payType,
        currency: person.currency,
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
        },
      };
    }

    return person;
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
    });

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'CREATE_PERSON',
      entityType: 'Person',
      entityId: person.id,
      newValue: { name: person.name, roleId: person.roleId, payType: person.payType },
    });

    return person;
  }
}
