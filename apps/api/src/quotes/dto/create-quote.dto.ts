import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteLineItemDto } from './quote-line-item.dto';
import { QuoteMilestoneDto } from './quote-milestone.dto';

export class QuoteBrandingDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyTin?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @IsOptional()
  companyEmail?: string;

  @IsString()
  @IsOptional()
  companyPhone?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsString()
  @IsOptional()
  clientTin?: string;

  @IsString()
  @IsOptional()
  clientContact?: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  validDays?: number = 30;

  @IsString()
  @IsOptional()
  secondaryCurrency?: string; // 'USD' | 'EUR'

  @IsString()
  @IsOptional()
  language?: string = 'en'; // 'en' | 'am'

  @IsString()
  @IsOptional()
  calendar?: string = 'GREGORIAN'; // 'GREGORIAN' | 'ETHIOPIAN'

  @IsString()
  @IsOptional()
  executiveSummary?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  @IsOptional()
  lineItems?: QuoteLineItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteMilestoneDto)
  @IsOptional()
  milestones?: QuoteMilestoneDto[];

  @IsString()
  @IsOptional()
  presetName?: string; // e.g. "30/40/30"

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @ValidateNested()
  @Type(() => QuoteBrandingDto)
  @IsOptional()
  branding?: QuoteBrandingDto;

  @IsBoolean()
  @IsOptional()
  includeWithholdingNote?: boolean = true;
}
