"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Clock, Loader2, Zap, Wifi, Search, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({ subject: "", initialMessage: "", topic: "CONNECTION" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/client/tickets");
            if (res.ok) setTickets(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalSubject = formData.subject;
            if (formData.topic === "CONNECTION") finalSubject = `[LOS/Connection] ${formData.subject}`;
            if (formData.topic === "WIFI") finalSubject = `[WiFi Need Help] ${formData.subject}`;

            const res = await fetch("/api/client/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject: finalSubject, initialMessage: formData.initialMessage })
            });

            if (res.ok) {
                setFormData({ subject: "", initialMessage: "", topic: "CONNECTION" });
                setShowModal(false);
                fetchTickets();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "IN_PROGRESS": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "RESOLVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 h-full flex flex-col pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Help & Support</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">View your past reports or create a new support ticket.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Open New Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center pb-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="flex-1 space-y-4">
                    {tickets.length === 0 ? (
                        <div className="text-center bg-card border-2 border-dashed border-border rounded-2xl p-12 mt-8">
                            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold">No Support Tickets Yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">If you experience any issues with your internet connection or billing, feel free to open a ticket here.</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shrink-0 ${ticket.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                {ticket.assignedTo && <span className="px-2 py-0.5 bg-muted rounded">Agent: {ticket.assignedTo.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getStatusStyle(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        <button className="text-primary text-sm font-semibold hover:underline">View Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for Creating Ticket */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl relative">
                            <h2 className="text-xl font-bold mb-6">Create Support Ticket</h2>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">What do you need help with?</label>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button type="button" onClick={() => setFormData({ ...formData, topic: 'CONNECTION' })} className={`p-3 border rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors ${formData.topic === 'CONNECTION' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-background hover:bg-muted'}`}>
                                            <Zap className="w-4 h-4" /> Connection / LOS
                                        </button>
                                        <button type="button" onClick={() => setFormData({ ...formData, topic: 'WIFI' })} className={`p-3 border rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors ${formData.topic === 'WIFI' ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted'}`}>
                                            <Wifi className="w-4 h-4" /> WiFi / Password
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Subject</label>
                                    <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} type="text" className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="E.g. Router light is blinking red" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Message Details</label>
                                    <textarea required value={formData.initialMessage} onChange={e => setFormData({ ...formData, initialMessage: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl h-32 resize-none focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Please describe exactly what happened..." />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 hover:bg-muted rounded-xl font-medium transition-colors">Cancel</button>
                                    <button disabled={submitting} type="submit" className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Ticket"}
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
