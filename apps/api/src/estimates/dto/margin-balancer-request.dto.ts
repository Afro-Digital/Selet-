import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class MarginBalancerRequestDto {
  @ApiProperty({
    description: 'ID of the module line whose margin is being changed',
    example: 'mod-a',
  })
  @IsString()
  @IsNotEmpty()
  changedLineId!: string;

  @ApiProperty({
    description: 'New margin for the changed module (e.g. 0.20 for 20%)',
    example: 0.2,
  })
  @IsNumber()
  @Min(0)
  @Max(0.95)
  newMargin!: number;

  @ApiProperty({ description: 'Target blended margin to lock (e.g. 0.30 for 30%)', example: 0.3 })
  @IsNumber()
  @Min(0)
  @Max(0.95)
  targetBlendedMargin!: number;

  @ApiPropertyOptional({
    description: 'Optional subset of line IDs to absorb the balancing difference',
    example: ['mod-b'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  balancingLineIds?: string[];
}
