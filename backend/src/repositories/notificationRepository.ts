import type { Notification, NotificationStatus, NotificationType } from '@prisma/client';
import { prisma } from './base';

export interface NotificationCreateData {
  projectId: string;
  recipientEmail: string;
  type: NotificationType;
  message: string;
}

export interface NotificationStatusUpdate {
  status: NotificationStatus;
  errorMessage?: string | null;
  sentAt?: Date | null;
}

export interface INotificationRepository {
  create(data: NotificationCreateData): Promise<Notification>;
  updateStatus(id: string, data: NotificationStatusUpdate): Promise<Notification>;
}

export class PrismaNotificationRepository implements INotificationRepository {
  async create(data: NotificationCreateData): Promise<Notification> {
    return prisma.notification.create({
      data: {
        projectId: data.projectId,
        recipientEmail: data.recipientEmail,
        type: data.type,
        message: data.message,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(id: string, data: NotificationStatusUpdate): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        status: data.status,
        errorMessage: data.errorMessage ?? null,
        sentAt: data.sentAt ?? null,
      },
    });
  }
}

export const notificationRepository: INotificationRepository = new PrismaNotificationRepository();
