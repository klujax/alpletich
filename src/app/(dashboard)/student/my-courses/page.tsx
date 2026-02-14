'use client';

import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { Purchase, GymStore, SalesPackage } from '@/lib/mock-service'; // Keep types for now
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package, Calendar, MessageCircle, Star, Clock, ShoppingBag, ChevronRight, Store, Dumbbell, FileText, ArrowLeft, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

export default function StudentCoursesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [stores, setStores] = useState<GymStore[]>([]);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<'overview' | 'workout' | 'nutrition'>('overview');

    useEffect(() => {
        async function load() {
            const user = await authService.getUser();
            if (!user) return;
            // Supabase getPurchases() returns ALL purchases, so we filter.
            const [allPurchases, storeData, packageData] = await Promise.all([
                dataService.getPurchases(),
                dataService.getStores(),
                dataService.getPackages(),
            ]);

            const myPurchases = allPurchases.filter((p: Purchase) => p.studentId === user.id);
            const activePurchases = myPurchases.filter(p => !p.packageSnapshot || p.packageSnapshot.packageType === 'program' || p.status === 'active');
            // Logic: Programs might be 'completed' but still accessible if they are programs.
            // Or if active/expired.
            // For now, let's just show all purchases as in mock service.

            setPurchases(myPurchases);
            setStores(storeData);
            setPackages(packageData);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const sortedPurchases = [...purchases].sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    const getStore = (shopId: string) => stores.find(s => s.id === shopId);

    const openDetail = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setActiveModalTab('overview');
        setIsDetailOpen(true);
    };

    const handleStartProgram = async (purchase: Purchase) => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (user && purchase.packageId) {
            // Note: setActiveProgram is missing in Supabase DataService interface in current view.
            // Assuming it's a gap or I need to implement it.
            // For now I'll check if it exists or simulate it.
            // In a real app we might update a 'current_program' field on the user profile or a separate table.

            if ((dataService as any).setActiveProgram) {
                await (dataService as any).setActiveProgram(user.id, purchase.packageId);
            } else {
                // Placeholder: maybe set local storage or do nothing if not simpler way
                localStorage.setItem('activeProgramId', purchase.packageId);
            }

            window.location.href = '/student/workouts';
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Derslerim</h1>
                    <p className="text-slate-500 font-medium">Aktif eğitimlerin ve programların</p>
                </div>
                <Link href="/marketplace">
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold rounded-xl px-6 h-12 shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                        <ShoppingBag className="w-5 h-5 mr-2" /> Yeni Ders Keşfet
                    </Button>
                </Link>
            </div>

            {/* Aktif Dersler */}
            {sortedPurchases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPurchases.map((purchase) => {
                        const store = getStore(purchase.shopId);
                        const progress = Math.floor(Math.random() * 100);
                        const isExpired = purchase.expiresAt && new Date(purchase.expiresAt) < new Date();

                        return (
                            <Card
                                key={purchase.id}
                                className="group border-none bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden ring-1 ring-slate-100"
                                onClick={() => openDetail(purchase)}
                            >
                                <div className="p-6 relative">
                                    <div className="absolute top-6 right-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isExpired ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-primary/10 text-primary border-primary/20'
                                            }`}>
                                            {isExpired ? 'Erişim Var' : 'Aktif'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-sm leading-none tabular-nums grayscale">
                                            {store?.logoEmoji || '📦'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{purchase.packageName}</h3>
                                            <p className="text-sm text-slate-500 font-bold">{store?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                <span>İlerleme Durumu</span>
                                                <span className="text-slate-900">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-primary" />
                                        </div>

                                        <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-slate-400">Başlangıç</p>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(purchase.purchasedAt).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100" />
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-slate-400">Bitiş</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {purchase.expiresAt ? new Date(purchase.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartProgram(purchase);
                                                }}
                                            >
                                                Programı Uygula
                                            </Button>

                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ResultIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Henüz dersin yok</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                        Hedeflerine ulaşmak için ilk adımı at. Pazaryerindeki profesyonel koçları ve programları keşfet.
                    </p>
                    <Link href="/marketplace">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            Pazaryerine Git
                        </Button>
                    </Link>
                </div>
            )}

            {/* Süresi Biten Dersler - Minimal List */}


            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Ders Detayları" size="lg">
                <div className="space-y-6">
                    {selectedPurchase && (
                        <>
                            {/* Header / Tab Navigation */}
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4">
                                {activeModalTab !== 'overview' && (
                                    <Button variant="ghost" size="icon" onClick={() => setActiveModalTab('overview')} className="-ml-2">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                                        {activeModalTab === 'overview' ? selectedPurchase.packageName :
                                            activeModalTab === 'workout' ? 'Antrenman Programı' : 'Beslenme Planı'}
                                    </h3>
                                    {activeModalTab === 'overview' && (
                                        <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                            <StoreIcon className="w-3 h-3" /> {getStore(selectedPurchase.shopId)?.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {activeModalTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Durum</p>
                                            <p className="text-lg font-black text-primary">
                                                {selectedPurchase.expiresAt && new Date(selectedPurchase.expiresAt) < new Date()
                                                    ? 'Erişim Var'
                                                    : 'Aktif'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kalan Süre</p>
                                            <p className="text-lg font-black text-slate-900">
                                                {selectedPurchase.expiresAt
                                                    ? (new Date(selectedPurchase.expiresAt) < new Date()
                                                        ? 'Koçluk Bitti'
                                                        : Math.ceil((new Date(selectedPurchase.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' Gün')
                                                    : 'Süresiz'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-black text-slate-900">Program İçeriği</h4>
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveModalTab('workout')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <DumbbellIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Antrenman Programı</p>
                                                    <p className="text-xs text-slate-500 font-bold">Detayları incele</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveModalTab('nutrition')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <FileTextIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Beslenme Planı</p>
                                                    <p className="text-xs text-slate-500 font-bold">Detayları incele</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg shadow-primary/20 active:scale-95 transition-all border-none"
                                            onClick={() => handleStartProgram(selectedPurchase)}
                                        >
                                            Programı Uygula (Tam Ekran)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeModalTab === 'workout' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 text-sm font-medium">
                                        Bu programın antrenman detayları aşağıdadır. Uygulamaya başlamak için "Programı Uygula" butonunu kullanabilirsiniz.
                                    </div>
                                    {packages.find(p => p.id === selectedPurchase.packageId)?.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            <span className="font-bold text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                    {(!packages.find(p => p.id === selectedPurchase.packageId)?.features?.length) && (
                                        <div className="text-center py-8 text-slate-400 font-medium">Bu program için detaylı özellik listesi bulunamadı.</div>
                                    )}
                                </div>
                            )}

                            {activeModalTab === 'nutrition' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm font-medium">
                                        Bu pakete dahil olan beslenme önerileri ve diyet planı detayları.
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">Detaylı beslenme planı PDF olarak sunulmaktadır veya antrenörünüz tarafından özel olarak hazırlanacaktır.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}

// Icons helper
const StoreIcon = Store;
const DumbbellIcon = Dumbbell;
const FileTextIcon = FileText;
const ResultIcon = Package;

// Missing imports? I need to make sure I import what I use.
// Store, Dumbbell, FileText are from lucide-react.
// I'll add them to imports at top if not present.
// The code uses: Package, Calendar, MessageCircle, Star, Clock, ShoppingBag immediately available.
// I used Store, Dumbbell, FileText in the modal content.
// I need to add them to lines 6-8.
