"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { authService } from "@/services/auth.service";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [savingSupport, setSavingSupport] = useState(false);
    const [supportEnabled, setSupportEnabled] = useState(true);
    const [supportText, setSupportText] = useState("");
    
    // Gallery States
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [savingGallery, setSavingGallery] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        authService.getCurrentUser()
            .then(user => {
                if (user.role === 'admin') {
                    fetchSettings();
                } else {
                    navigate('/admin');
                }
            })
            .catch(() => {
                navigate(`/login?redirect=/admin/settings`);
            });
    }, [navigate]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const supportRes = await api.get('/settings/customer_support').catch(() => null);
            if (supportRes?.data?.value) {
                setSupportEnabled(supportRes.data.value.enabled);
                setSupportText(supportRes.data.value.text || "");
            }

            const galleryRes = await api.get('/settings/home_gallery_images').catch(() => null);
            if (galleryRes?.data?.value?.images) {
                setGalleryImages(galleryRes.data.value.images);
            }
        } catch (e: any) {
            console.error("Failed to fetch settings", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSupport = async () => {
        setSavingSupport(true);
        try {
            await api.put('/settings/customer_support', {
                enabled: supportEnabled,
                text: supportText
            });
            alert("Customer support settings saved successfully.");
        } catch (e: any) {
            console.error("Failed to save settings", e);
            alert(e.response?.data?.detail || "Failed to save settings");
        } finally {
            setSavingSupport(false);
        }
    };

    const handleSaveGallery = async () => {
        setSavingGallery(true);
        try {
            await api.put('/settings/home_gallery_images', {
                images: galleryImages
            });
            alert("Homepage gallery saved successfully.");
        } catch (e: any) {
            console.error("Failed to save gallery", e);
            alert("Failed to save homepage gallery.");
        } finally {
            setSavingGallery(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploadingImages(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const uploadData = new FormData();
                uploadData.append("file", file);
                const res = await api.post("/designs/upload-image", uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                newUrls.push(res.data.url);
            }
            setGalleryImages(prev => [...prev, ...newUrls]);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to upload some images");
        } finally {
            setUploadingImages(false);
        }
    };

    const removeGalleryImage = (indexToRemove: number) => {
        setGalleryImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl pb-12">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground mt-1">Manage global configurations for the Nymintra platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Homepage Showcase Gallery</CardTitle>
                    <CardDescription>
                        Upload pictures that will be displayed in the dynamic slideshow on the customer homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/10 transition-colors relative">
                        <div className="text-4xl mb-4">🖼️</div>
                        <h3 className="font-semibold text-lg">Upload Showcase Images</h3>
                        <p className="text-sm text-muted-foreground mt-1">Select one or more beautiful sample designs for the homepage.</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="mt-4 flex justify-center gap-2">
                            <Button type="button" variant="outline" disabled={uploadingImages}>
                                {uploadingImages ? "Uploading..." : "Browse Files"}
                            </Button>
                            {galleryImages.length > 0 && (
                                <Button type="button" variant="ghost" onClick={() => setGalleryImages([])} className="text-destructive">
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>

                    {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {galleryImages.map((src, i) => (
                                <div key={i} className="aspect-[3/4] rounded-lg border overflow-hidden relative group shadow-sm transition-all hover:shadow-md">
                                    <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(i)}
                                        className="absolute top-2 right-2 bg-destructive/80 text-white w-6 h-6 flex items-center justify-center rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive text-xs z-10"
                                        title="Remove Image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSaveGallery} disabled={savingGallery}>
                            {savingGallery ? "Saving Gallery..." : "Save Gallery Configuration"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                        <Button onClick={handleSaveSupport} disabled={savingSupport}>
                            {savingSupport ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
