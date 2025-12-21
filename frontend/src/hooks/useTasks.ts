/**
 * useTasks Hook
 *
 * React Query hook for fetching tasks based on the selected view
 * (all, assigned, created, or overdue).
 *
 * Task data is treated as server-owned and synchronized via query
 * invalidation triggered by real-time socket events.
 */

import { useQuery } from "@tanstack/react-query";
import api from "app/services/api";

export function useTasks(
    enabled: boolean,
    view: "assigned" | "created" | "overdue"  | "all"
) {
    return useQuery({
        queryKey: ["tasks", view],
        queryFn: async () => {
            const params = view === "all" ? {} : { view };
            const res = await api.get("/api/tasks", { params });
            return res.data;
        },
        enabled
    });
}