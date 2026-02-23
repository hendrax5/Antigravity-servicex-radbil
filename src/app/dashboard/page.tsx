"use client";

import { useEffect, useState } from "react";
import { Users, Router, Shield, DollarSign, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardOverviewPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/stats");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8 pb-20 overflow-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }
    return (
        <div className="p-4 md:p-8 pb-20 overflow-auto h-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
            >
                <StatCard title="Active PPPoE" value={data?.stats?.activePppoe?.toString() || "0"} trend="+2%" icon={<Users className="w-5 h-5 text-blue-500" />} />
                <StatCard title="Active Hotspot" value={data?.stats?.activeHotspot?.toString() || "0"} trend="+5%" icon={<Shield className="w-5 h-5 text-purple-500" />} />
                <StatCard title="Registered Routers" value={data?.stats?.routers?.toString() || "0"} trend="Live" icon={<Router className="w-5 h-5 text-emerald-500" />} />
                <StatCard title="Monthly Revenue" value={`Rp ${data?.stats?.monthlyRevenue?.toLocaleString("id-ID") || "0"}`} trend="+12%" icon={<DollarSign className="w-5 h-5 text-primary" />} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 min-h-[400px]">
                    <h3 className="font-semibold text-lg mb-4">Revenue Trend (6 Months)</h3>
                    <div className="w-full h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.chartData || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                                    itemStyle={{ color: "var(--primary)" }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-lg mb-4">Recent Payments</h3>
                    <div className="space-y-4">
                        {data?.recentInvoices && data.recentInvoices.length > 0 ? (
                            data.recentInvoices.map((inv: any) => (
                                <div key={inv.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer">
                                    <div>
                                        <p className="text-sm font-medium">{inv.customerName}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-500">+Rp {inv.amount.toLocaleString("id-ID")}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                                No recent payments.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
    return (
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm">
                    {icon}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-muted-foreground text-sm mb-1">{title}</p>
                <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            </div>
        </div>
    );
}
