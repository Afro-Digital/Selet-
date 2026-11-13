import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-Commerce Platform Redesign' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Full revamp of Ethiopian artisan marketplace' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'client-uuid-here' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ example: 'ETB', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @ApiPropertyOptional({ example: 'E_COMMERCE' })
  @IsString()
  @IsOptional()
  templateCategory?: string;
}
