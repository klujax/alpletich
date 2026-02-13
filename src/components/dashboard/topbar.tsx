'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    Store,
} from 'lucide-react';
import { authService } from '@/lib/mock-service';
import { cn } from '@/lib/utils';

export function DashboardTopbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isMarketplace, setIsMarketplace] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        setIsMarketplace(pathname === '/marketplace');
    }, [pathname]);

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/');
    };

    if (!user) return null;
    if (isMarketplace) return null;

    return (
        <header className="h-20 w-full bg-white border-b border-slate-100 flex items-center px-8 sticky top-0 z-40">
            <div className="flex-1" />

            <div className="flex items-center gap-4">
                {user.role === 'coach' && !isMarketplace && (
                    <Link href="/marketplace" className="hidden lg:block">
                        <Button variant="ghost" className="text-slate-600 hover:text-green-600 font-bold">
                            <Store className="w-5 h-5 mr-2" />
                            Pazaryeri
                        </Button>
                    </Link>
                )}

                <div className="w-px h-6 bg-slate-100 mx-2 hidden sm:block" />

                <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900 leading-none mb-1">{user.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                            {user.role === 'coach' ? 'Eğitmen' : 'Öğrenci'}
                        </p>
                    </div>
                    <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback className="bg-green-100 text-green-700 font-black">
                            {user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </div>
        </header>
    );
}
