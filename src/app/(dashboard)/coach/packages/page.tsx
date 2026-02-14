'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
    Plus, Users, Star, Trash2, Edit, Package, Dumbbell, X, ChevronDown, ChevronUp, Video, Upload, Play, FileVideo
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { SalesPackage, GymStore, SportCategory, WorkoutDay, Exercise } from '@/lib/mock-service'; // Keep types
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

// === INTERFACES ===
interface WorkoutFormDay {
    dayName: string;
    focusArea: string;
    exercises: WorkoutFormExercise[];
    isOpen: boolean;
}

interface WorkoutFormExercise {
    name: string;
    targetMuscle: string;
    sets: string;
    reps: string;
    restSeconds: string;
    videoUrl: string;
    videoFileName: string;
}

const EMPTY_EXERCISE: WorkoutFormExercise = {
    name: '', targetMuscle: '', sets: '3', reps: '12', restSeconds: '60', videoUrl: '', videoFileName: '',
};

const EMPTY_FORM = {
    name: '', description: '', price: '', accessDuration: '1 Ay', packageType: 'coaching' as 'coaching' | 'program',
    sport: '', features: '', totalWeeks: '4', maxStudents: '10', hasChatSupport: false, hasGroupClass: false,
};

export default function CoachPackagesPage() {
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [store, setStore] = useState<GymStore | null>(null);
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
    const [previewVideoUrl, setPreviewVideoUrl] = useState('');
    const [viewWorkoutPkg, setViewWorkoutPkg] = useState<SalesPackage | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [workoutDays, setWorkoutDays] = useState<WorkoutFormDay[]>([]);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (!user) return;

        // Fetch all stores and find the one for this coach
        // In a real optimized app, we would have getStoreByCoachId endpoint/function
        const allStores = await dataService.getStores();
        const myStore = allStores.find((s: GymStore) => s.coachId === user.id) || null;

        const [pkgs, sportsData] = await Promise.all([
            dataService.getPackages(user.id),
            dataService.getSports(),
        ]);

        setPackages(pkgs);
        setStore(myStore);
        setSports(sportsData);
        setIsLoading(false);
    };

    // === WORKOUT DAY MANAGEMENT ===
    const addDay = () => {
        setWorkoutDays([...workoutDays, {
            dayName: `Gün ${workoutDays.length + 1}`,
            focusArea: '',
            exercises: [{ ...EMPTY_EXERCISE }],
            isOpen: true,
        }]);
    };

    const removeDay = (dayIdx: number) => {
        setWorkoutDays(workoutDays.filter((_, i) => i !== dayIdx));
    };

    const updateDay = (dayIdx: number, field: string, value: string) => {
        const updated = [...workoutDays];
        (updated[dayIdx] as any)[field] = value;
        setWorkoutDays(updated);
    };

    const toggleDay = (dayIdx: number) => {
        const updated = [...workoutDays];
        updated[dayIdx].isOpen = !updated[dayIdx].isOpen;
        setWorkoutDays(updated);
    };

    const addExercise = (dayIdx: number) => {
        const updated = [...workoutDays];
        updated[dayIdx].exercises.push({ ...EMPTY_EXERCISE });
        setWorkoutDays(updated);
    };

    const removeExercise = (dayIdx: number, exIdx: number) => {
        const updated = [...workoutDays];
        updated[dayIdx].exercises = updated[dayIdx].exercises.filter((_, i) => i !== exIdx);
        setWorkoutDays(updated);
    };

    const updateExercise = (dayIdx: number, exIdx: number, field: string, value: string) => {
        const updated = [...workoutDays];
        (updated[dayIdx].exercises[exIdx] as any)[field] = value;
        setWorkoutDays(updated);
    };

    // === VIDEO UPLOAD ===
    const handleVideoUpload = async (dayIdx: number, exIdx: number, file: File) => {
        if (!file.type.startsWith('video/')) {
            toast.error('Lütfen bir video dosyası seçin');
            return;
        }
        if (file.size > 500 * 1024 * 1024) { // 500MB limit
            toast.error('Video boyutu 500MB\'dan küçük olmalıdır');
            return;
        }

        toast.loading('Video yükleniyor...', { id: 'video-upload' });

        try {
            const path = `exercises/${Date.now()}_${file.name}`;
            const url = await dataService.uploadFile('exercise-videos', path, file);

            const updated = [...workoutDays];
            updated[dayIdx].exercises[exIdx].videoUrl = url;
            updated[dayIdx].exercises[exIdx].videoFileName = file.name;
            setWorkoutDays(updated);
            toast.success('Video yüklendi! ✅', { id: 'video-upload' });
        } catch (error) {
            console.error(error);
            toast.error('Video yüklenirken hata oluştu', { id: 'video-upload' });
        }
    };

    const removeVideo = (dayIdx: number, exIdx: number) => {
        const updated = [...workoutDays];
        updated[dayIdx].exercises[exIdx].videoUrl = '';
        updated[dayIdx].exercises[exIdx].videoFileName = '';
        setWorkoutDays(updated);
    };

    // === OPEN CREATE MODAL ===
    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingPackageId(null);
        setForm(EMPTY_FORM);
        setWorkoutDays([]);
        setIsModalOpen(true);
    };

    // === OPEN EDIT MODAL ===
    const openEditModal = (pkg: SalesPackage) => {
        setIsEditMode(true);
        setEditingPackageId(pkg.id);
        setForm({
            name: pkg.name,
            description: pkg.description,
            price: String(pkg.price),
            accessDuration: pkg.accessDuration,
            packageType: pkg.packageType,
            sport: pkg.sport,
            features: pkg.features.join(', '),
            totalWeeks: String(pkg.totalWeeks),
            maxStudents: String(pkg.maxStudents),
            hasChatSupport: pkg.hasChatSupport,
            hasGroupClass: pkg.hasGroupClass,
        });

        // Populate workout days from existing data
        if (pkg.workoutPlan && pkg.workoutPlan.length > 0) {
            setWorkoutDays(pkg.workoutPlan.map(day => ({
                dayName: day.dayName,
                focusArea: day.focusArea || '',
                isOpen: false,
                exercises: day.exercises.map(ex => ({
                    name: ex.name,
                    targetMuscle: ex.targetMuscle,
                    sets: String(ex.sets),
                    reps: ex.reps,
                    restSeconds: String(ex.restSeconds),
                    videoUrl: ex.videoUrl || '',
                    videoFileName: ex.videoUrl ? 'Mevcut video' : '',
                })),
            })));
        } else {
            setWorkoutDays([]);
        }

        setIsModalOpen(true);
    };

    // === BUILD WORKOUT PLAN ===
    const buildWorkoutPlan = (): WorkoutDay[] => {
        return workoutDays
            .filter(d => d.dayName.trim())
            .map(d => ({
                dayName: d.dayName,
                focusArea: d.focusArea || undefined,
                exercises: d.exercises
                    .filter(ex => ex.name.trim())
                    .map(ex => ({
                        id: 'ex_' + Math.random().toString(36).substr(2, 6),
                        name: ex.name,
                        targetMuscle: ex.targetMuscle,
                        sets: Number(ex.sets) || 3,
                        reps: ex.reps || '12',
                        restSeconds: Number(ex.restSeconds) || 60,
                        videoUrl: ex.videoUrl || undefined,
                    })),
            }));
    };

    // === CREATE ===
    const handleCreate = async () => {
        const user = await authService.getUser();
        if (!user || !store) { toast.error('Önce dükkanınızı açmalısınız!'); return; }
        if (!form.name || !form.price) { toast.error('Paket adı ve fiyat gerekli'); return; }

        const workoutPlan = buildWorkoutPlan();

        await dataService.createPackage({
            coachId: user.id,
            shopId: store.id,
            name: form.name,
            description: form.description,
            price: Number(form.price),
            accessDuration: form.accessDuration as any,
            packageType: form.packageType,
            totalWeeks: Number(form.totalWeeks),
            sport: form.sport,
            features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean),
            isPublished: true,
            hasChatSupport: form.hasChatSupport,
            hasGroupClass: form.hasGroupClass,
            maxStudents: Number(form.maxStudents),
            programContent: [],
            workoutPlan: workoutPlan.length > 0 ? workoutPlan : undefined,
            // Default stats for new package
            enrolledStudents: 0,
            rating: 0,
            reviewCount: 0
        });
        setIsModalOpen(false);
        setForm(EMPTY_FORM);
        setWorkoutDays([]);
        toast.success('Paket oluşturuldu! 🎉');
        loadData();
    };

    // === UPDATE ===
    const handleUpdate = async () => {
        if (!editingPackageId) return;
        const existingPkg = packages.find(p => p.id === editingPackageId);
        if (!existingPkg) return;
        if (!form.name || !form.price) { toast.error('Paket adı ve fiyat gerekli'); return; }

        const workoutPlan = buildWorkoutPlan();

        const updatedPkg: SalesPackage = {
            ...existingPkg,
            name: form.name,
            description: form.description,
            price: Number(form.price),
            accessDuration: form.accessDuration as any, // Cast to match type
            packageType: form.packageType,
            totalWeeks: Number(form.totalWeeks),
            sport: form.sport,
            features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean),
            hasChatSupport: form.hasChatSupport,
            hasGroupClass: form.hasGroupClass,
            maxStudents: Number(form.maxStudents),
            workoutPlan: workoutPlan.length > 0 ? workoutPlan : undefined,
        };

        await dataService.updatePackage(updatedPkg);
        setIsModalOpen(false);
        setForm(EMPTY_FORM);
        setWorkoutDays([]);
        setEditingPackageId(null);
        toast.success('Paket güncellendi! ✅');
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        await dataService.deletePackage(id);
        toast.success('Paket silindi');
        loadData();
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paketlerim</h1>
                    <p className="text-slate-500 font-medium">Dükkanında satışa sunduğun paketleri yönet</p>
                </div>
                <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6">
                    <Plus className="w-5 h-5 mr-2" /> Yeni Paket
                </Button>
            </div>

            {/* Package Grid */}
            {packages.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Henüz paket oluşturmadın</h2>
                    <p className="text-slate-500 mb-6">Öğrencilerin satın alabilmesi için paket oluştur</p>
                    <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> İlk Paketini Oluştur
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="border-slate-200 hover:shadow-xl transition-all group overflow-hidden">
                            <div className={`h-2 ${pkg.packageType === 'coaching' ? 'bg-green-500' : 'bg-purple-500'}`} />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${pkg.packageType === 'coaching' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {pkg.packageType === 'coaching' ? 'Koçluk' : 'Program'}
                                        </span>
                                        <h3 className="text-lg font-black text-slate-900 mt-2">{pkg.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-green-600">₺{pkg.price}</div>
                                        <span className="text-[10px] text-slate-400 font-bold">{pkg.accessDuration}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{pkg.description}</p>

                                <div className="flex items-center gap-4 mb-4 text-sm">
                                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                                        <Users className="w-4 h-4" /> {pkg.enrolledStudents}/{pkg.maxStudents}
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                                        <Star className="w-4 h-4 fill-amber-400" /> {pkg.rating || '-'}
                                    </span>
                                    {pkg.workoutPlan && pkg.workoutPlan.length > 0 && (
                                        <span className="flex items-center gap-1 text-blue-500 font-medium">
                                            <Dumbbell className="w-4 h-4" /> {pkg.workoutPlan.length} gün
                                        </span>
                                    )}
                                    {pkg.workoutPlan && pkg.workoutPlan.some(d => d.exercises.some(e => e.videoUrl)) && (
                                        <span className="flex items-center gap-1 text-purple-500 font-medium">
                                            <Video className="w-4 h-4" /> Video
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-lg border-slate-200" onClick={() => openEditModal(pkg)}>
                                        <Edit className="w-4 h-4 mr-1" /> Düzenle
                                    </Button>
                                    {pkg.workoutPlan && pkg.workoutPlan.length > 0 && (
                                        <Button variant="outline" size="sm" className="flex-1 rounded-lg border-slate-200" onClick={() => { setViewWorkoutPkg(pkg); setIsWorkoutModalOpen(true); }}>
                                            <Dumbbell className="w-4 h-4 mr-1" /> Program
                                        </Button>
                                    )}
                                    <Button variant="danger" size="sm" className="rounded-lg" onClick={() => handleDelete(pkg.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ========== CREATE / EDIT PACKAGE MODAL ========== */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Paketi Düzenle" : "Yeni Paket Oluştur"} size="lg">
                <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                    <Input label="Paket Adı *" placeholder="Örn: Elit Basketbol Programı" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none" placeholder="Paket hakkında kısa açıklama..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fiyat (₺) *" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Süre</label>
                            <select value={form.accessDuration} onChange={e => setForm({ ...form, accessDuration: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 font-medium">
                                <option value="1 Ay">1 Ay</option>
                                <option value="2 Ay">2 Ay</option>
                                <option value="3 Ay">3 Ay</option>
                                <option value="6 Ay">6 Ay</option>
                                <option value="1 Yıl">1 Yıl</option>
                                <option value="Ömür Boyu">Ömür Boyu</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Paket Tipi</label>
                            <select value={form.packageType} onChange={e => setForm({ ...form, packageType: e.target.value as any })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 font-medium">
                                <option value="coaching">Koçluk (Birebir)</option>
                                <option value="program">Program (Video/Doküman)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Spor Branşı</label>
                            <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 font-medium">
                                <option value="">Seçiniz</option>
                                {sports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Toplam Hafta" type="number" value={form.totalWeeks} onChange={e => setForm({ ...form, totalWeeks: e.target.value })} />
                        <Input label="Max Öğrenci" type="number" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })} />
                    </div>

                    <Input label="Özellikler (virgülle ayır)" placeholder="Birebir Görüşme, Beslenme Planı, Whatsapp Destek" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.hasChatSupport} onChange={e => setForm({ ...form, hasChatSupport: e.target.checked })} className="w-4 h-4 accent-green-600" />
                            <span className="text-sm font-medium text-slate-600">Mesaj Desteği</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.hasGroupClass} onChange={e => setForm({ ...form, hasGroupClass: e.target.checked })} className="w-4 h-4 accent-green-600" />
                            <span className="text-sm font-medium text-slate-600">Grup Dersi İçerir</span>
                        </label>
                    </div>

                    {/* ======== WORKOUT PROGRAM BUILDER ======== */}
                    <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Dumbbell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Antrenman Programı</h3>
                                    <p className="text-xs text-slate-400 font-medium">Gün gün egzersiz planı ve videolar ekleyin</p>
                                </div>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addDay} className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl">
                                <Plus className="w-4 h-4 mr-1" /> Gün Ekle
                            </Button>
                        </div>

                        {workoutDays.length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <Dumbbell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-bold">Henüz antrenman günü eklenmedi</p>
                                <p className="text-xs text-slate-300 font-medium mt-1">&quot;Gün Ekle&quot; butonuyla başlayın</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {workoutDays.map((day, dayIdx) => (
                                <div key={dayIdx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                    {/* Day Header */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => toggleDay(dayIdx)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                                                {dayIdx + 1}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-900">{day.dayName || `Gün ${dayIdx + 1}`}</span>
                                                {day.focusArea && <span className="text-xs text-slate-400 font-medium ml-2">• {day.focusArea}</span>}
                                                <span className="text-xs text-blue-500 font-bold ml-2">({day.exercises.length} egzersiz)</span>
                                                {day.exercises.some(e => e.videoUrl) && (
                                                    <span className="text-xs text-purple-500 font-bold ml-1">
                                                        <Video className="w-3 h-3 inline" /> {day.exercises.filter(e => e.videoUrl).length} video
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeDay(dayIdx); }}
                                                className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            {day.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {/* Day Content */}
                                    {day.isOpen && (
                                        <div className="p-4 pt-0 space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Gün Adı</label>
                                                    <input
                                                        value={day.dayName}
                                                        onChange={e => updateDay(dayIdx, 'dayName', e.target.value)}
                                                        placeholder="Örn: Pazartesi - Göğüs"
                                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Odak Alanı</label>
                                                    <input
                                                        value={day.focusArea}
                                                        onChange={e => updateDay(dayIdx, 'focusArea', e.target.value)}
                                                        placeholder="Örn: Üst Vücut & Güç"
                                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Exercises */}
                                            <div className="space-y-2">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Egzersizler</span>

                                                {day.exercises.map((ex, exIdx) => (
                                                    <div key={exIdx} className="bg-white rounded-xl border border-slate-100 p-3 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-300 uppercase">Egzersiz {exIdx + 1}</span>
                                                            {day.exercises.length > 1 && (
                                                                <button
                                                                    onClick={() => removeExercise(dayIdx, exIdx)}
                                                                    className="w-6 h-6 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                value={ex.name}
                                                                onChange={e => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                                                                placeholder="Egzersiz adı *"
                                                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all"
                                                            />
                                                            <input
                                                                value={ex.targetMuscle}
                                                                onChange={e => updateExercise(dayIdx, exIdx, 'targetMuscle', e.target.value)}
                                                                placeholder="Hedef kas grubu"
                                                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Set</label>
                                                                <input
                                                                    type="number"
                                                                    value={ex.sets}
                                                                    onChange={e => updateExercise(dayIdx, exIdx, 'sets', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:border-blue-400 transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Tekrar</label>
                                                                <input
                                                                    value={ex.reps}
                                                                    onChange={e => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                                                                    placeholder="12"
                                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:border-blue-400 transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Dinlenme (sn)</label>
                                                                <input
                                                                    type="number"
                                                                    value={ex.restSeconds}
                                                                    onChange={e => updateExercise(dayIdx, exIdx, 'restSeconds', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:border-blue-400 transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* === VIDEO UPLOAD SECTION === */}
                                                        <div className="pt-2 border-t border-slate-100">
                                                            {ex.videoUrl ? (
                                                                <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-2.5 border border-purple-100">
                                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                                        <FileVideo className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-purple-700 truncate">{ex.videoFileName || 'Video yüklendi'}</p>
                                                                        <p className="text-[10px] text-purple-400 font-medium">Video hazır ✓</p>
                                                                    </div>
                                                                    <div className="flex gap-1 shrink-0">
                                                                        <button
                                                                            onClick={() => { setPreviewVideoUrl(ex.videoUrl); setIsVideoPreviewOpen(true); }}
                                                                            className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 flex items-center justify-center transition-colors"
                                                                        >
                                                                            <Play className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => removeVideo(dayIdx, exIdx)}
                                                                            className="w-7 h-7 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <input
                                                                        type="file"
                                                                        accept="video/*"
                                                                        ref={el => { fileInputRefs.current[`${dayIdx}-${exIdx}`] = el; }}
                                                                        onChange={e => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) handleVideoUpload(dayIdx, exIdx, file);
                                                                            e.target.value = '';
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <button
                                                                        onClick={() => fileInputRefs.current[`${dayIdx}-${exIdx}`]?.click()}
                                                                        className="w-full py-2 rounded-lg border border-dashed border-purple-200 text-[11px] font-bold text-purple-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-1.5"
                                                                    >
                                                                        <Upload className="w-3.5 h-3.5" /> Video Yükle
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => addExercise(dayIdx)}
                                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Egzersiz Ekle
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={isEditMode ? handleUpdate : handleCreate} fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 mt-2">
                        {isEditMode ? 'Değişiklikleri Kaydet ✅' : 'Paketi Oluştur 🚀'}
                    </Button>
                </div>
            </Modal>

            {/* ========== VIEW WORKOUT PLAN MODAL ========== */}
            <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title={viewWorkoutPkg ? `${viewWorkoutPkg.name} - Antrenman Programı` : ''} size="lg">
                {viewWorkoutPkg?.workoutPlan && (
                    <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                        {viewWorkoutPkg.workoutPlan.map((day, dayIdx) => (
                            <div key={dayIdx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-slate-100/50 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-black">
                                            {dayIdx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">{day.dayName}</h4>
                                            {day.focusArea && <p className="text-xs text-slate-500 font-medium">{day.focusArea}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    {day.exercises.map((ex, exIdx) => (
                                        <div key={ex.id || exIdx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                            <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                                {exIdx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{ex.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{ex.targetMuscle}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {ex.videoUrl && (
                                                    <button
                                                        onClick={() => { setPreviewVideoUrl(ex.videoUrl!); setIsVideoPreviewOpen(true); }}
                                                        className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 flex items-center justify-center transition-colors"
                                                        title="Videoyu izle"
                                                    >
                                                        <Play className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
                                                    <span className="bg-slate-100 px-2 py-1 rounded-md">{ex.sets} set</span>
                                                    <span className="bg-slate-100 px-2 py-1 rounded-md">{ex.reps}</span>
                                                    <span className="bg-slate-100 px-2 py-1 rounded-md">{ex.restSeconds}sn</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* ========== VIDEO PREVIEW MODAL ========== */}
            <Modal isOpen={isVideoPreviewOpen} onClose={() => { setIsVideoPreviewOpen(false); setPreviewVideoUrl(''); }} title="Video Önizleme" size="lg">
                {previewVideoUrl && (
                    <div className="py-4">
                        <video
                            src={previewVideoUrl}
                            controls
                            autoPlay
                            className="w-full max-h-[60vh] rounded-2xl bg-black"
                        >
                            Tarayıcınız video etiketini desteklemiyor.
                        </video>
                    </div>
                )}
            </Modal>
        </div>
    );
}
