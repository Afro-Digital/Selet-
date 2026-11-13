import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteStatus } from '@prisma/client';
import { QuoteLineItemDto } from './quote-line-item.dto';
import { QuoteMilestoneDto } from './quote-milestone.dto';
import { QuoteBrandingDto } from './create-quote.dto';

export class UpdateQuoteDto {
  @IsEnum(QuoteStatus)
  @IsOptional()
  status?: QuoteStatus;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientTin?: string;

  @IsString()
  @IsOptional()
  clientContact?: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

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
  termsAndConditions?: string;

  @ValidateNested()
  @Type(() => QuoteBrandingDto)
  @IsOptional()
  branding?: QuoteBrandingDto;
}
