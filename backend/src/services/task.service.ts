import { TaskRepository } from "../repositories/task.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { io } from "../server";
import { TaskPriority } from "@prisma/client";

export class TaskService {
    private taskRepo = new TaskRepository();
    private notificationRepo = new NotificationRepository();

    async createTask(data: {
        title: string;
        description: string;
        dueDate: Date;
        priority: TaskPriority;
        creatorId: string;
        assignedToId?: string;
    }) {
        const assignedToId = data.assignedToId ?? data.creatorId;

        const task = await this.taskRepo.create({
            ...data,
            assignedToId,
            status: "TODO"
        });

        // Notification created ONLY if assigned to someone else
        if(assignedToId !== data.creatorId) {
            const notification = await this.notificationRepo.create({
                userId: assignedToId,
                message: `You have been assigned a task: ${task.title}`
            });

            io.to(assignedToId).emit("notification:new", {
                notificationId: notification.id
            });
        }

        // Task update broadcasted
        io.emit("task:updated", task);
        return task;
    }

    async updateTask(taskId: string, userId: string, data: any) {
        const task = await this.taskRepo.findById(taskId);

        const prevTask = {
            status: task?.status,
            priority: task?.priority,
            assignedToId: task?.assignedToId
        };


        if (!task) throw new Error("Task not found");

        const canEdit =
            task.creatorId === userId ||
            task.assignedToId === userId;

        if (!canEdit) throw new Error("Forbidden");

        const normalizedData = {
            ...data,
            ...(data.dueDate && { dueDate: new Date(data.dueDate) })
        };

        const updated = await this.taskRepo.update(taskId, normalizedData);

        if (
            data.status &&
            data.status !== prevTask.status &&
            updated.assignedToId !== userId
        ) {
            const notification = await this.notificationRepo.create({
                userId: updated.assignedToId,
                message: `Task "${updated.title}" status changed to ${updated.status}`
            });

            io.to(updated.assignedToId).emit("notification:new", {
                notificationId: notification.id
            });
        }

        if (
    data.assignedToId &&
    data.assignedToId !== prevTask.assignedToId
) {
    // Notify new assignee
    if (data.assignedToId !== userId) {
        const notification = await this.notificationRepo.create({
            userId: data.assignedToId,
            message: `You have been assigned a task: ${updated.title}`
        });

        io.to(data.assignedToId).emit("notification:new", {
            notificationId: notification.id
        });
    }

    // Notify previous assignee (if exists and not actor)
    if (
        prevTask.assignedToId &&
        prevTask.assignedToId !== userId
    ) {
        const notification = await this.notificationRepo.create({
            userId: prevTask.assignedToId,
            message: `Task "${updated.title}" has been reassigned`
        });

        io.to(prevTask.assignedToId).emit("notification:new", {
            notificationId: notification.id
        });
    }
}

        io.to(task.creatorId).emit("task:updated", updated);
        io.to(task.assignedToId).emit("task:updated", updated);

        return updated;
    }


    // Delete task
    async deleteTask(taskId: string, userId: string) {
        const task = await this.taskRepo.findById(taskId);

        if(!task) {
            throw new Error("Task not found");
        }
        if(task.creatorId !== userId) {
            throw new Error("Forbidden");
        }

        await this.taskRepo.delete(taskId);
        io.emit("task:deleted", { taskId });
    }
    
    async getTasksForUser(
        userId: string,
        view?: "assigned" | "created" | "overdue"
    ) {
        return this.taskRepo.findForUser(userId, view);
    }

    async getTaskById(taskId: string, userId: string) {
        const task = await this.taskRepo.findById(taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        const canView =
            task.creatorId === userId ||
            task.assignedToId === userId;

        if (!canView) {
            throw new Error("Forbidden");
        }

        return task;
    }

}