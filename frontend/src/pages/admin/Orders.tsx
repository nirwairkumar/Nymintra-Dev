"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Link } from 'react-router-dom';
import { authService } from "@/services/auth.service";
import { useNavigate } from 'react-router-dom';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useNavigate();

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                if (user.role === 'admin') {
                    fetchOrders();
                } else {
                    navigate('/admin');
                }
            })
            .catch(() => {
                navigate('/admin');
            });
    }, [router]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (e) {
            console.error("Failed to fetch admin orders", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Review print proofs, handle approvals, and update tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-foreground">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                        ) : (
                            orders.map((order, i) => (
                                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{order.id.split('-')[0]}</td>
                                    <td className="px-6 py-4">
                                        <div>{order.addresses?.full_name || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">{order.addresses?.city}</div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold">₹{order.total_amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${order.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                                order.status === "processing" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                                                    order.status === "printing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/orders/${order.id}`} target="_blank">
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                                View Details
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
