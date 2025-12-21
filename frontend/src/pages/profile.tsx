import { useMe } from "app/hooks/useMe";
import { useRouter } from "next/router";

/* ---------------- Page ---------------- */

export default function Profile() {
    const { data: me, isLoading } = useMe();
    const router = useRouter();

    if (isLoading) return null;
    if (!me) return null;

    /* ---------------- UI ---------------- */

    return (
        <div className="mx-auto mt-12 max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white/70 p-8 text-slate-600 backdrop-blur shadow-sm">

            {/* Back */}
            <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-slate-500 hover:text-slate-900 transition"
            >
                ← Back to Dashboard
            </button>

            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Profile</h1>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <p><span className="font-medium text-slate-500">ID:</span> {me.id}</p>
                <p><span className="font-medium text-slate-500">Email:</span> {me.email}</p>
                <p><span className="font-medium text-slate-500">Name:</span> {me.name}</p>
            </div>

            <button
                onClick={() => router.push("/profile/edit")}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition">
                Update Profile
            </button>
        </div>
    )
}