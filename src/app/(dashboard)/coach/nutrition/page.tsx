'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Utensils, Edit, Trash2, UserPlus, Check, X, Search } from 'lucide-react';
import { dataService, authService } from '@/lib/mock-service';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Profile } from '@/types/database';
import { cn, getMealTypeLabel } from '@/lib/utils';

interface Meal {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    details: string;
    calories: number;
}

export const dynamic = 'force-dynamic';

export default function NutritionPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [students, setStudents] = useState<Profile[]>([]);
    const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // -- New Plan Form State --
    const [planStep, setPlanStep] = useState<1 | 2>(1); // 1: Info, 2: Meals
    const [newPlan, setNewPlan] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });
    const [newMeals, setNewMeals] = useState<Meal[]>([]);
    const [tempMeal, setTempMeal] = useState({
        type: 'breakfast' as const,
        name: '',
        details: '',
        calories: ''
    });

    // -- Load Data --
    async function loadInitialData() {
        const user = authService.getUser();
        const [loadedPlans, loadedStudents] = await Promise.all([
            dataService.getNutritionPlans(user?.id),
            dataService.getStudents()
        ]);
        setPlans(loadedPlans);
        setStudents(loadedStudents);
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    // -- Handlers --

    const handleCreatePlan = async () => {
        setIsLoading(true);
        const planData = {
            name: newPlan.name,
            calories: Number(newPlan.calories),
            macros: {
                protein: Number(newPlan.protein),
                carbs: Number(newPlan.carbs),
                fat: Number(newPlan.fat),
            },
            meals: newMeals,
            student_id: null, // Şablon olarak oluşturulur
            coach_id: authService.getUser()?.id || '1'
        };

        await dataService.addNutritionPlan(planData);
        setIsNewPlanModalOpen(false);
        setNewPlan({ name: '', calories: '', protein: '', carbs: '', fat: '' });
        setNewMeals([]);
        setPlanStep(1);
        await loadInitialData();
        setIsLoading(false);
    };

    const handleAddTempMeal = () => {
        if (!tempMeal.name || !tempMeal.details) return;
        const meal: Meal = {
            id: Math.random().toString(),
            type: tempMeal.type,
            name: tempMeal.name,
            details: tempMeal.details,
            calories: Number(tempMeal.calories)
        };
        setNewMeals([...newMeals, meal]);
        setTempMeal({ ...tempMeal, name: '', details: '', calories: '' });
    };

    const handleRemoveMeal = (id: string) => {
        setNewMeals(newMeals.filter(m => m.id !== id));
    };

    const handleAssignPlan = async (studentId: string) => {
        if (!selectedPlanId) return;
        await dataService.assignNutritionPlan(selectedPlanId, studentId);
        setIsAssignModalOpen(false);
        setSelectedPlanId(null);
        alert('Plan başarıyla öğrenciye atandı!');
        loadInitialData();
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Beslenme Planları</h1>
                    <p className="text-slate-500 font-medium">Öğrencilerin için detaylı programlar oluştur.</p>
                </div>
                <Button onClick={() => setIsNewPlanModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Plan Oluştur
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {plans.map((plan, i) => (
                    <Card key={plan.id || i} className="bg-white border-slate-200 hover:border-green-500/50 transition-all group flex flex-col h-full shadow-sm">
                        <CardContent className="p-4 md:p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Utensils className="w-6 h-6 text-green-600" />
                                </div>
                                {/* Actions */}
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-4">
                                {plan.student_id ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <Check className="w-3 h-3" /> Atandı
                                    </span>
                                ) : 'Şablon'} • {plan.calories} kcal
                            </p>

                            {/* Macros Grid */}
                            <div className="grid grid-cols-3 gap-2 text-center text-sm bg-slate-50 p-2 md:p-3 rounded-lg border border-slate-100">
                                <div>
                                    <div className="text-slate-900 font-bold">{plan.macros?.protein}g</div>
                                    <div className="text-green-600 text-[10px] font-black uppercase tracking-tighter">Prot</div>
                                </div>
                                <div>
                                    <div className="text-slate-900 font-bold">{plan.macros?.carbs}g</div>
                                    <div className="text-amber-600 text-[10px] font-black uppercase tracking-tighter">Carb</div>
                                </div>
                                <div>
                                    <div className="text-slate-900 font-bold">{plan.macros?.fat}g</div>
                                    <div className="text-rose-600 text-[10px] font-black uppercase tracking-tighter">Fat</div>
                                </div>
                            </div>

                            {/* Meal Preview */}
                            {plan.meals && plan.meals.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Örnek Öğünler</p>
                                    {plan.meals.slice(0, 2).map((m: any, idx: number) => (
                                        <div key={m.id || idx} className="text-sm text-slate-700 font-medium truncate pl-2 border-l-2 border-green-200">
                                            {m.name}
                                        </div>
                                    ))}
                                    {plan.meals.length > 2 && <div className="text-xs text-slate-400 font-medium pl-2">ve {plan.meals.length - 2} daha...</div>}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                            <Button
                                fullWidth
                                variant="secondary"
                                className="gap-2"
                                onClick={() => {
                                    setSelectedPlanId(plan.id);
                                    setIsAssignModalOpen(true);
                                }}
                            >
                                <UserPlus className="w-4 h-4" />
                                Öğrenciye Ata
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* --- NEW PLAN MODAL --- */}
            <Modal
                isOpen={isNewPlanModalOpen}
                onClose={() => setIsNewPlanModalOpen(false)}
                title={planStep === 1 ? "Adım 1: Temel Hedefler" : "Adım 2: Yemek Listesi"}
                description={planStep === 1 ? "Günlük kalori ve makro hedeflerini belirle." : "Bu plana uygun örnek yemekler ekle."}
                size="lg"
            >
                {planStep === 1 ? (
                    // STEP 1: Basic Info
                    <div className="space-y-4">
                        <Input
                            label="Plan Adı"
                            placeholder="Örn: Hızlı Yağ Yakımı"
                            value={newPlan.name}
                            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Hedef Kalori"
                                type="number"
                                placeholder="2000"
                                value={newPlan.calories}
                                onChange={(e) => setNewPlan({ ...newPlan, calories: e.target.value })}
                            />
                            <Input
                                label="Protein (g)"
                                type="number"
                                placeholder="150"
                                value={newPlan.protein}
                                onChange={(e) => setNewPlan({ ...newPlan, protein: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Karb (g)"
                                type="number"
                                placeholder="200"
                                value={newPlan.carbs}
                                onChange={(e) => setNewPlan({ ...newPlan, carbs: e.target.value })}
                            />
                            <Input
                                label="Yağ (g)"
                                type="number"
                                placeholder="70"
                                value={newPlan.fat}
                                onChange={(e) => setNewPlan({ ...newPlan, fat: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setPlanStep(2)}>Sonraki Adım</Button>
                        </div>
                    </div>
                ) : (
                    // STEP 2: Meals
                    <div className="space-y-6">
                        {/* Temp Meal Form */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Öğün Ekle</h4>
                            <div className="grid grid-cols-12 gap-2">
                                <select
                                    className="col-span-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-2.5 focus:border-green-500 outline-none font-bold"
                                    value={tempMeal.type}
                                    onChange={(e) => setTempMeal({ ...tempMeal, type: e.target.value as any })}
                                >
                                    <option value="breakfast">Kahvaltı</option>
                                    <option value="lunch">Öğle</option>
                                    <option value="dinner">Akşam</option>
                                    <option value="snack">Ara Öğün</option>
                                </select>
                                <Input
                                    containerClassName="col-span-6"
                                    placeholder="Yemek Adı (Örn: Izgara Tavuk)"
                                    value={tempMeal.name}
                                    onChange={(e) => setTempMeal({ ...tempMeal, name: e.target.value })}
                                    className="h-10"
                                />
                                <Input
                                    containerClassName="col-span-3"
                                    placeholder="Kalori"
                                    type="number"
                                    value={tempMeal.calories}
                                    onChange={(e) => setTempMeal({ ...tempMeal, calories: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                            <Input
                                placeholder="Detaylar (Örn: 200g tavuk, 100g pirinç...)"
                                value={tempMeal.details}
                                onChange={(e) => setTempMeal({ ...tempMeal, details: e.target.value })}
                            />
                            <Button size="sm" variant="secondary" onClick={handleAddTempMeal} className="w-full">
                                Listeye Ekle
                            </Button>
                        </div>

                        {/* Added Meals List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {newMeals.length === 0 && (
                                <div className="text-center text-slate-400 py-4 text-sm font-medium">Henüz öğün eklenmedi.</div>
                            )}
                            {newMeals.map((meal, idx) => (
                                <div key={meal.id || idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-black text-green-600 tracking-wider bg-green-50 px-1.5 py-0.5 rounded-md">{getMealTypeLabel(meal.type)}</span>
                                            <span className="text-slate-900 font-bold">{meal.name}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">{meal.details} ({meal.calories} kcal)</div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMeal(meal.id)}>
                                        <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                            <Button variant="ghost" className="font-bold" onClick={() => setPlanStep(1)}>Geri Dön</Button>
                            <Button onClick={handleCreatePlan} isLoading={isLoading}>Planı Tamamla ve Kaydet</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- ASSIGN MODAL --- */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Öğrenci Seçimi"
                description="Bu planı hangi öğrencine atamak istersin?"
                size="sm"
            >
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 font-bold" />
                        <input
                            className="w-full bg-white border border-slate-200 text-slate-900 pl-9 pr-4 py-2 rounded-lg text-sm focus:border-green-500 outline-none font-bold placeholder:text-slate-400"
                            placeholder="İsim ile ara..."
                        />
                    </div>
                    {students.map((student, idx) => (
                        <div
                            key={student.id || idx}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100"
                            onClick={() => handleAssignPlan(student.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold border border-green-100 uppercase">
                                    {student.full_name?.substring(0, 2)}
                                </div>
                                <div>
                                    <div className="text-slate-900 font-bold">{student.full_name}</div>
                                    <div className="text-xs text-slate-500 font-medium">{student.email}</div>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-green-600 font-black">
                                Seç
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

