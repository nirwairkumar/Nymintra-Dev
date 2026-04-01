import { Button } from "@/components/ui/button";
import { Link, useParams } from 'react-router-dom';
import { ProductGallery } from "@/components/cards/ProductGallery";
import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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

    const images = design.image_urls && design.image_urls.length > 0
        ? design.image_urls
        : [design.thumbnail_url].filter(Boolean);

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

                    <div className="mb-8">
                        <div className="text-3xl sm:text-4xl font-bold text-primary">₹{design.base_price}</div>
                        <div className="text-sm text-muted-foreground mt-1">{t('cardDetail.pricePerCard')}</div>
                        {design.min_quantity && (
                            <div className="text-xs text-amber-600 font-medium mt-1">{t('cardDetail.minimumOrder', { count: design.min_quantity })}</div>
                        )}
                    </div>

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
                    <div className="mt-auto pt-4">
                        {design.available_stock > 0 ? (
                            <Link to={`/checkout?design=${design.slug}`} className="block w-full">
                                <Button size="lg" className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                    {t('cardDetail.orderNow')}
                                </Button>
                            </Link>
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
