'use client';

import React, { useRef } from 'react';
import { PropertyCard } from './PropertyCard';
import { Property, User } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyCarouselProps {
    properties: Property[];
    user: User | null;
    onBook?: (property: Property) => void;
    title: string;
}

export const PropertyCarousel = ({ properties, user, onBook, title }: PropertyCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // Approx card width
            const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="py-12">
            <div className="flex items-center justify-between mb-8 px-4 md:px-0">
                <h2 className="text-3xl font-black text-slate-50 tracking-tight">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-10 px-4 md:px-0 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {properties.map((property) => (
                    <div key={property.id} className="min-w-[320px] md:min-w-[380px] snap-center">
                        <PropertyCard
                            property={property}
                            user={user}
                            onBook={onBook}
                        />
                    </div>
                ))}
                {/* Padding right to allow viewing last item easily */}
                <div className="min-w-[20px]" />
            </div>
        </div>
    );
};
