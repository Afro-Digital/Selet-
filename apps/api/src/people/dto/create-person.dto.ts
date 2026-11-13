import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayType, PensionBase } from '@prisma/client';

export class CreatePersonDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'abebe@agency.et' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'ID of the job role (e.g. Senior Backend Dev)' })
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @ApiProperty({ enum: PayType, default: PayType.MONTHLY_SALARY })
  @IsEnum(PayType)
  payType!: PayType;

  @ApiPropertyOptional({ default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;

  // Compensation fields in integer minor units (e.g. 35,000 ETB = 3,500,000 santim)
  @ApiPropertyOptional({ example: '3500000', description: 'Basic salary in minor units' })
  @IsOptional()
  basicSalaryMinor?: string | number;

  @ApiPropertyOptional({ example: '500000', description: 'Allowances in minor units' })
  @IsOptional()
  allowancesMinor?: string | number;

  @ApiPropertyOptional({ example: '0', description: 'Benefits in minor units' })
  @IsOptional()
  benefitsMinor?: string | number;

  @ApiPropertyOptional({
    example: '0',
    description: 'Direct hourly contractor rate in minor units',
  })
  @IsOptional()
  directHourlyRateMinor?: string | number;

  @ApiPropertyOptional({ default: 160 })
  @IsNumber()
  @IsOptional()
  paidHoursPerMonth?: number;

  @ApiPropertyOptional({ default: 0.7, description: 'Utilization factor (0 to 1)' })
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  @IsOptional()
  utilizationRate?: number;

  @ApiPropertyOptional({ default: true, description: 'Exempts from POESSA pension if false' })
  @IsBoolean()
  @IsOptional()
  isEthiopianNational?: boolean;

  @ApiPropertyOptional({ default: 0.11 })
  @IsNumber()
  @IsOptional()
  pensionRate?: number;

  @ApiPropertyOptional({ enum: PensionBase, default: PensionBase.BASIC })
  @IsEnum(PensionBase)
  @IsOptional()
  pensionBase?: PensionBase;

  @ApiPropertyOptional({ description: 'Statutory ceiling in minor units' })
  @IsOptional()
  pensionCeilingMinor?: string | number;
}
