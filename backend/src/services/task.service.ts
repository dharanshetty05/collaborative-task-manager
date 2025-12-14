import { TaskRepository } from "../repositories/task.repository";

export class TaskService {
    private taskRepo = new TaskRepository();

    async createTask(data: {
        title: string;
        description: string;
        dueDate: Date;
        priority: any;
        creatorId: string;
        assignedToId: string;
    }) {
        return this.taskRepo.create({
            ...data,
            status: "TODO"
        });
    }

    async updateTask(id: string, data: any) {
        return this.taskRepo.update(id, data);
    }

    async deleteTask(id: string) {
        return this.taskRepo.delete(id);
    }
}