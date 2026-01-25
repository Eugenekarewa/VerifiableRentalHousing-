"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/shared/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      console.log('DashboardLayout check:', { user, role: user?.role, pathname });
      if (!user) {
        console.log('No user, redirecting to /login');
        router.replace('/login');
      } else {
        const roleInPath = pathname.split('/')[2];
        const userRoleLower = user.role.toLowerCase();
        if (userRoleLower !== roleInPath) {
          console.log(`Role mismatch (${userRoleLower} vs ${roleInPath}), redirecting`);
          router.replace(`/dashboards/${userRoleLower}`);
        }
      }
    } else {
      console.log('DashboardLayout loading...');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !user) return <div className="h-screen flex items-center justify-center font-bold animate-pulse">Verifying Access...</div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-10">{children}</div>
    </div>
  );
}