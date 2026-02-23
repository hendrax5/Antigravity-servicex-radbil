"use client";

import { useState, useEffect } from "react";
import { Copy, Link2, CreditCard, RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Network, Loader2, Router, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function AutomationSystemPage() {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<{ id: string; name: string; status: string }[] | null>(null);

    const handleRunIsolir = async () => {
        setRunning(true);
        setResults(null);
        try {
            const res = await fetch("/api/isolir", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setResults(data.isolatedCustomers);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">ISP Core Automation</h1>
                <p className="text-muted-foreground text-sm">Manage Auto-Isolir (Suspensions), Traffic Shaping (QoS), and OSPF Routing maps.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Auto-Isolir Panel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 bg-red-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Auto-Isolir Engine</h2>
                                <p className="text-xs text-muted-foreground">CRON-based suspension protocol.</p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6 relative z-10">The Isolir Engine scans the database for overdue Invoices. If found, it executes a MikroTik Radius macro to switch the PPPoE Secret to an `ISOLIR_PROFILE`, redirecting traffic to the Payment Gateway.</p>

                        <div className="bg-muted border border-border rounded-xl p-4 mb-6 relative z-10">
                            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wider text-muted-foreground">Radius Execution Log</h4>
                            <div className="font-mono text-xs space-y-2">
                                <div className="text-emerald-500">➜ Scan: 14:00:00 - Checking outstanding DB rows...</div>
                                {running ? (
                                    <div className="text-yellow-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Executing Winbox RouterOS Macro...</div>
                                ) : results ? (
                                    <>
                                        <div className="text-emerald-500">➜ Found {results.length} targets.</div>
                                        {results.map((r, i) => (
                                            <div key={i} className="text-red-500 ml-4">↳ SET pppoe-user profile=ISOLIR ({r.name})</div>
                                        ))}
                                        <div className="text-blue-500">➜ Operation completed.</div>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground opacity-50">➜ Standing by...</div>
                                )}
                            </div>
                        </div>

                        <button disabled={running} onClick={handleRunIsolir} className="mt-auto w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/20 disabled:opacity-50 relative z-10">
                            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Forced System Scan Now
                        </button>
                    </div>
                </motion.div>

                {/* QoS & OSPF Layout */}
                <div className="space-y-6">

                    {/* QoS Traffic Shaping */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-primary" /> QoS Traffic Shaping</h3>
                        <p className="text-sm text-muted-foreground mb-4">Automatically scales Simple Queues based on Fair Usage Policy (FUP) or Service Profiles.</p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-border bg-background rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm">Dynamic Queue Syncing</p>
                                    <p className="text-xs text-muted-foreground">Aligns Winbox queues with Dashboard Plans.</p>
                                </div>
                                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer ring-4 ring-primary/20">
                                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-border bg-background rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm">FUP Auto-Throttle (FUP)</p>
                                    <p className="text-xs text-muted-foreground">Drops users by 50% after 500GB usage.</p>
                                </div>
                                <div className="w-11 h-6 bg-muted rounded-full relative cursor-not-allowed border border-border">
                                    <div className="w-5 h-5 bg-muted-foreground rounded-full absolute left-0.5 top-0.5 shadow-sm opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* OSPF Visualizer Mock */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Network className="w-5 h-5 text-purple-500" /> BGP / OSPF Topology</h3>
                            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">LIVE MAP</span>
                        </div>

                        <div className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                            {/* Mock Graphic Map */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                            <div className="flex items-center gap-8 relative z-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-500 cursor-crosshair">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg"><Server className="w-5 h-5 text-white" /></div>
                                    <span className="text-[10px] font-bold">CORE-1</span>
                                </div>
                                <div className="h-0.5 w-16 bg-emerald-500 relative"><div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-600 bg-background px-1 rounded border border-emerald-200">ACTIVE</div></div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg"><Router className="w-5 h-5 text-white" /></div>
                                            <span className="text-[10px] font-bold">RTR-AREA2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-50 bg-background/50 px-2 py-1 rounded backdrop-blur">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-[9px] font-mono">Polling Neighbors...</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-3 text-center">Visual graphic represents dynamic routing data fetched via MikroTik API (<code>/routing ospf neighbor print</code>).</p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
