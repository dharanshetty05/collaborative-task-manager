/**
 * useMe Hook
 *
 * React Query hook for fetching the currently authenticated user's profile.
 * Authentication state is treated as server-owned, and retries are disabled
 * to avoid repeated unauthorized requests.
 */

import { useQuery } from "@tanstack/react-query";
import { getMe } from "app/services/auth";

export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false
    });
}