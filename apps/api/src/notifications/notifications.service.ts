import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationSeverity } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: {
        organizationId,
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateNotificationDto, organizationId: string) {
    // Avoid creating duplicate unread notifications for the same entity and type
    if (dto.entityType && dto.entityId) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          organizationId,
          type: dto.type,
          entityType: dto.entityType,
          entityId: dto.entityId,
          isRead: false,
        },
      });

      if (existing) {
        return existing;
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        organizationId,
        type: dto.type,
        severity: dto.severity || NotificationSeverity.INFO,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    // Optional email dispatch hook
    this.sendOptionalEmail(notification);

    return notification;
  }

  async markAsRead(id: string, organizationId: string) {
    return this.prisma.notification.updateMany({
      where: { id, organizationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(organizationId: string) {
    return this.prisma.notification.updateMany({
      where: { organizationId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, organizationId },
    });
  }

  private sendOptionalEmail(notification: any) {
    // If SMTP / email service configured in env, dispatch email; otherwise log
    const emailRecipient = process.env.NOTIFICATION_EMAIL;
    if (emailRecipient) {
      this.logger.log(
        `[Optional Email Dispatch] Sending alert to ${emailRecipient}: [${notification.severity}] ${notification.title}`,
      );
    } else {
      this.logger.debug(
        `In-app notification created: [${notification.type}] ${notification.title}`,
      );
    }
  }
}
