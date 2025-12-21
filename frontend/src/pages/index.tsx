import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, LogIn } from "lucide-react";

/* ---------------- Animations ---------------- */

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
};

/* ---------------- Page ---------------- */

export default function Home() {
    const router = useRouter();

    /* ---------------- UI ---------------- */

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
            
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur">

                <h1 className="text-sm font-semibold text-slate-900 tracking-wide">
                    Task<span className="text-indigo-600">Flow</span>
                </h1>

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => router.push("/login")}
                        className="text-sm text-slate-600 hover:text-slate-900 transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => router.push("/register")}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
                    >
                        Get started
                    </button>
                </div>

            </header>

            {/* Hero */}
            <section className="flex-1 flex items-center justify-center px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="max-w-3xl text-center"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight"
                    >
                        Organize work.
                        <br />
                        <span className="text-indigo-600">
                            Collaborate effortlessly.
                        </span>
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="mt-4 text-slate-600 text-base sm:text-lg"
                    >
                        Create tasks, assign ownership, track progress, and
                        collaborate in real time with a fast, reliable workflow.
                    </motion.p>

                    {/* Feature highlights */}
                    <motion.ul
                        variants={itemVariants}
                        className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
                    >
                        {[
                            "Secure access with role-based permissions",
                            "Live task updates without page refreshes",
                            "Validated inputs to prevent inconsistent data",
                            "Reliable task storage with transactional safety"
                        ]
                        .map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/70 p-4 backdrop-blur"
                            >
                                <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
                                <span className="text-sm text-slate-700">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </motion.ul>

                    {/* CTA */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => router.push("/register")}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition"
                        >
                            Create account
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => router.push("/login")}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm text-slate-700 hover:bg-slate-100 transition"
                        >
                            Sign in
                            <LogIn className="h-4 w-4" />
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </footer>
        </main>
    );
}
