import prisma from "../utils/prisma";
import { Task, TaskPriority, TaskStatus } from "@prisma/client";

type TaskQueryFilers = {
    view?: "assigned" | "created" | "overdue";
};

export class TaskRepository {
    async create(data: {
        title: string;
        description: string;
        dueDate: Date;
        priority: TaskPriority;
        status?: TaskStatus;
        creatorId: string;
        assignedToId: string;
    }): Promise<Task> {
        return prisma.task.create({ data });
    }

    async findById(id: string): Promise<Task | null> {
        return prisma.task.findUnique({
            where: { id }
        });
    }

    async update(
        id: string,
        data: Partial<Omit<Task, "id" | "createdAt">>
    ): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Task> {
        return prisma.task.delete({
            where: { id }
        });
    }

    async findForUser(
        userId: string,
        filters?: TaskQueryFilers
    ) {
        const baseWhere: any = {
            OR: [
                { creatorId: userId },
                { assignedToId: userId}
            ]
        };

        if (filters?.view === "assigned") {
            baseWhere.assignedToId = userId;
        }

        if (filters?.view === "created") {
            baseWhere.creatorId = userId;
        }

        if (filters?.view === "overdue") {
            baseWhere.dueDate = {
                lt: new Date()
            };
            baseWhere.status = {
                not: "COMPLETED"
            };
        }

        return prisma.task.findMany({
            where: baseWhere,
            orderBy: { dueDate: "asc" }
        });
    }
}