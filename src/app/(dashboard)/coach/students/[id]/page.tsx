'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataService, authService } from '@/lib/mock-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import {
    User, ArrowLeft, Dumbbell, Utensils,
    Activity, Calendar, TrendingUp, Plus, Trash2, Save, ChevronDown, Check
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Profile, Exercise, WeeklyPlan } from '@/types/database';
import { toast } from 'sonner';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const dynamic = 'force-dynamic';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [student, setStudent] = useState<Profile | null>(null);
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Modal States
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

    // Meal Form States
    const [mealName, setMealName] = useState('');
    const [mealCal, setMealCal] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        const user = await dataService.getStudentById(id);
        if (!user) {
            router.push('/coach/students');
            return;
        }

        const currentCoach = authService.getUser();
        const plan = await dataService.getWeeklyPlan(id);
        const exercises = await dataService.getExercises(currentCoach?.id);

        setStudent(user);
        setWeeklyPlan(plan);
        setAvailableExercises(exercises);
        setIsLoading(false);
    };

    const handleAddExercise = async (exercise: Exercise) => {
        if (!weeklyPlan) return;
        const newPlan = { ...weeklyPlan };
        if (!newPlan.workouts[selectedDay]) newPlan.workouts[selectedDay] = [];

        newPlan.workouts[selectedDay].push({
            ...exercise,
            instanceId: Date.now().toString() // Unique ID for this instance
        });

        await dataService.saveWeeklyPlan(id, newPlan);
        setWeeklyPlan(newPlan);
        setIsExerciseModalOpen(false);
        toast.success(`${exercise.name} ${selectedDay} gününe eklendi.`);
    };

    const handleAddMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weeklyPlan) return;
        const newPlan = { ...weeklyPlan };
        if (!newPlan.nutrition[selectedDay]) newPlan.nutrition[selectedDay] = [];

        newPlan.nutrition[selectedDay].push({
            id: Date.now().toString(),
            name: mealName,
            calories: parseInt(mealCal) || 0,
        });

        await dataService.saveWeeklyPlan(id, newPlan);
        setWeeklyPlan(newPlan);
        setIsMealModalOpen(false);
        setMealName('');
        setMealCal('');
        toast.success(`Öğün ${selectedDay} gününe eklendi.`);
    };

    const removeItem = async (type: 'workouts' | 'nutrition', day: string, itemId: string) => {
        if (!weeklyPlan) return;
        const newPlan = { ...weeklyPlan };
        if (type === 'workouts') {
            newPlan.workouts[day] = newPlan.workouts[day].filter((i) => i.instanceId !== itemId);
        } else {
            newPlan.nutrition[day] = newPlan.nutrition[day].filter((i) => i.id !== itemId);
        }
        await dataService.saveWeeklyPlan(id, newPlan);
        setWeeklyPlan(newPlan);
        toast.success("Silindi.");
    };

    if (isLoading || !student) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-green-500/30">
                    {getInitials(student.full_name || '')}
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.full_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">Aktif Öğrenci</span>
                        <p className="text-slate-500 font-medium text-sm">{student.email}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
                {[
                    { id: 'overview', label: 'Genel Bakış', icon: Activity },
                    { id: 'planner', label: 'Haftalık Planlayıcı', icon: Calendar },
                    { id: 'progress', label: 'Gelişim', icon: TrendingUp },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-green-700 shadow-md shadow-slate-200/50 ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- CONTENT --- */}
            <div className="min-h-[500px]">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4">
                        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-lg">+2.4%</span>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-1">98%</div>
                                <p className="text-sm font-bold text-slate-500">Program Uyumu</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <Dumbbell className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Bu Hafta</span>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-1">12</div>
                                <p className="text-sm font-bold text-slate-500">Tamamlanan Antrenman</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-orange-50 rounded-xl">
                                        <Activity className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-1">75.5 kg</div>
                                <p className="text-sm font-bold text-slate-500">Son Tartım</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* WEEKLY PLANNER TAB */}
                {activeTab === 'planner' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* WORKOUTS COLUMN */}
                            <div className="flex-1 space-y-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-green-600" />
                                    Antrenman Programı
                                </h3>

                                <div className="space-y-3">
                                    {DAYS.map(day => {
                                        const exercises = weeklyPlan?.workouts?.[day] || [];
                                        return (
                                            <Card key={day} className="border-slate-200 overflow-hidden">
                                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                                    <span className="font-bold text-slate-700">{day}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-green-100 hover:text-green-700"
                                                        onClick={() => { setSelectedDay(day); setIsExerciseModalOpen(true); }}
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                                <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto min-h-[60px]">
                                                    {exercises.length > 0 ? (
                                                        exercises.map((ex) => (
                                                            <div key={ex.instanceId} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={`https://img.youtube.com/vi/${ex.animation_url?.split('v=')[1]}/default.jpg`}
                                                                        className="w-10 h-10 rounded-lg object-cover bg-slate-200"
                                                                        alt=""
                                                                    />
                                                                    <div>
                                                                        <div className="font-bold text-sm text-slate-900">{ex.name}</div>
                                                                        <div className="text-xs text-slate-500">{Math.floor((ex.duration_seconds || 0) / 60)} dk • {ex.muscle_groups?.[0]}</div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem('workouts', day, ex.instanceId)}
                                                                    className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 text-xs text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">
                                                            Dinlenme Günü
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* NUTRITION COLUMN */}
                            <div className="flex-1 space-y-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-orange-500" />
                                    Beslenme Programı
                                </h3>

                                <div className="space-y-3">
                                    {DAYS.map(day => {
                                        const meals = weeklyPlan?.nutrition?.[day] || [];
                                        return (
                                            <Card key={day} className="border-slate-200 overflow-hidden">
                                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                                    <span className="font-bold text-slate-700">{day}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-orange-100 hover:text-orange-700"
                                                        onClick={() => { setSelectedDay(day); setIsMealModalOpen(true); }}
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                                <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto min-h-[60px]">
                                                    {meals.length > 0 ? (
                                                        meals.map((meal) => (
                                                            <div key={meal.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                                                                <div>
                                                                    <div className="font-bold text-sm text-slate-900">{meal.name}</div>
                                                                    <div className="text-xs text-slate-500 font-bold text-orange-600">{meal.calories} kcal</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem('nutrition', day, meal.id)}
                                                                    className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 text-xs text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">
                                                            Plan Yok
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* PROGRESS TAB */}
                {activeTab === 'progress' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl">
                            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Gelişim Verileri</h3>
                            <p className="text-slate-500">Öğrencinin girdiği veriler burada görünecek.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Exercise Selection Modal */}
            <Modal
                isOpen={isExerciseModalOpen}
                onClose={() => setIsExerciseModalOpen(false)}
                title={`${selectedDay} için Egzersiz Seç`}
            >
                <div className="h-[400px] overflow-y-auto pr-2 space-y-2">
                    {availableExercises.map(ex => (
                        <button
                            key={ex.id}
                            onClick={() => handleAddExercise(ex)}
                            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4 group"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${ex.animation_url?.split('v=')[1]}/default.jpg`}
                                className="w-16 h-12 rounded-lg object-cover bg-slate-200"
                                alt=""
                            />
                            <div>
                                <div className="font-bold text-slate-900 group-hover:text-green-700">{ex.name}</div>
                                <div className="text-xs text-slate-500">{ex.muscle_groups?.join(', ')} • {ex.difficulty}</div>
                            </div>
                            <div className="ml-auto">
                                <Plus className="w-5 h-5 text-slate-300 group-hover:text-green-600" />
                            </div>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Meal Add Modal */}
            <Modal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                title={`${selectedDay} için Öğün Ekle`}
            >
                <form onSubmit={handleAddMeal} className="space-y-4">
                    <Input
                        label="Öğün Adı"
                        placeholder="Örn: Kahvaltı - Yulaf"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        required
                    />
                    <Input
                        label="Kalori (tahmini)"
                        placeholder="Örn: 450"
                        type="number"
                        value={mealCal}
                        onChange={(e) => setMealCal(e.target.value)}
                        required
                    />
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsMealModalOpen(false)} className="flex-1">İptal</Button>
                        <Button type="submit" className="flex-1">Ekle</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
