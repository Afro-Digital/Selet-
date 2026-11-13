import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePricingScenarioDto {
  @ApiPropertyOptional({
    description: 'Target blended profit margin (e.g. 0.30 for 30%)',
    example: 0.3,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.95)
  targetMargin?: number;

  @ApiPropertyOptional({ description: 'Minimum margin floor (e.g. 0.15 for 15%)', example: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.95)
  minimumMargin?: number;

  @ApiPropertyOptional({ description: 'Stretch profit margin (e.g. 0.40 for 40%)', example: 0.4 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.95)
  stretchMargin?: number;

  @ApiPropertyOptional({
    description: 'Market baseline minimum price in minor units',
    example: 45000000,
  })
  @IsOptional()
  marketRateMinMinor?: number | string;

  @ApiPropertyOptional({
    description: 'Market baseline maximum price in minor units',
    example: 75000000,
  })
  @IsOptional()
  marketRateMaxMinor?: number | string;

  @ApiPropertyOptional({ description: 'Active pricing mode', example: 'TARGET_MARGIN' })
  @IsOptional()
  @IsString()
  pricingMode?: 'TARGET_MARGIN' | 'FIXED_BUDGET' | 'DISCOUNT';

  @ApiPropertyOptional({ description: 'Fixed client budget in minor units', example: 50000000 })
  @IsOptional()
  fixedBudgetMinor?: number | string;

  @ApiPropertyOptional({ description: 'What-if discount rate (e.g. 0.10 for 10%)', example: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.99)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Specific module line ID to discount (null for whole project)',
    example: null,
  })
  @IsOptional()
  @IsString()
  discountLineId?: string;

  @ApiPropertyOptional({
    description: 'Per-module margin overrides map',
    example: { 'mod-1': { margin: 0.25, floorMargin: 0.15, ceilingMargin: 0.6 } },
  })
  @IsOptional()
  @IsObject()
  moduleMargins?: Record<
    string,
    {
      margin: number;
      floorMargin?: number;
      ceilingMargin?: number;
    }
  >;

  @ApiPropertyOptional({
    description: 'Owner approval to override organization minimum floor margin',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  ownerApprovedBelowFloor?: boolean;
}
