import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class ScaleEstimateInputDto {
  @ApiProperty({ example: 5000, description: 'Estimated monthly active users (MAU)' })
  @IsNumber()
  @Min(0)
  monthlyUsers!: number;

  @ApiPropertyOptional({ example: 50, description: 'Estimated peak concurrent users' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  peakConcurrency?: number;

  @ApiPropertyOptional({ example: 50, description: 'Estimated asset and database storage in GB' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  storageGb?: number;

  @ApiPropertyOptional({ example: 200, description: 'Estimated monthly outbound bandwidth in GB' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trafficGb?: number;

  @ApiPropertyOptional({
    example: 50000000,
    description:
      'Estimated monthly transaction payment volume in minor units (e.g. 500,000 ETB = 50,000,000 santim)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyPaymentVolumeMinor?: number;
}
