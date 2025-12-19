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
        try{
            const data = updateTaskSchema.parse(req.body);        // Log check
            console.log("PATCH PAYLOAD AFTER ZOD:", data);
            const task = await service.updateTask(
                req.params.id, 
                req.userId!,
                data);
            res.json(task);
        } catch (err) {
            console.error("UPDATE TASK FAILED:", err);
            res.status(400).json({
                message: "Invalid update payload"
            });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        await service.deleteTask(req.params.id, req.userId!);
        res.status(204).send();
    }

    async list(req: AuthRequest, res: Response) {
        try {
            console.log("QUERY PARAMS:", req.query);
            console.log("USER ID:", req.userId);

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
        } catch (err) {
            console.error("LIST TASKS FAILED:", err);
            res.status(400).json({
                message: "Failed to fetch tasks"
            });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        const task = await service.getTaskById(
        req.params.id,
        req.userId!
        );

        res.json(task);
    }

}