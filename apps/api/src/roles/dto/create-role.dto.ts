import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role title, e.g. Senior Frontend Engineer',
    example: 'Senior Frontend Engineer',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Role description or responsibilities' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Default hourly cost in minor units (santim)',
    example: '45000',
  })
  @IsString()
  @IsOptional()
  defaultHourlyCostMinor?: string;

  @ApiPropertyOptional({ description: 'Currency code', default: 'ETB', example: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string;
}
