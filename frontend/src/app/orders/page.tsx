"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        authService.getCurrentUser()
            .then(data => {
                setUser(data);
                fetchOrders();
            })
            .catch(() => {
                window.location.href = '/login?redirect=/orders';
            });
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'printing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'packing': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'shipping': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return <div className="py-24 text-center">Loading your orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl min-h-[60vh]">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-muted/30">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">You haven't placed any invitation orders.</p>
                    <Link href="/cards">
                        <Button>Browse Catalog</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded-xl bg-card overflow-hidden shadow-sm">
                            <div className="bg-muted/50 p-4 border-b flex flex-wrap gap-4 items-center justify-between text-sm">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-muted-foreground font-medium mb-1">Order Placed</p>
                                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium mb-1">Total</p>
                                        <p className="font-bold">₹{order.total_amount}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-muted-foreground font-medium mb-1">Ship To</p>
                                        <p>{order.addresses?.full_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground font-medium mb-1">Order #</p>
                                    <p className="font-mono text-xs">{order.id.split('-')[0]}</p>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">{order.design_slug} Design ({order.quantity} copies)</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Customized for: {order.customizations?.bride_name} & {order.customizations?.groom_name}
                                    </p>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        <span className="relative flex h-2 w-2 mr-2">
                                            {(order.status !== 'delivered' && order.status !== 'pending') && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                                            )}
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                        </span>
                                        {order.status}
                                    </div>
                                </div>
                                <div>
                                    <Link href={`/orders/${order.id}`}>
                                        <Button variant="outline">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
