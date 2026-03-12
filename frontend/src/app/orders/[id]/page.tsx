"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from 'react';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const orderId = resolvedParams.id;

    const [order, setOrder] = useState<any>(null);
    const [supportConfig, setSupportConfig] = useState<{ enabled: boolean, text: string }>({ enabled: false, text: "" });
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [error, setError] = useState("");
    const [formattedDate, setFormattedDate] = useState("");

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                setAuthChecking(false);
                fetchData();
            })
            .catch(() => {
                setError("Please log in to view this order.");
                setAuthChecking(false);
            });
    }, []);

    const fetchData = async () => {
        try {
            // Fetch order and support settings in parallel
            const [orderRes, supportRes] = await Promise.all([
                api.get(`/orders/${orderId}`),
                api.get('/settings/customer_support').catch(() => ({ data: { value: { enabled: false, text: "" } } }))
            ]);

            setOrder(orderRes.data);
            setFormattedDate(new Date(orderRes.data.created_at).toLocaleDateString());

            if (supportRes.data && supportRes.data.value) {
                setSupportConfig(supportRes.data.value);
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || "Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    if (authChecking || loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 md:p-8 max-w-3xl text-center space-y-4 pt-12">
                <p className="text-destructive font-medium">{error}</p>
                <Link href="/orders">
                    <Button variant="outline">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    if (!order) return null;

    const cust = order.customizations || {};
    const addr = order.addresses || {};

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl min-h-[60vh]">
            <div className="mb-4">
                <Link href="/orders">
                    <Button variant="ghost" size="sm" className="-ml-4 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Orders
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Order Details</h1>
                    <p className="font-mono text-sm text-muted-foreground mt-1">ID: {order.id.split('-')[0]}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 uppercase tracking-wide
                        ${order.status === 'pending' ? 'border-amber-300 bg-amber-50 text-amber-800' :
                            order.status === 'processing' ? 'border-purple-300 bg-purple-50 text-purple-800' :
                                order.status === 'printing' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                                    'border-green-300 bg-green-50 text-green-800'}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Order Summary */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Placed</span>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Design Name</span>
                            <span className="font-medium capitalize">{order.design_slug.replace('-', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">{order.quantity} units</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 mt-3">
                            <span className="font-medium">Total Paid</span>
                            <span className="font-bold text-primary text-base">₹{order.total_amount}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Details */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Shipping To</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm space-y-1">
                        <p className="font-medium text-base mb-2">{addr.full_name}</p>
                        <p className="text-muted-foreground">{addr.street}</p>
                        <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zip_code}</p>
                        <p className="text-muted-foreground mt-2 pt-2 border-t">Phone: {addr.phone}</p>
                    </CardContent>
                </Card>

                {/* Customization Details */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Your Submitted Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            {(cust.bride_name || cust.groom_name) && (
                                <>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Bride's Name</p>
                                        <p className="font-medium">{cust.bride_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Groom's Name</p>
                                        <p className="font-medium">{cust.groom_name || '-'}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">Event Date</p>
                                <p className="font-medium">{cust.event_date || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Print Color</p>
                                <p className="font-medium capitalize">{cust.print_color || 'N/A'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Venue Details</p>
                                <p className="bg-muted p-3 rounded-md min-h-[50px] whitespace-pre-wrap">
                                    {cust.venue || 'No venue provided.'}
                                </p>
                            </div>
                            {cust.extra_notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1">Extra Notes</p>
                                    <p className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                                        {cust.extra_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Dynamic Customer Support Block */}
            {supportConfig.enabled && supportConfig.text && (
                <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <h3 className="font-bold text-lg text-primary mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Need Help With This Order?
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                        {supportConfig.text}
                    </p>
                </div>
            )}
        </div>
    );
}
