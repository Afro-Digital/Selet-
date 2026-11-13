import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Checkout & Payment Processing' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Handles telebirr, chapa, cart calculations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'parent-module-uuid-for-wbs-hierarchy' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
