"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Users, Router as RouterIcon, Shield, DollarSign, LogOut, MessageSquare, MapPin, Briefcase, CreditCard, Wifi, MessageCircle, Workflow, Server, Zap, Moon, Sun, Menu, X, Loader2, Network } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (status === "loading") {
        return <div className="w-screen h-screen flex items-center justify-center bg-primary/10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const role = (session?.user as any)?.role || "ADMIN";

    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between gap-3 mb-8 px-3 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg hidden sm:block md:hidden lg:block">ServiceX Radbil</span>
                </div>

                {/* Theme Toggle within sidebar (Desktop) */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors hidden md:block lg:block"
                >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                {/* Close Button Mobile */}
                <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-4 flex-grow overflow-y-auto px-2 pb-6">

                {/* GENERAL */}
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Main</p>
                    <SidebarItem href="/dashboard" icon={<Activity />} label="Overview" active={pathname === "/dashboard"} />
                    <SidebarItem href="/dashboard/tickets" icon={<MessageSquare size={20} />} label="Support Tickets" active={pathname.startsWith("/dashboard/tickets")} />
                </div>

                {/* NETWORK & OPS */}
                {["ADMIN", "NOC", "MANAGER_TECH", "TECH_SUPPORT"].includes(role) && (
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">Network & Ops</p>

                        {["ADMIN", "NOC", "MANAGER_TECH"].includes(role) && (
                            <>
                                <SidebarItem href="/dashboard/automation" icon={<Zap />} label="Core Automation" active={pathname.startsWith("/dashboard/automation")} />
                                <SidebarItem href="/dashboard/routers" icon={<RouterIcon />} label="MikroTik Routers" active={pathname.startsWith("/dashboard/routers")} />
                                <SidebarItem href="/dashboard/acs" icon={<Wifi />} label="ONT Devices (TR-069)" active={pathname.startsWith("/dashboard/acs")} />
                                <SidebarItem href="/dashboard/infrastructure" icon={<MapPin size={20} />} label="Network Topology" active={pathname.startsWith("/dashboard/infrastructure")} />
                            </>
                        )}
                        <SidebarItem href="/dashboard/nms" icon={<Server />} label="Network Monitor (NMS)" active={pathname.startsWith("/dashboard/nms")} />
                        <SidebarItem href="/dashboard/sessions" icon={<Network />} label="Active Sessions" active={pathname.startsWith("/dashboard/sessions")} />
                        <SidebarItem href="/dashboard/provisioning" icon={<Workflow />} label="Zero-Touch Provisioning" active={pathname.startsWith("/dashboard/provisioning")} />
                    </div>
                )}

                {/* CRM & SALES */}
                {["ADMIN", "MANAGER_SALES", "SALES"].includes(role) && (
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">CRM & Sales</p>
                        <SidebarItem href="/dashboard/customers" icon={<Users />} label="Customers" active={pathname.startsWith("/dashboard/customers")} />
                        <SidebarItem href="/dashboard/sales/commissions" icon={<DollarSign size={20} />} label="Sales Commissions" active={pathname.startsWith("/dashboard/sales/commissions")} />

                        {["ADMIN", "MANAGER_SALES"].includes(role) && (
                            <SidebarItem href="/dashboard/resellers" icon={<Briefcase size={20} />} label="Resellers & Mitra" active={pathname.startsWith("/dashboard/resellers")} />
                        )}
                    </div>
                )}

                {/* BILLING & FINANCE */}
                {["ADMIN", "FINANCE"].includes(role) && (
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">Finance</p>
                        <SidebarItem href="/dashboard/plans" icon={<Shield />} label="Hotspot Plans" active={pathname.startsWith("/dashboard/plans")} />
                        <SidebarItem href="/dashboard/invoices" icon={<DollarSign size={20} />} label="Billing & Invoicing" active={pathname.startsWith("/dashboard/invoices")} />
                        <SidebarItem href="/dashboard/billing" icon={<CreditCard size={20} />} label="Payment Automation" active={pathname.startsWith("/dashboard/billing")} />
                    </div>
                )}

                {/* SYSTEM ADMIN */}
                {["ADMIN"].includes(role) && (
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 mt-2">System Content</p>
                        <SidebarItem href="/dashboard/users" icon={<Users size={20} />} label="Staff & Roles" active={pathname.startsWith("/dashboard/users")} />
                        <SidebarItem href="/dashboard/whatsapp" icon={<MessageCircle size={20} />} label="WhatsApp Gateway" active={pathname.startsWith("/dashboard/whatsapp")} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border mt-auto">
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-lg font-medium transition-colors text-red-500 hover:text-red-600">
                    <LogOut className="w-5 h-5" />
                    <span className="md:hidden lg:inline">Logout</span>
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
                    <span className="font-bold">ServiceX</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors">
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
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
        <Link href={href} className={`flex items-center gap-3 p-3 rounded-lg transition-all relative overflow-hidden group ${active ? 'bg-primary text-primary-foreground font-semibold shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground font-medium'}`}>
            {active && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary opacity-10" />
            )}
            <div className={`relative z-10 p-1 rounded-md ${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary transition-colors'}`}>
                {icon}
            </div>
            <span className="relative z-10 md:hidden lg:inline">{label}</span>
        </Link>
    );
}
