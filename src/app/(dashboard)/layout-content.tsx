'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { authService } from '@/lib/mock-service';
import { Loader2 } from 'lucide-react';

import { MotivationQuote } from '@/components/dashboard/motivation-quote';

export function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [role, setRole] = useState<'coach' | 'student' | null>(null);
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!role) return null; // Redirecting...

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar role={role} />
            <main className="flex-1 lg:pl-72 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
                    <MotivationQuote />
                    {children}
                </div>
            </main>
        </div>
    );
}
