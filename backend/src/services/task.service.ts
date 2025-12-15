import { TaskRepository } from "../repositories/task.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { io } from "../server";
import { title } from "node:process";

export class TaskService {
    private taskRepo = new TaskRepository();
    private notificationRepo = new NotificationRepository();

    async createTask(data: {
        title: string;
        description: string;
        dueDate: Date;
        priority: any;
        creatorId: string;
        assignedToId: string;
    }) {
        const task = await this.taskRepo.create({
            ...data,
            status: "TODO"
        });

        io.emit("task:updated", task);

        return task;
    }

    async updateTask(id: string, data: any) {
        const task = await this.taskRepo.update(id, data);

        io.emit("task:updated", task);

        if (data.assignedToId) {
            await this.notificationRepo.create({
                userId: data.assignedToId,
                message: `You have been assigned a task: ${task.title}`
            });

            io.emit("task:assigned", {
                taskId: task.id,
                assignedToId: data.assignedToId,
                title: task.title
            });
        }

        return task;
    }


    async deleteTask(id: string) {
        await this.taskRepo.delete(id);

        io.emit("task:updated", { id });

        return;
    }

    async getTasksForUser(userId: string) {
        return this.taskRepo.findForUser(userId);
    }
}