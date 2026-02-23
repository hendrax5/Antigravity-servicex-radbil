"use client";

import { useState, useEffect } from "react";
import { Plus, Users, DollarSign, Briefcase, Mail, Phone, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ResellerType {
    id: string;
    name: string;
    email: string;
    phone: string;
    balance: number;
    createdAt: string;
    customers: { id: string, plan: { price: number } }[];
}

export default function ResellersPage() {
    const [resellers, setResellers] = useState<ResellerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", balance: "0" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/resellers");
            if (res.ok) setResellers(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReseller = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/resellers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, balance: parseFloat(formData.balance) }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", email: "", phone: "", balance: "0" });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mitra & Resellers</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage sub-ISPs and voucher resellers out in the field.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Reseller
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : resellers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Briefcase className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Active Partners</h3>
                    <p className="text-muted-foreground max-w-md">Collaborate with local partners to expand your Hotspot and FTTH coverage.</p>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {resellers.map((reseller, i) => {
                        // Calculate Monthly Revenue from their customers
                        const monthlyRevenue = reseller.customers.reduce((sum, cust) => sum + parseFloat(cust.plan?.price?.toString() || "0"), 0);

                        return (
                            <motion.div
                                key={reseller.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex flex-col relative"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl uppercase border border-primary/10">
                                        {reseller.name.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-tight">{reseller.name}</h3>
                                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wide border border-emerald-500/20">
                                            PARTNER
                                        </span>
                                    </div>
                                    <button className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3 flex-grow">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" /> {reseller.email || "No Email"}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4" /> {reseller.phone || "No Phone"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border/50">
                                    <div className="bg-muted bg-opacity-50 p-3 rounded-xl">
                                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Sub-Users</p>
                                        <p className="font-bold text-lg">{reseller.customers.length}</p>
                                    </div>
                                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Est. Revenue</p>
                                        <p className="font-bold text-lg text-primary">${monthlyRevenue.toFixed(2)}<span className="text-xs font-normal">/mo</span></p>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-2.5 text-sm font-semibold bg-background hover:bg-muted border border-border rounded-xl transition-colors flex items-center justify-center gap-2">
                                    Manage Partner <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )
                    })}
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
                            <Briefcase className="w-5 h-5 text-primary" /> Onboard Reseller
                        </h2>
                        <form className="space-y-4" onSubmit={handleSaveReseller}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Business or Sub-ISP Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="e.g. Warnet Berkah" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="contact@partner.com" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Phone / WA</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="08123456789" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Initial Wallet Balance ($)</label>
                                <input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                <p className="text-xs text-muted-foreground mt-1">They will use this balance to generate vouchers or activate sub-users.</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Registering..." : "Onboard Partner"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
