"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Shield, DollarSign, LogOut, MessageSquare, Loader2, Menu, X, Wifi } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // Ensure only CUSTOMER role can access /client
            if ((session?.user as any)?.role !== "CUSTOMER") {
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (status === "loading" || (session?.user as any)?.role !== "CUSTOMER") {
        return <div className="w-screen h-screen flex items-center justify-center bg-primary/10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
    }

    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between gap-3 mb-8 px-3 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg hidden sm:block md:hidden lg:block">Client Member Area</span>
                </div>
                {/* Close Button Mobile */}
                <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-4 flex-grow overflow-y-auto px-2 pb-6">
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">My Services</p>
                    <SidebarItem href="/client/dashboard" icon={<Wifi />} label="Connection Status" active={pathname === "/client/dashboard"} />
                </div>

                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">Billing & Invoices</p>
                    <SidebarItem href="/client/invoices" icon={<DollarSign />} label="My Invoices" active={pathname.startsWith("/client/invoices")} />
                </div>

                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">Help & Support</p>
                    <SidebarItem href="/client/tickets" icon={<MessageSquare />} label="Support Tickets" active={pathname.startsWith("/client/tickets")} />
                </div>
            </div>

            <div className="p-4 border-t border-border mt-auto">
                <div className="mb-4 px-2 hidden lg:block">
                    <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 hover:bg-red-500/10 rounded-lg font-medium transition-colors text-red-500 hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden lg:inline">Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-20 lg:w-72 border-r border-border bg-card p-4 shadow-sm z-20 shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Hamburger */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Client Area</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col p-4 shadow-2xl z-50 overflow-hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden w-full pt-16 md:pt-0">
                <div className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/10">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition-all relative overflow-hidden group ${active ? 'bg-primary text-primary-foreground font-semibold shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground font-medium'}`}>
            {active && (
                <motion.div layoutId="client-sidebar-active" className="absolute inset-0 bg-primary opacity-10" />
            )}
            <div className={`relative z-10 p-1 rounded-md ${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary transition-colors'}`}>
                {icon}
            </div>
            <span className="relative z-10 hidden lg:inline">{label}</span>
        </Link>
    );
}
