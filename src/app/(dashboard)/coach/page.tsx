'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    BookOpen,
    CheckCircle,
    Plus,
    ArrowUpRight,
    TrendingUp,
    Clock,
    ChevronRight,
    Utensils,
    Dumbbell
} from 'lucide-react';
import { dataService } from '@/lib/mock-service';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CoachDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function loadStats() {
            const data = await dataService.getStudentStats();
            setStats(data);
        }
        loadStats();
    }, []);

    const quickStats = [
        {
            label: 'Aktif Öğrenciler',
            value: stats?.activeStudents || 0,
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: '+2 bu hafta'
        },
        {
            label: 'Toplam Programlar',
            value: stats?.programs || 0,
            icon: BookOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Tüm zamanlar'
        },
        {
            label: 'Tamamlanan Antrenmanlar',
            value: stats?.completedWorkouts || 0,
            icon: CheckCircle,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            trend: '%12 artış'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Eğitmen Paneli</h1>
                    <p className="text-slate-500 font-medium">Hoş geldin, işte öğrenci topluluğundaki son durum.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/coach/students">
                        <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 rounded-xl px-6">
                            <Plus className="w-5 h-5 mr-2" />
                            Yeni Kayıt
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickStats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                    >
                        <Card hover variant="vibrant">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.bg} ${stat.color}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Son Aktiviteler</CardTitle>
                            <CardDescription>Öğrencilerinin gerçekleştirdiği son eylemler.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-green-600 font-bold">Tümünü Gör</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { name: 'Mehmet Öğrenci', action: 'Antrenmanı tamamladı', time: '12 dk önce', badge: 'Yeni' },
                                { name: 'Ayşe Kaya', action: 'Programa kayıt oldu', time: '2 saat önce', badge: null },
                                { name: 'Can Demir', action: 'Yeni kilo kaydı ekledi', time: '5 saat önce', badge: null }
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-white shadow-sm transition-transform group-hover:scale-110">
                                            {activity.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{activity.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{activity.action}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{activity.time}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader>
                        <CardTitle>Hızlı İşlemler</CardTitle>
                        <CardDescription>Sık kullandığın araçlara buradan ulaş.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Beslenme Planı Hazırla', href: '/coach/nutrition', icon: Utensils, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            { label: 'Yeni Egzersiz Ekle', href: '/coach/workouts', icon: Dumbbell, color: 'bg-green-50 text-green-600 border-green-100' },
                            { label: 'Gelişim Grafiklerini İncele', href: '/coach/students', icon: TrendingUp, color: 'bg-green-100/50 text-green-700 border-green-200' },
                            { label: 'Randevuları Kontrol Et', href: '#', icon: Clock, color: 'bg-slate-50 text-slate-600 border-slate-200' },
                        ].map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className={`p-4 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col gap-3 ${action.color}`}>
                                    <action.icon className="w-6 h-6" />
                                    <span className="text-sm font-bold leading-tight">{action.label}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

