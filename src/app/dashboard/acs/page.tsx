"use client";

import { useState, useEffect } from "react";
import { Plus, Router, Wifi, Terminal, RefreshCw, Power, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OntDeviceType {
    id: string;
    serialNumber: string;
    macAddress: string;
    model: string;
    firmware: string;
    status: string;
    lastInform: string;
    customer?: { name: string };
}

interface CustomerType {
    id: string;
    name: string;
}

export default function AcsManagementPage() {
    const [devices, setDevices] = useState<OntDeviceType[]>([]);
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [rebootingId, setRebootingId] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ serialNumber: "", macAddress: "", model: "ZTE F609", customerId: "" });
    const [saving, setSaving] = useState(false);

    // ACS Settings State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [acsConfig, setAcsConfig] = useState({ acsUrl: "", acsAuthToken: "" });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setAcsConfig({
                    acsUrl: data.acsUrl || "",
                    acsAuthToken: data.acsAuthToken || ""
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(acsConfig),
            });
            if (res.ok) {
                setIsSettingsModalOpen(false);
                alert("ACS settings saved.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchData = async () => {
        try {
            const [resDev, resCust] = await Promise.all([
                fetch("/api/acs"),
                fetch("/api/customers")
            ]);
            if (resDev.ok) setDevices(await resDev.json());
            if (resCust.ok) setCustomers(await resCust.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleManualAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/acs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ serialNumber: "", macAddress: "", model: "ZTE F609", customerId: "" });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoteReboot = async (serialNumber: string, id: string) => {
        setRebootingId(id);
        try {
            await fetch("/api/acs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REBOOT", serialNumber })
            });

            // Trigger a quick UI feedback
            setTimeout(() => setRebootingId(""), 2500);
        } catch (e) {
            console.error(e);
            setRebootingId("");
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">TR-069 Device Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Provision, reboot, and monitor customer ONTs remotely via Auto Configuration Server (GenieACS).</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsSettingsModalOpen(true)} className="bg-background border border-border hover:bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
                        <Terminal className="w-4 h-4" /> Configure ACS
                    </button>
                    <button onClick={fetchData} className="bg-background border border-border hover:bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" /> Sync ACS
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Manual Provision
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : devices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Router className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Devices Registered</h3>
                    <p className="text-muted-foreground max-w-md">Ensure your ONTs are configured with the correct ACS URL (e.g. `http://acs.yourdomain.com:7547`) to auto-register here.</p>
                </div>
            ) : (
                /* Device List Table */
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-6 py-4">Serial Number / MAC</th>
                                    <th className="px-6 py-4">Model & Firmware</th>
                                    <th className="px-6 py-4">Assigned Customer</th>
                                    <th className="px-6 py-4">Status & Last Inform</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {devices.map(device => (
                                    <tr key={device.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <Wifi className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{device.serialNumber}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{device.macAddress || "MAC-UNKNOWN"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground/80">{device.model}</div>
                                            <div className="text-xs text-muted-foreground">{device.firmware || "V1.0.0"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {device.customer ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 font-medium border border-border/50">
                                                    {device.customer.name}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    {device.status === 'ONLINE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${device.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                </span>
                                                <span className={`text-xs font-bold ${device.status === 'ONLINE' ? 'text-emerald-500' : 'text-red-500'}`}>{device.status}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                                {new Date(device.lastInform).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-muted-foreground hover:text-foreground bg-background hover:bg-muted border border-border rounded-lg transition-colors" title="Device Parameters">
                                                    <Terminal className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoteReboot(device.serialNumber, device.id)}
                                                    disabled={rebootingId === device.id}
                                                    className="p-2 text-orange-500 hover:text-orange-600 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                                    title="Remote Reboot"
                                                >
                                                    {rebootingId === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Manual Provision Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-primary" /> Pre-Provision Device
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Manually register an ONT serial number to assign it before the device hits the ACS server.</p>

                        <form className="space-y-4" onSubmit={handleManualAdd}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Serial Number (SN)</label>
                                <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="ZTEGC1234567" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">MAC Address</label>
                                    <input type="text" value={formData.macAddress} onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="AA:BB:CC:DD:EE:FF" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Device Model</label>
                                    <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-mono" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Assign to Customer (Optional)</label>
                                <select value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none">
                                    <option value="">-- No Assignment --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Saving..." : "Provision Rules"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ACS Settings Modal */}
            <AnimatePresence>
                {isSettingsModalOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-primary" /> ACS Server Settings
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">Configure the endpoint and authentication for your GenieACS or TR-069 server.</p>

                            <form className="space-y-4" onSubmit={handleSaveSettings}>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">GenieACS API URL</label>
                                    <input type="url" value={acsConfig.acsUrl} onChange={(e) => setAcsConfig({ ...acsConfig, acsUrl: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="http://103.1.2.3:7557" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">API Auth Token / Secret</label>
                                    <input type="password" value={acsConfig.acsAuthToken} onChange={(e) => setAcsConfig({ ...acsConfig, acsAuthToken: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Optional security token" />
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                    <button disabled={savingSettings} type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                        {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
