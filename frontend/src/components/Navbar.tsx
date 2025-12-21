/**
 * Application Navbar
 *
 * Displays the current page title and provides global actions such as
 * notifications access, profile navigation, and logout.
 *
 * Logout clears authentication state, disconnects active sockets, and
 * resets cached server data to ensure a clean session transition.
 */

import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "app/services/auth";
import { disconnectSocket } from "app/services/socket";
import NotificationBell from "./NotificationBell";

type Props = {
  title?: string;
};

/* ---------------- Page ---------------- */

export default function Navbar({ title = "Dashboard" }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logoutUser();
    disconnectSocket();
    queryClient.clear();
    router.push("/login");
  };

  /* ---------------- UI ---------------- */
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <a
          href="/profile"
          className="text-sm text-gray-600 hover:text-black"
        >
          Profile
        </a>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-black"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
