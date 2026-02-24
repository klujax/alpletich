'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    LogOut,
    Settings,
    Store,
    MessageCircle,
    ShoppingBag,
    BarChart3,
    CalendarDays,
    Star,
    ShieldCheck,
    Wallet,
    Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';

interface SidebarProps {
    role: 'coach' | 'student' | 'admin';
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [showCoachingFeatures, setShowCoachingFeatures] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== 'student') {
                setShowCoachingFeatures(true);
                return;
            }

            const user = await authService.getUser();
            if (!user) return;

            // Fetch purchases and packages to check if user has active coaching package
            const [purchases, packages] = await Promise.all([
                dataService.getPurchases(user.id),
                dataService.getPackages()
            ]);

            const coachingPackageIds = packages
                .filter(pkg => pkg.packageType === 'coaching')
                .map(pkg => pkg.id);

            const hasActiveCoaching = purchases.some(p =>
                p.status === 'active' &&
                (!p.expiresAt || new Date(p.expiresAt) > new Date()) &&
                p.packageId &&
                coachingPackageIds.includes(p.packageId)
            );

            setShowCoachingFeatures(hasActiveCoaching);
        };
        checkAccess();
    }, [role]);

    const coachLinks = [
        { name: 'Panel', href: '/coach', icon: LayoutDashboard },
        { name: 'Dükkanım', href: '/coach/shop', icon: Store },
        { name: 'Paketlerim', href: '/coach/packages', icon: ShoppingBag },
        { name: 'Grup Dersleri', href: '/coach/classes', icon: CalendarDays },
        { name: 'Öğrencilerim', href: '/coach/students', icon: Users },
        { name: 'Mesajlar', href: '/chat', icon: MessageCircle },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const studentLinks = [
        { name: 'Panel', href: '/student', icon: LayoutDashboard },
        { name: 'Pazaryeri', href: '/marketplace', icon: ShoppingBag },
        { name: 'Antrenmanlar', href: '/student/workouts', icon: Dumbbell },
        { name: 'Derslerim', href: '/student/my-courses', icon: Play },
        { name: 'Grup Derslerim', href: '/student/classes', icon: CalendarDays },
        ...(showCoachingFeatures ? [{ name: 'Koçlarım', href: '/student/coaches', icon: Star }] : []),
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const adminLinks = [
        { name: 'Sistem Özeti', href: '/admin', icon: ShieldCheck },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
        { name: 'Dükkanlar', href: '/admin/shops', icon: Store },
        { name: 'Gelirler', href: '/admin/revenue', icon: Wallet },
        { name: 'Raporlar', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const links = role === 'admin' ? adminLinks : (role === 'coach' ? coachLinks : studentLinks);

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/');
    };

    return (
        <aside
            className="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col font-sans"
        >
            {/* Logo Section */}
            <div className="p-8 pb-6">
                <div className="flex items-center justify-center">
                    <img src="/logo.png" alt="Sportaly Logo" className="h-12 w-auto object-contain" />
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto no-scrollbar">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Menü</p>
                </div>
                {links.map((link) => {
                    const isDashboardRoot = link.href === '/student' || link.href === '/coach' || link.href === '/admin';
                    const isActive = link.href === pathname || (!isDashboardRoot && pathname?.startsWith(link.href + '/'));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-green-50 text-green-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold"
                            )}
                        >
                            <link.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-green-600 stroke-[2.5]" : "text-slate-400 group-hover:text-green-600"
                            )} />
                            <span className="text-[13px] tracking-tight truncate">
                                {link.name}
                            </span>
                        </Link>
                    );
                })}

                <div className="h-px bg-slate-100 my-4 mx-4" />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold group"
                >
                    <LogOut className="w-5 h-5 transition-colors" />
                    <span className="text-[13px] tracking-tight">Çıkış Yap</span>
                </button>
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Hesap Türü</p>
                    <p className="text-xs text-slate-900 font-black">
                        {role === 'admin' ? 'Yönetici' : role === 'coach' ? 'Eğitmen' : 'Öğrenci'}
                    </p>
                </div>
            </div>
        </aside>
    );
}
