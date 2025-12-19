import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new NotificationController();

router.get("/", authMiddleware, controller.list);
router.patch("/:id/read", authMiddleware, controller.markRead);
router.patch("/read-all", authMiddleware, controller.markAllRead);

export default router;