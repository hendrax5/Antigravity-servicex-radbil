"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search, MoreVertical, Loader2, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerType {
    id: string;
    username: string;
    name: string;
    phone: string | null;
    type: string;
    status: string;
    plan: { name: string; bandwidth: string };
    salesperson?: { id: string; name: string } | null;
    technician?: { id: string; name: string } | null;
    createdAt: string;
}

interface PlanType {
    id: string;
    name: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "", password: "", name: "", phone: "", type: "HOTSPOT", planId: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resCust, resPlans] = await Promise.all([
                fetch("/api/customers"),
                fetch("/api/plans")
            ]);

            if (resCust.ok) setCustomers(await resCust.json());
            if (resPlans.ok) setPlans(await resPlans.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ username: "", password: "", name: "", phone: "", type: "HOTSPOT", planId: "" });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Database</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage Hotspot users, PPPoE subscribers, and their active plans.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <Search className="w-4 h-4" />
                        </div>
                        <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm w-64 shadow-sm" />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Subscriber
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : customers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Customers Found</h3>
                    <p className="text-muted-foreground max-w-md">Onboard your first subscriber to start managing networking access and recurring billing.</p>
                </div>
            ) : (
                /* Table / List */
                <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium tracking-wider">Subscriber Info</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Service Type</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Active Plan</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.map((c, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        key={c.id} className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{c.name}</span>
                                                <span className="text-xs text-muted-foreground">@{c.username}</span>
                                                <span className="text-xs text-muted-foreground flex items-center mt-0.5 gap-1"><Phone className="w-3 h-3" /> {c.phone || "No phone"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] w-fit font-bold px-2 py-0.5 rounded tracking-wider ${c.type === 'HOTSPOT' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    {c.type}
                                                </span>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    Sales: <span className="text-foreground font-medium">{c.salesperson?.name || "Self/Admin"}</span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    Tech: <span className="text-foreground font-medium">{c.technician?.name || "Unassigned"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium bg-background px-2.5 py-1 rounded-lg border border-border shadow-sm inline-flex items-center gap-2">
                                                {c.plan?.name || "No Plan"}
                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{c.plan?.bandwidth || "-"}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                                                c.status === "EXPIRED" ? "bg-red-500/10 text-red-500" :
                                                    c.status === "PENDING_INSTALL" ? "bg-yellow-500/10 text-yellow-500" :
                                                        "bg-orange-500/10 text-orange-500"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500' : c.status === 'EXPIRED' ? 'bg-red-500' : c.status === 'PENDING_INSTALL' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                                                {c.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-6">Register Customer</h2>
                        <form className="space-y-4" onSubmit={handleSaveCustomer}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Full Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="John Doe" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Username (Login)</label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Password</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Phone Number</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="+62 812..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Connection</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option value="HOTSPOT">Hotspot / WiFi</option>
                                        <option value="PPPOE">PPPoE Dial-Up</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Assign Plan</label>
                                    <select value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required>
                                        <option value="" disabled>Select Plan...</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Creating..." : "Save Customer"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
