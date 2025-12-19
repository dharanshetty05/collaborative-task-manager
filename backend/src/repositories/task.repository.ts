import prisma from "../utils/prisma";
import { Task, TaskPriority, TaskStatus } from "@prisma/client";

type TaskUpdateInput = {
    title?: string;
    description?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedToId?: string;
};

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
        data: TaskUpdateInput
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
        view?: "assigned" | "created" | "overdue"
    ) {
        if (view === "assigned") {
            return prisma.task.findMany({
                where: { assignedToId: userId },
                orderBy: { dueDate: "asc" }
            });
        }

        if (view === "created") {
            return prisma.task.findMany({
                where: { creatorId: userId },
                orderBy: { dueDate: "asc" }
            });
        }

        if (view === "overdue") {
            return prisma.task.findMany({
                where: {
                    OR: [
                        { creatorId: userId },
                        { assignedToId: userId }
                    ],
                    dueDate: { lt: new Date() },
                    status: { not: "COMPLETED" }
                },
                orderBy: { dueDate: "asc" }
            });
        }

        // default: all visible tasks
        return prisma.task.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { assignedToId: userId }
                ]
            },
            orderBy: { dueDate: "asc" }
        });
    }

}