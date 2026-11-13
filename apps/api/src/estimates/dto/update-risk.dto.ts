import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';

export class RiskFactorEntryDto {
  @ApiProperty({ example: 'unclear_reqs' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Unclear or Evolving Requirements' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 0.05, description: 'Risk multiplier rate (e.g. 0.05 for +5%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  multiplier!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled!: boolean;
}

export class UpdateRiskDto {
  @ApiPropertyOptional({ example: 0.1, description: 'Contingency rate (e.g. 0.10 for 10%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  contingencyRate?: number;

  @ApiPropertyOptional({ example: 0.15, description: 'Overhead rate override (e.g. 0.15 for 15%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  overheadRate?: number;

  @ApiPropertyOptional({ type: [RiskFactorEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskFactorEntryDto)
  @IsOptional()
  riskFactors?: RiskFactorEntryDto[];
}
