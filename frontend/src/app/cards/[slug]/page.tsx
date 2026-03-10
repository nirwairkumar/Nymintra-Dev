import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

// Define the interface for the design
interface CardDesign {
    id: string;
    name: string;
    slug: string;
    categories: string[];
    style: string;
    description: string;
    base_price: number;
    min_quantity: number;
    thumbnail_url: string;
    image_urls: string[];
    preview_url?: string;
    print_url?: string;
    zones_json?: any;
    supported_langs: string[];
    orientation: string;
    is_active: boolean;
    sort_order: number;
    available_stock: number;
    print_price: number;
    print_price_unit: number;
    print_colors: string[];
}

// Fetch the design from the backend
async function getDesignBySlug(slug: string): Promise<CardDesign | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    try {
        const res = await fetch(`${apiUrl}/designs/${slug}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default async function DesignDetailPage({ params }: { params: { slug: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const design = await getDesignBySlug(resolvedParams.slug);

    if (!design) {
        notFound();
    }

    const images = design.image_urls && design.image_urls.length > 0
        ? design.image_urls
        : [design.thumbnail_url].filter(Boolean);

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Breadcrumb back navigation */}
            <div className="mb-8">
                <Link href="/cards" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/0000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Catalog
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div className="aspect-[3/4] bg-muted/30 rounded-2xl overflow-hidden relative border shadow-sm flex items-center justify-center p-4">
                        {images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={images[0]}
                                alt={design.name}
                                className="w-full h-full object-contain drop-shadow-xl"
                            />
                        ) : (
                            <div className="text-center">
                                <span className="text-muted-foreground block text-lg font-serif">Image Unavailable</span>
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {images.map((url, i) => (
                                <div key={i} className="aspect-square rounded-md border bg-muted/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                    <img src={url} alt={`View ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col py-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(design.categories || []).map(cat => (
                            <div key={cat} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {cat}
                            </div>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                        {design.name}
                    </h1>

                    <div className="mb-8">
                        <div className="text-4xl font-bold text-primary">₹{design.base_price}</div>
                        <div className="text-sm text-muted-foreground mt-1">Price per card</div>
                        {design.min_quantity && (
                            <div className="text-xs text-amber-600 font-medium mt-1">Minimum Order: {design.min_quantity} units</div>
                        )}
                    </div>

                    <div className="prose prose-sm md:prose-base mb-8 text-muted-foreground">
                        <p className="leading-relaxed">
                            {design.description || "A beautifully crafted invitation to turn your special moments into lifelong memories. Customize wording, fonts, and layouts to perfect your personal touch."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-y py-6 mb-8">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">Style Theme</span>
                            <span className="font-medium capitalize">{design.style || "Traditional"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">Orientation</span>
                            <span className="font-medium capitalize">{design.orientation}</span>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <span className="text-sm text-muted-foreground mb-1">Languages Supported</span>
                            <span className="font-medium uppercase">{(design.supported_langs || []).join(", ") || "EN"}</span>
                        </div>
                    </div>

                    {/* Print Details & Stock Status */}
                    <div className="bg-muted/30 p-6 rounded-xl border mb-8 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-sm font-medium text-muted-foreground">Availability</span>
                            {design.available_stock > 0 ? (
                                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{design.available_stock} in stock</span>
                            ) : (
                                <span className="text-sm font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">Out of Stock</span>
                            )}
                        </div>
                        {design.print_price > 0 && (
                            <div className="flex justify-between items-center pb-3 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">Printing Cost</span>
                                <span className="text-sm font-medium">₹{design.print_price} per {design.print_price_unit} cards</span>
                            </div>
                        )}
                        {design.print_colors && design.print_colors.length > 0 && (
                            <div className="pt-2">
                                <span className="text-sm font-medium text-muted-foreground block mb-3">Available Print Colors</span>
                                <div className="flex flex-wrap gap-2">
                                    {design.print_colors.map((color, idx) => (
                                        <div key={idx} className="text-xs font-medium px-3 py-1.5 rounded-md border bg-background shadow-sm flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full border shadow-sm"
                                                style={{ backgroundColor: color.toLowerCase() === 'gold' ? '#FFD700' : color.toLowerCase() === 'silver' ? '#C0C0C0' : color.toLowerCase() }}
                                            />
                                            {color}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3">You will select your preferred color during checkout.</p>
                            </div>
                        )}
                    </div>

                    {/* Call To Action */}
                    <div className="mt-auto pt-4">
                        {design.available_stock > 0 ? (
                            <Link href={`/checkout?design=${design.slug}`} className="block w-full">
                                <Button size="lg" className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                    Customize and Checkout
                                </Button>
                            </Link>
                        ) : (
                            <Button size="lg" disabled className="w-full text-lg h-14 opacity-50 cursor-not-allowed">
                                Currently Out of Stock
                            </Button>
                        )}
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            You can review the design, select print color, and enter delivery details in the next step.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
