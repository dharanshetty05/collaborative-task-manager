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