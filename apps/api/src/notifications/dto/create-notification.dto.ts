import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationSeverity, NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, example: 'STALE_CATALOG_PRICE' })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({ enum: NotificationSeverity, default: 'INFO' })
  @IsEnum(NotificationSeverity)
  @IsOptional()
  severity?: NotificationSeverity;

  @ApiProperty({ description: 'Notification title', example: 'Catalog item price is stale' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Related entity type, e.g. CatalogItem' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsString()
  @IsOptional()
  entityId?: string;
}
