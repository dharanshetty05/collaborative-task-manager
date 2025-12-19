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
        // Log check
        console.log("RAW BODY:", req.body);
        
        const data = updateTaskSchema.parse(req.body);

        // Log check
        console.log("PARSED DATA:", data);

        const task = await service.updateTask(req.params.id, data);
        res.json(task);
    }

    async delete(req: AuthRequest, res: Response) {
        await service.deleteTask(req.params.id);
        res.status(204).send();
    }

    async list(req: AuthRequest, res: Response) {
        const view = req.query.view as
            | "assigned"
            | "created"
            | "overdue"
            | undefined;
        
        const tasks = await service.getTasksForUser(
            req.userId!,
            view
        );

        res.json(tasks);
    }
}