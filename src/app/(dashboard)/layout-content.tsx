'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/sidebar';
import { authService } from '@/lib/mock-service';
import { Loader2 } from 'lucide-react';

import { MotivationQuote } from '@/components/dashboard/motivation-quote';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { MobileBottomNav } from '@/components/dashboard/mobile-nav';

export function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [role, setRole] = useState<'coach' | 'student' | 'admin' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = authService.getUser();
        if (!user) {
            router.push('/login');
        } else {
            setRole(user.role);
        }
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!role) return null; // Redirecting...

    return (
        <div className="flex min-h-screen bg-white">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden lg:block shrink-0">
                <Sidebar role={role} />
            </div>

            <main className="flex-1 lg:pl-64 min-h-screen transition-all duration-300 pb-32 lg:pb-0 overflow-x-hidden">
                {/* Topbar only on desktop */}
                <div className="hidden lg:block">
                    <DashboardTopbar />
                </div>

                <div className="w-full max-w-[1920px] mx-auto pt-4 lg:pt-0 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation - Visible only on mobile */}
            <div className="lg:hidden">
                <MobileBottomNav role={role} />
            </div>
        </div>
    );
}
