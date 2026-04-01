"use client";

import { useEffect, useState, Suspense } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const CATEGORIES = [
    { id: "wedding", label: "Wedding" },
    { id: "engagement", label: "Engagement" },
    { id: "birthday", label: "Birthday" },
    { id: "puja", label: "Religious / Puja" },
    { id: "anniversary", label: "Anniversary" },
    { id: "corporate", label: "Corporate" },
];

const AVAILABLE_COLORS = [
    { name: "Red", value: "#FF0000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Green", value: "#008000" },
    { name: "Gold", value: "#FFD700" },
    { name: "Silver", value: "#C0C0C0" },
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF", border: true },
    { name: "Pink", value: "#FFC0CB" },
    { name: "Purple", value: "#800080" },
    { name: "Yellow", value: "#FFFF00" },
    { name: "Orange", value: "#FFA500" },
    { name: "Rose Gold", value: "#B76E79" },
    { name: "Maroon", value: "#800000" },
];

function AdminDesignForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditMode = !!editId;

    const [activeSection, setActiveSection] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        categories: [] as string[],
        original_price: "",
        base_price: "",
        min_quantity: "50",
        description: "",
        available_stock: "1000",
        print_price: "0",
        print_price_unit: "100",
        print_colors: "",
        style: "Traditional",
        custom_style: "",
        orientation: "Portrait",
        supported_langs: ["EN"],
    });

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const sections = [
        { id: "basic", label: "Basic Details", icon: "📝" },
        { id: "images", label: "Gallery Images", icon: "📸" },
        { id: "pricing", label: "Pricing & Printing", icon: "💰" },
        { id: "publish", label: "Review & Publish", icon: "✅" }
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchDesign();
        }
    }, [editId]);

    const fetchDesign = async () => {
        try {
            const res = await api.get(`/designs/by-id/${editId}`);
            const design = res.data;

            setFormData({
                name: design.name,
                slug: design.slug,
                categories: design.categories || [],
                original_price: design.original_price ? design.original_price.toString() : "",
                base_price: design.base_price.toString(),
                min_quantity: design.min_quantity.toString(),
                description: design.description || "",
                available_stock: design.available_stock.toString(),
                print_price: design.print_price.toString(),
                print_price_unit: (design.print_price_unit || 100).toString(),
                print_colors: design.print_colors ? design.print_colors.join(", ") : "",
                style: ["Traditional", "Modern", "Floral", "Minimalist"].includes(design.style) ? design.style : "Other",
                custom_style: ["Traditional", "Modern", "Floral", "Minimalist"].includes(design.style) ? "" : design.style,
                orientation: design.orientation || "Portrait",
                supported_langs: design.supported_langs || ["EN"],
            });

            setImageUrls(design.image_urls || [design.thumbnail_url].filter(Boolean));
            setPreviews(design.image_urls || [design.thumbnail_url].filter(Boolean));
        } catch (err) {
            console.error("Failed to fetch design", err);
            alert("Failed to load design for editing");
        } finally {
            setFetching(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: isEditMode ? formData.slug : generateSlug(name)
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

    const toggleLanguage = (langId: string) => {
        setFormData(prev => {
            const supported_langs = prev.supported_langs.includes(langId)
                ? prev.supported_langs.filter(id => id !== langId)
                : [...prev.supported_langs, langId];
            return { ...prev, supported_langs };
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
            setPreviews(prev => [...prev, ...newUrls]);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to upload some images");
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const setCoverImage = (indexToCover: number) => {
        if (indexToCover === 0) return;

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

    const handleSave = async () => {
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
            const colorsArray = formData.print_colors
                ? formData.print_colors.split(",").map(c => c.trim()).filter(Boolean)
                : [];

            const payload = {
                ...formData,
                original_price: formData.original_price ? parseFloat(formData.original_price) : null,
                base_price: parseFloat(formData.base_price),
                min_quantity: parseInt(formData.min_quantity),
                available_stock: parseInt(formData.available_stock),
                print_price: parseFloat(formData.print_price),
                print_price_unit: parseInt(formData.print_price_unit),
                print_colors: colorsArray,
                style: formData.style === "Other" ? formData.custom_style : formData.style,
                orientation: formData.orientation,
                supported_langs: formData.supported_langs,
                thumbnail_url: imageUrls[0],
                image_urls: imageUrls,
            };

            if (isEditMode) {
                await api.patch(`/designs/${editId}`, payload);
            } else {
                await api.post("/designs", payload);
            }

            navigate("/admin/designs");
        } catch (err: any) {
            alert(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'publish'} card`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="py-24 text-center">Loading design details...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">
                    {isEditMode ? "Edit Card Design" : "Upload New Card"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage the details, images, and pricing for this design.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Left Navigation Sidebar */}
                <div className="w-full md:w-64 bg-card border rounded-xl overflow-hidden shadow-sm flex-shrink-0 sticky top-24">
                    <nav className="flex flex-col">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-3 px-4 py-4 text-left font-medium transition-colors border-l-4 ${
                                    activeSection === section.id
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <span className="text-xl">{section.icon}</span>
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-card border rounded-xl p-6 shadow-sm min-h-[500px]">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                        {activeSection === "basic" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold border-b pb-2">Basic Details</h2>
                                
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
                                            disabled={isEditMode}
                                            required
                                        />
                                        {isEditMode && <p className="text-[10px] text-muted-foreground">URL slug cannot be changed after creation.</p>}
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

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="style">Style Theme</Label>
                                        <select
                                            id="style"
                                            className="w-full h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={formData.style}
                                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                                        >
                                            <option value="Traditional">Traditional</option>
                                            <option value="Modern">Modern</option>
                                            <option value="Floral">Floral</option>
                                            <option value="Minimalist">Minimalist</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {formData.style === "Other" && (
                                            <Input
                                                className="mt-2"
                                                placeholder="Specify style..."
                                                value={formData.custom_style}
                                                onChange={(e) => setFormData({ ...formData, custom_style: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="orientation">Orientation</Label>
                                        <select
                                            id="orientation"
                                            className="w-full h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={formData.orientation}
                                            onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                                        >
                                            <option value="Portrait">Portrait</option>
                                            <option value="Landscape">Landscape</option>
                                            <option value="Square">Square</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Languages Supported</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: "EN", label: "English" },
                                                { id: "HI", label: "Hindi" }
                                            ].map(lang => (
                                                <div
                                                    key={lang.id}
                                                    onClick={() => toggleLanguage(lang.id)}
                                                    className={`cursor-pointer border rounded-md p-2 text-center text-sm transition-colors flex-1 ${formData.supported_langs.includes(lang.id)
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background hover:border-primary/50"
                                                        }`}
                                                >
                                                    {lang.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

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
                                
                                <div className="flex justify-end pt-4">
                                    <Button type="button" onClick={() => setActiveSection("images")}>Next: Images</Button>
                                </div>
                            </div>
                        )}

                        {activeSection === "images" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold border-b pb-2">Gallery Images</h2>
                                
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/10 transition-colors relative">
                                    <div className="text-4xl mb-4">📸</div>
                                    <h3 className="font-semibold text-lg">Upload Card Gallery Images</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Select one or more beautiful images of the card.</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
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
                                        {previews.map((src, i) => {
                                            const isVideo = src.match(/\.(mp4|webm|mov)$/i);
                                            return (
                                                <div key={i} className="aspect-square rounded-lg border overflow-hidden relative group shadow-sm transition-all hover:shadow-md bg-muted/20">
                                                    {isVideo ? (
                                                        <video src={src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                                    ) : (
                                                        <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                                    )}
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
                                            );
                                        })}
                                    </div>
                                )}
                                
                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setActiveSection("basic")}>Back</Button>
                                    <Button type="button" onClick={() => setActiveSection("pricing")}>Next: Pricing</Button>
                                </div>
                            </div>
                        )}

                        {activeSection === "pricing" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold border-b pb-2">Pricing & Printing</h2>
                                
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="original_price">Original Price/Card (MSRP ₹)</Label>
                                        <Input
                                            id="original_price"
                                            type="number"
                                            step="0.01"
                                            placeholder="28.00"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">Leave empty if no discount.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Discounted Price/Card (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="6.50"
                                            value={formData.base_price}
                                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">Final robust selling price.</p>
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

                                <fieldset className="border p-4 rounded-md space-y-4 relative bg-muted/10">
                                    <legend className="text-sm font-semibold px-2 text-primary">Printing Details</legend>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="print_price">Print Price (per 100 cards) (₹)</Label>
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
                                            <p className="text-[10px] text-muted-foreground mt-1">Leave at 100 to match the label.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Available Print Colors (Ink)</Label>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {AVAILABLE_COLORS.map(color => {
                                                const selectedColors = formData.print_colors ? formData.print_colors.split(',').map(c => c.trim()) : [];
                                                const isSelected = selectedColors.includes(color.name);
                                                return (
                                                    <div key={color.name} className="flex flex-col items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setFormData({ ...formData, print_colors: selectedColors.filter(c => c !== color.name).join(", ") });
                                                                } else {
                                                                    setFormData({ ...formData, print_colors: [...selectedColors, color.name].join(", ") });
                                                                }
                                                            }}
                                                            title={color.name}
                                                            className={`w-8 h-8 rounded-full ${color.border ? 'border border-border' : ''} shadow-sm transition-transform ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                                            style={{ backgroundColor: color.value }}
                                                        />
                                                        <span className="text-[10px] font-medium text-muted-foreground">{color.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1 text-right">Click to toggle the color availability.</p>
                                    </div>
                                </fieldset>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setActiveSection("images")}>Back</Button>
                                    <Button type="button" onClick={() => setActiveSection("publish")}>Next: Review</Button>
                                </div>
                            </div>
                        )}

                        {activeSection === "publish" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold border-b pb-2">Review & Publish</h2>
                                
                                <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Card Name</span>
                                        <span className="font-medium">{formData.name || "—"}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Categories</span>
                                        <span className="font-medium">{formData.categories.length > 0 ? formData.categories.join(", ") : "—"}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Pricing</span>
                                        <span className="font-medium">₹{formData.base_price || "0"} / card</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">MOQ</span>
                                        <span className="font-medium">{formData.min_quantity || "0"} units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Images Attached</span>
                                        <span className="font-medium">{imageUrls.length}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    {isEditMode
                                        ? "By saving, the updated details will be reflected in the Browsing Library."
                                        : "By publishing, this card will immediately become available in the Browsing Library."
                                    }
                                </p>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setActiveSection("pricing")}>Back</Button>
                                    
                                    <Button
                                        key="save-btn"
                                        type="button"
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8"
                                    >
                                        {loading ? (isEditMode ? "Saving..." : "Publishing...") : (isEditMode ? "Save Changes" : "Publish Card")}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AdminUploadCard() {
    return (
        <Suspense fallback={<div className="py-24 text-center">Loading form...</div>}>
            <AdminDesignForm />
        </Suspense>
    );
}
