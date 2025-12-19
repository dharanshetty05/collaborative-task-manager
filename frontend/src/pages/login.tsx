import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "app/services/auth";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

type FormData = z.infer<typeof schema>;

export default function Login() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        await loginUser(data);
        alert("Logged in");
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Welcome back
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign in to continue to your workspace
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        Login
                        <ArrowRight className="h-4 w-4" />
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
