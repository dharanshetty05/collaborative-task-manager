import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotificationRepository } from "../repositories/notification.repository";

const repo = new NotificationRepository();

export class NotificationController {
    async list(req: AuthRequest, res: Response) {
        const notifications = await repo.findForUser(req.userId!);
        res.json(notifications);
    }

    async markRead(req: AuthRequest, res: Response) {
        await repo.markAsRead(req.params.id, req.userId!);
        res.status(204).send();
    }

    async markAllRead(req: AuthRequest, res: Response) {
        await repo.markAllAsRead(req.userId!);
        res.status(204).send();
    }
}