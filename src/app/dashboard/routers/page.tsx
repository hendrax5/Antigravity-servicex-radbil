"use client";

import { useState, useEffect } from "react";
import { Plus, Router as RouterIcon, Edit2, Trash2, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface RouterType {
    id: string;
    name: string;
    ipAddress: string;
    apiPort: number;
    status: string;
    vpnIp: string | null;
}

export default function RoutersPage() {
    const [routers, setRouters] = useState<RouterType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "", ipAddress: "", username: "", password: "", apiPort: 8728, vpnIp: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRouters();
    }, []);

    const fetchRouters = async () => {
        try {
            const res = await fetch("/api/routers");
            if (res.ok) {
                const data = await res.json();
                setRouters(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRouter = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/routers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", ipAddress: "", username: "", password: "", apiPort: 8728, vpnIp: "" });
                fetchRouters(); // Refresh list
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
                    <h1 className="text-3xl font-bold tracking-tight">Routers & Devices</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage MikroTik routers and network gateways.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Router
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : routers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <RouterIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Routers Found</h3>
                    <p className="text-muted-foreground max-w-md">Get started by connecting your first MikroTik router to monitor and manage its Hotspot and PPPoE services.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routers.map((router, i) => (
                        <motion.div
                            key={router.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col gap-5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                <RouterIcon className="w-24 h-24 text-primary" />
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl border ${router.status === "ONLINE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold truncate max-w-[160px]">{router.name}</h3>
                                        <p className="text-xs text-muted-foreground font-mono">{router.ipAddress}:{router.apiPort}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="z-10 bg-muted/50 rounded-xl p-4 space-y-2 border border-border/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">VPN IP:</span>
                                    <span className="font-mono">{router.vpnIp || "-"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`font-semibold ${router.status === "ONLINE" ? "text-emerald-500" : "text-red-500"}`}>
                                        {router.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-auto z-10">
                                <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
                        <h2 className="text-xl font-bold mb-6">Add MikroTik Router</h2>
                        <form className="space-y-4" onSubmit={handleSaveRouter}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Router Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Core Utama" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">IP Address / Domain</label>
                                <input type="text" value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="192.168.1.1" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Username</label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Password</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">API Port</label>
                                    <input type="number" value={formData.apiPort} onChange={(e) => setFormData({ ...formData, apiPort: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">VPN IP (Optional)</label>
                                    <input type="text" value={formData.vpnIp} onChange={(e) => setFormData({ ...formData, vpnIp: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="10.8.0.x" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Saving..." : "Save Router"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
