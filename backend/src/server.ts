import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";

// Safety checks for JWT_SECRET and DATABASE_URL
if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
}

if(!process.env.DATABASE_URL){
    throw new Error("DATABASE_URL not defined");
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: true,
        credentials: true
    }
});

// io.use((socket, next) => {
//     try{
//         console.log("SOCKET AUTH PAYLOAD:", socket.handshake.auth);

//         const userId = socket.handshake.auth?.userId;

//         if(!userId) {
//             console.log("❌ SOCKET REJECTED: No userId");
//             throw next(new Error("Unauthorized"));
//         }

//         socket.data.userId = userId;
//         next();
//     } catch {
//         next(new Error("Unauthorized"));
//     }
// });

io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) {
        socket.disconnect();
        return;
    }

    socket.join(userId);
    console.log("User joined room:", userId);
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };