"use client";

import { useState, useEffect } from "react";
import { Ticket, Search, Filter, AlertCircle, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TicketData {
    id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    customer: { name: string; username: string };
    assignedTo?: { name: string };
}

export default function TicketsPage() {
    // In a real application, you would fetch from /api/tickets.
    // For this MVP demonstration, we mock the ticket data.
    const [tickets, setTickets] = useState<TicketData[]>([
        {
            id: "TKT-001",
            subject: "LOS Merah di modem",
            description: "Modem indihome saya lampunya merah kedip kedip sejak tadi malam jam 8.",
            status: "OPEN",
            priority: "HIGH",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            customer: { name: "Budi Santoso", username: "budi01" },
            assignedTo: { name: "Teknisi A" }
        },
        {
            id: "TKT-002",
            subject: "Internet Lambat",
            description: "Main game pingnya tinggi terus padahal langganan 50Mbps.",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            customer: { name: "Ahmad Rizky", username: "ahmad.r" }
        },
        {
            id: "TKT-003",
            subject: "Ganti Password Wifi",
            description: "Tolong ganti pass wifi saya jadi 'rahasia123'.",
            status: "RESOLVED",
            priority: "LOW",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            customer: { name: "Siti Aminah", username: "siti_a" },
            assignedTo: { name: "Customer Service" }
        }
    ]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Quick filtering state
    const [filterStatus, setFilterStatus] = useState("ALL");

    const filteredTickets = filterStatus === "ALL" ? tickets : tickets.filter(t => t.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-red-500/10 text-red-600 border-red-500/20";
            case "IN_PROGRESS": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case "RESOLVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "HIGH": return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
            case "MEDIUM": return <Clock className="w-3.5 h-3.5 text-orange-500" />;
            case "LOW": return <CheckCircle className="w-3.5 h-3.5 text-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Desk</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage customer issues, fiber cuts, and maintenance requests.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Search ticket # or customer name..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm shadow-sm" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${filterStatus === status
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                                }`}
                        >
                            {status.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {filteredTickets.map((ticket, i) => (
                    <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-5"
                    >
                        {/* Status Icon Indicator */}
                        <div className="shrink-0 pt-1">
                            {ticket.status === "OPEN" && <div className="p-2.5 bg-red-500/10 text-red-500 rounded-full"><Ticket className="w-5 h-5" /></div>}
                            {ticket.status === "IN_PROGRESS" && <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-full"><Clock className="w-5 h-5" /></div>}
                            {ticket.status === "RESOLVED" && <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full"><CheckCircle className="w-5 h-5" /></div>}
                        </div>

                        {/* Core Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <span className="text-xs font-bold text-muted-foreground">{ticket.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getStatusColor(ticket.status)}`}>
                                    {ticket.status.replace("_", " ")}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground bg-muted p-0.5 pr-2 rounded-full border border-border">
                                    <span className="p-1 bg-background rounded-full">{getPriorityIcon(ticket.priority)}</span> {ticket.priority}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg leading-tight mb-2 truncate">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                        </div>

                        {/* Metadata Right */}
                        <div className="shrink-0 flex flex-col md:items-end gap-2 md:gap-0 justify-between mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                            <div className="text-sm">
                                <span className="font-semibold text-foreground">{ticket.customer.name}</span>
                                <p className="text-xs text-muted-foreground">{ticket.customer.username}</p>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    {mounted ? new Date(ticket.createdAt).toLocaleDateString() : "Loading..."}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    3
                                </div>
                            </div>
                        </div>

                    </motion.div>
                ))}

                {filteredTickets.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                        No tickets found matching the selected filters.
                    </div>
                )}
            </div>

        </div>
    );
}
