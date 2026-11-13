import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFloorsDto {
  @ApiPropertyOptional({
    example: 0.2,
    description: 'Absolute minimum acceptable project margin (0 to 1)',
  })
  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  minimumFloorMargin?: number;

  @ApiPropertyOptional({ example: 0.35, description: 'Target recommended margin' })
  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  targetMargin?: number;

  @ApiPropertyOptional({ example: 0.45, description: 'High stretch margin' })
  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  stretchMargin?: number;
}
