"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES = [
    { id: "wedding", label: "Wedding" },
    { id: "engagement", label: "Engagement" },
    { id: "birthday", label: "Birthday" },
    { id: "puja", label: "Religious / Puja" },
    { id: "anniversary", label: "Anniversary" },
    { id: "corporate", label: "Corporate" },
];

export default function AdminUploadCard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        categories: [] as string[],
        base_price: "",
        min_quantity: "50",
        description: "",
        available_stock: "1000",
        print_price: "0",
        print_price_unit: "100",
        print_colors: "", // We'll manage this as a comma-separated string in the input for simplicity
    });

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name)
        });
    };

    const toggleCategory = (catId: string) => {
        setFormData(prev => {
            const categories = prev.categories.includes(catId)
                ? prev.categories.filter(id => id !== catId)
                : [...prev.categories, catId];
            return { ...prev, categories };
        });
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
            setImageUrls(prev => [...prev, ...newUrls]);
            // Also update previews
            setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Failed to upload some images";
            alert(msg);
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const setCoverImage = (indexToCover: number) => {
        if (indexToCover === 0) return; // Already cover

        setImageUrls(prev => {
            const newUrls = [...prev];
            const item = newUrls.splice(indexToCover, 1)[0];
            newUrls.unshift(item);
            return newUrls;
        });

        setPreviews(prev => {
            const newPreviews = [...prev];
            const item = newPreviews.splice(indexToCover, 1)[0];
            newPreviews.unshift(item);
            return newPreviews;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.categories.length === 0) {
            alert("Please select at least one category");
            return;
        }
        if (imageUrls.length === 0) {
            alert("Please upload at least one image");
            return;
        }

        setLoading(true);
        try {
            // Process colors from comma separated string to array
            const colorsArray = formData.print_colors
                ? formData.print_colors.split(",").map(c => c.trim()).filter(Boolean)
                : [];

            await api.post("/designs", {
                ...formData,
                base_price: parseFloat(formData.base_price),
                min_quantity: parseInt(formData.min_quantity),
                available_stock: parseInt(formData.available_stock),
                print_price: parseFloat(formData.print_price),
                print_price_unit: parseInt(formData.print_price_unit),
                print_colors: colorsArray,
                thumbnail_url: imageUrls[0], // Use first image as thumbnail
                image_urls: imageUrls,
            });
            router.push("/admin/designs");
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to publish card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Upload New Card</h1>
                <p className="text-muted-foreground mt-1">Step {step} of 3: {
                    step === 1 ? "Basic Details" : step === 2 ? "Upload Images" : "Review & Publish"
                }</p>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-muted mt-4 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Card Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Royal Wedding Invitation"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Categories (Select one or more)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`cursor-pointer border rounded-md p-2 text-center text-sm transition-colors ${formData.categories.includes(cat.id)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:border-primary/50"
                                                }`}
                                        >
                                            {cat.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="price">Base Card Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="5.50"
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Cost of the physical unprinted card.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min_quantity">Min Purchase (MOQ)</Label>
                                    <Input
                                        id="min_quantity"
                                        type="number"
                                        placeholder="100"
                                        value={formData.min_quantity}
                                        onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="available_stock">Available Stock</Label>
                                    <Input
                                        id="available_stock"
                                        type="number"
                                        placeholder="1000"
                                        value={formData.available_stock}
                                        onChange={(e) => setFormData({ ...formData, available_stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <fieldset className="border p-4 rounded-md space-y-4 relative">
                                <legend className="text-sm font-semibold px-2 text-primary">Printing Details</legend>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="print_price">Printing Cost (₹)</Label>
                                        <Input
                                            id="print_price"
                                            type="number"
                                            step="0.01"
                                            placeholder="200"
                                            value={formData.print_price}
                                            onChange={(e) => setFormData({ ...formData, print_price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="print_price_unit">Cost is per X cards</Label>
                                        <Input
                                            id="print_price_unit"
                                            type="number"
                                            placeholder="100"
                                            value={formData.print_price_unit}
                                            onChange={(e) => setFormData({ ...formData, print_price_unit: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">E.g., ₹200 per 100 cards.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="print_colors">Available Print Colors</Label>
                                    <Input
                                        id="print_colors"
                                        placeholder="e.g. Red, Gold, Silver Foil, Black"
                                        value={formData.print_colors}
                                        onChange={(e) => setFormData({ ...formData, print_colors: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Comma-separated list of colors the user can choose from.</p>
                                </div>
                            </fieldset>

                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <textarea
                                    id="description"
                                    className="w-full h-24 p-3 border rounded-md text-sm bg-background"
                                    placeholder="Describe the card material, texture, or finish..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/10 transition-colors relative">
                                <div className="text-4xl mb-4">📸</div>
                                <h3 className="font-semibold text-lg">Upload Card Gallery Images</h3>
                                <p className="text-sm text-muted-foreground mt-1">Select one or more beautiful images of the card.</p>
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
                                    {previews.length > 0 && (
                                        <Button type="button" variant="ghost" onClick={() => { setImageUrls([]); setPreviews([]); }} className="text-destructive">
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    {previews.map((src, i) => (
                                        <div key={i} className="aspect-square rounded-lg border overflow-hidden relative group shadow-sm transition-all hover:shadow-md">
                                            <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                            {/* Cover / Set Cover Badge */}
                                            {i === 0 ? (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow z-10">
                                                    Cover
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImage(i)}
                                                    className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-10"
                                                >
                                                    Set as Cover
                                                </button>
                                            )}
                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 bg-destructive/80 text-white w-6 h-6 flex items-center justify-center rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive text-xs z-10"
                                                title="Remove Image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Card Name</span>
                                    <span className="font-medium">{formData.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Categories</span>
                                    <span className="font-medium">{formData.categories.join(", ")}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Pricing</span>
                                    <span className="font-medium">₹{formData.base_price} / card</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">MOQ</span>
                                    <span className="font-medium">{formData.min_quantity} units</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Images Attached</span>
                                    <span className="font-medium">{imageUrls.length}</span>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                By publishing, this card will immediately become available in the Browsing Library.
                            </p>
                        </div>
                    )}

                    <div className="pt-6 border-t flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1 || loading}
                        >
                            Back
                        </Button>

                        {step < 3 ? (
                            <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90" disabled={uploadingImages}>
                                {uploadingImages ? "Uploading..." : "Continue"}
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                {loading ? "Publishing..." : "Publish Card"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
