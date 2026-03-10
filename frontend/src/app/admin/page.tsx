"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

import { authService } from "@/services/auth.service";

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth State
    const [isAdminState, setIsAdminState] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                if (user.role === 'admin') {
                    setIsAdminState(true);
                    fetchOrders();
                } else {
                    setAuthChecking(false);
                }
            })
            .catch(() => {
                setAuthChecking(false);
            });
    }, []);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setAuthChecking(true);
        try {
            const data = await authService.adminLogin({ email, password });
            // Use the user from the login response to save a round trip
            const user = data.user || await authService.getCurrentUser();
            if (user?.role === 'admin') {
                setIsAdminState(true);
                fetchOrders();
            } else {
                setLoginError("Not authorized as admin");
            }
        } catch (err: any) {
            setLoginError(err.response?.data?.detail || "Invalid admin credentials");
        } finally {
            setAuthChecking(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            // Assuming the backend returns 403 or empty if not admin.
            // In a real app we'd handle 401/403 gracefully here
            setOrders(res.data);
        } catch (e) {
            console.error("Failed to fetch admin orders", e);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Optimistically update UI
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const StatusSelect = ({ order }: { order: any }) => {
        const statuses = ["pending", "printing", "packing", "shipping", "delivered"];
        return (
            <select
                className="text-xs p-1 mt-1 border rounded w-full bg-background"
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            >
                {statuses.map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
            </select>
        );
    };

    if (authChecking && !isAdminState) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium animate-pulse">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!isAdminState) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-serif font-bold tracking-tight">Admin Portal</CardTitle>
                        <p className="text-sm text-muted-foreground">Enter restricted credentials to manage operations.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Component</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="admin@nymintra.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Super Secret Password</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded-md"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                            <Button type="submit" className="w-full" disabled={authChecking}>
                                {authChecking ? "Authenticating..." : "Access Dashboard"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back, Admin. Manage your e-commerce platform here.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {orders.filter(o => o.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Printing Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter(o => o.status === 'printing').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {orders.filter(o => o.status === 'delivered').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Order ID</th>
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Customer</th>
                                    <th className="p-3 font-medium">Amount</th>
                                    <th className="p-3 font-medium">Status & Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Loading orders...</td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center">No orders found.</td></tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id} className="border-b hover:bg-muted/20">
                                            <td className="p-3 font-mono text-xs">{order.id.split('-')[0]}</td>
                                            <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div>{order.addresses?.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{order.addresses?.city}</div>
                                            </td>
                                            <td className="p-3 font-semibold">₹{order.total_amount}</td>
                                            <td className="p-3 min-w-[140px]">
                                                <StatusSelect order={order} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Card Categories Schema Hint</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                        To add new categories dynamically to the browsing filter, you can insert rows into the Supabase <code>categories</code> table (if provisioned), and attach those IDs to your card designs instead of passing arbitrary strings in the `category` column. Currently, categories are defined strictly in the frontend array map for speed in Phase 2.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
