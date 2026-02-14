'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search, Star, Users, ShoppingBag, Store, Filter, Check, ChevronRight, ChevronLeft, Clock, MessageCircle, Award, Target, Sparkles, TrendingUp, Zap, CalendarDays
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GymStore, SalesPackage, SportCategory, Review, GroupClass } from '@/lib/mock-service'; // Keep types
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function MarketplacePage() {
    const [stores, setStores] = useState<GymStore[]>([]);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedSport, setSelectedSport] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'packages' | 'classes'>('packages');
    const [userInterests, setUserInterests] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
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
            setUser(currentUser);
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

        try {
            await dataService.purchasePackage(user.id, pkg.id);
            setIsDetailOpen(false);
            toast.success('Paket satın alındı! 🎉 Derslerim sayfasından erişebilirsin.');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Satın alma işlemi başarısız oldu.');
        }
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


            {/* --- DETAIL MODAL REAMPED --- */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="" size="lg">
                <div className="absolute top-0 left-0 w-full h-32 bg-slate-50 -z-10" />
                {selectedPackage && (
                    <div className="space-y-8 py-2">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-10">
                            <div className="w-24 h-24 rounded-[1.5rem] bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-4xl">
                                {detailStore?.logoEmoji || '🏪'}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{selectedPackage.name}</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-600">
                                        <Store className="w-4 h-4 text-green-500" />
                                        {detailStore?.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-100">
                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                        {detailStore?.rating || '5.0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiyat</p>
                                <p className="text-2xl font-black text-green-600">₺{selectedPackage.price}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Süre</p>
                                <p className="text-2xl font-black text-slate-900">{selectedPackage.accessDuration}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Program</p>
                                <p className="text-2xl font-black text-slate-900">{selectedPackage.totalWeeks} Hafta</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                Neler Alacaksın?
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedPackage.features?.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50 group hover:bg-green-50 transition-colors">
                                        <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <p className="text-xs text-slate-400 font-black mb-1 uppercase tracking-widest">Hemen Başla</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">Değişime hazır mısın?</p>
                            </div>
                            <Button
                                onClick={() => handlePurchase(selectedPackage)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                            >
                                Satın Al
                            </Button>
                        </div>

                        {/* Store Reviews in Modal */}
                        {detailReviews.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Eğitmen Değerlendirmeleri</h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                                    {detailReviews.map(r => (
                                        <div key={r.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm text-slate-900">{r.studentName}</span>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{r.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* --- GROUP CLASS DETAIL MODAL --- */}
            <Modal isOpen={isClassDetailOpen} onClose={() => setIsClassDetailOpen(false)} title="" size="lg">
                <div className="absolute top-0 left-0 w-full h-32 bg-slate-50 -z-10" />
                {selectedClass && (
                    <div className="space-y-8 py-2">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-10">
                            <div className="w-24 h-24 rounded-[1.5rem] bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-4xl">
                                {detailStore?.logoEmoji || '🏪'}
                            </div>
                            <div className="flex-1">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-3`}>
                                    {sports.find(s => s.id === selectedClass.sport)?.name} Grup Dersi
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{selectedClass.title}</h3>
                                <div className="flex items-center gap-1.5 font-bold text-slate-600">
                                    <Store className="w-4 h-4 text-green-500" />
                                    {detailStore?.name}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Tarih</p>
                                <p className="text-lg font-black text-blue-900">{new Date(selectedClass.scheduledAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Saat</p>
                                <p className="text-lg font-black text-orange-900">{new Date(selectedClass.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Kapasite</p>
                                <p className="text-lg font-black text-green-900">{selectedClass.enrolledParticipants.length} / {selectedClass.maxParticipants}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Ders Hakkında
                            </h4>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {selectedClass.description}
                            </p>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                            <div>
                                <p className="text-xs text-slate-400 font-black mb-1 uppercase tracking-widest">Katılım Ücreti</p>
                                <p className="text-2xl font-black text-white">{selectedClass.price === 0 ? 'Ücretsiz' : `₺${selectedClass.price}`}</p>
                            </div>
                            <Button
                                onClick={() => handleClassPurchase(selectedClass)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                            >
                                {selectedClass.price === 0 ? 'Hemen Katıl' : 'Dersi Satın Al'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

// Re-using Link as an import since it was replaced in some blocks

