'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Utensils, AlertCircle, ChevronRight, Info, Flame, Droplets } from 'lucide-react';
import { dataService, authService } from '@/lib/mock-service';
import { getMealTypeLabel } from '@/lib/utils';

import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function NutritionPage() {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const user = authService.getUser() || { id: '2' };
            const data = await dataService.getNutritionPlan(user.id);
            setPlan(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle className="w-10 h-10 text-slate-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-950 mb-2">Henüz Bir Planın Yok</h1>
                <p className="text-slate-700 max-w-md font-bold text-lg">
                    Eğitmenin senin için henüz bir beslenme programı oluşturmamış. Lütfen eğitmenine danış.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header>
                <h1 className="text-3xl font-black text-slate-950 tracking-tight">Beslenme Programım</h1>
                <p className="text-slate-700 font-bold text-lg">Hedeflerine ulaşman için hazırlanan günlük rutin.</p>
            </header>

            {/* Özet Kartı */}
            <Card className="border-slate-200 overflow-hidden shadow-2xl shadow-green-500/10">
                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                        <div className="p-8 flex-1 bg-white">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="p-4 bg-green-700 rounded-2xl shadow-xl shadow-green-300">
                                    <Utensils className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">{plan.name}</h2>
                                    <div className="flex items-center gap-2 text-slate-700 font-black text-sm mt-1">
                                        <Flame className="w-5 h-5 text-orange-600" />
                                        Günlük Hedef: {plan.calories} kcal
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { label: 'Protein', value: plan.macros?.protein, unit: 'g', text: 'text-green-800', light: 'bg-green-50 border-green-100' },
                                    { label: 'Karb', value: plan.macros?.carbs, unit: 'g', text: 'text-amber-800', light: 'bg-amber-50 border-amber-100' },
                                    { label: 'Yağ', value: plan.macros?.fat, unit: 'g', text: 'text-emerald-800', light: 'bg-emerald-50 border-emerald-100' },
                                ].map(macro => (
                                    <div key={macro.label} className={`${macro.light} p-5 rounded-2xl border hover:border-slate-300 transition-all shadow-sm`}>
                                        <p className="text-xs font-black uppercase text-slate-600 tracking-widest mb-2">{macro.label}</p>
                                        <div className={`text-2xl font-black ${macro.text}`}>{macro.value}{macro.unit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 lg:w-80 bg-slate-50 flex flex-col justify-center border-t lg:border-t-0">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <Droplets className="w-5 h-5 text-green-600" /> Su Hedefi
                                    </div>
                                    <span className="text-lg font-black text-slate-950">3.5L</span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                    <div className="h-full w-2/3 bg-green-600 rounded-full shadow-lg shadow-green-200"></div>
                                </div>
                                <p className="text-xs text-slate-700 font-bold leading-relaxed bg-green-50/50 p-3 rounded-xl border border-green-100">
                                    💡 Vücut ağırlığının her 20 kg'ı için 1 litre su tüketmeyi hedefle.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Öğün Listesi */}
            <div className="grid gap-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">Öğün Planı</h3>
                    <span className="text-sm font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Toplam {plan.meals?.length || 0} Öğün</span>
                </div>

                <div className="space-y-4">
                    {plan.meals && plan.meals.length > 0 ? (
                        plan.meals.map((meal: any, index: number) => (
                            <div key={meal.id || index}>
                                <Card className="border-slate-200 hover:border-green-400 transition-all hover:shadow-2xl hover:shadow-slate-300/40 group overflow-hidden">
                                    <CardContent className="p-0 flex flex-col md:flex-row md:items-stretch">
                                        <div className="w-16 md:w-20 bg-slate-50 flex items-center justify-center text-slate-500 font-black text-xl border-r border-slate-100 group-hover:bg-green-700 group-hover:text-white transition-all duration-500 md:min-h-full py-4">
                                            {index + 1}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-green-800 bg-green-100 px-3 py-1 rounded-lg border border-green-200 shadow-sm">
                                                        {getMealTypeLabel(meal.type)}
                                                    </span>
                                                    {meal.calories > 500 && (
                                                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200 shadow-sm">
                                                            Zengin Öğün
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-black text-slate-950 group-hover:text-green-900 transition-colors">{meal.name}</h3>
                                                <p className="text-slate-700 text-base font-bold leading-relaxed">{meal.details}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 md:text-right flex md:flex-col items-center md:items-end gap-2 shrink-0 md:min-w-[120px] group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                                                <div className="text-3xl font-black text-slate-950 leading-none">{meal.calories}</div>
                                                <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">kcal</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-600 font-black text-lg">Bu planda henüz öğün tanımlanmamış.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-green-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-green-900/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-600/30 rounded-full blur-[100px] -translate-y-20 translate-x-20 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[80px] translate-y-20 -translate-x-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 text-green-300 font-black text-sm uppercase tracking-widest mb-5 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                            <Info className="w-5 h-5" /> Önemli Tavsiye
                        </div>
                        <h4 className="text-2xl font-black mb-4 italic leading-tight">Beslenmene Sadık Kal, Potansiyelini Keşfet!</h4>
                        <p className="text-green-50 text-lg font-bold leading-relaxed">
                            Beslenme programındaki her öğün hedeflerine göre optimize edildi. Öğün atlamamaya, makrolarını yakalamaya ve bol su içmeye özen göster.
                        </p>
                    </div>
                    <Button size="lg" className="bg-white text-green-900 hover:bg-green-50 font-black rounded-[1.5rem] h-16 px-10 border-0 shrink-0 shadow-2xl shadow-black/40 text-lg">
                        Eğitmene Soru Sor
                    </Button>
                </div>
            </div>
        </div>
    );
}

