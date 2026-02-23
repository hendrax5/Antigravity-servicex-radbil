"use client";

import { useState, useEffect } from "react";
import { Plus, Network, Server, MapPin, CheckCircle2, AlertTriangle, Users, GitMerge, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PopType {
    id: string;
    name: string;
    location: string;
    odps: OdpType[];
}

interface OdpType {
    id: string;
    name: string;
    location: string;
    portCount: number;
    customers: { id: string, status: string }[];
}

export default function InfrastructurePage() {
    const [pops, setPops] = useState<PopType[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isPopModalOpen, setIsPopModalOpen] = useState(false);
    const [isOdpModalOpen, setIsOdpModalOpen] = useState(false);
    const [selectedPopId, setSelectedPopId] = useState("");

    // Form State
    const [formData, setFormData] = useState({ name: "", location: "", portCount: "8", popId: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/infrastructure");
            if (res.ok) setPops(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInfra = async (e: React.FormEvent, type: "POP" | "ODP") => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = type === "POP"
                ? { type: "POP", name: formData.name, location: formData.location }
                : { type: "ODP", name: formData.name, location: formData.location, portCount: formData.portCount, popId: formData.popId || selectedPopId };

            const res = await fetch("/api/infrastructure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsPopModalOpen(false);
                setIsOdpModalOpen(false);
                setFormData({ name: "", location: "", portCount: "8", popId: "" });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const openOdpModal = (popId: string) => {
        setSelectedPopId(popId);
        setIsOdpModalOpen(true);
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Infrastructure Topology</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Map your physical network assets from Point of Presence (POP) to Optical Distribution Points (ODP).</p>
                </div>
                <button
                    onClick={() => setIsPopModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Add POP Location
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : pops.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <MapPin className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Infrastructure Mapped</h3>
                    <p className="text-muted-foreground max-w-md">Start by adding a Point of Presence (POP) representing your main distribution sites or server rooms.</p>
                </div>
            ) : (
                /* Topology List */
                <div className="space-y-6">
                    {pops.map((pop, i) => (
                        <motion.div
                            key={pop.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
                        >
                            {/* POP Header */}
                            <div className="p-5 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{pop.name}</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                            <MapPin className="w-3.5 h-3.5" /> {(pop.location || "No address provided")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4 hidden md:block">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total ODPs</p>
                                        <p className="text-xl font-bold leading-none">{pop.odps.length}</p>
                                    </div>
                                    <button onClick={() => openOdpModal(pop.id)} className="bg-background border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
                                        <Plus className="w-4 h-4" /> Add ODP
                                    </button>
                                </div>
                            </div>

                            {/* ODPs Grid */}
                            {pop.odps.length > 0 ? (
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-muted/5">
                                    {pop.odps.map(odp => {
                                        const activeCount = odp.customers.filter(c => c.status === "ACTIVE").length;
                                        const utilization = Math.round((odp.customers.length / odp.portCount) * 100);

                                        return (
                                            <div key={odp.id} className="bg-background border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-semibold">{odp.name}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${utilization > 80 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                        {odp.portCount} PORT
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                                                    <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{odp.location || "Unmapped"}</span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground font-medium flex items-center gap-1"><GitMerge className="w-3.5 h-3.5" /> Port Usage</span>
                                                        <span className="font-bold">{odp.customers.length} / {odp.portCount}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${utilization > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${utilization}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm bg-muted/5">
                                    No Optical Distribution Points (ODPs) registered under this POP.
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add POP Modal */}
            {isPopModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" /> Register New POP
                        </h2>
                        <form className="space-y-4" onSubmit={(e) => handleSaveInfra(e, "POP")}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">POP Name Identifier</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="e.g. POP-SERVER-01" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Physical Location</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Gedung Telkom Lt.2" />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsPopModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Creating..." : "Save POP"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Add ODP Modal */}
            {isOdpModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Network className="w-5 h-5 text-primary" /> Register New ODP
                        </h2>
                        <form className="space-y-4" onSubmit={(e) => handleSaveInfra(e, "ODP")}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">ODP Box Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="e.g. ODP-BDG-001" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Total Ports</label>
                                    <select value={formData.portCount} onChange={(e) => setFormData({ ...formData, portCount: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option value="4">4 Port Dropcore</option>
                                        <option value="8">8 Port Spliter</option>
                                        <option value="16">16 Port Spliter</option>
                                        <option value="24">24 Port Hub</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Parent POP</label>
                                    <select value={formData.popId || selectedPopId} onChange={(e) => setFormData({ ...formData, popId: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" disabled>
                                        {pops.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Pole Location / Address</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Tiang depan Indomaret Dipatiukur" />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsOdpModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Creating..." : "Save ODP Box"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
