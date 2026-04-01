import { Button } from "@/components/ui/button";
import { Link, useParams } from 'react-router-dom';
import { ProductGallery } from "@/components/cards/ProductGallery";
import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';

// Define the interface for the design
interface CardDesign {
    id: string;
    name: string;
    slug: string;
    categories: string[];
    style: string;
    description: string;
    original_price?: number;
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
    try {
        const res = await api.get(`/designs/${slug}`);
        return res.data;
    } catch (e) {
        console.error("Failed to fetch design", e);
        return null;
    }
}

export default function DesignDetailPage() {
    const { slug } = useParams();
    const [design, setDesign] = useState<CardDesign | null>(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!design) return;
        addToCart({
            id: design.id,
            name: design.name,
            slug: design.slug,
            thumbnail_url: design.image_urls?.[0] || design.thumbnail_url || '',
            base_price: design.base_price,
            original_price: design.original_price,
            quantity: design.min_quantity || 1
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    useEffect(() => {
        if (slug) {
            getDesignBySlug(slug).then(data => {
                setDesign(data);
                setLoading(false);
            });
        }
    }, [slug]);

    if (loading) {
        return <div className="py-24 text-center">{t('cardDetail.loading')}</div>;
    }

    if (!design) {
        return <div className="py-24 text-center">{t('cardDetail.notFound')}</div>;
    }

    const galleryImages = [
        design.thumbnail_url,
        ...(design.image_urls || [])
    ].filter((url): url is string => !!url && typeof url === 'string');
    
    // Remove duplicates while preserving order
    const images = Array.from(new Set(galleryImages));

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Breadcrumb back navigation */}
            <div className="mb-8">
                <Link to="/cards" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/0000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                    {t('cardDetail.backToCatalog')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <ProductGallery images={images} productName={design.name} />
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

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                        {design.name}
                    </h1>

                    {(() => {
                        const originalPrice = design.original_price || design.base_price;
                        const hasDiscount = originalPrice > design.base_price;
                        const discountPercent = hasDiscount ? Math.round(((originalPrice - design.base_price) / originalPrice) * 100) : 0;
                        
                        return (
                            <div className="mb-8">
                                {hasDiscount && (
                                    <div className="text-xs font-bold text-green-700 tracking-wider uppercase mb-2 drop-shadow-sm flex items-center gap-1">
                                        <span>SUPER DEALS</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-2">
                                    {hasDiscount && (
                                        <>
                                            <span className="text-2xl font-extrabold text-green-700 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                                {discountPercent}%
                                            </span>
                                            <span className="text-2xl text-muted-foreground line-through decoration-muted-foreground/60 decoration-2 font-medium">₹{originalPrice}</span>
                                        </>
                                    )}
                                    <span className="text-4xl sm:text-5xl font-extrabold text-foreground font-sans tracking-tight">₹{design.base_price}</span>
                                    <span className="text-base font-normal text-muted-foreground mt-4">/card</span>
                                </div>
                                {design.min_quantity && (
                                    <div className="text-sm text-amber-600 font-semibold mt-3 flex items-center gap-2 bg-amber-50 w-fit px-3 py-1.5 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                                        {t('cardDetail.minimumOrder', { count: design.min_quantity })}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="prose prose-sm md:prose-base mb-8 text-muted-foreground">
                        <p className="leading-relaxed">
                            {design.description || t('cardDetail.defaultDescription')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-y py-6 mb-8">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">{t('cardDetail.styleTheme')}</span>
                            <span className="font-medium capitalize">{design.style || t('common.traditional')}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">{t('cardDetail.orientation')}</span>
                            <span className="font-medium capitalize">{design.orientation}</span>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <span className="text-sm text-muted-foreground mb-1">{t('cardDetail.languagesSupported')}</span>
                            <span className="font-medium uppercase">{(design.supported_langs || []).join(", ") || "EN"}</span>
                        </div>
                    </div>

                    {/* Print Details & Stock Status */}
                    <div className="bg-muted/30 p-6 rounded-xl border mb-8 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-sm font-medium text-muted-foreground">{t('cardDetail.availability')}</span>
                            {design.available_stock > 0 ? (
                                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{t('cardDetail.inStock', { count: design.available_stock })}</span>
                            ) : (
                                <span className="text-sm font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">{t('cardDetail.outOfStock')}</span>
                            )}
                        </div>
                        {design.print_price > 0 && (
                            <div className="flex justify-between items-center pb-3 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">{t('cardDetail.printingCost')}</span>
                                <span className="text-sm font-medium">{t('cardDetail.printCostValue', { price: design.print_price, unit: design.print_price_unit })}</span>
                            </div>
                        )}
                        {design.print_colors && design.print_colors.length > 0 && (
                            <div className="pt-2">
                                <span className="text-sm font-medium text-muted-foreground block mb-3">{t('cardDetail.availablePrintColors')}</span>
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
                                <p className="text-[10px] text-muted-foreground mt-3">{t('cardDetail.selectColorHint')}</p>
                            </div>
                        )}
                    </div>

                    {/* Call To Action */}
                    <div className="mt-auto pt-4 flex gap-4">
                        {design.available_stock > 0 ? (
                            <>
                                <Button 
                                    onClick={handleAddToCart}
                                    size="lg" 
                                    variant="outline" 
                                    className={`flex-1 text-lg h-14 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${added ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-muted/20'}`}
                                >
                                    {added ? 'Added to Cart!' : 'Add to Cart'}
                                </Button>
                                <Link to={`/checkout?design=${design.slug}`} className="flex-1">
                                    <Button size="lg" className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        {t('cardDetail.orderNow')}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Button size="lg" disabled className="w-full text-lg h-14 opacity-50 cursor-not-allowed">
                                {t('cardDetail.currentlyOutOfStock')}
                            </Button>
                        )}
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            {t('cardDetail.ctaHint')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
