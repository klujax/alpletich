"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    MessageCircle,
    Store,
    Settings,
    Dumbbell,
    CalendarDays,
    Star,
    ShieldCheck,
    Wallet,
    BarChart3,
    Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, dataService } from "@/lib/mock-service";

interface MobileBottomNavProps {
    role: 'coach' | 'student' | 'admin';
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
    const pathname = usePathname();
    const [showCoachingFeatures, setShowCoachingFeatures] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== 'student') {
                setShowCoachingFeatures(true);
                return;
            }

            const user = authService.getUser();
            if (!user) return;

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
        { name: 'Antrenman', href: '/coach/workouts', icon: Dumbbell },
        { name: 'Dükkan', href: '/coach/shop', icon: Store },
        { name: 'Paketler', href: '/coach/packages', icon: ShoppingBag },
        { name: 'Dersler', href: '/coach/classes', icon: CalendarDays },
        { name: 'Öğrenciler', href: '/coach/students', icon: Users },
        { name: 'Mesajlar', href: '/chat', icon: MessageCircle },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const studentLinks = [
        { name: 'Panel', href: '/student', icon: LayoutDashboard },
        { name: 'Pazaryeri', href: '/marketplace', icon: ShoppingBag },
        { name: 'Antrenman', href: '/student/workouts', icon: Dumbbell },
        { name: 'Derslerim', href: '/student/my-courses', icon: Play },
        { name: 'Grup Ders', href: '/student/classes', icon: CalendarDays },
        ...(showCoachingFeatures ? [{ name: 'Koçlarım', href: '/student/coaches', icon: Star }] : []),
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const adminLinks = [
        { name: 'Özet', href: '/admin', icon: ShieldCheck },
        { name: 'Üyeler', href: '/admin/users', icon: Users },
        { name: 'Dükkanlar', href: '/admin/shops', icon: Store },
        { name: 'Gelir', href: '/admin/revenue', icon: Wallet },
        { name: 'Rapor', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    const links = role === 'admin' ? adminLinks : (role === 'coach' ? coachLinks : studentLinks);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-lg border-t border-slate-100 lg:hidden pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center overflow-x-auto no-scrollbar h-[4.5rem] px-1">
                {links.map((link) => {
                    const isDashboardRoot = link.href === '/student' || link.href === '/coach' || link.href === '/admin';
                    const isActive = link.href === pathname || (!isDashboardRoot && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[4.2rem] flex-shrink-0 h-full space-y-1 transition-all duration-200 active:scale-90 px-1.5",
                                isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "relative transition-all duration-300",
                                isActive ? "translate-y-[-2px]" : ""
                            )}>
                                <link.icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-600" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[9px] font-medium tracking-tight transition-all whitespace-nowrap",
                                isActive ? "font-bold" : ""
                            )}>
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
