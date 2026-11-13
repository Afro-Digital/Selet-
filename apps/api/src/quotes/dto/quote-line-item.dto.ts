import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum LineItemVisibility {
  SHOW_PRICE = 'SHOW_PRICE',
  DESCRIPTION_ONLY = 'DESCRIPTION_ONLY',
  MERGE_GROUP = 'MERGE_GROUP',
}

export class QuoteLineItemDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(LineItemVisibility)
  @IsOptional()
  visibility: LineItemVisibility = LineItemVisibility.SHOW_PRICE;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsString()
  @IsNotEmpty()
  priceMinor!: string; // minor units as string (e.g. "15000000" for 150,000.00 ETB)

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
