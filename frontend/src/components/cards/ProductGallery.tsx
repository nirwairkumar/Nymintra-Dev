"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openModal = (index: number) => setSelectedImageIndex(index);
    const closeModal = () => setSelectedImageIndex(null);

    const goToPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div
                    className="aspect-[3/4] bg-muted/30 rounded-2xl overflow-hidden relative border shadow-sm flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => images.length > 0 && openModal(0)}
                >
                    {images.length > 0 ? (
                        <img
                            src={images[0]}
                            alt={productName}
                            className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
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
                            <div
                                key={i}
                                className="aspect-square rounded-md border bg-muted/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openModal(i)}
                            >
                                <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeModal}>
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50 rounded-full bg-black/50"
                        onClick={closeModal}
                    >
                        <X size={24} />
                    </button>

                    {images.length > 1 && (
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-50 rounded-full bg-black/50"
                            onClick={goToPrev}
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    <div className="w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[selectedImageIndex]}
                            alt={`${productName} view ${selectedImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {images.length > 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-50 rounded-full bg-black/50"
                            onClick={goToNext}
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
