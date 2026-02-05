'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Utensils,
    TrendingUp,
    LogOut,
    Menu,
    X,
    Settings,
    Store,
    Trophy,
    MessageCircle,
    ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import Image from 'next/image';
import { authService, dataService } from '@/lib/mock-service';
import { useEffect } from 'react';

interface SidebarProps {
    role: 'coach' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const coachLinks = [
        { name: 'Branşlarım', href: '/coach/sports', icon: Trophy },
        { name: 'Paketlerim', href: '/coach/packages', icon: ShoppingBag },
        { name: 'Öğrenciler', href: '/coach/students', icon: Users },
        { name: 'Mesajlar', href: '/coach/messages', icon: MessageCircle },
        { name: 'Beslenme', href: '/coach/nutrition', icon: Utensils },
        { name: 'Egzersizler', href: '/coach/workouts', icon: Dumbbell },
    ];

    const studentLinks = [
        { name: 'Panel', href: '/student', icon: LayoutDashboard },
        { name: 'Antrenman', href: '/student/workouts', icon: Dumbbell },
        { name: 'Koçumla Sohbet', href: '/student/chat', icon: MessageCircle },
        { name: 'Beslenme', href: '/student/nutrition', icon: Utensils },
        { name: 'Gelişim', href: '/student/progress', icon: TrendingUp },
    ];

    const [userLinks, setUserLinks] = useState(role === 'coach' ? coachLinks : studentLinks);

    useEffect(() => {
        const checkAccess = () => {
            // Koç için değişiklik yok
            if (role === 'coach') {
                setUserLinks(coachLinks);
                return;
            }

            // Öğrenci için paket kontrolü
            const userPackageStr = localStorage.getItem('user_sport_package');
            let hasChatAccess = false;

            if (userPackageStr) {
                try {
                    const userPkg = JSON.parse(userPackageStr);
                    // Eğer paketin içinde features varsa ve "7/24 mesaj desteği" veya "Canlı görüşmeler" içeriyorsa
                    // Veya packageData -> features
                    const features = userPkg.packageData?.features || [];
                    // Basit kontrol: features text array içinde "mesaj" veya "görüşme" geçiyor mu?
                    // Veya mock verideki premium pakete bakıyoruz
                    const premiumFeature = features.some((f: string) =>
                        f.toLowerCase().includes('mesaj') ||
                        f.toLowerCase().includes('görüşme') ||
                        f.toLowerCase().includes('chat') ||
                        userPkg.packageType === 'premium' // Legacy check
                    );

                    if (premiumFeature) hasChatAccess = true;
                } catch (e) {
                    console.error("Paket parse hatası", e);
                }
            }

            if (!hasChatAccess) {
                setUserLinks(studentLinks.filter(l => l.href !== '/student/chat'));
            } else {
                setUserLinks(studentLinks);
            }
        };

        checkAccess();
    }, [role, pathname]);

    const links = userLinks;

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/');
    };

    return (
        <>
            <button
                className="fixed top-4 left-4 z-50 p-3 bg-white border border-slate-200 rounded-xl lg:hidden shadow-md text-slate-700 hover:text-green-600 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                />
            )}

            {/* Sidebar - Always visible on desktop, animated on mobile */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col shadow-2xl lg:shadow-none font-sans transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="p-6 pb-4 flex flex-col items-center border-b border-slate-50">
                    <div className="flex flex-col items-center gap-3 w-full">
                        <div className="relative w-20 h-20 overflow-hidden">
                            <Image
                                src="/shark-logo.jpg"
                                alt="Alpletich Logo"
                                fill
                                className="object-contain mix-blend-multiply"
                                priority
                            />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 tracking-[0.15em] leading-none">
                            ALPLETICH
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Menü</p>
                    </div>
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "relative flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group overflow-hidden border border-transparent",
                                    isActive
                                        ? "bg-green-50 text-green-800 border-green-100 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium hover:border-slate-100"
                                )}
                            >
                                <div className="flex items-center gap-3.5 z-10 relative">
                                    <link.icon className={cn(
                                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-green-700 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-900"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        isActive ? "font-black" : ""
                                    )}>
                                        {link.name}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50 m-4 rounded-3xl">
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => {
                            setIsOpen(false);
                            if (role === 'coach') router.push('/coach/settings');
                            // else router.push('/student/settings'); // Future impl
                        }}
                        className="justify-start text-slate-600 hover:text-slate-950 hover:bg-white rounded-xl h-12 font-bold hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
                    >
                        <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-600" />
                        Ayarlar
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={handleLogout}
                        className="justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-12 font-bold hover:shadow-sm transition-all border border-transparent hover:border-rose-100"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Çıkış Yap
                    </Button>
                </div>
            </aside>
        </>
    );
}
