import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: err.issues
        });
    }

    if (err.message === "Unauthorized") {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    return res.status(500).json({
        message: "Something went wrong"
    });
}