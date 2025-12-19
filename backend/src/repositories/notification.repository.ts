/**
 * NotificationRepository
 *
 * This encapsulates all database operations related to user notifications.
 * Provides persistence, retrieval, and read-state updates while ensuring all mutations are safely scoped to the owning user.
 *
 * This repository is intentionally minimal and is consumed by domain services (for creation) and controllers (for read-state updates).
 */

import prisma from "../utils/prisma";
import { Notification } from "@prisma/client";

export class NotificationRepository {
    // create notification
    async create(data: {
        userId: string;
        message: string;
    }): Promise<Notification> {
        return prisma.notification.create({
            data
        });
    }

    // fetch notification based on UserId
    async findForUser(userId: string): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    }
    // mark notifications as read
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