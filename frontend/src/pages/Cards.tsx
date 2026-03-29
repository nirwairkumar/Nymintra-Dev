import { Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

async function getDesigns(category?: string) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.nymintra.com/api/v1';
    const url = new URL(`${apiUrl}/designs/`);
    if (category && category !== 'all') url.searchParams.append('category', category);
    try {
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch designs", e);
        return [];
    }
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CardsCatalog() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || 'all';
    
    const [designs, setDesigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDesigns(category).then(data => {
            setDesigns(data);
        }).finally(() => {
            setLoading(false);
        });
    }, [category]);

    const categories = [
        { id: 'all', name: 'All Collections' },
        { id: 'wedding', name: 'Wedding (Shaadi)' },
        { id: 'engagement', name: 'Engagement (Roka)' },
        { id: 'haldi', name: 'Haldi & Mehndi' },
        { id: 'puja', name: 'Religious / Puja' },
        { id: 'anniversary', name: 'Anniversary' },
        { id: 'birthday', name: 'Birthday' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 bg-background min-h-screen relative overflow-hidden"
        >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

            <div className="container px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 shrink-0">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="sticky top-24 backdrop-blur-md bg-card/50 p-6 rounded-2xl border border-primary/10 shadow-sm"
                    >
                        <h2 className="font-serif text-2xl font-bold mb-6 text-primary border-b border-primary/10 pb-4">Aesthetics</h2>
                        <ul className="space-y-3">
                            {categories.map(c => (
                                <li key={c.id}>
                                    <Link
                                        to={c.id === 'all' ? '/cards' : `/cards?category=${c.id}`}
                                        className={`flex items-center justify-between py-2 px-4 rounded-xl transition-all duration-300 ${category === c.id
                                            ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary font-semibold border-l-4 border-primary'
                                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground border-l-4 border-transparent'
                                            }`}
                                    >
                                        {c.name}
                                        {category === c.id && <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </aside>

                <main className="flex-1">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                            Premium Invitations
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            Discover deeply rooted, culturally rich designs tailored for your unforgettable moments.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="rounded-2xl bg-muted/20 animate-pulse aspect-[3/4]"></div>
                            ))}
                        </div>
                    ) : designs.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-24 text-center border border-dashed border-primary/20 rounded-2xl bg-primary/5 backdrop-blur-sm"
                        >
                            <p className="text-muted-foreground text-lg font-medium">We couldn't find any designs in this collection currently.</p>
                            <Button variant="outline" className="mt-6 border-primary/20 hover:bg-primary sm:hover:text-primary-foreground text-primary">Browse All</Button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {designs.map((design: any) => (
                                <motion.div 
                                    variants={itemVariants}
                                    key={design.id} 
                                    className="border border-border/60 rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30 relative"
                                >
                                    {/* Gold Accent Corner */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/40 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                        {design.thumbnail_url ? (
                                            <img
                                                src={design.thumbnail_url}
                                                alt={design.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                                                <span className="text-muted-foreground/30 text-6xl">🎴</span>
                                            </div>
                                        )}
                                        
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                            <Link to={`/cards/${design.slug}`} className="w-full">
                                                <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl border-none font-semibold">
                                                    Customize Design
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-card to-card/95">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h3 className="font-semibold text-lg font-serif truncate text-foreground group-hover:text-primary transition-colors" title={design.name}>{design.name}</h3>
                                            <span className="font-bold text-lg whitespace-nowrap text-primary">₹{design.base_price}</span>
                                        </div>
                                        <p className="text-muted-foreground text-xs mb-4 uppercase tracking-wider font-medium">
                                            {design.categories?.slice(0, 2).join(" • ") || design.category || "General"}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                                            {design.min_quantity && (
                                                <span className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/0000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                                                    Min {design.min_quantity} qty
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </main>
            </div>
        </motion.div>
    );
}
