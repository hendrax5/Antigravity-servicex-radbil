"use client";

import { useState } from "react";
import { Copy, Link2, MessageCircle, QrCode, Smartphone, RefreshCw, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppGatewayPage() {
    const [copied, setCopied] = useState(false);
    const webhookUrl = "https://your-domain.com/api/webhooks/whatsapp";
    const [isLinked, setIsLinked] = useState(false);

    // Simulation for scanning QR
    const [isScanning, setIsScanning] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSimulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setIsLinked(true);
        }, 3000);
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">WhatsApp Auto-Bot Gateway</h1>
                <p className="text-muted-foreground text-sm">Automate billing reminders, technical support replies, and invoice generation via WhatsApp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code / Connection Panel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col h-full">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2.5 rounded-xl ${isLinked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Device Connection</h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                    Status: <span className={`font-semibold ${isLinked ? 'text-emerald-500' : 'text-amber-500'}`}>{isLinked ? 'CONNECTED' : 'WAITING FOR QR'}</span>
                                </p>
                            </div>
                        </div>

                        {isLinked ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                <h3 className="font-bold text-xl mb-1 text-emerald-600">WhatsApp is Linked!</h3>
                                <p className="text-sm text-emerald-600/80 mb-6">Device: +62 812-3456-7890</p>

                                <button onClick={() => setIsLinked(false)} className="px-5 py-2.5 bg-background border border-border hover:bg-muted font-medium text-sm rounded-xl transition-colors text-red-500 hover:text-red-600">
                                    Disconnect Session
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10 rounded-2xl border-2 border-dashed border-border">
                                {isScanning ? (
                                    <div className="flex flex-col items-center">
                                        <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
                                        <p className="font-medium text-primary">Pairing with WhatsApp...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-48 h-48 bg-white border border-border rounded-xl mb-6 p-2 flex items-center justify-center shadow-sm">
                                            {/* Placeholder QR Code */}
                                            <div className="w-full h-full bg-slate-900 opacity-10 flex items-center justify-center">
                                                <QrCode className="w-20 h-20 text-slate-900" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold mb-2">Scan QR Code</h3>
                                        <p className="text-sm text-muted-foreground text-balance">Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device.</p>

                                        <button onClick={handleSimulateScan} className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm rounded-xl transition-colors w-full shadow-lg">
                                            Simulate Mock Scan (MVP)
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Configuration / Feature Panel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">

                    {/* Auto-Replies Toggle */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary" /> Active Bot Features</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-border bg-background rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm">Invoice Auto-Reminders</p>
                                    <p className="text-xs text-muted-foreground">Sends H-3 and H-1 billing reminders.</p>
                                </div>
                                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer ring-4 ring-primary/20">
                                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-border bg-background rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm text-emerald-500">Auto-Reply: !tagihan</p>
                                    <p className="text-xs text-muted-foreground">Customers can check their open invoices.</p>
                                </div>
                                <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer ring-4 ring-emerald-500/20">
                                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-border bg-background rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm text-blue-500">Auto-Reply: !gangguan [pesan]</p>
                                    <p className="text-xs text-muted-foreground">Auto-generates CRM Support Tickets.</p>
                                </div>
                                <div className="w-11 h-6 bg-blue-500 rounded-full relative cursor-pointer ring-4 ring-blue-500/20">
                                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Webhook API */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">

                        <div>
                            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-primary" /> External Bot Webhook URL
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">If using external providers (Waha, Baileys, Fonnte), point incoming messages here.</p>

                            <div className="flex shadow-sm rounded-xl overflow-hidden border border-border">
                                <div className="bg-muted px-4 py-3 text-sm font-mono text-muted-foreground flex-1 overflow-x-auto whitespace-nowrap">
                                    {webhookUrl}
                                </div>
                                <button onClick={handleCopy} className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 hover:bg-primary/90 transition-colors font-medium text-sm border-l border-primary/20">
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mt-2">
                            <p className="text-xs font-medium text-amber-600 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Security Note</p>
                            <p className="text-[11px] text-amber-600/80 mt-1">Ensure your provider enforces SSL/TLS signatures before hitting this webhook to avoid spoofed messages.</p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
