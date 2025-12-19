import prisma from "../utils/prisma";
import { Notification } from "@prisma/client";

export class NotificationRepository {
    async create(data: {
        userId: string;
        message: string;
    }): Promise<Notification> {
        return prisma.notification.create({
            data
        });
    }

    async findForUser(userId: string): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    }

    async markAsRead(id: string, userId: string) {
        return prisma.notification.updateMany({
            where: { id, userId, isRead: false },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
}