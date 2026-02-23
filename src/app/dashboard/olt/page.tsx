"use client";

import { useState } from "react";
import { Plus, Server, Activity, Search, RefreshCw, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Mocking OLT Data since we aren't connecting SSH out-of-the-box in MVP
const MOCK_OLTS = [
    { id: "1", name: "ZTE C320 Core", ip: "10.10.10.2", type: "ZTE", status: "ONLINE", totalOnu: 142, activeOnu: 138, uptime: "45d 12h" },
    { id: "2", name: "Huawei MA5608T", ip: "10.10.10.3", type: "HUAWEI", status: "OFFLINE", totalOnu: 89, activeOnu: 0, uptime: "-" }
];

export default function OltPage() {
    const [olts, setOlts] = useState(MOCK_OLTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">OLT Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Direct SSH/SNMP management for ZTE, Huawei, and HiSoft Fiber OLTs.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Add OLT Device
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {olts.map((olt, i) => (
                    <motion.div
                        key={olt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col gap-6 relative overflow-hidden"
                    >
                        <div className="absolute -bottom-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Server className="w-40 h-40" />
                        </div>

                        <div className="flex justify-between items-start z-10">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-xl border shadow-sm ${olt.status === 'ONLINE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                    <Server className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{olt.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-mono text-muted-foreground">{olt.ip}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase bg-muted border border-border`}>{olt.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 z-10 mb-2">
                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active ONUs
                                </p>
                                <p className="text-2xl font-bold">{olt.activeOnu}<span className="text-sm font-medium text-muted-foreground">/{olt.totalOnu}</span></p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5" /> Uptime
                                </p>
                                <p className="text-xl font-bold truncate">{olt.uptime}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 z-10 mt-auto">
                            <button className="flex-1 py-2 bg-background border border-border hover:bg-muted rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" /> Unconfigured
                            </button>
                            <button className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-primary/20">
                                <Terminal className="w-4 h-4" /> Terminal
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Modal Placeholder */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" /> Register OLT Device
                        </h2>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Device Name</label>
                                <input type="text" className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="e.g. Huawei POP 1" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">IP Address</label>
                                    <input type="text" className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="192.168.100.1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Vendor Profile</label>
                                    <select className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option value="ZTE">ZTE (C320/C620)</option>
                                        <option value="HUAWEI">Huawei (MA5608T)</option>
                                        <option value="HISOFT">HiSoft / VSOL</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Telnet/SSH User</label>
                                    <input type="text" className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Password</label>
                                    <input type="password" className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">Save OLT</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
