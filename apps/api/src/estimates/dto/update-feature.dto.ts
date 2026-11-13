import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { EstimationMethod } from '@prisma/client';

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: 'Telebirr Payment Gateway Integration' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Webhook handlers, signature verification' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EstimationMethod })
  @IsEnum(EstimationMethod)
  @IsOptional()
  method?: EstimationMethod;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
