"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [supportEnabled, setSupportEnabled] = useState(true);
    const [supportText, setSupportText] = useState("");
    const router = useRouter();

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                if (user.role === 'admin') {
                    fetchSettings();
                } else {
                    router.push('/admin');
                }
            })
            .catch(() => {
                router.push('/admin');
            });
    }, [router]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/customer_support');
            if (res.data && res.data.value) {
                setSupportEnabled(res.data.value.enabled);
                setSupportText(res.data.value.text || "");
            }
        } catch (e: any) {
            console.error("Failed to fetch settings", e);
            // If 404, it just means no settings exist yet, we stick with defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings/customer_support', {
                enabled: supportEnabled,
                text: supportText
            });
            alert("Settings saved successfully.");
        } catch (e: any) {
            console.error("Failed to save settings", e);
            alert(e.response?.data?.detail || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground mt-1">Manage global configurations for the Nymintra platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Support Module</CardTitle>
                    <CardDescription>
                        Configure the support information displayed to customers when they view their order details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium">Enable Customer Support Display</label>
                            <p className="text-sm text-muted-foreground">
                                If turned off, customers will not see the support block on their order tracking page.
                            </p>
                        </div>
                        <Switch
                            checked={supportEnabled}
                            onCheckedChange={setSupportEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Support Message & Contact Details</label>
                        <p className="text-sm text-muted-foreground mb-2">
                            Enter the email, phone number, or instructions you want the customer to use. Supports plain text and line breaks.
                        </p>
                        <Textarea
                            className="min-h-[120px]"
                            placeholder="e.g., For support regarding your print proof, email support@nymintra.com or call +91-9876543210."
                            value={supportText}
                            onChange={(e) => setSupportText(e.target.value)}
                            disabled={!supportEnabled}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
