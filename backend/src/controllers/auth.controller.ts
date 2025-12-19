import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema, updateProfileSchema } from "../dto/auth.dto";
import { AuthRequest } from "../middleware/auth.middleware";
import { UserRepository } from "../repositories/user.repository";

const authService = new AuthService();
const repo = new UserRepository();

export class AuthController {
    async register(req: Request, res: Response) {
        const data = registerSchema.parse(req.body);
        const { user, token } = await authService.register(
            data.name,
            data.email,
            data.password
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }

    async login(req: Request, res: Response) {
        const data = loginSchema.parse(req.body);
        const { user, token } = await authService.login(
            data.email,
            data.password
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }

    async logout(_req: Request, res: Response) {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({ message: "Logged out successfully" });
    }

    // Fetches User Profile information
    async me(req: AuthRequest, res: Response) {
        const userId = req.userId!;
        const user = await authService.getMe(userId);
        res.json(user);
    }

    async updateProfile(req: AuthRequest, res: Response) {
        const userId = req.userId!;
        const data = updateProfileSchema.parse(req.body);

        const updatedUser = await authService.updateProfile(
            userId,
            data.name
        );
        
        res.json(updatedUser);
    }

    async list(req: AuthRequest, res: Response) {
        const users = await repo.findAll();
        res.json(users);
    }
}