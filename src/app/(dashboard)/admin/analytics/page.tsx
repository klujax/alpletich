'use client';

import { useEffect, useState } from 'react';
import { supabaseDataService } from '@/lib/supabase-service';
import { SystemStats } from '@/lib/types';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Store,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
    Wallet,
    CreditCard,
    BarChart3,
    Activity,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock monthly data
const MONTHLY_DATA = [
    { month: 'Oca', revenue: 18500, expenses: 4200, profit: 14300 },
    { month: 'Şub', revenue: 22000, expenses: 5100, profit: 16900 },
    { month: 'Mar', revenue: 28500, expenses: 6300, profit: 22200 },
    { month: 'Nis', revenue: 31200, expenses: 7000, profit: 24200 },
    { month: 'May', revenue: 38000, expenses: 8200, profit: 29800 },
    { month: 'Haz', revenue: 42500, expenses: 9100, profit: 33400 },
    { month: 'Tem', revenue: 45000, expenses: 9800, profit: 35200 },
    { month: 'Ağu', revenue: 48000, expenses: 10500, profit: 37500 },
];

const RECENT_TRANSACTIONS = [
    { id: '1', type: 'income', amount: 2500, description: 'Pro Paket Satışı - Ahmet Koç', date: '2026-02-08', store: 'Fitness Arena' },
    { id: '2', type: 'income', amount: 1800, description: 'Starter Paket Satışı - Can Demir', date: '2026-02-07', store: 'Iron Temple' },
    { id: '3', type: 'expense', amount: 450, description: 'Platform Komisyonu', date: '2026-02-07', store: 'Sistem' },
    { id: '4', type: 'income', amount: 3200, description: 'Elite Program - Ahmet Koç', date: '2026-02-06', store: 'Fitness Arena' },
    { id: '5', type: 'expense', amount: 120, description: 'SMS Bildirimleri', date: '2026-02-06', store: 'Sistem' },
    { id: '6', type: 'income', amount: 950, description: 'Beslenme Paketi - Can Demir', date: '2026-02-05', store: 'Iron Temple' },
    { id: '7', type: 'expense', amount: 280, description: 'Platform Komisyonu', date: '2026-02-05', store: 'Sistem' },
    { id: '8', type: 'income', amount: 1500, description: 'Koçluk Paketi - Selin Yılmaz', date: '2026-02-04', store: 'Fitness Arena' },
];

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        const data = await supabaseDataService.getSystemStats();
        setStats(data);
        setIsLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
    };

    const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/admin" className="inline-flex items-center text-slate-400 hover:text-slate-950 font-black text-xs uppercase tracking-widest transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Geri Dön
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter italic leading-none uppercase">
                        GELİR <span className="text-slate-300">ANALİTİĞİ</span>
                    </h1>
                    <p className="text-slate-500 font-bold max-w-xl">Tüm gelir, gider ve kazanç verilerini detaylı olarak incele.</p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                selectedPeriod === period
                                    ? "bg-white text-slate-900 shadow-lg"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {period === 'week' ? 'Hafta' : period === 'month' ? 'Ay' : 'Yıl'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-[2.5rem] border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-black">
                                <ArrowUpRight className="w-4 h-4" />
                                +{stats.monthlyGrowth}%
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Toplam Gelir</div>
                        <div className="text-4xl font-black text-emerald-700 mt-1">{formatCurrency(stats.totalRevenue)}</div>
                        <div className="text-xs font-bold text-slate-400 mt-2">Bu ay: {formatCurrency(48000)}</div>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
                                <TrendingDown className="w-8 h-8 text-rose-600" />
                            </div>
                            <div className="flex items-center gap-1 text-rose-600 text-sm font-black">
                                <ArrowDownRight className="w-4 h-4" />
                                +8.2%
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Toplam Gider</div>
                        <div className="text-4xl font-black text-rose-700 mt-1">{formatCurrency(stats.totalExpenses)}</div>
                        <div className="text-xs font-bold text-slate-400 mt-2">Bu ay: {formatCurrency(10500)}</div>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <PiggyBank className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 text-sm font-black">
                                <ArrowUpRight className="w-4 h-4" />
                                +15.4%
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Net Kazanç</div>
                        <div className="text-4xl font-black text-purple-700 mt-1">{formatCurrency(stats.netProfit)}</div>
                        <div className="text-xs font-bold text-slate-400 mt-2">Bu ay: {formatCurrency(37500)}</div>
                    </div>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="p-8 rounded-[2.5rem] border-2 border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Aylık Gelir Grafiği</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1">Son 8 ayın gelir performansı</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded" />
                            <span className="text-xs font-bold text-slate-500">Gelir</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-rose-400 rounded" />
                            <span className="text-xs font-bold text-slate-500">Gider</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded" />
                            <span className="text-xs font-bold text-slate-500">Kâr</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-8 gap-4 items-end h-64">
                    {MONTHLY_DATA.map((data, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col gap-1 items-center" style={{ height: '200px' }}>
                                <div className="w-full flex gap-1 items-end h-full">
                                    <div
                                        className="flex-1 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                        title={`Gelir: ${formatCurrency(data.revenue)}`}
                                    />
                                    <div
                                        className="flex-1 bg-rose-400 rounded-t-lg transition-all hover:bg-rose-500"
                                        style={{ height: `${(data.expenses / maxRevenue) * 100}%` }}
                                        title={`Gider: ${formatCurrency(data.expenses)}`}
                                    />
                                    <div
                                        className="flex-1 bg-purple-500 rounded-t-lg transition-all hover:bg-purple-600"
                                        style={{ height: `${(data.profit / maxRevenue) * 100}%` }}
                                        title={`Kâr: ${formatCurrency(data.profit)}`}
                                    />
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">{data.month}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <Card className="rounded-[2.5rem] border-2 border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b-2 border-slate-50 bg-slate-50/50">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Son İşlemler</h3>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                        {RECENT_TRANSACTIONS.map((tx) => (
                            <div key={tx.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        tx.type === 'income' ? "bg-emerald-100" : "bg-rose-100"
                                    )}>
                                        {tx.type === 'income' ? (
                                            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <ArrowDownRight className="w-5 h-5 text-rose-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900 text-sm">{tx.description}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{tx.store}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-black text-lg",
                                    tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-[2rem] border-2 border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Platform Komisyonu</div>
                                <div className="text-2xl font-black text-slate-900">{formatCurrency(stats.platformCommission)}</div>
                            </div>
                            <div className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">%5</div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border-2 border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aktif Kullanıcılar</div>
                                <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
                            </div>
                            <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                +12
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border-2 border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <Store className="w-7 h-7 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Aktif Mağazalar</div>
                                <div className="text-2xl font-black text-slate-900">{stats.totalStores}</div>
                            </div>
                            <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                +2
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border-2 border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <Target className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Satış Hedefi</div>
                                <div className="text-2xl font-black text-slate-900">%87</div>
                            </div>
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
