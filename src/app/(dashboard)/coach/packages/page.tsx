'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, ShoppingBag, Check, X, Calendar, Dumbbell, Utensils, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { dataService, SalesPackage, authService, SportCategory } from '@/lib/mock-service';
import { toast } from 'sonner';
import { WeeklyPlan } from '@/types/database';

export const dynamic = 'force-dynamic';

export default function PackagesPage() {
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [sportsMap, setSportsMap] = useState<SportCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<SalesPackage | null>(null);

    // Form States - Step 1: Basic Info
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [accessDuration, setAccessDuration] = useState('1 Ay');
    const [totalWeeks, setTotalWeeks] = useState(4);
    const [packageType, setPackageType] = useState<'workout' | 'nutrition' | 'bundle'>('bundle');
    const [sport, setSport] = useState('basketball');
    const [hasChatSupport, setHasChatSupport] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState('');

    // Form States - Step 2: Program Content
    const [programContent, setProgramContent] = useState<any[]>([]);
    const [activeWeek, setActiveWeek] = useState(1);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        setIsLoading(true);
        const user = authService.getUser();
        if (user) {
            const pkgs = await dataService.getPackages(user.id);
            const sports = await dataService.getSports(user.id);
            setPackages(pkgs);
            setSportsMap(sports);
        }
        setIsLoading(false);
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedPackage(null);
        resetForm();
        setStep(1);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg: SalesPackage) => {
        setIsEditing(true);
        setSelectedPackage(pkg);
        setName(pkg.name || '');
        setDescription(pkg.description || '');
        setPrice(pkg.price !== undefined ? pkg.price.toString() : '');
        setAccessDuration(pkg.accessDuration || '1 Ay');
        setTotalWeeks(pkg.totalWeeks || 4);
        setPackageType(pkg.packageType || 'bundle');
        setPackageType(pkg.packageType || 'bundle');
        setSport(pkg.sport || 'basketball');
        setHasChatSupport(pkg.hasChatSupport || false);
        setFeatures(pkg.features || []);
        setProgramContent(pkg.programContent || []);
        setStep(1);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setAccessDuration('1 Ay');
        setTotalWeeks(4);
        setPackageType('bundle');
        setSport('basketball');
        setSport('basketball');
        setHasChatSupport(false);
        setFeatures([]);
        setFeatureInput('');
        setProgramContent([]);
    };

    const handleNextStep = () => {
        // Initialize program content if empty or length mismatch
        if (programContent.length !== totalWeeks) {
            // If we have content but changing length, try to preserve
            // Simplification: if expanding, keep old and pad. if shrinking, cut.

            const newContent = Array(totalWeeks).fill(null).map((_, i) => {
                if (programContent[i]) return programContent[i];
                return {
                    week: i + 1,
                    workouts: { 'Pazartesi': '', 'Salı': '', 'Çarşamba': '', 'Perşembe': '', 'Cuma': '', 'Cumartesi': '', 'Pazar': '' },
                    nutrition: { 'Pazartesi': '', 'Salı': '', 'Çarşamba': '', 'Perşembe': '', 'Cuma': '', 'Cumartesi': '', 'Pazar': '' }
                };
            });

            setProgramContent(newContent);
        }
        setStep(2);
    };

    const updateProgram = (day: string, type: 'workout' | 'nutrition', value: string) => {
        const newContent = [...programContent];
        const weekData = newContent[activeWeek - 1];

        if (type === 'workout') {
            weekData.workouts[day] = value;
        } else {
            weekData.nutrition[day] = value;
        }

        setProgramContent(newContent);
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const user = authService.getUser();
        if (!user) return;

        try {
            const packageData = {
                name,
                description,
                price: parseFloat(price) || 0,
                accessDuration,
                totalWeeks,
                packageType,
                programContent,
                sport,
                hasChatSupport,
                features,
                coachId: user.id,
                isPublished: true
            };

            if (isEditing && selectedPackage) {
                await dataService.updatePackage({
                    ...selectedPackage,
                    ...packageData
                });
                toast.success('Paket güncellendi');
            } else {
                await dataService.createPackage(packageData);
                toast.success('Yeni paket oluşturuldu');
            }

            setIsModalOpen(false);
            loadPackages();
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu paketi silmek istediğinize emin misiniz?')) {
            await dataService.deletePackage(id);
            toast.success('Paket silindi');
            loadPackages();
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>;

    const currentWeekData = programContent[activeWeek - 1] || {
        workouts: {},
        nutrition: {}
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paketlerim ve Programlarım</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Satışa sunduğunuz antrenman ve beslenme paketlerini buradan yönetin.
                    </p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Yeni Paket Oluştur
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <Card key={pkg.id} className="relative group overflow-hidden border-slate-200 hover:border-green-200 transition-all hover:shadow-xl hover:shadow-green-900/5">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${pkg.sport === 'basketball' ? 'bg-orange-500' :
                            pkg.sport === 'football' ? 'bg-green-500' :
                                pkg.sport === 'swimming' ? 'bg-blue-500' : 'bg-purple-500'
                            }`} />

                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${pkg.sport === 'basketball' ? 'bg-orange-50 text-orange-700' :
                                    pkg.sport === 'football' ? 'bg-green-50 text-green-700' :
                                        pkg.sport === 'swimming' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                    }`}>
                                    {sportsMap.find(s => s.id === pkg.sport)?.name || pkg.sport}
                                </span>
                                <div className="font-black text-xl text-slate-900">₺{pkg.price}</div>
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1">{pkg.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">{pkg.description}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-4 mb-4 text-xs font-bold text-slate-500">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                    <Clock className="w-3.5 h-3.5" />
                                    {pkg.totalWeeks} Hafta
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Erişim: {pkg.accessDuration}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                    {pkg.packageType === 'workout' ? <Dumbbell className="w-3.5 h-3.5" /> :
                                        pkg.packageType === 'nutrition' ? <Utensils className="w-3.5 h-3.5" /> :
                                            <div className="flex gap-0.5"><Dumbbell className="w-3.5 h-3.5" /><Utensils className="w-3.5 h-3.5" /></div>}
                                    {pkg.packageType === 'workout' ? 'Antrenman' : pkg.packageType === 'nutrition' ? 'Beslenme' : 'Full Paket'}
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {pkg.features.slice(0, 3).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span className="line-clamp-1">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => handleOpenEdit(pkg)}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-600"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Düzenle
                                </Button>
                                <Button
                                    variant="outline"
                                    className="px-3 border-red-200 hover:bg-red-50 text-red-600 hover:border-red-300"
                                    onClick={() => handleDelete(pkg.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {packages.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz paket oluşturmadınız</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                            Öğrencilerinize sunmak için ilk antrenman veya beslenme paketinizi oluşturun.
                        </p>
                        <Button onClick={handleOpenCreate} variant="outline" className="border-slate-200">
                            Paket Oluştur
                        </Button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
                size="xl"
            >
                <div className="py-4 h-[600px] flex flex-col">
                    {/* Stepper */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 1 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'}`}>1</div>
                        <div className="w-16 h-1 bg-slate-100 mx-2">
                            <div className={`h-full bg-green-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 2 ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Paket Adı"
                                        placeholder="Örn: 4 Haftalık Dikey Sıçrama"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Spor Dalı</label>
                                        <select
                                            value={sport}
                                            onChange={(e) => setSport(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium bg-white"
                                        >
                                            {sportsMap.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Paket Tipi</label>
                                        <select
                                            value={packageType}
                                            onChange={(e) => setPackageType(e.target.value as any)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium bg-white"
                                        >
                                            <option value="workout">Sadece Antrenman</option>
                                            <option value="nutrition">Sadece Beslenme</option>
                                            <option value="bundle">Antrenman + Beslenme</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Program Süresi (Hafta)</label>
                                        <select
                                            value={totalWeeks}
                                            onChange={(e) => setTotalWeeks(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium bg-white"
                                        >
                                            {[1, 2, 3, 4, 6, 8, 12].map(w => (
                                                <option key={w} value={w}>{w} Hafta</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        label="Fiyat (₺)"
                                        type="number"
                                        placeholder="999"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none"
                                        placeholder="Paket içeriği hakkında kısa bilgi..."
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Erişim Süresi"
                                        placeholder="Örn: 2 Ay (Program bitince erişim kapanır)"
                                        value={accessDuration}
                                        onChange={(e) => setAccessDuration(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Öğrenci paketi satın aldıktan sonra ne kadar süreyle görüntüleyebilir?</p>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="hasChatSupport"
                                        checked={hasChatSupport}
                                        onChange={(e) => setHasChatSupport(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor="hasChatSupport" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                        Koç ile Mesajlaşma Desteği Var
                                        <p className="text-xs font-normal text-slate-500 mt-0.5">
                                            İşaretlenirse öğrenci panelinde "Koçumla Sohbet" aktif olur.
                                        </p>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Paket Özellikleri</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            placeholder="Örn: Birebir Analiz"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                        />
                                        <Button type="button" onClick={handleAddFeature} variant="secondary" className="px-4">
                                            Ekle
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(index)}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                                    {Array.from({ length: totalWeeks }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveWeek(i + 1)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeWeek === i + 1
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {i + 1}. Hafta
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                        {activeWeek}. Hafta Planı
                                    </h3>

                                    <div className="grid gap-4">
                                        {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                                            <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-slate-900">{day}</span>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {(!currentWeekData.workouts[day] && !currentWeekData.nutrition[day]) ? 'İçerik Girilmedi' : 'Planlandı'}
                                                    </span>
                                                </div>

                                                {(packageType === 'workout' || packageType === 'bundle') && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                                                            <Dumbbell className="w-3 h-3" /> Antrenman
                                                        </div>
                                                        <textarea
                                                            className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-green-500 transition-colors bg-white resize-y"
                                                            placeholder="Örn: 3x12 Bench Press, 4x10 Squat..."
                                                            rows={2}
                                                            value={currentWeekData.workouts[day] || ''}
                                                            onChange={(e) => updateProgram(day, 'workout', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {(packageType === 'nutrition' || packageType === 'bundle') && (
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                                                            <Utensils className="w-3 h-3" /> Beslenme
                                                        </div>
                                                        <textarea
                                                            className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-green-500 transition-colors bg-white resize-y"
                                                            placeholder="Örn: Kahvaltı: 3 Yumurta..."
                                                            rows={2}
                                                            value={currentWeekData.nutrition[day] || ''}
                                                            onChange={(e) => updateProgram(day, 'nutrition', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-100 flex gap-3">
                        {step === 2 ? (
                            <>
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">Geri</Button>
                                <Button type="button" onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                    Kaydet ve Oluştur
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">İptal</Button>
                                <Button type="button" onClick={handleNextStep} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                    İleri: Program İçeriği
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
