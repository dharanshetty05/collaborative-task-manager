import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useMe } from "app/hooks/useMe";
import { useUpdateProfile } from "app/hooks/useUpdateProfile";

/* ---------------- Schemas ---------------- */

const schema = z.object({
    name: z.string().min(1)
});

type FormData = z.infer<typeof schema>;

/* ---------------- Page ---------------- */

export default function EditProfile() {
    const { data: me, isLoading } = useMe();
    const updateProfile = useUpdateProfile();
    const router = useRouter();

    /* ---------------- Handlers ---------------- */

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

    /* ---------------- UI ---------------- */

    return (
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white/70 p-8 text-slate-600 backdrop-blur shadow-sm">

            {/* Back to Profile */}
            <button
                onClick={() => router.push("/profile")}
                className="mb-6 text-sm text-slate-500 hover:text-slate-900 transition"
            >
                ← Back to Profile
            </button>
            
            <h1 className="mb-6 text-xl font-semibold tracking-tight text-slate-900">Update Profile</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input
                    placeholder="Enter the new name"
                    {...register("name")}
                    className="w-full border rounded px-3 py-2"
                />

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateProfile.isPending}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300/40 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}