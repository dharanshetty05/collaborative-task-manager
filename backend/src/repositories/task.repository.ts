import prisma from "../utils/prisma";
import { Task, TaskPriority, TaskStatus } from "@prisma/client";

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
}