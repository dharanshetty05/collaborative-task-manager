import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { authMiddleware, AuthRequest } from "./middleware/auth.middleware";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/error.middleware";
import notificationRoutes from "./routes/notification.routes"

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Using cookie parser to parse cookies
app.use(cookieParser());

// Centralized error handling
app.use(errorHandler)

// Test route for authMiddleware
app.get("/api/me", authMiddleware, (req: AuthRequest, res) => {
    res.json({ 
        id: req.userId
    });
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok"});
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/notifications", notificationRoutes)

export default app;