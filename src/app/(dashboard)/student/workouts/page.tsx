'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowLeft, Construction, Dumbbell, Calendar, Clock, PlayCircle,
    ChevronRight, Utensils, Flame, AlertCircle
} from 'lucide-react';
import { authService, dataService, SalesPackage } from '@/lib/mock-service';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function StudentWorkoutsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [activePackage, setActivePackage] = useState<SalesPackage | null>(null);
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
    const [selectedDay, setSelectedDay] = useState<number>(0);

    useEffect(() => {
        async function load() {
            try {
                const user = authService.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                const packages = await dataService.getPackages();
                let targetId = user.active_program_id;

                // If no active program explicitly set, try to find from purchases
                if (!targetId) {
                    const purchases = await dataService.getPurchases(user.id);
                    // Filter: active status, not expired, type is program
                    const validPurchases = purchases.filter(p =>
                        p.status === 'active' &&
                        (!p.expiresAt || new Date(p.expiresAt) > new Date())
                    ).sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

                    for (const pur of validPurchases) {
                        const pkg = packages.find(p => p.id === pur.packageId);
                        if (pkg && pkg.packageType === 'program') {
                            targetId = pkg.id;
                            break;
                        }
                    }
                }

                if (targetId) {
                    const found = packages.find(p => p.id === targetId);
                    if (found) setActivePackage(found);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!activePackage) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in px-4">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <Dumbbell className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Aktif Program Bulunamadı</h1>
                <p className="text-slate-500 font-medium max-w-md mb-8">
                    Henüz seçili bir antrenman programınız yok. "Derslerim" sayfasından satın aldığınız bir paketi uygulamaya başlayın.
                </p>
                <Link href="/student/my-courses">
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-green-600/20">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Derslerime Git
                    </Button>
                </Link>
            </div>
        );
    }

    const { workoutPlan, nutritionPlan } = activePackage;
    const hasNutrition = nutritionPlan && nutritionPlan.length > 0;

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-green-200">
                            Aktif Program
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-400">
                            {activePackage.totalWeeks} Haftalık Plan
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {activePackage.name}
                    </h1>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => { setActiveTab('workout'); setSelectedDay(0); }}
                        className={cn(
                            "flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-all",
                            activeTab === 'workout'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Antrenman
                    </button>
                    {hasNutrition && (
                        <button
                            onClick={() => { setActiveTab('nutrition'); setSelectedDay(0); }}
                            className={cn(
                                "flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-all",
                                activeTab === 'nutrition'
                                    ? "bg-white text-green-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Beslenme
                        </button>
                    )}
                </div>
            </div>

            {/* TAB CONTENT: WORKOUT */}
            {activeTab === 'workout' && workoutPlan && (
                <div className="transition-all duration-300">
                    {/* Day Selector */}
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 mb-3 sm:mb-4 touch-pan-x snap-x no-scrollbar">
                        {workoutPlan.map((day, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedDay(idx)}
                                className={cn(
                                    "flex-shrink-0 snap-start min-w-[110px] sm:min-w-[140px] p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all",
                                    selectedDay === idx
                                        ? "border-primary bg-primary text-white shadow-lg shadow-green-600/20"
                                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <p className={cn("text-[9px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1", selectedDay === idx ? "text-slate-400" : "text-slate-400")}>
                                    {idx + 1}. Gün
                                </p>
                                <p className="font-bold text-xs sm:text-sm truncate">{day.dayName}</p>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 p-4 sm:p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4 sm:mb-8">
                            <div>
                                <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1">{workoutPlan[selectedDay]?.dayName}</h2>
                                <p className="text-xs sm:text-base text-slate-500 font-medium flex items-center gap-1.5 sm:gap-2">
                                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                                    Odak: {workoutPlan[selectedDay]?.focusArea || 'Genel'}
                                </p>
                            </div>
                            <Button className="hidden md:flex bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                                <PlayCircle className="w-5 h-5 mr-2" /> Antrenmanı Başlat
                            </Button>
                        </div>

                        <div className="space-y-2.5 sm:space-y-4">
                            {workoutPlan[selectedDay]?.exercises.map((exercise, idx) => (
                                <div key={exercise.id} className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition-all flex items-center justify-between gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-sm sm:text-lg text-slate-300 shadow-sm group-hover:text-green-500 group-hover:border-green-200 transition-colors flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 text-sm sm:text-lg truncate">{exercise.name}</h3>
                                            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">{exercise.targetMuscle}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600 flex-shrink-0">
                                        <div className="text-center">
                                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Set</p>
                                            <p>{exercise.sets}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Tekrar</p>
                                            <p>{exercise.reps}</p>
                                        </div>
                                        <div className="hidden md:block text-center px-4 py-1 rounded-lg bg-white border border-slate-200">
                                            <p className="text-[10px] text-slate-400 uppercase">Dinlenme</p>
                                            <p>{exercise.restSeconds}sn</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: NUTRITION */}
            {activeTab === 'nutrition' && hasNutrition && nutritionPlan && (
                <div className="transition-all duration-300">
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-1">{nutritionPlan[0]?.dayName}</h2>
                            <p className="text-slate-500 font-medium">Bu plana uygun beslenerek gelişiminizi hızlandırın.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nutritionPlan[0]?.meals.map((mealGroup, idx) => (
                                <div key={idx} className="space-y-4">
                                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        {mealGroup.type}
                                    </h3>
                                    {mealGroup.items.map((meal) => (
                                        <Card key={meal.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-4">
                                                <div className="mb-3">
                                                    <h4 className="font-bold text-slate-900">{meal.name}</h4>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {meal.ingredients.map((ing, i) => (
                                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                                                                {ing}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 py-3 border-t border-slate-50">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Kalori</p>
                                                        <p className="text-xs font-black text-slate-700">{meal.calories}</p>
                                                    </div>
                                                    <div className="text-center border-l border-slate-50">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Prot</p>
                                                        <p className="text-xs font-black text-slate-700">{meal.protein}g</p>
                                                    </div>
                                                    <div className="text-center border-l border-slate-50">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Karb</p>
                                                        <p className="text-xs font-black text-slate-700">{meal.carbs}g</p>
                                                    </div>
                                                    <div className="text-center border-l border-slate-50">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Yağ</p>
                                                        <p className="text-xs font-black text-slate-700">{meal.fat}g</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
