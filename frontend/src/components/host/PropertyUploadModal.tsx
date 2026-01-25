import React, { useState } from 'react';
import { X, Upload, DollarSign, MapPin, Home, Loader2, CheckCircle, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertiesAPI } from '@/lib/api';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const propertySchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    price: z.number().min(1, 'Price must be greater than 0'),
    location: z.string().min(3, 'Location is required'),
    image: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
    amenities: z.string().optional(), // Comma separated
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PropertyUploadModal: React.FC<PropertyUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isConnected, address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema)
    });

    if (!isOpen) return null;

    const onSubmit = async (data: PropertyFormData) => {
        setError(null);

        if (!isConnected) {
            setError("Please connect your wallet to list a property.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Sign Message for Verification
            const message = `I verify that I own this property and authorize its listing on Verifiable Rental Protocol.\n\nProperty: ${data.title}\nPrice: $${data.price}/night\n\nWallet: ${address}`;
            const signature = await signMessageAsync({ message });

            // Format amenities string to array
            const amenitiesList = data.amenities
                ? data.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0)
                : [];

            const payload = {
                title: data.title,
                description: data.description,
                price: data.price,
                location: data.location,
                images: data.image ? [data.image] : ['https://images.unsplash.com/photo-1600596542815-e25fa1108638?w=800'],
                amenities: amenitiesList,
                signature, // Send signature to backend
                walletAddress: address,
                // Default values for now
                bedrooms: 1,
                bathrooms: 1,
                maxGuests: 2
            };

            // Call API
            await (propertiesAPI as any).createProperty(payload);

            onSuccess();
            reset();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || err.response?.data?.message || 'Failed to list property. Signing rejected or network error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Home className="text-blue-500" size={20} />
                        List Your Property
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Wallet Requirement Alert */}
                    {!isConnected ? (
                        <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Connect Wallet Required</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    You must sign a cryptographic proof to verify ownership of this listing.
                                </p>
                            </div>
                            <ConnectButton showBalance={false} />
                        </div>
                    ) : (
                        error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )
                    )}

                    <form id="property-form" onSubmit={handleSubmit(onSubmit)} className={`space-y-5 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Property Title</label>
                            <input
                                {...register('title')}
                                placeholder="e.g. Modern Sunset Villa"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    {...register('location')}
                                    placeholder="e.g. Malibu, California"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            {errors.location && <p className="text-red-400 text-xs">{errors.location.message}</p>}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Price per Night ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="number"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Describe your property..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                            />
                            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Image URL (Optional)</label>
                            <div className="relative">
                                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    {...register('image')}
                                    placeholder="https://..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            {errors.image && <p className="text-red-400 text-xs">{errors.image.message}</p>}
                        </div>

                        {/* Amenities */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Amenities (Comma separated)</label>
                            <input
                                {...register('amenities')}
                                placeholder="WiFi, Pool, Gym..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-slate-900/50">
                    <button
                        form="property-form"
                        type="submit"
                        disabled={isSubmitting || !isConnected}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Signing & Uploading...
                            </>
                        ) : (
                            <>
                                Sign & Confirm Listing <CheckCircle size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
