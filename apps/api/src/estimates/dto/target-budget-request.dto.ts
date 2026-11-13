import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class TargetBudgetRequestDto {
  @ApiProperty({ description: 'Client budget in minor units', example: 50000000 })
  @IsNotEmpty()
  budgetMinor!: number | string;

  @ApiPropertyOptional({ description: 'Minimum acceptable blended margin floor', example: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.95)
  floorBlendedMargin?: number;
}
