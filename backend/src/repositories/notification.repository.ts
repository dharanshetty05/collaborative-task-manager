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
}