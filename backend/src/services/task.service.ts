import { TaskRepository } from "../repositories/task.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { io } from "../server";

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

        if(data.assignedToId) {
            await this.notificationRepo.create({
                userId: data.assignedToId,
                message: `You have been assigned a task: ${task.title}`
            });

            io.to(data.assignedToId).emit("task:assigned", {
                taskId: task.id,
                title: task.title
            });
        }

        io.emit("task:updated", task);

        console.log("Task created", task.id);
        console.log("Task created by", data.creatorId);
        return task;
    }

    async updateTask(id: string, data: any) {
        const task = await this.taskRepo.update(id, data);

        io.emit("task:updated", task);

        if (data.assignedToId) {
            console.log("EMMITTING task: assigned to", data.assignedToId);
            
            await this.notificationRepo.create({
                userId: data.assignedToId,
                message: `You have been assigned a task: ${task.title}`
            });

            io.to(data.assignedToId).emit("task:assigned", {
                taskId: task.id,
                title: task.title
            });
        }
        console.log("Task assigned", {
            taskId: task.id,
            to: data.assignedToId
        });
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