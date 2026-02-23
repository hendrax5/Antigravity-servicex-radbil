"use client";

import { useEffect, useState } from "react";
import { Wifi, ShieldAlert, CreditCard, History, Clock, FileText, Router, HelpCircle, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ClientDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Wifi Self Service
    const [showWifiModal, setShowWifiModal] = useState(false);
    const [newWifiPassword, setNewWifiPassword] = useState("");
    const [submittingWifi, setSubmittingWifi] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleChangeWifi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWifiPassword || newWifiPassword.length < 8) return alert("Minimum 8 characters required for WiFi.");
        setSubmittingWifi(true);
        try {
            const res = await fetch("/api/client/wifi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: newWifiPassword })
            });
            const result = await res.json();
            if (res.ok) {
                alert("WiFi password updated and router reconnecting...");
                setShowWifiModal(false);
                setNewWifiPassword("");
                fetchDashboard(); // Refresh status
            } else {
                alert(result.error || "Failed to change WiFi password.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingWifi(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            const res = await fetch("/api/client/dashboard");
            if (res.ok) {
                setData(await res.json());
            }
        } catch (e) {
            console.error("Error fetching client dashboard:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center p-8 pb-20 overflow-auto"><span className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></span></div>;
    }

    if (!data || data.error) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <ShieldAlert className="w-16 h-16 mb-4 opacity-50 text-red-500" />
                <h2 className="text-xl font-bold text-foreground">Failed to load profile</h2>
                <p>We could not find your active internet subscription.</p>
            </div>
        );
    }

    const { profile, plan, network, recentInvoices, recentTickets } = data;

    return (
        <div className="p-4 md:p-8 space-y-6 sm:space-y-8 h-full flex flex-col pb-24">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hello, {profile?.name} 👋</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your {plan?.name} internet subscription.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-sm text-sm font-semibold">
                    Status:
                    <span className={`flex items-center gap-1.5 ${profile?.status === 'ACTIVE' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                        {profile?.status}
                    </span>
                </div>
            </div>

            {/* Top Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

                {/* Active Plan Widget */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary to-primary/80 border text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    {/* Decoration */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Current Plan</p>
                            <h2 className="text-3xl font-bold tracking-tight">{plan?.name}</h2>
                            <p className="text-white/90 text-sm mt-1">{plan?.bandwidth} Mbps</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm font-medium opacity-90">Rp {Number(plan?.price).toLocaleString('id-ID')} /mo</div>
                        </div>
                    </div>
                </motion.div>

                {/* Connection Widget */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Internet Connection</p>
                            <div className={`p-2 rounded-xl ${network?.connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {network?.connected ? <Wifi className="w-5 h-5" /> : <Router className="w-5 h-5" />}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {network?.connected ? 'Online' : 'Offline'}
                                {network?.connected && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            </h2>
                            {network?.connected ? (
                                <p className="text-muted-foreground text-sm mt-1">Uptime: {network.uptime}</p>
                            ) : (
                                <p className="text-red-500/80 text-sm mt-1">Router is disconnected</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Next Billing Widget */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Upcoming Bill</p>
                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                        {recentInvoices && recentInvoices.length > 0 && recentInvoices[0].status === "UNPAID" ? (
                            <div className="mt-4">
                                <h2 className="text-2xl font-bold">Rp {Number(recentInvoices[0].amount).toLocaleString('id-ID')}</h2>
                                <p className="text-orange-500 font-medium text-sm mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due {new Date(recentInvoices[0].dueDate).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <h2 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">All Paid! <CheckCircle2 className="w-6 h-6" /></h2>
                                <p className="text-muted-foreground text-sm mt-1">No outstanding balances.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

                {/* Recent Billing History */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5 text-muted-foreground" /> Recent Bills</h3>
                        <button className="text-sm font-semibold text-primary hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {recentInvoices && recentInvoices.length > 0 ? (
                            recentInvoices.map((inv: any) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="p-2.5 bg-background rounded-lg border border-border/50 text-muted-foreground hidden sm:block">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Invoice INV-{inv.id.substring(inv.id.length - 6).toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">Rp {Number(inv.amount).toLocaleString('id-ID')}</div>
                                        <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            inv.status === 'UNPAID' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
                                No invoice history found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Self Service & Support */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-muted-foreground" /> Self Service</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* WiFi Settings Quick Action */}
                        <div onClick={() => setShowWifiModal(true)} className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                                <Wifi className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Change WiFi Password</h4>
                            <p className="text-xs text-muted-foreground mt-1 mb-3">Update your router's wireless password instantly.</p>
                            <a className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Setup WiFi <ChevronRight className="w-3 h-3" /></a>
                        </div>

                        {/* Report Issue Quick Action */}
                        <div onClick={() => window.location.href = '/client/tickets'} className="p-4 rounded-xl border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors">Report Connection Issue</h4>
                            <p className="text-xs text-muted-foreground mt-1 mb-3">Experiencing slow speeds or LOS light on modem?</p>
                            <a className="text-xs font-semibold text-orange-500 flex items-center gap-1 group-hover:gap-2 transition-all">Open Ticket <ChevronRight className="w-3 h-3" /></a>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Tickets</h4>
                        {recentTickets && recentTickets.length > 0 ? (
                            <div className="space-y-3">
                                {recentTickets.map((t: any) => (
                                    <div key={t.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
                                        <p className="font-medium text-sm truncate pr-4">{t.subject}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">No active support tickets.</p>
                        )}
                    </div>
                </div>

            </div>

            {/* WiFi Change Password Modal */}
            {showWifiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl relative">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-primary" /> Change WiFi
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Enter a new password for your wireless router. It will take effect immediately.</p>

                        <form onSubmit={handleChangeWifi} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">New Password</label>
                                <input
                                    required
                                    value={newWifiPassword}
                                    onChange={(e) => setNewWifiPassword(e.target.value)}
                                    type="text"
                                    minLength={8}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowWifiModal(false)} className="px-5 py-2 hover:bg-muted rounded-xl font-medium transition-colors">Cancel</button>
                                <button disabled={submittingWifi} type="submit" className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2">
                                    {submittingWifi ? <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></span> : "Save & Restart"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
