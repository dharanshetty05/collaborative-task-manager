/**
 * NotificationBell.tsx
 *
 * This displays a notification bell along with an unread count badge and a dropdown list of notifications.
 * Notifications are fetched from the backend and rendered from server truth using React Query.
 *
 * Clicking an unread notification marks it as read via an API call and immediately syncs UI
 * state by invalidating the notifications query. Real-time updates are handled externally
 * via socket events that trigger query invalidation.
 *
 * This ensures notifications are persistent, refresh-safe, and consistent across sessions.
 */

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
            {/* Bell Button for Notifications*/}
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

            {/* Dropdown which shows notifications (read and unread*/}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-10">
                    
                    {/* Check for no notifications */}
                    {data.length === 0 && (
                        <p className="p-3 text-sm text-gray-500">
                            No notifications
                        </p>
                    )}

                    {/* Fetch notifications */}
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