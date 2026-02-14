'use client';

import { authService, dataService } from '@/lib/mock-service';
import { Purchase, GroupClass } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Play, Dumbbell, ChevronRight, ShoppingBag, CalendarDays, Star, Package, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<GroupClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const currentUser = await authService.getUser();
            setUser(currentUser);
            if (!currentUser) return;

            const [myPurchases, allClasses] = await Promise.all([
                dataService.getPurchases(currentUser.id),
                dataService.getGroupClasses(), // TODO: Filter by enrolled classes server-side?
            ]);

            setPurchases(myPurchases);

            // Katıldığı sınıfları filtrele
            const myClasses = allClasses.filter((c: GroupClass) =>
                c.enrolledParticipants && c.enrolledParticipants.includes(currentUser.id) && c.status === 'scheduled'
            );
            setUpcomingClasses(myClasses);
            setIsLoading(false);

            // Notification Logic
            const now = new Date();
            const imminentClass = myClasses.find((c: GroupClass) => {
                const d = new Date(c.scheduledAt);
                const diffHours = (d.getTime() - now.getTime()) / 3600000;
                return diffHours > 0 && diffHours < 24;
            });

            if (imminentClass) {
                const d = new Date(imminentClass.scheduledAt);
                const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                const isToday = d.getDate() === now.getDate();

                setTimeout(() => {
                    toast.message(`🔔 Yaklaşan Ders: ${imminentClass.title}`, {
                        description: `${isToday ? 'Bugün' : 'Yarın'} saat ${timeStr}'da canlı dersiniz var! Hazırlanın.`,
                        action: {
                            label: 'Derse Git',
                            onClick: () => window.location.href = '/student/classes'
                        },
                        duration: 8000,
                    });
                }, 1500);
            }
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const activePurchases = purchases.filter(p => p.status === 'active');

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Simple Greeting Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Selam, {user?.full_name?.split(' ')[0] || 'Şampiyon'}! 👋
                    </h1>
                    <p className="text-slate-500 font-medium">Bugün hedeflerine bir adım daha yaklaşmaya hazır mısın?</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/student/workouts">
                        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-12 px-6 shadow-sm transition-all active:scale-95">
                            <Play className="w-5 h-5 mr-2" /> Antrenmana Başla
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Simple Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Aktif Ders', value: activePurchases.length, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Grup Dersi', value: upcomingClasses.length, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Eğitmen', value: [...new Set(purchases.map(p => p.coachId))].length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, index) => (
                    <Card key={stat.label} className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                <h3 className="text-xl font-black text-slate-900 leading-none">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Aktif Dersler */}
                <Card className="border-slate-200">
                    <div className="p-6 pb-2 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">Aktif Derslerim</h2>
                        <Link href="/student/my-courses">
                            <Button variant="ghost" size="sm" className="text-green-600 font-bold">Tümü</Button>
                        </Link>
                    </div>
                    <CardContent>
                        {activePurchases.length === 0 ? (
                            <div className="text-center py-8">
                                <Dumbbell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Henüz aktif dersin yok</p>
                                <Link href="/marketplace">
                                    <Button size="sm" variant="secondary" className="mt-3">Ders Keşfet</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activePurchases.slice(0, 4).map((purchase) => (
                                    <div key={purchase.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-sm transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                <Package className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{purchase.packageName}</p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {purchase.expiresAt ? `Bitiş: ${new Date(purchase.expiresAt).toLocaleDateString('tr-TR')}` : 'Ömür Boyu'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Yaklaşan Grup Dersleri */}
                <Card className="border-slate-200">
                    <div className="p-6 pb-2 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">Yaklaşan Dersler</h2>
                        <Link href="/student/classes">
                            <Button variant="ghost" size="sm" className="text-green-600 font-bold">Tümü</Button>
                        </Link>
                    </div>
                    <CardContent>
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Yaklaşan ders yok</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingClasses.slice(0, 4).map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <CalendarDays className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{cls.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
            </div>
        </div>
    );
}
