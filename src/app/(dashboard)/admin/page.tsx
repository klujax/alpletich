'use client';

import { useEffect, useState } from 'react';
import { dataService } from '@/lib/mock-service';
import {
    Users,
    Store,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Shield,
    BarChart3,
    ArrowUpRight,
    Wallet,
    PiggyBank,
    Percent
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SystemStats {
    totalUsers: number;
    totalCoaches: number;
    totalStudents: number;
    bannedUsers: number;
    totalStores: number;
    activeStores: number;
    bannedStores: number;
    totalPurchases: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    platformCommission: number;
    monthlyGrowth: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        const data = await dataService.getSystemStats();
        setStats(data);
        setIsLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
    };

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-green-600 to-green-800 p-10 md:p-16 border border-green-500 shadow-2xl shadow-green-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[150px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-2xl text-white text-xs font-black tracking-widest uppercase">
                            <Shield className="w-4 h-4" />
                            Super Admin Panel
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                            SİSTEM <span className="text-green-300">MERKEZİ</span>
                        </h1>
                        <p className="text-green-50/80 font-bold text-lg max-w-xl">
                            Tüm kullanıcıları, dükkanları ve finansal durumu bu panelden yönet.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/users" className="group">
                            <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2.5rem] transition-all hover:scale-105 backdrop-blur-xl">
                                <Users className="w-10 h-10 text-primary mb-3" />
                                <div className="text-white font-black text-lg uppercase tracking-tight">Kullanıcılar</div>
                                <div className="text-slate-400 text-sm font-bold mt-1">{stats.totalUsers} kişi</div>
                            </div>
                        </Link>
                        <Link href="/admin/shops" className="group">
                            <div className="bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2.5rem] transition-all hover:scale-105 backdrop-blur-xl">
                                <Store className="w-10 h-10 text-primary mb-3" />
                                <div className="text-white font-black text-lg uppercase tracking-tight">Dükkanlar</div>
                                <div className="text-slate-400 text-sm font-bold mt-1">{stats.totalStores} dükkan</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-8 rounded-[2.5rem] border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-primary bg-primary/20 px-3 py-1.5 rounded-xl uppercase">+{stats.monthlyGrowth}%</span>
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">Toplam Gelir</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="w-7 h-7 text-rose-600" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Toplam Gider</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalExpenses)}</div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <PiggyBank className="w-7 h-7 text-primary" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">Net Kazanç</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(stats.netProfit)}</div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <Percent className="w-7 h-7 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Platform Komisyonu</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(stats.platformCommission)}</div>
                </Card>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:shadow-xl transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Kullanıcı</div>
                            <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-2 border-primary/20 hover:shadow-xl transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Eğitmenler</div>
                            <div className="text-3xl font-black text-slate-900">{stats.totalCoaches}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-2 border-primary/20 hover:shadow-xl transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Öğrenciler</div>
                            <div className="text-3xl font-black text-slate-900">{stats.totalStudents}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-2 border-rose-100 hover:shadow-xl transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Shield className="w-8 h-8 text-rose-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Banlı Kullanıcı</div>
                            <div className="text-3xl font-black text-slate-900">{stats.bannedUsers}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/users">
                    <Card className="p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kullanıcı Yönetimi</h3>
                                <p className="text-slate-500 font-bold">Tüm kullanıcıları görüntüle, banla veya sil</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/admin/shops">
                    <Card className="p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dükkan Yönetimi</h3>
                                <p className="text-slate-500 font-bold">Dükkanların finansal durumunu incele</p>
                            </div>
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
