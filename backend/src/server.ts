import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: true,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };