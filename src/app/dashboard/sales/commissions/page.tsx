"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, MoreHorizontal, FileText, CheckCircle2, XCircle, Search, Filter, TrendingUp, DollarSign, Users, ArrowUpRight } from "lucide-react";

interface Commission {
    id: string;
    amount: number;
    status: string;
    notes: string;
    createdAt: string;
    customer: {
        name: string;
        phone: string;
        plan: {
            price: number;
        } | null;
    };
    salesperson: {
        name: string;
    };
}

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pending: 0,
        approved: 0,
        totalSales: 0
    });

    useEffect(() => {
        setMounted(true);
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/commissions");
            if (res.ok) {
                const data = await res.json();
                setCommissions(data);

                // Calculate stats
                let total = 0;
                let pend = 0;
                let appr = 0;
                data.forEach((c: Commission) => {
                    if (c.status === "APPROVED" || c.status === "PAID") total += c.amount;
                    if (c.status === "PENDING") pend += c.amount;
                    if (c.status === "APPROVED") appr += c.amount;
                });

                setStats({
                    totalEarned: total,
                    pending: pend,
                    approved: appr,
                    totalSales: data.length
                });
            }
        } catch (error) {
            console.error("Failed to fetch commissions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Paid</span>;
            case "APPROVED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Approved</span>;
            case "PENDING":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">Pending</span>;
            case "REJECTED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 border border-red-500/20">Rejected</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20">{status}</span>;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Commissions</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track your earnings and referral statuses.</p>
                </div>
                <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                    <FileText className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Earned</h3>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">Rp {stats.totalEarned.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500 font-medium">+12%</span> from last month
                    </p>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Pending Payout</h3>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">Rp {stats.pending.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-muted-foreground mt-2">Awaiting review & approval</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Ready to Payout</h3>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">Rp {stats.approved.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-muted-foreground mt-2">Approved and awaiting transfer</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalSales}</p>
                    <p className="text-xs text-muted-foreground mt-2">Customers acquired</p>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="relative w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search commissions..."
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Salesperson</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading commissions...
                                    </td>
                                </tr>
                            ) : commissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <DollarSign className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-foreground">No commissions found</p>
                                            <p className="text-sm mt-1">When sales are made, commissions will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {item.customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">{item.customer.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{item.customer.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{item.salesperson.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">Rp {item.amount.toLocaleString('id-ID')}</div>
                                            {item.customer.plan?.price && (
                                                <div className="text-xs text-muted-foreground">Base: Rp {item.customer.plan.price.toLocaleString('id-ID')}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {mounted ? new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : "Loading..."}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
