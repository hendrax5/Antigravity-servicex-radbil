"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Router, Terminal, CheckCircle2, Loader2, Workflow, Database, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerType { id: string; name: string; username: string; status: string; technician?: { id: string; name: string } | null; }
interface RouterType { id: string; name: string; ipAddress: string; }
interface OdpType { id: string; name: string; pop: { name: string } }
interface UserType { id: string; name: string; role: string; }

export default function ProvisioningPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "ADMIN";

    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [routers, setRouters] = useState<RouterType[]>([]);
    const [odps, setOdps] = useState<OdpType[]>([]);
    const [techStaff, setTechStaff] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        onuSerialNumber: "",
        customerId: "",
        mikrotikId: "",
        odpId: "",
        lineProfile: "100M-PROFILE",
        srvProfile: "PPPoE-VLAN10"
    });
    const [provisioning, setProvisioning] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, rRes, oRes, uRes] = await Promise.all([
                fetch("/api/customers"),
                fetch("/api/routers"),
                fetch("/api/odps"), // Changed from /api/infrastructure to /api/odps
                fetch("/api/users") // Added fetch for users
            ]);
            if (cRes.ok) setCustomers(await cRes.json());
            if (rRes.ok) setRouters(await rRes.json());
            if (oRes.ok) {
                const odpsData = await oRes.json();
                // Assuming /api/odps now returns flat ODPs with pop info
                setOdps(odpsData);
            }
            if (uRes.ok) {
                const users: UserType[] = await uRes.json();
                setTechStaff(users.filter(u => u.role === "TECH_SUPPORT"));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault();
        setProvisioning(true);
        setSuccessMsg("");
        try {
            const res = await fetch("/api/provisioning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData }),
            });

            if (res.ok) {
                setSuccessMsg("Success! ONT Registered to OLT and Radius PPPoE Configured.");
                setFormData({ ...formData, onuSerialNumber: "", customerId: "" }); // Reset some
            } else {
                alert("Failed to provision.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProvisioning(false);
        }
    };

    const handleAssignJob = async (customerId: string, technicianId: string) => {
        try {
            const res = await fetch(`/api/customers/assign`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId, technicianId }),
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error("Assignment failed:", e);
        }
    };

    // Filter Logic for Assigning
    const isTechSupport = role === "TECH_SUPPORT";
    const availableCustomers = customers.filter(c => {
        // Must be pending install
        if (c.status !== "PENDING_INSTALL") return false;
        // If they are a normal tech, only show assigned users
        if (isTechSupport && c.technician?.id !== (session?.user as any)?.id) return false;
        return true;
    });

    if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Zero-Touch Provisioning (ZTP)</h1>
                <p className="text-muted-foreground text-sm">Orchestrate OLT physical connection and Radius logical authentication in a single macro.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Provisioning Form */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Workflow className="w-6 h-6 text-primary" /> Execute Provisioning Macro
                        </h2>

                        {successMsg && (
                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 relative z-10">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{successMsg}</p>
                            </div>
                        )}

                        <form className="space-y-5 relative z-10" onSubmit={handleProvision}>

                            {/* Step 1: Customer & Hardware */}
                            <div className="space-y-4 p-5 border border-border bg-background rounded-xl">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">1</span>
                                    <h3 className="font-semibold text-sm">Customer Assignment</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Select Target</label>
                                        <select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none">
                                            <option value="">-- Choose Target --</option>
                                            {availableCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.username})</option>)}
                                            {availableCustomers.length === 0 && <option disabled>No Installed Assigned to You</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block text-orange-500">Unregistered ONU Serial</label>
                                        <input required type="text" value={formData.onuSerialNumber} onChange={(e) => setFormData({ ...formData, onuSerialNumber: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-orange-500/30 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 outline-none font-mono uppercase" placeholder="ZTEGC1234567" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: OLT / Infrastructure Setup */}
                            <div className="space-y-4 p-5 border border-border bg-background rounded-xl">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">2</span>
                                    <h3 className="font-semibold text-sm">FTTH Parameters (OLT)</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-medium mb-1 block">Physical ODP Location</label>
                                        <select required value={formData.odpId} onChange={(e) => setFormData({ ...formData, odpId: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none">
                                            <option value="">-- Map to ODP Box --</option>
                                            {odps.map(o => <option key={o.id} value={o.id}>{o.pop?.name} &gt; {o.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Line Profile (TCONT/GEM)</label>
                                        <select value={formData.lineProfile} onChange={(e) => setFormData({ ...formData, lineProfile: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none">
                                            <option value="100M-PROFILE">100M-PROFILE (Default)</option>
                                            <option value="1G-PROFILE">1G-PROFILE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Service Profile (VLAN)</label>
                                        <select value={formData.srvProfile} onChange={(e) => setFormData({ ...formData, srvProfile: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none">
                                            <option value="PPPoE-VLAN10">PPPoE-VLAN10</option>
                                            <option value="HOTSPOT-VLAN20">HOTSPOT-VLAN20</option>
                                            <option value="IPTV-VLAN30">IPTV-VLAN30</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Radius / Router Injection */}
                            <div className="space-y-4 p-5 border border-border bg-background rounded-xl">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">3</span>
                                    <h3 className="font-semibold text-sm text-blue-600">Radius Orchestration (MikroTik)</h3>
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block">Target NAS/Router</label>
                                    <select required value={formData.mikrotikId} onChange={(e) => setFormData({ ...formData, mikrotikId: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                                        <option value="">-- Select NAS Controller --</option>
                                        {routers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.ipAddress})</option>)}
                                    </select>
                                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Credentials (radcheck/radreply) will be automatically pulled from the Customer's Service Plan.
                                    </p>
                                </div>
                            </div>

                            <button disabled={provisioning} type="submit" className="w-full py-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                {provisioning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
                                {provisioning ? "Executing Macro..." : "Auto-Provision Customer"}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Info Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-blue-600 flex items-center gap-2 mb-3">
                            <Database className="w-5 h-5" /> What happens in the background?
                        </h3>
                        <div className="space-y-4 text-sm text-blue-900/80 dark:text-blue-200/80">
                            <p>When you click <strong>Auto-Provision</strong>, ServiceX executes a powerful sequence bridging your physical GPON and your logical Radius:</p>

                            <ul className="space-y-3">
                                <li className="flex gap-2 items-start">
                                    <div className="p-1 bg-blue-500/20 rounded mt-0.5"><Router className="w-3.5 h-3.5 text-blue-600" /></div>
                                    <span>Logs into your ZTE/Huawei OLT via Telnet.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="p-1 bg-blue-500/20 rounded mt-0.5"><Terminal className="w-3.5 h-3.5 text-blue-600" /></div>
                                    <span>Maps the Unregistered ONU SN to your selected <code>Line Profile</code> and <code>Service Profile</code>.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="p-1 bg-blue-500/20 rounded mt-0.5"><Shield className="w-3.5 h-3.5 text-blue-600" /></div>
                                    <span>Generates Radius attributes (radcheck) for the User's Service Plan and connects it to the MikroTik NAS.</span>
                                </li>
                            </ul>

                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 mt-4 text-xs font-medium text-blue-700 dark:text-blue-300">
                                ✨ This eliminates manual Winbox and OLT data-entry!
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
