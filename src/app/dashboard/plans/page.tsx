"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Edit2, Trash2, Loader2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface PlanType {
    id: string;
    name: string;
    price: string;
    type: string;
    bandwidth: string;
    validity: number;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "", price: "", type: "HOTSPOT", bandwidth: "10M/10M", validity: 30
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/plans");
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // send price as decimal string/number based on prisma scale
                body: JSON.stringify({ ...formData, price: parseFloat(formData.price) }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", price: "", type: "HOTSPOT", bandwidth: "10M/10M", validity: 30 });
                fetchPlans();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleSyncQos = async (planId: string, bandwidth: string) => {
        setSyncingId(planId);
        try {
            const res = await fetch("/api/plans/qos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, newBandwidth: bandwidth }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchPlans(); // Refresh the active sub count or pure data if needed
            } else {
                alert("Failed to synchronize QoS on Routers.");
            }
        } catch (e) {
            console.error("QoS Sync error:", e);
        } finally {
            setSyncingId(null);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create and manage Hotspot vouchers and PPPoE Profiles.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Plan
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Shield className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Plans Created</h3>
                    <p className="text-muted-foreground max-w-md">Start defining your bandwidth profiles and pricing structure to onboard customers.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider ${plan.type === 'HOTSPOT' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {plan.type}
                                </span>
                                <div className="flex space-x-1">
                                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold truncate mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-2xl font-black">Rp {Number(plan.price).toLocaleString("id-ID")}</span>
                                <span className="text-muted-foreground text-sm font-medium">/ {plan.validity} hari</span>
                            </div>

                            <div className="space-y-3 flex-grow bg-muted/30 -mx-6 -mb-6 p-6 border-t border-border mt-auto">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Bandwidth</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSyncQos(plan.id, plan.bandwidth)}
                                            disabled={syncingId === plan.id}
                                            className="text-[10px] uppercase font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                                            title="Sync bandwidth changes to all routers"
                                        >
                                            {syncingId === plan.id ? "Syncing..." : "Deploy QoS"}
                                        </button>
                                        <span className="font-medium font-mono bg-background px-2 py-0.5 rounded border border-border flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3 text-primary" />
                                            {plan.bandwidth}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Active Subs</span>
                                    <span className="font-semibold">0</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
                        <h2 className="text-xl font-bold mb-6">Create Service Plan</h2>
                        <form className="space-y-4" onSubmit={handleSavePlan}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Plan Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Bronze 10Mbps" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Service Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option value="HOTSPOT">Hotspot Voucher</option>
                                        <option value="PPPOE">PPPoE Profile</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Harga (Rp)</label>
                                    <input type="number" step="1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Bandwidth (Rx/Tx)</label>
                                    <input type="text" value={formData.bandwidth} onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm" placeholder="10M/10M" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Validity (Days)</label>
                                    <input type="number" min="1" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Deploying..." : "Create Plan"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
