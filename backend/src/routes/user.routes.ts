import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new AuthController();

// Profile APIs
router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.patch("/me", authMiddleware, (req, res) => controller.updateProfile(req, res));

router.get("/users", authMiddleware, controller.list);
export default router;