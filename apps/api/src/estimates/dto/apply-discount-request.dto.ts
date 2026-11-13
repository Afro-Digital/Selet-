import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApplyDiscountRequestDto {
  @ApiProperty({ description: 'Discount percentage (e.g. 0.10 for 10%)', example: 0.1 })
  @IsNumber()
  @Min(0)
  @Max(0.99)
  discountPercent!: number;

  @ApiPropertyOptional({
    description: 'Optional target module line ID to discount (omit for full project discount)',
  })
  @IsOptional()
  @IsString()
  targetLineId?: string;

  @ApiPropertyOptional({
    description: 'Optional project floor margin to check feasibility against',
    example: 0.15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.95)
  projectFloorMargin?: number;
}
