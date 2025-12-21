/**
 * useUsers
 *
 * React Query hook for fetching the list of users available for task assignment.
 * Fetching can be conditionally enabled to avoid unnecessary requests before
 * authentication is resolved.
 */

import { useQuery } from "@tanstack/react-query";
import api from "app/services/api";
import { User } from "app/types/user";

export function useUsers(enabled: boolean) {
    return useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get<User[]>("/api/users");
            return res.data;
        },
        enabled
    });
}