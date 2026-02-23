"use client";

import { useState, useEffect } from "react";
import { Network, Wifi, Activity, Server, Loader2, Clock, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface PppoeSession {
    id: string;
    name: string;
    service: string;
    callerId: string;
    address: string;
    uptime: string;
}

interface HotspotSession {
    id: string;
    server: string;
    user: string;
    address: string;
    macAddress: string;
    uptime: string;
    bytesIn: string;
    bytesOut: string;
}

export default function ActiveSessionsPage() {
    const [pppoeSessions, setPppoeSessions] = useState<PppoeSession[]>([]);
    const [hotspotSessions, setHotspotSessions] = useState<HotspotSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"PPPOE" | "HOTSPOT">("PPPOE");

    useEffect(() => {
        fetchSessions();
        // Optional: setup a polling interval for live updates
        const interval = setInterval(fetchSessions, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/monitoring/sessions");
            if (res.ok) {
                const data = await res.json();
                setPppoeSessions(data.pppoe || []);
                setHotspotSessions(data.hotspot || []);
            }
        } catch (e) {
            console.error("Failed to fetch sessions", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Live PPPoE and Hotspot users connected to NAS Routers.</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-1 flex">
                    <button
                        onClick={() => setActiveTab("PPPOE")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "PPPOE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                        <Globe className="w-4 h-4" /> PPPoE ({pppoeSessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("HOTSPOT")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "HOTSPOT" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                        <Wifi className="w-4 h-4" /> Hotspot ({hotspotSessions.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                {loading && pppoeSessions.length === 0 && hotspotSessions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-auto flex-1 p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                                {activeTab === "PPPOE" ? (
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Username</th>
                                        <th className="px-6 py-4 font-medium">IP Address</th>
                                        <th className="px-6 py-4 font-medium">MAC / Caller ID</th>
                                        <th className="px-6 py-4 font-medium">Service</th>
                                        <th className="px-6 py-4 font-medium text-right">Uptime</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Username</th>
                                        <th className="px-6 py-4 font-medium">IP Address</th>
                                        <th className="px-6 py-4 font-medium">MAC Address</th>
                                        <th className="px-6 py-4 font-medium">Server</th>
                                        <th className="px-6 py-4 font-medium text-right">Uptime</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activeTab === "PPPOE" && pppoeSessions.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No active PPPoE sessions found.</td></tr>
                                )}
                                {activeTab === "HOTSPOT" && hotspotSessions.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No active Hotspot sessions found.</td></tr>
                                )}

                                {activeTab === "PPPOE" && pppoeSessions.map((session, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={session.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-primary flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            {session.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{session.address}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{session.callerId}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">
                                                {session.service.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-1 font-mono text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            {session.uptime}
                                        </td>
                                    </motion.tr>
                                ))}

                                {activeTab === "HOTSPOT" && hotspotSessions.map((session, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={session.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-orange-500 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                            {session.user}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{session.address}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{session.macAddress}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{session.server}</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-1 font-mono text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            {session.uptime}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
