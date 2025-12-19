import { useMe } from "app/hooks/useMe";
import { useRouter } from "next/router";

export default function Profile() {
    const { data: me, isLoading } = useMe();
    const router = useRouter();

    if (isLoading) return null;
    if (!me) return null;

    return (
        <div className="max-w-md mx-auto mt-10 bg-white border text-gray-500 rounded-lg p-6 space-y-4">

            {/* Back */}
            <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-600 hover:text-black"
            >
                ← Back to Dashboard
            </button>

            <h1 className="text-lg font-semibold">Profile</h1>

            <div className="space-y-2 text-sm">
                <p><span className="font-medium">ID:</span> {me.id}</p>
                <p><span className="font-medium">Email:</span> {me.email}</p>
                <p><span className="font-medium">Name:</span> {me.name}</p>
            </div>

            <button
                onClick={() => router.push("/profile/edit")}
                className="mt-4 bg-black text-white px-4 py-2 rounded">
                Update Profile
            </button>
        </div>
    )
}