/**
 * NotificationController
 *
 * This handles read-only access and read-state updates for user notifications.
 * All operations are scoped to the authenticated user to prevent cross-user access or mutation.
 *
 * This controller intentionally exposes minimal behavior: fetch notifications and mark notifications as read
 *
 * Creation of notifications is handled exclusively by domain services (e.g., task assignment side-effects), not by client requests.
 */


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