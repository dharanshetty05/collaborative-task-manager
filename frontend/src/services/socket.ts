/**
 * Socket Client
 *
 * This module manages the lifecycle of a single Socket.IO client instance used
 * for real-time updates such as task changes and notifications.
 *
 * The socket connection is user-scoped and initialized lazily. All real-time
 * events are consumed as side effects to invalidate React Query caches rather
 * than mutating client state directly.
 */


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

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket() {
    if (!socket) {
        throw new Error("Socket not connected");
    }
    return socket;
}
