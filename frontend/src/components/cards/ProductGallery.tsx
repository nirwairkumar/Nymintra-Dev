"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [mainImageIndex, setMainImageIndex] = useState<number>(0);

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

    const mainUrl = images.length > 0 ? images[mainImageIndex] : '';
    const isMainVideo = mainUrl ? mainUrl.match(/\.(mp4|webm|mov)$/i) : false;

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="relative group">
                    <div
                        className="aspect-[4/5] w-full bg-muted/10 rounded-2xl overflow-hidden relative border shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                    >
                        {images.length > 0 ? (
                            <div className="relative w-full h-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={mainImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full flex items-center justify-center p-4"
                                        onClick={() => openModal(mainImageIndex)}
                                    >
                                        {isMainVideo ? (
                                            <video src={mainUrl} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                                        ) : (
                                            <img
                                                src={mainUrl}
                                                alt={productName}
                                                className="w-full h-full object-contain drop-shadow-sm"
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows overlay */}
                                {images.length > 1 && (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}

                                {/* Dot Indicators */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => { e.stopPropagation(); setMainImageIndex(i); }}
                                                className={`w-2 h-2 rounded-full transition-all ${mainImageIndex === i ? 'bg-primary w-4' : 'bg-primary/30'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <span className="text-muted-foreground block text-lg font-serif">Image Unavailable</span>
                            </div>
                        )}
                    </div>
                </div>

                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((url, i) => {
                            const isVideo = url.match(/\.(mp4|webm|mov)$/i);
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-md border bg-muted/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${mainImageIndex === i ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                    onClick={() => setMainImageIndex(i)}
                                >
                                    {isVideo ? <video src={url} className="w-full h-full object-cover" /> : <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />}
                                </div>
                            )
                        })}
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
                        {images[selectedImageIndex]?.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={images[selectedImageIndex]} controls autoPlay className="max-w-full max-h-full object-contain" />
                        ) : (
                            <img
                                src={images[selectedImageIndex]}
                                alt={`${productName} view ${selectedImageIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
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
