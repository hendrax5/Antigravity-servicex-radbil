"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, CheckCircle2, Clock, Loader2, User, Phone, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface CommissionType {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    customer: {
        name: string;
        phone: string;
        status: string;
        plan: { price: number };
    };
    salesperson: {
        name: string;
    };
}

export default function SalesCommissionsPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "ADMIN";

    const [commissions, setCommissions] = useState<CommissionType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/commissions");
            if (res.ok) {
                setCommissions(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalEarned = commissions.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);
    const totalPending = commissions.filter(c => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0);

    // Sort logic: show PENDING first to emphasize what they are waiting on
    const sortedCommissions = [...commissions].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Commissions</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Track your customer onboarding bonuses and incentive payouts.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-card border border-border px-5 py-2.5 rounded-xl shadow-sm text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pending Payouts</p>
                        <p className="text-xl font-bold text-yellow-500">Rp {totalPending.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-xl text-center">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Total Earned</p>
                        <p className="text-xl font-bold text-primary">Rp {totalEarned.toLocaleString("id-ID")}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : commissions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <DollarSign className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Commissions Yet</h3>
                    <p className="text-muted-foreground max-w-md">Start onboarding subscribers into the pending install queue to earn your first commission metric.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCommissions.map((commission, i) => (
                        <motion.div
                            key={commission.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col gap-4 relative"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-bold text-lg leading-tight line-clamp-2">Rp {commission.amount.toLocaleString("id-ID")}</h3>
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border 
                                    ${commission.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                                `}>
                                    {commission.status === "PAID" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                    {commission.status}
                                </span>
                            </div>

                            <div className="space-y-2.5 py-4 border-y border-border/50 flex-grow">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4 opacity-70" /> {commission.customer?.name}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Zap className="w-4 h-4 opacity-70" /> Status:
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-widest">{commission.customer?.status.replace("_", " ")}</span>
                                </div>

                                {["ADMIN", "MANAGER_SALES"].includes(role) && (
                                    <div className="bg-muted p-2 rounded-lg mt-3 text-xs flex justify-between">
                                        <span className="text-muted-foreground">Registered By:</span>
                                        <span className="font-semibold">{commission.salesperson?.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Generated {new Date(commission.createdAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
