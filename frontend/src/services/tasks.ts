import api from "./api";

export async function createTask(data:{
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    assignedToId: string;
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
