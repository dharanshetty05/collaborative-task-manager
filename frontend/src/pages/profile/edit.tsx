import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useMe } from "app/hooks/useMe";
import { useUpdateProfile } from "app/hooks/useUpdateProfile";

const schema = z.object({
    name: z.string().min(1)
});

type FormData = z.infer<typeof schema>;

export default function EditProfile() {
    const { data: me, isLoading } = useMe();
    const updateProfile = useUpdateProfile();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: me?.name
        }
    });

    if (isLoading) return null;
    if (!me) return null;

    const onSubmit = async (data: FormData) => {
        await updateProfile.mutateAsync(data);
        router.push("/profile");
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white border text-gray-500 rounded-lg p-6">

            {/* Back to Profile */}
            <button
                onClick={() => router.push("/profile")}
                className="text-sm text-gray-600 hover:text-black mb-4"
            >
                ← Back to Profile
            </button>
            
            <h1 className="text-lg font-semibold mb-4">Update Profile</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    placeholder="Enter the new name"
                    {...register("name")}
                    className="w-full border rounded px-3 py-2"
                />

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="border px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}