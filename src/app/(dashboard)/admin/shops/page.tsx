'use client';

import { useEffect, useState } from 'react';
import { dataService } from '@/lib/mock-service';
import {
    Store,
    Search,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    X,
    BarChart3,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StoreFinancials {
    storeId: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    monthlyData: { month: string; revenue: number; expenses: number }[];
    recentTransactions?: { id: string; type: string; amount: number; description: string; date: string }[];
}

export default function AdminShopsPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState<any | null>(null);
    const [storeFinancials, setStoreFinancials] = useState<StoreFinancials | null>(null);
    const [showFinancialModal, setShowFinancialModal] = useState(false);
    const [financialsLoading, setFinancialsLoading] = useState(false);

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        setIsLoading(true);
        const data = await dataService.getStores();
        setStores(data);
        setIsLoading(false);
    };

    const handleViewFinancials = async (store: any) => {
        setSelectedStore(store);
        setShowFinancialModal(true);
        setFinancialsLoading(true);

        const financials = await dataService.getStoreFinancials(store.id);
        financials.netProfit = financials.totalRevenue - financials.totalExpenses;
        setStoreFinancials(financials);
        setFinancialsLoading(false);
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
                        DÜKKAN <span className="text-slate-300">YÖNETİMİ</span>
                    </h1>
                    <p className="text-slate-500 font-bold max-w-xl">Tüm dükkanları ve finansal durumlarını incele.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Input
                        placeholder="Dükkan veya kategori ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-16 pl-14 rounded-[2rem] border-2 border-slate-100 focus:border-purple-500 bg-white shadow-xl shadow-slate-200/20"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                    <Store className="absolute top-6 right-6 w-12 h-12 text-white/10" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam Dükkan</div>
                    <div className="text-5xl font-black italic mt-2">{stores.length}</div>
                </div>
                <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                    <TrendingUp className="absolute top-6 right-6 w-12 h-12 text-white/20" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam Satış</div>
                    <div className="text-5xl font-black italic mt-2">₺248K</div>
                </div>
                <div className="bg-purple-600 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                    <BarChart3 className="absolute top-6 right-6 w-12 h-12 text-white/20" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Bu Ay</div>
                    <div className="text-5xl font-black italic mt-2">₺42K</div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStores.map((store) => (
                    <Card
                        key={store.id}
                        className="group rounded-[3rem] border-2 border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden bg-white shadow-xl hover:shadow-2xl cursor-pointer"
                        onClick={() => handleViewFinancials(store)}
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-3xl font-black shadow-inner",
                                    store.themeColor === 'blue' ? "bg-blue-100 text-blue-600" :
                                        store.themeColor === 'green' ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
                                )}>
                                    {store.name.charAt(0)}
                                </div>
                                <Button variant="ghost" size="sm" className="w-12 h-12 rounded-xl hover:bg-purple-100 text-slate-400 group-hover:text-purple-600 transition-colors">
                                    <Eye className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">{store.name}</h3>
                                <div className="text-xs font-black text-purple-600 uppercase tracking-widest">{store.slug}.sporapp.com</div>
                            </div>

                            <p className="text-slate-400 font-bold text-sm line-clamp-2">{store.description}</p>

                            <div className="flex flex-wrap gap-2">
                                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    {store.category}
                                </span>
                            </div>
                        </div>

                        <div className="border-t-2 border-slate-50 p-6 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-black text-slate-400 uppercase">Finansal Detay İçin Tıkla</div>
                                <ArrowUpRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Financial Modal */}
            <Modal
                isOpen={showFinancialModal}
                onClose={() => { setShowFinancialModal(false); setSelectedStore(null); setStoreFinancials(null); }}
                title={selectedStore?.name ? `${selectedStore.name} - Finansal Özet` : 'Finansal Özet'}
                size="xl"
            >
                {financialsLoading ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : storeFinancials ? (
                    <div className="space-y-8 py-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] text-center">
                                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Toplam Gelir</div>
                                <div className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(storeFinancials.totalRevenue)}</div>
                            </div>
                            <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] text-center">
                                <TrendingDown className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Toplam Gider</div>
                                <div className="text-2xl font-black text-rose-700 mt-1">{formatCurrency(storeFinancials.totalExpenses)}</div>
                            </div>
                            <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-[2rem] text-center">
                                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Net Kazanç</div>
                                <div className="text-2xl font-black text-purple-700 mt-1">{formatCurrency(storeFinancials.netProfit)}</div>
                            </div>
                        </div>

                        {/* Monthly Chart (simple bar representation) */}
                        <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Aylık Performans</h4>
                            <div className="grid grid-cols-6 gap-3">
                                {storeFinancials.monthlyData.map((data, i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-32 flex flex-col justify-end gap-1 mb-2">
                                            <div
                                                className="bg-emerald-500 rounded-t-lg"
                                                style={{ height: `${(data.revenue / 15000) * 100}%` }}
                                            />
                                            <div
                                                className="bg-rose-400 rounded-b-lg"
                                                style={{ height: `${(data.expenses / 15000) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase">{data.month.slice(0, 3)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                                    <span className="text-xs font-bold text-slate-500">Gelir</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-rose-400 rounded" />
                                    <span className="text-xs font-bold text-slate-500">Gider</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b-2 border-slate-50 bg-slate-50/50">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Son İşlemler</h4>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {storeFinancials.recentTransactions?.map((tx) => (
                                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
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
                                                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(tx.date).toLocaleDateString('tr-TR')}
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
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
