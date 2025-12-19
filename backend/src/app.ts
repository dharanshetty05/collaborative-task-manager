import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { authMiddleware, AuthRequest } from "./middleware/auth.middleware";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/error.middleware";
import notificationRoutes from "./routes/notification.routes"
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Using cookie parser to parse cookies
app.use(cookieParser());

// Simple health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok"});
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/notifications", notificationRoutes)
app.use("/api", userRoutes);

// Centralized error handling
app.use(errorHandler)

export default app;