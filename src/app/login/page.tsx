"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            // Fetch session to determine role and redirect accordingly
            const session = await getSession();
            if (session && (session.user as any).role === "CUSTOMER") {
                window.location.href = "/client/dashboard";
            } else {
                window.location.href = "/dashboard";
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md p-8 bg-card rounded-3xl border border-border shadow-2xl shadow-primary/5"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex w-14 h-14 bg-primary/10 rounded-2xl items-center justify-center mb-4 border border-primary/20">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Sign in to your ServiceX workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Email or Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                placeholder="Email or Username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium">Password</label>
                            <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in to Dashboard"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Need an account? <a href="#" className="text-primary hover:underline font-medium">Contact Sales</a>
                </p>
            </motion.div>
        </div>
    );
}
