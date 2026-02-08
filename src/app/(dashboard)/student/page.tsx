'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { dataService, authService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import {
    Play,
    TrendingUp,
    Utensils,
    CheckCircle2,
    ChevronRight,
    Flame,
    Award,
    Target
} from 'lucide-react';

import Link from 'next/link';
import { MotivationQuote } from '@/components/dashboard/motivation-quote';

export const dynamic = 'force-dynamic';

export default function StudentDashboard() {
    const [workout, setWorkout] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const w = await dataService.getTodaysWorkout();
            setWorkout(w);
            setUser(authService.getUser());
        }
        load();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <MotivationQuote />
            {/* Hero/Welcome Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-8 md:p-12 shadow-2xl shadow-green-500/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div>
                            <Flame className="w-4 h-4" />
                            3 Günlük Seri!
                        </div>
                        <h1>
                            Selam, {user?.full_name?.split(' ')[0] || 'Şampiyon'}!
                        </h1>
                        <p>
                            Bugün <span className="text-green-700 font-extrabold italic underline decoration-green-300">Üst Vücut</span> odaklı çalışacağız. Hazırsan başlayalım!
                        </p>

                        <div>
                            <Link href="/student/workouts">
                                <Button size="lg" className="bg-green-700 hover:bg-green-800 shadow-xl shadow-green-200 rounded-2xl px-8 h-14 font-black text-white">
                                    <Play className="w-5 h-5 mr-2 fill-current" />
                                    Antrenmana Başla
                                </Button>
                            </Link>
                            <Link href="/student/progress">
                                <Button size="lg" variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-2xl px-8 h-14 font-black">
                                    Geçmişi İncele
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <div className="w-64 h-64 bg-slate-50 rounded-[3rem] border border-slate-200 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-5xl font-black text-slate-950 mb-1">85%</div>
                                <div className="text-xs text-slate-600 font-black uppercase tracking-widest">Haftalık Hedef</div>
                                <div className="mt-4 w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                    <div className="h-full w-[85%] bg-green-600 rounded-full shadow-[0_0_12px_rgba(22,163,74,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white shadow-2xl rounded-2xl border border-slate-200 flex items-center justify-center text-3xl">
                            🏆
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Su Tüketimi', value: '2.4L', target: '3.5L', color: 'blue', icon: '💧' },
                    { label: 'Aktif Kalori', value: '450', target: '600', color: 'orange', icon: '🔥' },
                    { label: 'Uyku', value: '7.2s', target: '8s', color: 'green', icon: '🌙' },
                    { label: 'Süre', value: '45dk', target: '60dk', color: 'emerald', icon: '⏱️' },
                ].map((stat, i) => (
                    <Card key={i} className="border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-600 font-black uppercase tracking-wider mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-slate-900">{stat.value}</span>
                                    <span className="text-[10px] text-slate-500 font-bold">/ {stat.target}</span>
                                </div>
                            </div>
                            <div className="text-2xl opacity-100 filter grayscale-[0.2]">{stat.icon}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Left Column: Workout List */}
                <div className="md:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Egzersiz Listesi</h2>
                        <Button variant="ghost" size="sm" className="text-green-700 font-black">Planı Gör</Button>
                    </div>

                    <div className="grid gap-4">
                        {workout.map((item, i) => (
                            <div key={item.id || i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-600 group-hover:bg-green-700 group-hover:text-white transition-all duration-300">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900 text-lg">{item.exercise.name}</h4>
                                    <div className="flex gap-4 mt-1">
                                        <div className="flex items-center gap-1 text-sm text-slate-700 font-bold">
                                            <Target className="w-4 h-4 text-green-600" /> {item.sets} Set
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-slate-700 font-bold">
                                            <Award className="w-4 h-4 text-amber-600" /> {item.reps} Tekrar
                                        </div>
                                    </div>
                                </div>
                                {item.is_completed ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <Button size="sm" variant="ghost" className="w-10 h-10 rounded-full p-0 border border-slate-200 group-hover:bg-green-700 group-hover:text-white group-hover:border-green-700 transition-all">
                                        <Play className="w-4 h-4 fill-current" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Nutrition/Daily Goal */}
                <div className="md:col-span-4 space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Beslenme</h2>
                    <Card variant="vibrant" className="overflow-hidden border-slate-200">
                        <div className="p-6 bg-gradient-to-br from-green-700 to-emerald-800 text-white">
                            <div className="flex justify-between items-start mb-6">
                                <Utensils className="w-10 h-10 text-white/50" />
                                <div className="text-right">
                                    <span className="text-sm font-black text-white/70 block">HEDEF</span>
                                    <span className="text-3xl font-black text-white">2200</span>
                                    <span className="text-xs font-bold text-white/80 ml-1 uppercase">kcal</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Protein', value: 160, max: 180, color: 'bg-white' },
                                    { label: 'Karb', value: 120, max: 200, color: 'bg-white/70' },
                                    { label: 'Yağ', value: 45, max: 70, color: 'bg-white/40' },
                                ].map(macro => (
                                    <div key={macro.label} className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white">
                                            <span>{macro.label}</span>
                                            <span>{macro.value} / {macro.max}g</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${macro.color} rounded-full`}
                                                style={{ width: `${(macro.value / macro.max) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <CardFooter className="p-4 bg-white border-t border-slate-100">
                            <Link href="/student/nutrition" className="w-full">
                                <Button variant="ghost" fullWidth className="text-slate-950 font-black hover:bg-slate-50 group py-6">
                                    Detaylı Plan <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

