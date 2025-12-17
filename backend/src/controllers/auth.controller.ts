import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../dto/auth.dto";

const authService = new AuthService();

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
            secure: false
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
            secure: false
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
            secure: false
        });

        res.status(200).json({ messaage: "Logged out successfully" });
    }
}