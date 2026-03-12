"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const orderId = resolvedParams.id;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [error, setError] = useState("");
    const [formattedDate, setFormattedDate] = useState("");

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                if (user.role === 'admin') {
                    setAuthChecking(false);
                    fetchOrderDetails();
                } else {
                    setError("Not authorized");
                    setAuthChecking(false);
                }
            })
            .catch(() => {
                setError("Not authenticated");
                setAuthChecking(false);
            });
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            setOrder(res.data);
            setFormattedDate(new Date(res.data.created_at).toLocaleString());
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrder({ ...order, status: newStatus });
        } catch (e) {
            alert("Failed to update status");
        }
    };

    if (authChecking || loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading order details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    if (!order) return null;

    const cust = order.customizations || {};
    const addr = order.addresses || {};
    const user = order.user_details || {};

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Order #{order.id.split('-')[0]}</h1>
                    <p className="text-muted-foreground mt-1">Placed on {formattedDate}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                    <select
                        className={`px-3 py-1.5 rounded-md font-medium text-sm border-2 outline-none
                            ${order.status === 'pending' ? 'border-amber-300 bg-amber-50 text-amber-800' :
                                order.status === 'processing' ? 'border-purple-300 bg-purple-50 text-purple-800' :
                                    order.status === 'printing' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                        'border-green-300 bg-green-50 text-green-800'}`}
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="printing">Printing</option>
                        <option value="packing">Packing</option>
                        <option value="shipping">Shipping</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customer & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">User Name</span>
                            <span className="font-medium">{user.name || addr.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-muted-foreground">Registered Phone</span>
                            <span className="font-medium">{user.phone || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Payment & Product</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Design ID (Slug)</span>
                            <span className="font-medium">{order.design_slug}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Quantity Ordered</span>
                            <span className="font-medium">{order.quantity} units</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Total Paid Amount</span>
                            <span className="font-bold text-primary text-base">₹{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-muted-foreground">Razorpay ID</span>
                            <span className="font-mono text-xs">{order.razorpay_payment_id || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Printing Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Event & Printing Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">Event Date</p>
                                <p className="font-medium">{cust.event_date || 'Not specified'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">Print Color</p>
                                <p className="font-medium capitalize">{cust.print_color || 'Not specified'}</p>
                            </div>

                            {(cust.bride_name || cust.groom_name) && (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs">Bride's Name</p>
                                        <p className="font-medium">{cust.bride_name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs">Groom's Name</p>
                                        <p className="font-medium">{cust.groom_name || '-'}</p>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1 md:col-span-2 mt-2">
                                <p className="text-muted-foreground text-xs">Venue Details</p>
                                <p className="font-medium bg-muted/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                                    {cust.venue || 'No venue details strictly provided. Customer opted for phone call.'}
                                </p>
                            </div>

                            <div className="space-y-1 md:col-span-2 mt-2">
                                <p className="text-muted-foreground text-xs">Extra Special Notes</p>
                                <p className="font-medium bg-amber-50 text-amber-900 border border-amber-100 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                                    {cust.extra_notes || 'None'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Address Card */}
                <Card className="md:col-span-2 border-primary/20">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-lg text-primary">Delivery Address</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-muted-foreground text-xs">Recipient Name</p>
                                    <p className="font-medium text-base">{addr.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Contact Phone</p>
                                    <p className="font-medium">{addr.phone}</p>
                                </div>
                            </div>
                            <div className="bg-muted p-4 rounded-md space-y-1">
                                <p className="font-medium">{addr.street}</p>
                                <p>{addr.city}, {addr.state}</p>
                                <p className="font-bold mt-2">ZIP: {addr.zip_code}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-6">
                <Button variant="outline" onClick={() => window.close()}>Close Tab</Button>
            </div>
        </div>
    );
}
