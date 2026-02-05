'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dataService, authService } from '@/lib/mock-service';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import { Exercise, WeeklyPlan } from '@/types/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Search, Filter, Calendar, Dumbbell, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// Türkçe gün isimlerini Date objesine eşlemek için
const DAY_MAP: { [key: number]: string } = {
    1: 'Pazartesi', 2: 'Salı', 3: 'Çarşamba', 4: 'Perşembe', 5: 'Cuma', 6: 'Cumartesi', 0: 'Pazar'
};

export const dynamic = 'force-dynamic';

export default function StudentWorkoutsPage() {
    const router = useRouter();
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [completedExercises, setCompletedExercises] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPlan();
    }, []);

    const loadPlan = async () => {
        setIsLoading(true);
        // Giriş yapan kullanıcıyı al (mock) - getCurrent implementation
        const user = authService.getUser();
        if (!user) {
            // Demo amaçlı, eğer giriş yoksa id '2' (öğrenci) varsayalım
            // Gerçek uygulamada login'e redirect olur
        }

        const userId = user?.id || '2';
        const plan = await dataService.getWeeklyPlan(userId);
        setWeeklyPlan(plan);

        // Bugünün gününü otomatik seç
        const todayIndex = new Date().getDay();
        const todayName = DAY_MAP[todayIndex];
        setSelectedDay(todayName);

        // LocalStorage'dan tamamlananları yükle
        const storedCompleted = localStorage.getItem(`completed_workouts_${userId}`);
        if (storedCompleted) {
            setCompletedExercises(JSON.parse(storedCompleted));
        }

        setIsLoading(false);
    };

    const handleComplete = (exerciseInstanceId: string, name: string) => {
        let newCompleted = [...completedExercises];
        const uniqueId = `${selectedDay}-${exerciseInstanceId}`; // Gün bazlı unique ID

        if (newCompleted.includes(uniqueId)) {
            newCompleted = newCompleted.filter(id => id !== uniqueId);
            toast("İşaret kaldırıldı", {
                description: `${name} tamamlanmadı olarak işaretlendi.`
            });
        } else {
            newCompleted.push(uniqueId);
            toast.success("Tebrikler!", {
                description: `${name} tamamlandı! 💪`,
            });
        }

        setCompletedExercises(newCompleted);
        // Save to local storage
        const user = authService.getUser();
        localStorage.setItem(`completed_workouts_${user?.id || '2'}`, JSON.stringify(newCompleted));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const todaysWorkout = weeklyPlan?.workouts?.[selectedDay] || [];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Haftalık Programım</h1>
                    <p className="text-slate-700 font-bold text-lg">Bugün senin için planlananlar.</p>
                </div>

                {/* Gün Seçici */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto max-w-full no-scrollbar border border-slate-200">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                                selectedDay === day
                                    ? "bg-white text-green-700 shadow-md shadow-slate-200/50 ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                            )}
                        >
                            {day}
                            {/* Günün egzersiz sayısı (opsiyonel badge) */}
                            {(weeklyPlan?.workouts?.[day]?.length || 0) > 0 && (
                                <span className={cn(
                                    "ml-2 w-2 h-2 inline-block rounded-full",
                                    selectedDay === day ? "bg-green-500" : "bg-slate-300"
                                )} />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* Antrenman Listesi */}
            <div className="min-h-[400px]">
                <div>
                    {todaysWorkout.length > 0 ? (
                        todaysWorkout.map((exercise, index: number) => {
                            const uniqueId = `${selectedDay}-${exercise.instanceId}`;
                            const isCompleted = completedExercises.includes(uniqueId);

                            return (
                                <div key={exercise.instanceId} className="relative group">
                                    {/* Completion Toggle Button */}
                                    <div className="absolute top-4 right-4 z-30">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComplete(exercise.instanceId, exercise.name);
                                            }}
                                            className={cn(
                                                "p-3 rounded-2xl border-2 transition-all duration-300 shadow-lg",
                                                isCompleted
                                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200"
                                                    : "bg-white/90 backdrop-blur-md border-slate-200 text-slate-400 hover:text-slate-950 hover:border-slate-300"
                                            )}
                                        >
                                            <CheckCircle2 className={cn("w-5 h-5", isCompleted ? "fill-current" : "")} />
                                        </button>
                                    </div>

                                    <div className={cn(
                                        "h-full transition-all duration-500",
                                        isCompleted ? "opacity-60 grayscale-[0.5] scale-[0.98]" : "hover:scale-[1.02]"
                                    )}>
                                        <ExerciseCard
                                            exercise={exercise}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl text-slate-300">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-950 mb-2">Dinlenme Günü</h3>
                            <p className="text-slate-700 font-bold max-w-sm">
                                {selectedDay} günü için atanmış bir antrenman yok. İyi dinlenmeler! 😴
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}

