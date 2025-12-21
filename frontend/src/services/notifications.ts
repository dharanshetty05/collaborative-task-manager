/**
 * Notifications API
 *
 * This provides backend API helpers for fetching and updating user notifications. All notification data is treated as server truth and consumed via React Query.
 *
 * These functions are intentionally minimal and real-time updates are handled through socket-triggered query invalidation rather than client-side state mutation.
 */

import api from "./api";

export async function getNotifications() {
    const res = await api.get("/api/notifications");
    return res.data;
}

export async function markNotificationRead(id:string) {
    await api.patch(`/api/notifications/${id}/read`);
}