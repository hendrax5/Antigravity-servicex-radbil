"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Star, Shield, Search, MoreHorizontal, UserCheck, KeySquare, Loader2 } from "lucide-react";

interface UserAccount {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    status: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: "", email: "", role: "TECH_SUPPORT", password: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            setShowModal(false);
            setFormData({ name: "", email: "", role: "TECH_SUPPORT", password: "" });
            fetchUsers();
        } catch (e: any) {
            alert(e.message || "Failed to create user");
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "NOC": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "MANAGER_SALES": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "TECH_SUPPORT": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "FINANCE": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff & Roles Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create and manage internal employee accounts and their RBAC permissions.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Staff Account
                </button>
            </div>

            {/* List */}
            <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Role Access</th>
                                <th className="px-6 py-4">Tenant ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground text-sm">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {user.tenantId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}></div>
                                                <span className="text-xs font-medium">{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Add New Staff</h2>
                        <form className="space-y-4" onSubmit={handleCreateUser}>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Full Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full px-4 py-2 bg-background border border-border rounded-xl" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Email (Login ID)</label>
                                <input required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" className="w-full px-4 py-2 bg-background border border-border rounded-xl" placeholder="john@servicex.id" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Password</label>
                                <input required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} type="password" minLength={6} className="w-full px-4 py-2 bg-background border border-border rounded-xl" placeholder="Set user password" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Role Access</label>
                                <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl">
                                    <option value="ADMIN">ADMIN (Full Access)</option>
                                    <option value="MANAGER_SALES">MANAGER (Sales & CRM)</option>
                                    <option value="NOC">NOC (Network Ops)</option>
                                    <option value="TECH_SUPPORT">TECH SUPPORT (Field Agent)</option>
                                    <option value="FINANCE">FINANCE (Billing & Moota)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium transition-colors">Cancel</button>
                                <button disabled={saving} type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
