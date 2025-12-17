import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: string) {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL!, {
            auth: { userId }
        });
    }
    return socket;
}

export function getSocket() {
    if (!socket) {
        throw new Error("Socket not connected");
    }
    return socket;
}

// export const socket = io(
//     process.env.NEXT_PUBLIC_API_URL!,
//     { 
//         withCredentials: true,
//         autoConnect: false
//     }
// );