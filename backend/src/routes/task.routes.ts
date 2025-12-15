import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new TaskController();

router.post("/", authMiddleware, (req, res) => controller.create(req, res));
router.patch("/:id", authMiddleware, (req, res) => controller.update(req, res));
router.delete("/:id", authMiddleware, (req, res) => controller.delete(req, res));
router.get("/", authMiddleware, (req, res) => controller.list(req, res));

export default router;