'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
                return;
            }

            const role = user.role?.toUpperCase();
            if (role === 'ADMIN') {
                router.replace('/dashboards/admin');
            } else if (role === 'HOST') {
                router.replace('/dashboards/host');
            } else {
                router.replace('/dashboards/guest');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-400 font-medium">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
