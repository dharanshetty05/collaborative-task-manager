import api from "./api";

export async function getNotifications() {
    const res = await api.get("/notifications");
    return res.data;
}

export async function markNotificationRead(id:string) {
    await api.patch(`/notifications/${id}/read`);
}