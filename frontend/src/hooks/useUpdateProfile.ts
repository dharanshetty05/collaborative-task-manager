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