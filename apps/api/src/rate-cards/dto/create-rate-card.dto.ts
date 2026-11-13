import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RateCardItemInputDto {
  @ApiProperty({ description: 'Job role ID', example: 'uuid-role-1' })
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @ApiProperty({
    description: 'Client billing hourly rate in minor units (santim)',
    example: '75000',
  })
  @IsString()
  @IsNotEmpty()
  hourlyRateMinor!: string;

  @ApiPropertyOptional({ description: 'Currency code', default: 'ETB', example: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;
}

export class CreateRateCardDto {
  @ApiProperty({ description: 'Rate card name', example: 'Standard Domestic 2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Currency code', default: 'ETB', example: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Effective start date ISO string',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the default rate card for projects',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Billing rate items per role', type: [RateCardItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateCardItemInputDto)
  @IsOptional()
  items?: RateCardItemInputDto[];
}
