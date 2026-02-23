"use client";

import { useEffect, useState } from "react";
import { Receipt, DollarSign, Download, Lock, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";

export default function ClientInvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/client/invoices");
            if (res.ok) setInvoices(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatePay = (id: string) => {
        alert("This would open the Moota QRIS / Payment Gateway Modal in production for Invoice " + id);
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 h-full flex flex-col pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Billing & Invoices</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">View your payment history and pay outstanding bills.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center pb-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="flex-1 space-y-4">
                    {invoices.length === 0 ? (
                        <div className="text-center bg-card border-2 border-dashed border-border rounded-2xl p-12 mt-8">
                            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold">No Invoices Yet</h3>
                            <p className="text-muted-foreground mt-2">You don't have any billing history on this account.</p>
                        </div>
                    ) : (
                        invoices.map(invoice => (
                            <div key={invoice.id} className={`bg-card border p-5 rounded-2xl transition-all ${invoice.status === 'UNPAID' ? 'border-orange-500/50 shadow-md shadow-orange-500/5' :
                                    invoice.status === 'OVERDUE' ? 'border-red-500/50 shadow-md shadow-red-500/5' :
                                        'border-border shadow-sm'
                                }`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-4 rounded-xl shrink-0 ${invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {invoice.status === 'UNPAID' ? <Clock className="w-6 h-6" /> :
                                                invoice.status === 'OVERDUE' ? <AlertTriangle className="w-6 h-6 text-red-500" /> :
                                                    <CheckCircle2 className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Invoice ID: INV-{invoice.id.substring(invoice.id.length - 8).toUpperCase()}</p>
                                            <h3 className="text-2xl font-bold">Rp {Number(invoice.amount).toLocaleString('id-ID')}</h3>
                                            <p className="text-sm mt-1 text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full border-t md:border-t-0 border-border pt-4 md:pt-0">
                                        {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') ? (
                                            <button onClick={() => handleSimulatePay(invoice.id)} className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg border-b-4 border-primary/50 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center gap-2">
                                                <DollarSign className="w-5 h-5" /> Pay Now
                                            </button>
                                        ) : (
                                            <span className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl">
                                                <Lock className="w-4 h-4" /> Paid on {new Date(invoice.paidAt || invoice.updatedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                        <button className="flex-1 md:flex-none px-4 py-2.5 text-foreground bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                                            <Download className="w-4 h-4" /> PDF
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
