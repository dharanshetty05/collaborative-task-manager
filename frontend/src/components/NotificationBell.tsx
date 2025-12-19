import { useState } from "react";
import { useNotifications } from "app/hooks/useNotifications";
import { markNotificationRead } from "app/services/notifications";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationBell() {
    const { data, unreadCount, isLoading } = useNotifications();
    const [open, setOpen] = useState(false);

    const queryClient = useQueryClient();

    if (isLoading) return null;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2"
            >
                🔔

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-10">
                    {data.length === 0 && (
                        <p className="p-3 text-sm text-gray-500">
                            No notifications
                        </p>
                    )}

                    <ul>
                        {data.map((n:any) => (
                            <li
                                key={n.id}
                                onClick={async () => {
                                    if (!n.isRead) {
                                        await markNotificationRead(n.id);

                                        queryClient.invalidateQueries({
                                            queryKey: ["notifications"]
                                        });
                                    }
                                }}
                                className={`p-3 text-sm cursor-pointer border-b ${
                                    n.isRead
                                        ? "text-gray-500"
                                        : "font-semibold bg-gray-50"
                                }`}
                            >
                                {n.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}