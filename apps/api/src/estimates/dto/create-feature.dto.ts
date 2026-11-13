import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { EstimationMethod } from '@prisma/client';

export class CreateFeatureDto {
  @ApiProperty({ example: 'Telebirr Payment Gateway Integration' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Webhook handlers, signature verification, retry mechanism' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EstimationMethod, default: EstimationMethod.THREE_POINT })
  @IsEnum(EstimationMethod)
  @IsOptional()
  method?: EstimationMethod;

  @ApiPropertyOptional({ example: 'user-uuid-of-assigned-developer' })
  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
