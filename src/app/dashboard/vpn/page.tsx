"use client";

import { useState, useEffect } from "react";
import { Plus, Network, Lock, Wifi, Server, Activity, Loader2, Link2, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface VpnType {
    id: string;
    username: string;
    type: string;
    serverIp: string;
    localIp: string;
    status: string;
    routerId: string;
}

interface RouterType {
    id: string;
    name: string;
}

export default function VpnPage() {
    const [vpns, setVpns] = useState<VpnType[]>([]);
    const [routers, setRouters] = useState<RouterType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "", password: "", type: "L2TP/IPsec", routerId: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resVpn, resRouters] = await Promise.all([
                fetch("/api/vpn"),
                fetch("/api/routers")
            ]);

            if (resVpn.ok) setVpns(await resVpn.json());
            if (resRouters.ok) setRouters(await resRouters.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVpn = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/vpn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ username: "", password: "", type: "L2TP/IPsec", routerId: "" });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        return status === "CONNECTED"
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20";
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">VPN Remote Manager</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create secure tunnels (PPTP/L2TP) for Mikrotik routers behind NAT.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Tunnel
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : vpns.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Network className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Remote Tunnels</h3>
                    <p className="text-muted-foreground max-w-md">Generate a VPN secret to tunnel your router for remote winbox / webfig API access over the cloud.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vpns.map((vpn, i) => (
                        <motion.div
                            key={vpn.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col gap-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Lock className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-muted rounded-xl border border-border shadow-sm">
                                        <Network className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{vpn.username}</h3>
                                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block border border-border">
                                            {vpn.type}
                                        </span>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(vpn.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${vpn.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {vpn.status}
                                </span>
                            </div>

                            <div className="space-y-3 z-10 flex-grow">
                                <div className="bg-background rounded-xl p-3 border border-border space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Server IP</span>
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded cursor-copy hover:bg-muted/80 transition-colors flex items-center gap-1 border border-border/50">
                                            {vpn.serverIp} <Copy className="w-3 h-3 opacity-50" />
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Remote IP</span>
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded cursor-copy hover:bg-muted/80 transition-colors flex items-center gap-1 border border-border/50 text-primary">
                                            {vpn.localIp} <Copy className="w-3 h-3 opacity-50" />
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                    <Link2 className="w-3.5 h-3.5" /> Bound to: <span className="font-medium text-foreground">{routers.find(r => r.id === vpn.routerId)?.name || 'Unknown Router'}</span>
                                </p>
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
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" /> Create VPN Key
                        </h2>
                        <form className="space-y-4" onSubmit={handleSaveVpn}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">VPN Username</label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">VPN Password</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Protocol Type</label>
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                    <option value="L2TP/IPsec">L2TP / IPsec (Recommended)</option>
                                    <option value="PPTP">PPTP (Legacy)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Assign to Router</label>
                                <select value={formData.routerId} onChange={(e) => setFormData({ ...formData, routerId: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required>
                                    <option value="" disabled>Select MikroTik Router...</option>
                                    {routers.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Generating..." : "Generate Secret"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
