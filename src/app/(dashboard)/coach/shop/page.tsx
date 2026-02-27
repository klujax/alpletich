'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
    Store, Edit, Star, Users, DollarSign, Package, Camera, Upload, X,
    Image as ImageIcon, TrendingUp, CalendarDays, Dumbbell, BarChart3,
    ShoppingBag, ChevronRight, Plus, MessageCircle
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GymStore, SalesPackage, Review, SportCategory, GroupClass, Purchase } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CoachShopPage() {
    const [store, setStore] = useState<GymStore | null>(null);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newShopName, setNewShopName] = useState('');
    const [newShopCategory, setNewShopCategory] = useState('');
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [editData, setEditData] = useState({ name: '', description: '', category: '', logoEmoji: '', themeColor: '' });
    const [bannerUrl, setBannerUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (!user) return;
        const [shopData, pkgs, revs, sportsData, cls, myPurchases] = await Promise.all([
            dataService.getCoachStore(user.id),
            dataService.getPackages(user.id),
            dataService.getReviews(undefined, user.id),
            dataService.getSports(),
            dataService.getGroupClasses(user.id),
            dataService.getCoachPurchases(user.id),
        ]);
        setStore(shopData || null);
        setPackages(pkgs);
        setReviews(revs);
        setSports(sportsData);
        setClasses(cls);
        setPurchases(myPurchases);
        setIsLoading(false);
    };

    const handleCreateStore = async () => {
        const user = await authService.getUser();
        if (!user || !newShopName) return;
        try {
            const baseSlug = newShopName.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await dataService.createStore({
                coachId: user.id, name: newShopName,
                category: newShopCategory || 'Genel',
                slug: baseSlug + '-' + Date.now().toString(36),
                description: 'Yeni dükkan'
            } as any);
            setIsCreateModalOpen(false);
            setNewShopName('');
            setNewShopCategory('');
            toast.success('Dükkanın başarıyla açıldı! 🎉');
            loadData();
        } catch (error: any) {
            toast.error(error?.message || 'Dükkan oluşturulamadı');
        }
    };

    const handleUpdateStore = async () => {
        if (!store) return;
        try {
            await dataService.updateStore({ ...store, ...editData });
            setIsEditModalOpen(false);
            toast.success('Dükkan bilgileri güncellendi ✅');
            loadData();
        } catch { toast.error('Güncelleme başarısız'); }
    };

    const openEditModal = () => {
        if (!store) return;
        setEditData({ name: store.name, description: store.description, category: store.category, logoEmoji: store.logoEmoji, themeColor: store.themeColor });
        setIsEditModalOpen(true);
    };

    const handleBannerUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Lütfen bir resim dosyası seçin'); return; }
        setIsUploadingBanner(true);
        try {
            const url = await dataService.uploadFile('shop-images', `shop-banners/${Date.now()}_${file.name}`, file);
            setBannerUrl(url);
            toast.success('Banner yüklendi! 🖼️');
        } catch { toast.error('Banner yüklenemedi'); }
        finally { setIsUploadingBanner(false); }
    };

    const handleGalleryUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Lütfen bir resim dosyası seçin'); return; }
        setIsUploadingGallery(true);
        try {
            const url = await dataService.uploadFile('shop-images', `shop-gallery/${Date.now()}_${file.name}`, file);
            setGalleryUrls(prev => [...prev, url]);
            toast.success('Fotoğraf eklendi! 📸');
        } catch { toast.error('Fotoğraf yüklenemedi'); }
        finally { setIsUploadingGallery(false); }
    };

    // Revenue calculations
    const totalRevenue = purchases.reduce((s, p) => s + (p.price || 0), 0);
    const now = new Date();
    const monthlyRevenue = purchases
        .filter(p => { const d = new Date(p.purchasedAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
        .reduce((s, p) => s + (p.price || 0), 0);
    const activeStudentCount = new Set(purchases.filter(p => p.status === 'active').map(p => p.studentId)).size;
    const upcomingClasses = classes.filter(c => c.status === 'scheduled');

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    /* ===================== NO STORE VIEW ===================== */
    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-5 md:mb-6 border-2 border-green-100">
                    <Store className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Henüz Dükkanın Yok</h1>
                <p className="text-sm md:text-base text-slate-500 font-medium max-w-md mb-6 md:mb-8">
                    Dükkanını aç, paketlerini ve programlarını satışa sun. Öğrenciler seni bulsun!
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-black rounded-xl md:rounded-2xl px-6 md:px-8 h-12 md:h-14 shadow-xl shadow-green-600/20 text-sm md:text-base">
                    <Store className="w-5 h-5 mr-2" /> Dükkanımı Aç
                </Button>
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Dükkanını Aç" size="sm">
                    <div className="space-y-4 py-4">
                        <Input label="Dükkan Adı" placeholder="Örn: Ahmet Koç Performance" value={newShopName} onChange={e => setNewShopName(e.target.value)} />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                            <select value={newShopCategory} onChange={e => setNewShopCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-medium">
                                <option value="">Kategori seçin...</option>
                                {sports.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleCreateStore} fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold h-12">Dükkanı Oluştur 🚀</Button>
                    </div>
                </Modal>
            </div>
        );
    }

    /* ===================== MAIN STORE VIEW ===================== */
    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-24 lg:pb-10">

            {/* ======== BANNER + STORE INFO ======== */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-lg group">
                {/* Banner */}
                <div className="relative h-36 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 overflow-hidden">
                    {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <div className="absolute w-40 h-40 rounded-full bg-white/10 blur-3xl top-2 right-8" />
                            <div className="absolute w-56 h-56 rounded-full bg-white/5 blur-3xl -bottom-16 -left-16" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <Store className="w-24 h-24 text-white" />
                            </div>
                        </>
                    )}
                    <button onClick={() => bannerInputRef.current?.click()}
                        className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition-all opacity-70 md:opacity-0 md:group-hover:opacity-100">
                        <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">{bannerUrl ? 'Değiştir' : 'Banner Ekle'}</span>
                    </button>
                    <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); e.target.value = ''; }} />
                </div>

                {/* Store Info Card */}
                <div className="relative bg-white p-4 sm:p-5 md:p-6 lg:p-8 -mt-8 sm:-mt-10 md:-mt-12 mx-3 sm:mx-4 md:mx-6 lg:mx-8 rounded-xl md:rounded-2xl border border-slate-100 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 border-2 border-green-200 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-sm shrink-0">
                                {store.logoEmoji || '🏋️'}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">{store.name}</h1>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">{store.category} • {store.description?.slice(0, 50)}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 md:mt-2">
                                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-600">
                                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" /> {store.rating || '0'}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">({store.reviewCount || reviews.length} yorum)</span>
                                    <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{activeStudentCount} aktif öğrenci</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={openEditModal} className="border-slate-200 font-bold rounded-xl text-xs sm:text-sm shrink-0 self-end sm:self-auto">
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> Düzenle
                        </Button>
                    </div>
                </div>
            </div>

            {/* ======== REVENUE STATS ======== */}
            <section>
                <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 flex items-center gap-2 px-1">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> Gelir & İstatistikler
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { label: 'Toplam Gelir', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, icon: DollarSign, iconColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                        { label: 'Bu Ay Gelir', value: `₺${monthlyRevenue.toLocaleString('tr-TR')}`, icon: TrendingUp, iconColor: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'Toplam Satış', value: purchases.length, icon: ShoppingBag, iconColor: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Aktif Öğrenci', value: activeStudentCount, icon: Users, iconColor: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                    ].map(s => (
                        <Card key={s.label} className={`border ${s.border} overflow-hidden`}>
                            <CardContent className="p-3 sm:p-4 md:p-5">
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl ${s.bg} flex items-center justify-center mb-2 md:mb-3`}>
                                    <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.iconColor}`} />
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">{s.value}</div>
                                <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5 md:mt-1">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ======== RECENT SALES ======== */}
            {purchases.length > 0 && (
                <section>
                    <Card className="border-slate-200 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm sm:text-base font-black flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> Son Satışlar
                            </CardTitle>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-400">{purchases.length} toplam</span>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="space-y-2 sm:space-y-3">
                                {purchases.slice(0, 5).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 ${p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {p.status === 'active' ? '✓' : '—'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{p.packageName}</p>
                                                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                                    {new Date(p.purchasedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="font-black text-green-600 text-sm sm:text-base">₺{p.price}</p>
                                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${p.status === 'active' ? 'text-green-500' : 'text-slate-400'}`}>
                                                {p.status === 'active' ? 'Aktif' : 'Bitti'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* ======== GALLERY ======== */}
            <section>
                <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" /> Galeri
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()}
                        disabled={isUploadingGallery}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 font-bold rounded-lg md:rounded-xl text-xs">
                        {isUploadingGallery
                            ? <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-1.5" />
                            : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                        <span className="hidden sm:inline">Fotoğraf</span> Ekle
                    </Button>
                    <input ref={galleryInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(f); e.target.value = ''; }} />
                </div>

                {galleryUrls.length === 0 ? (
                    <div onClick={() => galleryInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl p-8 sm:p-10 md:p-12 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group">
                        <Camera className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-2 md:mb-3 group-hover:text-purple-400 transition-colors" />
                        <p className="text-slate-400 font-bold text-sm md:text-base group-hover:text-purple-500">Dükkanınızın fotoğraflarını ekleyin</p>
                        <p className="text-[10px] md:text-xs text-slate-300 font-medium mt-1">Salon, ekipman, antrenman ortamı</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {galleryUrls.map((url, i) => (
                            <div key={i} className="relative group rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 aspect-square">
                                <img src={url} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                                <button onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        ))}
                        <div onClick={() => galleryInputRef.current?.click()}
                            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all group">
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 group-hover:text-purple-400" />
                            <span className="text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-purple-400 mt-1">Ekle</span>
                        </div>
                    </div>
                )}
            </section>

            {/* ======== PACKAGES ======== */}
            <section>
                <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> Paketlerim
                    </h2>
                    <Link href="/coach/packages">
                        <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50 font-bold rounded-lg md:rounded-xl text-xs">
                            Tümü <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                    </Link>
                </div>

                {packages.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-6 sm:p-8 text-center">
                            <Package className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-2 md:mb-3" />
                            <p className="text-slate-500 font-bold text-sm md:text-base">Henüz paket eklemedin</p>
                            <Link href="/coach/packages">
                                <Button size="sm" className="mt-3 md:mt-4 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Paket Oluştur
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {packages.slice(0, 6).map(pkg => (
                            <Card key={pkg.id} className="border-slate-200 hover:shadow-lg transition-all overflow-hidden">
                                <div className={`h-1.5 sm:h-2 ${pkg.packageType === 'coaching' ? 'bg-green-500' : 'bg-purple-500'}`} />
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                        <div className="min-w-0 mr-2">
                                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${pkg.packageType === 'coaching' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {pkg.packageType === 'coaching' ? 'Koçluk' : 'Program'}
                                            </span>
                                            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1.5 sm:mt-2 truncate">{pkg.name}</h3>
                                        </div>
                                        <div className="text-base sm:text-xl font-black text-green-600 shrink-0">₺{pkg.price}</div>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-2 mb-2 sm:mb-3">{pkg.description}</p>
                                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400 font-bold">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {pkg.enrolledStudents || 0}/{pkg.maxStudents}</span>
                                        {pkg.workoutPlan && pkg.workoutPlan.length > 0 && (
                                            <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {pkg.workoutPlan.length} gün</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* ======== UPCOMING CLASSES ======== */}
            <section>
                <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Yaklaşan Dersler
                    </h2>
                    <Link href="/coach/classes">
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-lg md:rounded-xl text-xs">
                            Tümü <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                    </Link>
                </div>

                {upcomingClasses.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-6 sm:p-8 text-center">
                            <CalendarDays className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-2 md:mb-3" />
                            <p className="text-slate-500 font-bold text-sm md:text-base">Planlanmış ders yok</p>
                            <Link href="/coach/classes">
                                <Button size="sm" className="mt-3 md:mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Ders Oluştur
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {upcomingClasses.slice(0, 4).map(cls => (
                            <Card key={cls.id} className="border-slate-200 hover:shadow-md transition-all">
                                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{cls.title}</p>
                                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                                                {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                {' • '}{cls.durationMinutes}dk
                                                {' • '}{(cls.enrolledParticipants?.length || 0)}/{cls.maxParticipants}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        {cls.price > 0 && <p className="font-black text-green-600 text-xs sm:text-sm">₺{cls.price}</p>}
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-500">Planlanmış</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* ======== REVIEWS ======== */}
            <section>
                <Card className="border-slate-200 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm sm:text-base font-black flex items-center gap-2">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Değerlendirmeler
                        </CardTitle>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{reviews.length} yorum</span>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        {reviews.length === 0 ? (
                            <div className="text-center py-6 sm:py-8">
                                <Star className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-2 md:mb-3" />
                                <p className="text-slate-400 font-bold text-sm md:text-base">Henüz değerlendirme yok</p>
                                <p className="text-[10px] md:text-xs text-slate-300 mt-1">Öğrencilerin seni değerlendirmeye başladığında burada gözükecek</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                {reviews.slice(0, 5).map(r => (
                                    <div key={r.id} className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-[10px] sm:text-xs">
                                                    {r.studentName?.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900 text-xs sm:text-sm">{r.studentName}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 font-medium">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* ======== EDIT MODAL ======== */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Dükkanı Düzenle" size="lg">
                <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-1 sm:pr-2">
                    <Input label="Dükkan Adı" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                        <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })}
                            rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-medium resize-none text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                            <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-medium">
                                <option value="">Kategori seçin...</option>
                                {sports.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
                            </select>
                        </div>
                        <Input label="Logo Emoji" value={editData.logoEmoji} onChange={e => setEditData({ ...editData, logoEmoji: e.target.value })} placeholder="🏋️" />
                    </div>
                    <Button onClick={handleUpdateStore} fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold h-12">
                        Değişiklikleri Kaydet ✅
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
