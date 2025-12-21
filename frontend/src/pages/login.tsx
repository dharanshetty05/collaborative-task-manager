import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "app/services/auth";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Head from "next/head";

/* ---------------- Schemas ---------------- */

/**
 * Login form validation schema.
 *
 * Notes:
 * - Email must be a valid address
 * - Password length is validated client-side
 * - Authentication errors are handled by the API
 */
const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Minimum 6 characters")
});

type FormData = z.infer<typeof schema>;

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

/* ---------------- Page ---------------- */

export default function Login() {
    const router = useRouter();

    /* ---------------- Handlers ---------------- */

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            await loginUser(data);
            toast.success("Logged in successfully");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err?.message || "Login failed");
        }
    };

    /* ---------------- UI ---------------- */
    
    return (

    <>
        <Head>
            <title>Login · TaskFlow</title>
        </Head>
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
            {/* Back to home */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to home
            </button>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-sm"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="mb-6 text-center"
                >
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sign in to continue to your workspace
                    </p>
                </motion.div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    {/* Email */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="password"
                                {...register("password")}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </motion.div>

                    {/* Submit */}
                    <motion.button
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                    </motion.button>

                    {/* Footer */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-6 text-center"
                    >
                        <p className="text-sm text-slate-600">
                            Don’t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/register")}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                Create one
                            </button>
                        </p>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    </>
    );
}
