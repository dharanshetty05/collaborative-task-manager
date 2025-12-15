import { Response } from "express";
import { TaskService } from "../services/task.service";
import { createTaskSchema, updateTaskSchema } from "../dto/task.dto";
import { AuthRequest } from "../middleware/auth.middleware";

const service = new TaskService();

export class TaskController {
    async create(req: AuthRequest, res: Response) {
        const data = createTaskSchema.parse(req.body);
        const task = await service.createTask({
            ...data,
            dueDate: new Date(data.dueDate),
            creatorId: req.userId!
        });
        res.status(201).json(task);
    }

    async update(req: AuthRequest, res: Response) {
        const data = updateTaskSchema.parse(req.body);
        const task = await service.updateTask(req.params.id, data);
        res.json(task);
    }

    async delete(req: AuthRequest, res: Response) {
        await service.deleteTask(req.params.id);
        res.status(204).send();
    }

    async list(req: AuthRequest, res: Response) {
        const tasks = await service.getTasksForUser(req.userId!);
        res.json(tasks);
    }
}