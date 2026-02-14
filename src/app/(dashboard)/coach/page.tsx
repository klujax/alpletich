'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, Store, Plus, TrendingUp, ChevronRight, ShoppingBag,
    CalendarDays, Star, DollarSign, MessageCircle, Package
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GymStore, SalesPackage, Purchase, GroupClass } from '@/lib/types';
import { Profile } from '@/types/database';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CoachDashboard() {
    const [user, setUser] = useState<Profile | null>(null);
    const [store, setStore] = useState<GymStore | null>(null);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [studentCount, setStudentCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const currentUser = await authService.getUser();
            if (!currentUser) return;
            setUser(currentUser); // Set user state

            // Note: Parallel fetching
            const [shopData, pkgs, cls, students, myPurchases] = await Promise.all([
                dataService.getStoreByOwnerId(currentUser.id),
                dataService.getPackages(currentUser.id),
                dataService.getGroupClasses(currentUser.id),
                dataService.getCoachStudents(currentUser.id),
                dataService.getCoachPurchases(currentUser.id),
            ]);

            setStore(shopData);
            setPackages(pkgs);
            setClasses(cls);
            setStudentCount(students.length);

            // Purchases are already filtered by coachId in getCoachPurchases
            const revenue = myPurchases.reduce((sum: number, p: Purchase) => sum + p.price, 0);
            setTotalRevenue(revenue);

            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const upcomingClasses = classes.filter(c => c.status === 'scheduled').slice(0, 3);

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Minimalist Hero */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white border-2 border-slate-100 p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-black uppercase tracking-widest mb-6">
                            Eğitmen Paneli
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Hoş geldin, {user?.full_name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">
                            {store ? `${store.name} • ${studentCount} aktif öğrenci` : 'Henüz bir dükkanın bulunmuyor. Hemen bir tane oluştur!'}
                        </p>
                    </div>
                    {!store && (
                        <Link href="/coach/shop">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl px-8 h-14 shadow-lg shadow-green-600/20 transition-all active:scale-95">
                                <Plus className="w-5 h-5 mr-2" /> Dükkan Oluştur
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Toplam Gelir', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Aktif Öğrenci', value: studentCount, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Paket Sayısı', value: packages.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Dükkan Puanı', value: store ? `${store.rating} ⭐` : '-', icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
                ].map((stat, index) => (
                    <div key={stat.label} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                        <Card className="hover:shadow-lg transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yaklaşan Grup Dersleri */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Yaklaşan Grup Dersleri</CardTitle>
                            <CardDescription>Planlanmış canlı dersleriniz</CardDescription>
                        </div>
                        <Link href="/coach/classes">
                            <Button variant="ghost" size="sm" className="text-green-600 font-bold">Tümü</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Planlanmış ders yok</p>
                                <Link href="/coach/classes">
                                    <Button size="sm" variant="secondary" className="mt-3">Ders Oluştur</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingClasses.map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                <CalendarDays className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{cls.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                    {' • '}{cls.enrolledParticipants.length}/{cls.maxParticipants} katılımcı
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hızlı İşlemler */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hızlı İşlemler</CardTitle>
                        <CardDescription>Sık kullandığın araçlara buradan ulaş</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Yeni Paket Oluştur', href: '/coach/packages', icon: ShoppingBag, color: 'bg-primary/5 text-primary border-primary/10' },
                            { label: 'Grup Dersi Planla', href: '/coach/classes', icon: CalendarDays, color: 'bg-primary/5 text-primary border-primary/10' },
                            { label: 'Öğrencileri Gör', href: '/coach/students', icon: Users, color: 'bg-primary/5 text-primary border-primary/10' },
                            { label: 'Mesajları Oku', href: '/chat', icon: MessageCircle, color: 'bg-primary/5 text-primary border-primary/10' },
                        ].map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className={`p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col gap-3 ${action.color}`}>
                                    <action.icon className="w-6 h-6" />
                                    <span className="text-sm font-bold leading-tight">{action.label}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
