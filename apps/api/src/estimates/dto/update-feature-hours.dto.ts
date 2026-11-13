import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { TShirtSize } from '@prisma/client';

export class RoleHoursEntryDto {
  @ApiProperty({ example: 'role-uuid' })
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  optimisticHours?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  likelyHours?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pessimisticHours?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  singleHours?: number;

  @ApiPropertyOptional({ enum: TShirtSize, example: TShirtSize.M })
  @IsEnum(TShirtSize)
  @IsOptional()
  tshirtSize?: TShirtSize;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  storyPoints?: number;
}

export class UpdateFeatureHoursDto {
  @ApiProperty({ type: [RoleHoursEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleHoursEntryDto)
  roleHours!: RoleHoursEntryDto[];
}
