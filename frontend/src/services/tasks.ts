/**
 * Tasks API
 *
 * This module provides backend API helpers for creating, updating, and deleting tasks. All task data is treated as server-owned and synchronized on the client via React Query.
 *
 * Partial updates are supported, and real-time consistency is achieved through socket-triggered query invalidation rather than direct client-side mutations.
 */

import api from "./api";

export async function createTask(data:{
    title: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignedToId?: string;
}) {
    const res = await api.post("/api/tasks", data);
    return res.data;
}

export async function updateTask(id: string, data: any) {
    const res = await api.patch(`/api/tasks/${id}`, data);
    return res.data;
}

export async function deleteTask(id: string) {
    await api.delete(`/api/tasks/${id}`);
}
