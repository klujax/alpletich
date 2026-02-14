'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseDataService } from '@/lib/supabase-service';
import { GymStore, Purchase } from '@/lib/types';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminRevenuePage() {
    const [stores, setStores] = useState<GymStore[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [storeData, purchaseData] = await Promise.all([
                supabaseDataService.getStores(),
                supabaseDataService.getPurchases(),
            ]);
            setStores(storeData);
            setPurchases(purchaseData);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const totalRevenue = purchases.reduce((s, p) => s + p.price, 0);
    const platformCommission = Math.floor(totalRevenue * 0.10);
    const coachPayout = totalRevenue - platformCommission;

    const storeRevenues = stores.map(store => {
        const storePurchases = purchases.filter(p => p.shopId === store.id);
        const revenue = storePurchases.reduce((s, p) => s + p.price, 0);
        return { store, revenue, salesCount: storePurchases.length };
    }).sort((a, b) => b.revenue - a.revenue);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gelir Raporu</h1>
                <p className="text-slate-500 font-bold">Platform genelindeki tüm finansal veriler</p>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-[2.5rem] border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-emerald-600" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Toplam Gelir</div>
                    <div className="text-3xl font-black text-emerald-700 mt-1">{formatCurrency(totalRevenue)}</div>
                    <div className="text-xs text-emerald-500 font-bold mt-2">{purchases.length} satış</div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <PiggyBank className="w-7 h-7 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Platform Komisyonu (%10)</div>
                    <div className="text-3xl font-black text-purple-700 mt-1">{formatCurrency(platformCommission)}</div>
                    <div className="text-xs text-purple-500 font-bold mt-2">Net platform kazancı</div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <DollarSign className="w-7 h-7 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Koç Ödemeleri</div>
                    <div className="text-3xl font-black text-blue-700 mt-1">{formatCurrency(coachPayout)}</div>
                    <div className="text-xs text-blue-500 font-bold mt-2">Koçlara aktarılan</div>
                </Card>
            </div>

            {/* Store Revenue Breakdown */}
            <Card className="rounded-[2rem] border-2 border-slate-100">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Dükkan Bazlı Gelirler</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {storeRevenues.map(({ store, revenue, salesCount }, i) => (
                            <div key={store.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                        {i + 1}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl">
                                        {store.logoEmoji}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{store.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{store.category} • {salesCount} satış</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">{formatCurrency(revenue)}</div>
                                    <div className="text-xs font-bold text-purple-500">Komisyon: {formatCurrency(Math.floor(revenue * 0.10))}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card className="rounded-[2rem] border-2 border-slate-100">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Son Satışlar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {purchases.slice(-10).reverse().map(purchase => (
                            <div key={purchase.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{purchase.packageName}</p>
                                    <p className="text-xs text-slate-400 font-medium">{new Date(purchase.purchasedAt).toLocaleDateString('tr-TR')} • {purchase.status === 'active' ? '🟢 Aktif' : '⚪ Süresi doldu'}</p>
                                </div>
                                <div className="text-lg font-black text-green-600">₺{purchase.price}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
