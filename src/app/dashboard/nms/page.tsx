"use client";

import { useState, useEffect } from "react";
import { Activity, Router, Server, Zap, AlertTriangle, CheckCircle2, RefreshCw, BarChart3, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface RouterStatus {
    id: string;
    name: string;
    ipAddress: string;
    isOnline: boolean;
    latency: number;
    rxGbe: number;
    txGbe: number;
    cpuLoad: number;
}

interface OntDevice {
    id: string;
    serialNumber: string;
    status: string;
}

export default function NMSPage() {
    const [routers, setRouters] = useState<RouterStatus[]>([]);
    const [onts, setOnts] = useState<OntDevice[]>([]);
    const [loading, setLoading] = useState(true);

    // Checking individual OLT laser power state
    const [checkingLaserId, setCheckingLaserId] = useState("");
    const [laserInfo, setLaserInfo] = useState<{ [key: string]: { rx: string; tx: string; status: string } }>({});

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Auto-refresh NMS every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [resR, resO] = await Promise.all([
                fetch("/api/monitoring?type=routers"),
                fetch("/api/acs") // Get all TR-069 ONTs
            ]);
            if (resR.ok) setRouters(await resR.json());
            if (resO.ok) setOnts(await resO.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getLaserPower = async (deviceId: string) => {
        setCheckingLaserId(deviceId);
        try {
            const res = await fetch(`/api/monitoring?type=ont_laser&deviceId=${deviceId}`);
            if (res.ok) {
                const data = await res.json();
                setLaserInfo(prev => ({ ...prev, [deviceId]: data }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingLaserId("");
        }
    }

    const onlineRouters = routers.filter(r => r.isOnline).length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-500" /> Network Operations Center
                    </h1>
                    <p className="text-muted-foreground text-sm">Real-time Ping, SNMP Traffic, and Live FTTH Optical Power Monitoring.</p>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Auto-syncing every 15s</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MikroTik Core Routers Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Router className="w-6 h-6 text-primary" /> Core Routers (MikroTik)</h2>

                    {loading && routers.length === 0 ? (
                        <div className="h-64 border border-border rounded-2xl flex items-center justify-center bg-card"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : routers.map(router => (
                        <motion.div key={router.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">

                            {/* Status Indicator Bar */}
                            <div className={`absolute top-0 left-0 w-2 h-full ${router.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />

                            <div className="flex justify-between items-start mb-6 pl-4">
                                <div>
                                    <h3 className="font-bold text-lg">{router.name} <span className="text-xs font-mono text-muted-foreground ml-2">{router.ipAddress}</span></h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${router.isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                            {router.isOnline ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                        {router.isOnline && <span className="text-xs text-muted-foreground font-mono">Ping: {router.latency}ms</span>}
                                    </div>
                                </div>
                                <BarChart3 className={`w-6 h-6 ${router.isOnline ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                            </div>

                            {router.isOnline ? (
                                <div className="grid grid-cols-3 gap-4 pl-4">
                                    <div className="bg-muted/50 p-3 rounded-xl border border-border flex flex-col items-center text-center">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">RX Traffic</span>
                                        <span className="font-mono text-lg text-emerald-600 font-semibold">{router.rxGbe} <span className="text-xs text-emerald-600/70 block -mt-1">Mbps</span></span>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-xl border border-border flex flex-col items-center text-center">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">TX Traffic</span>
                                        <span className="font-mono text-lg text-blue-600 font-semibold">{router.txGbe} <span className="text-xs text-blue-600/70 block -mt-1">Mbps</span></span>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-xl border border-border flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-orange-500/10" style={{ height: `${router.cpuLoad}%`, bottom: 0, top: 'auto' }} />
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 relative z-10">CPU Load</span>
                                        <span className="font-mono text-lg text-orange-600 font-semibold relative z-10">{router.cpuLoad}%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-4 p-4 bg-red-500/5 rounded-xl border border-red-500/20 text-red-600 text-sm flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 shrink-0" /> Route Down! BGP/OSPF convergence may be occurring.
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* FTTH OLT & Laser Diagnostics Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Server className="w-6 h-6 text-primary" /> FTTH OLT Terminals</h2>

                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm">Live Optical Power (Laser) Tracking</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Detect fiber cuts (LOS Alarms) directly from the OLT without visiting the user's house.</p>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/10 text-muted-foreground font-medium text-xs">
                                    <tr>
                                        <th className="px-5 py-3">ONU Serial</th>
                                        <th className="px-5 py-3">TR-069 Status</th>
                                        <th className="px-5 py-3 text-right">Optical Power (OLT Macro)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {onts.map(ont => (
                                        <tr key={ont.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-3 font-mono font-medium">{ont.serialNumber}</td>
                                            <td className="px-5 py-3">
                                                {ont.status === "ONLINE" ?
                                                    <span className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> ONLINE</span> :
                                                    <span className="text-red-500 flex items-center gap-1.5 text-xs font-bold"><WifiOff className="w-3.5 h-3.5" /> OFFLINE</span>
                                                }
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {laserInfo[ont.id] ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-3 font-mono text-[11px]">
                                                            <span className="text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">RX: {laserInfo[ont.id].rx}</span>
                                                            <span className="text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">TX: {laserInfo[ont.id].tx}</span>
                                                        </div>
                                                        {laserInfo[ont.id].status === "LOS ALARM" && (
                                                            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded inline-block animate-pulse">FIBER CUT (LOS) DETECTED!</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => getLaserPower(ont.id)}
                                                        disabled={checkingLaserId === ont.id}
                                                        className="text-xs px-3 py-1.5 bg-background border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg transition-colors inline-flex items-center gap-2 font-medium disabled:opacity-50"
                                                    >
                                                        {checkingLaserId === ont.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                        Check Laser dBm
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {onts.length === 0 && (
                                        <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">No ONTs provisioned.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
