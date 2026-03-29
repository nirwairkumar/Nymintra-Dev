"use client";

import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function AdminDesignsPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await api.get('/designs');
            setCards(res.data);
        } catch (e) {
            console.error("Failed to fetch cards", e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (_card: any) => {
        try {
            // Placeholder for toggle status API
            alert("Toggle status functionality to be implemented in Phase 6");
        } catch (e) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Card Library</h1>
                    <p className="text-muted-foreground mt-1">Manage all available cards, pricing, and categories.</p>
                </div>
                <Link to="/admin/designs/upload">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        + Upload New Card
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="py-24 text-center">Loading cards...</div>
            ) : cards.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No cards uploaded yet.</p>
                    <Link to="/admin/designs/upload" className="mt-4 block">
                        <Button variant="outline">Upload your first card</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {cards.map((card) => (
                        <div key={card.id} className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col group">
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
                                <div className={`absolute top-2 right-2 text-white text-[10px] px-2 py-0.5 rounded shadow ${card.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                                    {card.is_active ? 'Active' : 'Hidden'}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-semibold text-lg font-serif truncate" title={card.name}>{card.name}</h3>
                                <div className="mt-1 space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Categories:</span> {card.categories?.join(", ") || "None"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Price:</span> ₹{card.base_price} / card
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">MOQ:</span> {card.min_quantity} units
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-between gap-2">
                                    <Link to={`/admin/designs/upload?edit=${card.id}`} className="w-full">
                                        <Button variant="outline" size="sm" className="w-full">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`w-full ${card.is_active ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}`}
                                        onClick={() => handleStatusToggle(card)}
                                    >
                                        {card.is_active ? 'Disable' : 'Enable'}
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
