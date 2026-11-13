import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { CatalogCategory, Payer } from '@prisma/client';

export class ScaleItemEntryDto {
  @ApiProperty({ example: 'item-hosting-tier' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional({ example: 'cat-item-uuid' })
  @IsString()
  @IsOptional()
  catalogItemId?: string;

  @ApiProperty({ example: 'AWS EC2 t4g.medium (2 vCPU, 4GB RAM)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: CatalogCategory, example: CatalogCategory.HOSTING })
  @IsEnum(CatalogCategory)
  category!: CatalogCategory;

  @ApiProperty({ example: 449750, description: 'Monthly amount in minor units (4,497.50 ETB)' })
  @IsNumber()
  @Min(0)
  amountMinor!: number;

  @ApiProperty({ example: 'ETB', default: 'ETB' })
  @IsString()
  currency!: string;

  @ApiProperty({ enum: Payer, example: Payer.CLIENT })
  @IsEnum(Payer)
  payer!: Payer;

  @ApiProperty({ example: true })
  @IsBoolean()
  isIncluded!: boolean;

  @ApiProperty({ example: 'Assumed 5,000 monthly users with 10% peak concurrency' })
  @IsString()
  @IsNotEmpty()
  assumption!: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isUserOverridden?: boolean;
}

export class UpdateScaleItemsDto {
  @ApiProperty({ type: [ScaleItemEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScaleItemEntryDto)
  items!: ScaleItemEntryDto[];
}
