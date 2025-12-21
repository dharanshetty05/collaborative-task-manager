/**
 * useNotifications (Hook)
 *
 * This is a centralized hook for fetching user notifications from the backend.
 * Uses React Query to keep notifications in sync with server truth.
 *
 * Derives `unreadCount` from persisted notification data instead of
 * relying on local state or socket payloads, ensuring correctness
 * across refreshes, tab switches, and reconnects.
 *
 * Socket events only invalidate this query; they never mutate state directly.
 */

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "app/services/notifications";

export function useNotifications() {
    const query = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications
    });

    const unreadCount = query.data?.filter((n: any) => !n.isRead).length ?? 0;

    return {
        ...query,
        unreadCount
    };
}