/**
 * useUpdateProfile
 *
 * React Query mutation for updating the authenticated user's profile.
 * On success, the cached user data is updated to keep client state in sync
 * without triggering an additional fetch.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "app/services/auth";

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(["me"], data);
        }
    });
}