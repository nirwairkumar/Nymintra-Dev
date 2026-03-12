import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

async function getDesigns(category?: string) {
    // If running on the server, we need to handle potential undefined API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const url = new URL(`${apiUrl}/designs/`);

    if (category && category !== 'all') {
        url.searchParams.append('category', category);
    }

    try {
        // Adding cache: 'no-store' for development, switch to ISR for production
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch designs", e);
        return [];
    }
}

// In Next.js App Router, the page component can be async and access searchParams
export default async function CardsCatalog({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Await searchParams in Next 15+ if needed, but it's fine as an object in 13/14.
    // Assuming Next.js 14 based on the project age, searchParams is synchronously available, 
    // but Next.js 15 requires it to be awaited. We'll access it directly for now.
    const resolvedParams = await searchParams;
    const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';

    const designs = await getDesigns(category);

    // Hardcoded categories for now
    const categories = [
        { id: 'all', name: 'All Cards' },
        { id: 'wedding', name: 'Wedding' },
        { id: 'birthday', name: 'Birthday' },
        { id: 'engagement', name: 'Engagement' },
        { id: 'puja', name: 'Religious / Puja' },
        { id: 'anniversary', name: 'Anniversary' },
        { id: 'corporate', name: 'Corporate' },
    ];

    return (
        <div className="py-12 bg-background min-h-screen">
            <div className="container px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-24">
                        <h2 className="font-serif text-2xl font-bold mb-6">Categories</h2>
                        <ul className="space-y-2">
                            {categories.map(c => (
                                <li key={c.id}>
                                    <Link
                                        href={c.id === 'all' ? '/cards' : `/cards?category=${c.id}`}
                                        className={`block py-2 px-3 rounded-md transition-colors ${category === c.id
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="flex-1">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Card Catalog</h1>
                    <p className="text-muted-foreground mb-8">
                        Browse our collection of premium cards for every occasion.
                    </p>

                    {designs.length === 0 ? (
                        <div className="py-12 text-center border rounded-xl bg-muted/30">
                            <p className="text-muted-foreground">No cards found for this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {designs.map((design: any) => (
                                <div key={design.id} className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
                                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                        {design.thumbnail_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={design.thumbnail_url}
                                                alt={design.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-muted-foreground text-4xl">🎴</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-semibold text-lg font-serif mb-1 truncate" title={design.name}>{design.name}</h3>
                                        <p className="text-muted-foreground text-xs mb-4 capitalize">
                                            {design.categories?.slice(0, 2).join(" • ") || design.category || "General"}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">₹{design.base_price}</span>
                                                {design.min_quantity && (
                                                    <span className="text-[10px] text-muted-foreground">Min. {design.min_quantity} units</span>
                                                )}
                                            </div>
                                            <Link href={`/cards/${design.slug}`}>
                                                <Button size="sm">View Details</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
