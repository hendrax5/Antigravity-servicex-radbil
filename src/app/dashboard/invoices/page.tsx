"use client";

import { useState, useEffect } from "react";
import { Plus, DollarSign, FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface InvoiceType {
    id: string;
    amount: string;
    status: string;
    dueDate: string;
    paidAt?: string;
    customer: {
        name: string;
        username: string;
        type: string;
    };
}

interface CustomerType {
    id: string;
    name: string;
    plan: { price: string };
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customerId: "", amount: "", dueDate: new Date().toISOString().split('T')[0]
    });
    const [saving, setSaving] = useState(false);
    const [runningIsolir, setRunningIsolir] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resInv, resCust] = await Promise.all([
                fetch("/api/invoices"),
                fetch("/api/customers")
            ]);

            if (resInv.ok) setInvoices(await resInv.json());
            if (resCust.ok) setCustomers(await resCust.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const custId = e.target.value;
        const cust = customers.find(c => c.id === custId);
        setFormData({
            ...formData,
            customerId: custId,
            amount: cust?.plan?.price || ""
        });
    }

    const handleSaveInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // send price as decimal
                body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ customerId: "", amount: "", dueDate: new Date().toISOString().split('T')[0] });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoIsolir = async () => {
        if (!confirm("Run Auto-Isolir constraint? This will suspend all overdue internet users in MikroTik.")) return;
        setRunningIsolir(true);
        try {
            const res = await fetch("/api/isolir", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                alert(`Success! Auto-Isolir isolated ${data.isolatedCount} customers.`);
                fetchData(); // Refresh list just in case
            } else {
                alert("Auto-Isolir failed to execute.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRunningIsolir(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "UNPAID": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PAID": return <CheckCircle className="w-3.5 h-3.5" />;
            case "UNPAID": return <Clock className="w-3.5 h-3.5" />;
            case "CANCELLED": return <AlertCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Invoicing</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Automate recurring billing, generate vouchers, and track payments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAutoIsolir}
                        disabled={runningIsolir}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                        title="Suspend all overdue Internet customers"
                    >
                        {runningIsolir ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                        Run Auto-Isolir
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Invoice
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : invoices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-semibold text-xl mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground max-w-md">Generate an invoice manually or wait for the automated billing cycle to run.</p>
                </div>
            ) : (
                /* Table / List */
                <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium tracking-wider">Invoice / Customer</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoices.map((inv, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        key={inv.id} className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="p-2.5 bg-background border border-border rounded-xl shadow-sm text-muted-foreground">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">INV-{inv.id.slice(-6).toUpperCase()}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">{inv.customer?.name} • {inv.customer?.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-base">Rp {Number(inv.amount).toLocaleString("id-ID")}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {mounted ? new Date(inv.dueDate).toLocaleDateString() : "..."}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(inv.status)}`}>
                                                {getStatusIcon(inv.status)}
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {inv.status === "UNPAID" && (
                                                <button className="text-sm font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        <h2 className="text-xl font-bold mb-6">Create Manual Invoice</h2>
                        <form className="space-y-4" onSubmit={handleSaveInvoice}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Customer</label>
                                <select value={formData.customerId} onChange={handleCustomerSelect} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required>
                                    <option value="" disabled>Select Customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Total Amount (Rp)</label>
                                    <input type="number" step="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Due Date</label>
                                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" required />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50">
                                    {saving ? "Generating..." : "Generate Invoice"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
