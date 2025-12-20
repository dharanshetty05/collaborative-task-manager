import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, LogIn } from "lucide-react";

export default function Home() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white flex flex-col">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h1 className="text-sm font-semibold text-slate-900">
                    TaskFlow
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-sm text-slate-600 hover:text-slate-900"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => router.push("/register")}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Get started
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="flex-1 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-3xl text-center"
                >
                    <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight">
                        Collaborative task management,
                        <br />
                        built for modern teams
                    </h2>

                    <p className="mt-4 text-slate-600 text-base sm:text-lg">
                        Create tasks, assign ownership, track progress, and collaborate
                        in real time with a fast, reliable workflow.
                    </p>

                    {/* Feature highlights */}
                    <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        {[
                            "Secure authentication with HttpOnly cookies",
                            "Real-time updates powered by Socket.io",
                            "Strict input validation with Zod",
                            "Reliable data persistence using PostgreSQL and Prisma"
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-slate-900 mt-0.5" />
                                <span className="text-sm text-slate-700">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push("/register")}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Create account
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => router.push("/login")}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Sign in
                            <LogIn className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </footer>
        </main>
    );
}
