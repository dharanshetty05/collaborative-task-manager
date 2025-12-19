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
        // Task Created
        const task = await this.taskRepo.create({
            ...data,
            status: "TODO"
        });

        // Notification created ONLY if assigned to someone else
        if(data.assignedToId && data.assignedToId !== data.creatorId) {
            const notification = await this.notificationRepo.create({
                userId: data.assignedToId,
                message: `You have been assigned a task: ${task.title}`
            });

            // Socket emitted after DB write happens
            io.to(data.assignedToId).emit("notification:new", {
                notificationId: notification.id
            });
        }

        // Task update broadcasted
        io.emit("task:updated", task);

        // Simple health check
        console.log("Task created", task.id);
        console.log("Task created by", data.creatorId);

        return task;
    }

    async updateTask(id: string, data: any) {
        // Fetch existing task
        const existingTask = await this.taskRepo.findById(id);
        if (!existingTask) {
            throw new Error("Task not found");
        }

        // Detect assignment change
        const assignmentChanged = data.assignedToId && data.assignedToId !== existingTask.assignedToId;

        // Update task
        const updatedTask = await this.taskRepo.update(id, data);

        // Assignment side-effect handled ONLY if changed
        if (assignmentChanged && data.assignedToId !== existingTask.creatorId) {
            const notification = await this.notificationRepo.create({
                userId: data.assignedToId,
                message: `You have been assigned a task : ${updatedTask.title}`
            });
        } 

        // Emit task update
        io.emit("task:updated");

        return updatedTask;
    }

    // Delete task
    async deleteTask(id: string) {
        await this.taskRepo.delete(id);

        io.emit("task:updated", { id });

        return;
    }
    
    async getTasksForUser(
        userId: string,
        view?: "assigned" | "created" | "overdue"
    ) {
        return this.taskRepo.findForUser(userId, { view });
    }
}