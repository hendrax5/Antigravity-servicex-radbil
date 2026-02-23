"use client";

import { useEffect, useState } from "react";
import { Copy, Link2, CreditCard, RefreshCw, KeyRound, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MootaSettingsPage() {
    const [copied, setCopied] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const webhookUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}/api/webhooks/moota` : "";

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setApiKey(data.mootaSecret || "");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mootaSecret: apiKey })
            });
            if (res.ok) {
                alert("Moota settings saved successfully.");
            } else {
                alert("Failed to save settings.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Payment Automation (Moota)</h1>
                <p className="text-muted-foreground text-sm">Automate invoice verification for local Indonesian bank transfers (BCA, Mandiri, BNI, BRI) using Moota Mutasi API.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Instruction Panel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Moota Integration setup</h2>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">ServiceX uses standard webhooks to listen for incoming funds. Every time a customer pays an invoice with a unique code (e.g Rp 150.045), Moota will hit this endpoint, and we automatically set the Customer's Invoice to PAID.</p>

                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">1</span>
                                <div>
                                    <p className="font-semibold text-foreground">Create a Moota Account</p>
                                    <p className="text-muted-foreground">Register at <a href="https://moota.co" className="text-primary hover:underline" target="_blank">moota.co</a> and link your internet banking accounts.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">2</span>
                                <div>
                                    <p className="font-semibold text-foreground">Configure Webhook URL</p>
                                    <p className="text-muted-foreground">Paste the Webhook URL below into your Moota Developer settings so they can push mutasi data to us.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">3</span>
                                <div>
                                    <p className="font-semibold text-foreground">Grab API Secret</p>
                                    <p className="text-muted-foreground">Enter your API Secret to allow us to issue manual checks if a webhook fails.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Configuration Form */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">

                        {/* Webhook Field */}
                        <div>
                            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-primary" /> Webhook Endpoint URL
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">Copy this URL to your Moota dashboard under API Settings.</p>

                            <div className="flex shadow-sm rounded-xl overflow-hidden border border-border">
                                <div className="bg-muted px-4 py-3 text-sm font-mono text-muted-foreground flex-1 overflow-x-auto whitespace-nowrap">
                                    {webhookUrl}
                                </div>
                                <button onClick={handleCopy} className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium text-sm">
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-border" />

                        {/* API Key Field */}
                        <div>
                            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-emerald-500" /> API Secret Key
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">Found in your Moota profile settings.</p>

                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono text-sm"
                                placeholder="mt_live_..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl transition-all shadow-lg mt-auto flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>

                    {/* Simulated Live View */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-emerald-600 text-sm flex items-center gap-1.5"><RefreshCw className="w-4 h-4 animate-spin-slow" /> Listener Active</h4>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Listening</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Waiting for incoming bank transfer POST payloads on <code className="text-emerald-600 bg-emerald-500/10 px-1 py-0.5 rounded">/api/webhooks/moota</code>.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
