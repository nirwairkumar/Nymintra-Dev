"use client";

import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Trash2, Eye, EyeOff, Edit3, Plus } from "lucide-react";

export default function AdminDesignsPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            // Using the new admin endpoint to see all cards (active/inactive)
            const res = await api.get('/designs/admin/all');
            setCards(res.data);
        } catch (e) {
            console.error("Failed to fetch cards", e);
            // Fallback to public endpoint if admin one fails for some reason
            try {
                const res = await api.get('/designs');
                setCards(res.data);
            } catch (inner) {
                console.error("Total fetch failure", inner);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (card: any) => {
        try {
            const newStatus = !card.is_active;
            await api.patch(`/designs/${card.id}`, { is_active: newStatus });
            
            // Optimistic update
            setCards(prev => prev.map(c => 
                c.id === card.id ? { ...c, is_active: newStatus } : c
            ));
        } catch (e) {
            console.error("Toggle fail", e);
            alert("Failed to update card status");
        }
    };

    const handleDelete = async (card: any) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${card.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/designs/${card.id}`);
            // Remove from state
            setCards(prev => prev.filter(c => c.id !== card.id));
        } catch (e) {
            console.error("Delete fail", e);
            alert("Failed to delete card");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Card Library</h1>
                    <p className="text-muted-foreground mt-1">Manage all available designs, pricing, and visibility.</p>
                </div>
                <Link to="/admin/designs/upload">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Upload New Card
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium animate-pulse">Loading Card Designs...</p>
                </div>
            ) : cards.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                    <div className="text-5xl mb-4 text-muted-foreground/30">🎴</div>
                    <h3 className="text-lg font-semibold">No cards found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">Start by uploading your first card design to showcase in the store.</p>
                    <Link to="/admin/designs/upload" className="mt-6 block">
                        <Button variant="outline">Upload your first card</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cards.map((card) => (
                        <div key={card.id} className={`group border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${!card.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                            <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                {card.thumbnail_url ? (
                                    <img
                                        src={card.thumbnail_url}
                                        alt={card.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">🎴</div>
                                )}
                                
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg ${card.is_active ? 'bg-emerald-500' : 'bg-zinc-500'}`}>
                                {card.is_active ? 'Active' : 'Hidden'}
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col bg-card">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-base font-serif truncate flex-1" title={card.name}>{card.name}</h3>
                                    <span className="text-emerald-700 font-bold text-sm">₹{card.base_price}</span>
                                </div>
                                
                                <div className="mt-3 grid grid-cols-2 gap-y-2 text-[11px] text-muted-foreground">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground font-sans">Stock</span>
                                        <span>{card.available_stock} units</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="font-bold text-foreground font-sans text-right">Min Qty</span>
                                        <span>{card.min_quantity} units</span>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t flex flex-wrap gap-2">
                                    <Link to={`/admin/designs/upload?edit=${card.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                                            <Edit3 className="h-3 w-3" /> Edit
                                        </Button>
                                    </Link>
                                    
                                    <Button
                                        variant={card.is_active ? "outline" : "secondary"}
                                        size="sm"
                                        className={`flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider ${card.is_active ? 'border-zinc-200 text-zinc-600' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                        onClick={() => handleStatusToggle(card)}
                                    >
                                        {card.is_active ? (
                                            <span className="flex items-center justify-center gap-2"><EyeOff className="h-3 w-3" /> Hide</span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2"><Eye className="h-3 w-3" /> Publish</span>
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                                        onClick={() => handleDelete(card)}
                                        title="Delete Permanently"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
