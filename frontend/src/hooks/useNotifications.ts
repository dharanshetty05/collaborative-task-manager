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