import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCatalogItemDto } from './create-catalog-item.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCatalogItemDto extends PartialType(CreateCatalogItemDto) {
  @ApiPropertyOptional({ description: 'Mark item as verified as of now', default: false })
  @IsBoolean()
  @IsOptional()
  markVerified?: boolean;
}
