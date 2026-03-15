'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
    Star, Users, ShoppingBag, Store, Check, ChevronRight, ChevronLeft, Clock, Award, Target, Sparkles, CalendarDays, MoveRight
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GymStore, SalesPackage, SportCategory, Review, GroupClass } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function MarketplacePage() {
    const router = useRouter();
    const [stores, setStores] = useState<GymStore[]>([]);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedSport, setSelectedSport] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'packages' | 'classes'>('packages');
    const [userInterests, setUserInterests] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<SalesPackage | null>(null);
    const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
    const [detailStore, setDetailStore] = useState<GymStore | null>(null);
    const [detailReviews, setDetailReviews] = useState<Review[]>([]);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        // Assuming current user is needed for interests
        const currentUser = await authService.getUser();
        if (currentUser) {
            if (currentUser.interested_sports && currentUser.interested_sports.length > 0) {
                setUserInterests(currentUser.interested_sports); // Assuming array of strings
            }
        }

        const [storeData, packageData, classesData, sportsData, reviewData] = await Promise.all([
            dataService.getStores(),
            dataService.getPackages(),
            dataService.getGroupClasses(),
            dataService.getSports(),
            dataService.getReviews(),
        ]);

        setStores(storeData.filter((s: GymStore) => s.isActive !== false)); // Handle optional isActive
        setPackages(packageData.filter((p: SalesPackage) => p.isPublished));
        setGroupClasses(classesData.filter((c: GroupClass) => c.status === 'scheduled'));
        setSports(sportsData);
        setReviews(reviewData);
        setIsLoading(false);
    };

    const handlePurchase = async (pkg: SalesPackage) => {
        const user = await authService.getUser();
        if (!user) { toast.error('Giriş yapmalısınız'); return; }
        if (user.role !== 'student') { toast.error('Sadece öğrenciler satın alabilir'); return; }

        // İyzico ödeme sayfasına yönlendir
        setIsDetailOpen(false);
        router.push(`/checkout/${pkg.id}`);
    };

    const handleClassPurchase = async (cls: GroupClass) => {
        const user = await authService.getUser();
        if (!user) { toast.error('Giriş yapmalısınız'); return; }
        if (user.role !== 'student') { toast.error('Sadece öğrenciler satın alabilir'); return; }
        if (cls.enrolledParticipants.includes(user.id)) { toast.error('Bu derse zaten katıldınız'); return; }

        try {
            await dataService.enrollClass(cls.id, user.id);

            // Optionally create a purchase record if paid class, but explicit enrollClass handles enrollment
            // If payment needed, would need separate logic. For now assuming free or direct enroll.
            // If price > 0, we might need purchase logic similar to package, 
            // but enrollClass in Supabase service inserts into class_enrollments.

            setIsClassDetailOpen(false);
            toast.success('Ders kaydı başarılı! 🎉 Grup Derslerim sayfasından erişebilirsin.');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Ders kaydı başarısız oldu.');
        }
    };

    const openDetail = (pkg: SalesPackage) => {
        const store = stores.find(s => s.id === pkg.shopId);
        const shopReviews = reviews.filter(r => r.shopId === pkg.shopId);
        setSelectedPackage(pkg);
        setDetailStore(store || null);
        setDetailReviews(shopReviews);
        setIsDetailOpen(true);
    };

    const openClassDetail = (cls: GroupClass) => {
        const store = stores.find(s => s.id === cls.shopId);
        setSelectedClass(cls);
        setDetailStore(store || null);
        setIsClassDetailOpen(true);
    };

    const filteredPackages = packages
        .filter(pkg => {
            if (selectedSport !== 'all' && pkg.sport !== selectedSport) return false;
            return true;
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const filteredClasses = groupClasses
        .filter(cls => {
            if (selectedSport !== 'all' && cls.sport !== selectedSport) return false;
            return true;
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-green-500/20 rounded-full animate-ping" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-t-green-600 rounded-full animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20 pt-0 px-4 md:px-8">
            {/* --- HORIZONTAL CATEGORY BAR --- */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl -mx-4 md:-mx-8 px-4 md:px-8 py-2 border-b border-slate-100 mb-6 shadow-sm">
                <div className="max-w-[1400px] mx-auto relative flex items-center gap-2">
                    {/* Left Scroll Button - Hidden on Mobile */}
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center hover:bg-slate-50 transition-colors z-10"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* Scrollable Categories */}
                    <div
                        ref={scrollRef}
                        className="flex flex-nowrap overflow-x-auto gap-2 no-scrollbar scroll-smooth flex-1 py-1 px-1 items-center"
                    >
                        <button
                            onClick={() => setSelectedSport('all')}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border",
                                selectedSport === 'all'
                                    ? "bg-primary text-white border-primary shadow-md shadow-green-100"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            Tümü
                        </button>
                        {sports.map(sport => (
                            <button
                                key={sport.id}
                                onClick={() => setSelectedSport(sport.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border",
                                    selectedSport === sport.id
                                        ? "bg-primary text-white border-primary shadow-md shadow-green-100"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <span className="text-base">{sport.icon}</span>
                                {sport.name}
                            </button>
                        ))}
                    </div>

                    {/* Right Scroll Button - Hidden on Mobile */}
                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center hover:bg-slate-50 transition-colors z-10 mr-2"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>

                </div>
            </div>

            {/* --- VIEW MODE TABS --- */}
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setViewMode('packages')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                        viewMode === 'packages'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Eğitim Paketleri
                    </div>
                </button>
                <button
                    onClick={() => setViewMode('classes')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                        viewMode === 'classes'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Grup Dersleri
                    </div>
                </button>
            </div>

            {/* --- MINIMALIST PERSONALIZED BANNER --- */}
            {selectedSport === 'all' && userInterests.length > 0 && viewMode === 'packages' && (
                <div className="relative group p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 overflow-hidden shadow-sm lg:shadow-none hover:shadow-lg transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <Target className="w-32 h-32 text-slate-900" />
                    </div>
                    <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 flex-shrink-0">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Senin İçin Seçtiklerimiz ✨</h3>
                            <p className="text-slate-500 font-bold text-lg leading-tight">
                                İlgi alanına giren <span className="text-primary underline underline-offset-4 decoration-2 decoration-primary/30">{userInterests.length} farklı spor dalında</span> en iyi eğitmenleri senin için listeledik.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setUserInterests([])}
                            className="bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black rounded-2xl px-8 h-14"
                        >
                            Tümünü Gör
                        </Button>
                    </div>
                </div>
            )}

            {/* --- GRID DISPLAY --- */}
            {viewMode === 'packages' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    {filteredPackages.map((pkg, idx) => {
                        const store = stores.find(s => s.id === pkg.shopId);
                        const sport = sports.find(s => s.id === pkg.sport);
                        return (
                            <div
                                key={pkg.id}
                                className="group relative h-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <Card
                                    className="h-full border-none bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group/card ring-1 ring-slate-100"
                                    onClick={() => openDetail(pkg)}
                                >
                                    {/* Minimalist Compact Header */}
                                    <div className="relative h-24 overflow-hidden bg-slate-50 border-b border-slate-50 group-hover/card:bg-slate-100 transition-colors">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] text-6xl select-none grayscale">
                                            {sport?.icon}
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <div className="px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md shadow-sm border border-slate-100 flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[10px] font-black text-slate-700">{pkg.rating}</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                                            <div className="w-5 h-5 rounded-md bg-white shadow-sm flex items-center justify-center text-xs border border-slate-100">
                                                {store?.logoEmoji}
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-3 flex flex-col flex-1 gap-1">
                                        <h3 className="text-xs font-black text-slate-900 leading-tight line-clamp-2 min-h-[2.4em] group-hover/card:text-green-700 transition-colors">
                                            {pkg.name}
                                        </h3>

                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                            <span>{pkg.packageType === 'coaching' ? 'Birebir Koçluk' : 'Program'}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                            <span>{pkg.accessDuration}</span>
                                        </div>

                                        <div className="mt-auto pt-2 flex items-center justify-between">
                                            <p className="text-sm font-black text-green-600">₺{pkg.price}</p>
                                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/card:bg-green-600 group-hover/card:text-white transition-all">
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((cls, idx) => {
                        const store = stores.find(s => s.id === cls.shopId);
                        const sport = sports.find(s => s.id === cls.sport);
                        return (
                            <div
                                key={cls.id}
                                className="group relative h-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <Card
                                    className="h-full border-none bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group/card ring-1 ring-slate-100"
                                    onClick={() => openClassDetail(cls)}
                                >
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                                                <span className="text-sm">{sport?.icon}</span>
                                                {sport?.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-green-600 font-black">
                                                {cls.price === 0 ? 'ÜCRETSİZ' : `₺${cls.price}`}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover/card:text-green-600 transition-colors">
                                            {cls.title}
                                        </h3>

                                        <div className="space-y-3 mb-6 flex-1">
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <CalendarDays className="w-4 h-4" />
                                                </div>
                                                {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                {new Date(cls.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} dk)
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                {cls.enrolledParticipants.length} / {cls.maxParticipants} Katılımcı
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
                                                    {store?.logoEmoji}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{store?.name}</span>
                                            </div>
                                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-4">
                                                İncele
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}

            {(viewMode === 'packages' ? filteredPackages.length : filteredClasses.length) === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-8 h-8 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Henüz buralar boş</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Seçilen filtreye uygun aktif paket bulamadık. Başka bir kategori keşfetmeye ne dersin?
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => { setSelectedSport('all'); setUserInterests([]); }}
                        className="mt-8 font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                    >
                        Tümünü Görüntüle
                    </Button>
                </div>
            )}


            {/* --- PREMIUM DETAIL MODAL --- */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="" size="lg">
                {selectedPackage && (
                    <div className="relative overflow-hidden -m-6 flex flex-col h-[85vh]">
                        {/* Hero Header Section */}
                        <div className="relative h-64 md:h-72 w-full flex-shrink-0">
                            {/* Background Pattern/Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-green-900" />
                            <div className="absolute inset-0 opacity-20" 
                                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            
                            {/* Decorative Icon */}
                            <div className="absolute -right-8 -top-8 w-64 h-64 opacity-10 blur-2xl bg-green-400 rounded-full animate-pulse" />
                            <div className="absolute right-8 bottom-8 text-8xl md:text-9xl opacity-20 pointer-events-none select-none grayscale invert drop-shadow-2xl translate-y-4 animate-in slide-in-from-bottom-8 duration-1000">
                                {sports.find(s => s.id === selectedPackage.sport)?.icon}
                            </div>

                            {/* Close Button - Sticky or absolute */}
                            <button 
                                onClick={() => setIsDetailOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all z-20"
                            >
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </button>

                            {/* Content Over Hero */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-slate-940 via-slate-900/40 to-transparent">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                                            <Sparkles className="w-3 h-3" />
                                            {selectedPackage.packageType === 'coaching' ? 'Birebir Koçluk' : 'Program'}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            {selectedPackage.accessDuration} Erişim
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none max-w-2xl drop-shadow-lg">
                                        {selectedPackage.name}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-lg border border-slate-100">
                                            {detailStore?.logoEmoji || '🏪'}
                                        </div>
                                        <span className="text-white font-bold text-sm tracking-tight opacity-90">{detailStore?.name}</span>
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-4 h-4 fill-amber-400" />
                                            <span className="font-black text-sm">{selectedPackage.rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Body Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10 bg-white">
                            {/* Summary Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Clock className="w-5 h-5 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Program Süresi</p>
                                        <p className="text-lg font-black text-slate-900">{selectedPackage.totalWeeks} Hafta</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Users className="w-5 h-5 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Öğrenci Sayısı</p>
                                        <p className="text-lg font-black text-slate-900">{selectedPackage.enrolledStudents || 0} Aktif</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Target className="w-5 h-5 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Destek</p>
                                        <p className="text-lg font-black text-slate-900">{selectedPackage.hasChatSupport ? 'Soru-Cevap' : 'Sadece Plan'}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Award className="w-5 h-5 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Popülerlik</p>
                                        <p className="text-lg font-black text-slate-900">En Çok Satan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        Paket İçeriği & Avantajlar
                                    </h4>
                                    <span className="text-xs font-bold text-slate-400">{selectedPackage.features?.length || 0} Özellik</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedPackage.features?.map((f, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 group hover:bg-green-50/50 hover:border-green-100 transition-all duration-300">
                                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-lg shadow-green-600/20">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 leading-tight tracking-tight group-hover:text-slate-900 transition-colors">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Hakkında</h4>
                                <p className="text-slate-500 font-bold leading-relaxed text-sm">
                                    {selectedPackage.description || "Bu paket henüz açıklama içermiyor."}
                                </p>
                            </div>

                            {/* Store Reviews in Modal */}
                            {detailReviews.length > 0 && (
                                <div className="pt-10 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Eğitmen Değerlendirmeleri</h4>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black">
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            {selectedPackage.rating} / 5.0
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {detailReviews.slice(0, 3).map(r => {
                                            const isComplaint = r.comment.includes('ŞİKAYET');
                                            return (
                                                <div key={r.id} className={`p-6 rounded-[2rem] border ${isComplaint ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-100'} hover:scale-[1.01] transition-transform`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden uppercase">
                                                                {r.studentName?.[0] || 'U'}
                                                            </div>
                                                            <span className={`font-black text-xs ${isComplaint ? 'text-red-900' : 'text-slate-900'}`}>{r.studentName || 'Anonim Kullanıcı'}</span>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? (isComplaint ? 'text-red-500 fill-red-500' : 'text-amber-400 fill-amber-400') : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-bold leading-relaxed italic ${isComplaint ? 'text-red-600' : 'text-slate-500'}`}>&quot;{r.comment}&quot;</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex items-center justify-between gap-6 flex-shrink-0">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">Ödenecek Tutar</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">₺{selectedPackage.price}</span>
                                    <span className="text-xs font-bold text-slate-400">/ Tek Sefer</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => handlePurchase(selectedPackage)}
                                className="flex-1 max-w-[240px] bg-green-600 hover:bg-green-700 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all group"
                            >
                                <span className="flex items-center gap-3">
                                    Eğitime Başla <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
            {/* --- GROUP CLASS DETAIL MODAL REAMPED --- */}
            <Modal isOpen={isClassDetailOpen} onClose={() => setIsClassDetailOpen(false)} title="" size="lg">
                {selectedClass && (
                    <div className="relative overflow-hidden -m-6 flex flex-col h-[85vh]">
                        {/* Hero Header Section */}
                        <div className="relative h-64 md:h-72 w-full flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900" />
                            <div className="absolute inset-0 opacity-10" 
                                 style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }} />
                                
                            <div className="absolute right-8 bottom-8 text-8xl md:text-9xl opacity-20 pointer-events-none select-none grayscale invert drop-shadow-2xl translate-y-4">
                                {sports.find(s => s.id === selectedClass.sport)?.icon}
                            </div>

                            <button 
                                onClick={() => setIsClassDetailOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all z-20"
                            >
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </button>

                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-slate-940 via-slate-900/40 to-transparent">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                            <Users className="w-3 h-3" />
                                            Canlı Grup Dersi
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            {selectedClass.durationMinutes} Dakika
                                        </div>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none max-w-2xl drop-shadow-lg">
                                        {selectedClass.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-lg border border-slate-100">
                                            {detailStore?.logoEmoji || '🏪'}
                                        </div>
                                        <span className="text-white font-bold text-sm tracking-tight opacity-90">{detailStore?.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10 bg-white">
                            {/* Schedule Info Card */}
                            <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex flex-col items-center justify-center flex-shrink-0 border border-indigo-100 animate-in zoom-in duration-500">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{new Date(selectedClass.scheduledAt).toLocaleDateString('tr-TR', { month: 'short' })}</p>
                                    <p className="text-3xl font-black text-indigo-900 leading-none">{new Date(selectedClass.scheduledAt).getDate()}</p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-2xl font-black text-slate-900 border-b border-indigo-200/50 pb-2 mb-2">
                                        {new Date(selectedClass.scheduledAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            {new Date(selectedClass.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} Başlangıç
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                                <Users className="w-3.5 h-3.5" />
                                            </div>
                                            {selectedClass.enrolledParticipants.length} / {selectedClass.maxParticipants} Katılımcı
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    Ders Hakkında Detaylar
                                </h4>
                                <p className="text-slate-500 font-bold leading-relaxed text-sm p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                    {selectedClass.description}
                                </p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                                <div>
                                    <p className="text-xs text-slate-400 font-black mb-1 uppercase tracking-widest">Rezervasyon Ücreti</p>
                                    <p className="text-3xl font-black text-white">{selectedClass.price === 0 ? 'Tamamen Ücretsiz' : `₺${selectedClass.price}`}</p>
                                </div>
                                <Button
                                    onClick={() => handleClassPurchase(selectedClass)}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all group"
                                >
                                    <span className="flex items-center gap-3">
                                        {selectedClass.price === 0 ? 'Yerini Ayırt' : 'Dersi Satın Al'} <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

// Re-using Link as an import since it was replaced in some blocks

