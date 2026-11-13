import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateModuleDto {
  @ApiPropertyOptional({ example: 'Checkout & Payment Processing' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Handles telebirr, chapa, cart calculations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'parent-module-uuid' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
