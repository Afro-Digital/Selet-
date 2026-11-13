import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogCategory, Payer, PriceModel } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCatalogItemDto {
  @ApiProperty({ description: 'Catalog item name', example: 'AWS EC2 t4g.medium' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: CatalogCategory, default: 'TOOL', example: 'HOSTING' })
  @IsEnum(CatalogCategory)
  category!: CatalogCategory;

  @ApiProperty({ enum: PriceModel, default: 'PER_MONTH', example: 'PER_MONTH' })
  @IsEnum(PriceModel)
  priceModel!: PriceModel;

  @ApiPropertyOptional({
    description: 'Amount in minor units (santim/cents)',
    example: '450000',
  })
  @IsString()
  @IsOptional()
  amountMinor?: string;

  @ApiPropertyOptional({
    description: 'Percentage rate if priceModel is PERCENTAGE (e.g. 0.035 for 3.5%)',
    example: 0.035,
  })
  @IsNumber()
  @IsOptional()
  percentageRate?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'ETB', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Source URL for pricing reference' })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ enum: Payer, default: 'CLIENT', example: 'CLIENT' })
  @IsEnum(Payer)
  @IsOptional()
  payer?: Payer;

  @ApiPropertyOptional({
    description: 'Number of days after which the price is considered stale',
    default: 90,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  staleAfterDays?: number;

  @ApiPropertyOptional({ description: 'Whether this item is a removable example', default: false })
  @IsBoolean()
  @IsOptional()
  isExample?: boolean;
}
