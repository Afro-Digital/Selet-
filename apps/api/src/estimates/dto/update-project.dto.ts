import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'E-Commerce Platform Redesign' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'client-uuid' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ example: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @ApiPropertyOptional({ example: 'E_COMMERCE' })
  @IsString()
  @IsOptional()
  templateCategory?: string;
}
