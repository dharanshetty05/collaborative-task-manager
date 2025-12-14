import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Using cookie parser to parse cookies
app.use(cookieParser());

// Test route for authMiddleware
app.get("/api/me", authMiddleware, (req, res) => {
    res.json({ message: "You are authenticated" });
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok"});
});

app.use("/api/auth", authRoutes);

export default app;