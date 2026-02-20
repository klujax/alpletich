'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
    Store, Edit, Star, Users, DollarSign, Package, Eye, ExternalLink, Settings
} from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GymStore, SalesPackage, Review, SportCategory } from '@/lib/types';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function CoachShopPage() {
    const [store, setStore] = useState<GymStore | null>(null);
    const [packages, setPackages] = useState<SalesPackage[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newShopName, setNewShopName] = useState('');
    const [newShopCategory, setNewShopCategory] = useState('');
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [editData, setEditData] = useState({ name: '', description: '', category: '', logoEmoji: '', themeColor: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (!user) return;
        const [shopData, pkgs, revs, sportsData] = await Promise.all([
            dataService.getCoachStore(user.id),
            dataService.getPackages(user.id),
            dataService.getReviews(undefined, user.id),
            dataService.getSports(),
        ]);
        setStore(shopData || null);
        setPackages(pkgs);
        setReviews(revs);
        setSports(sportsData);
        setIsLoading(false);
    };

    const handleCreateStore = async () => {
        const user = await authService.getUser();
        if (!user || !newShopName) return;

        try {
            // Generate a safe slug from store name
            const baseSlug = newShopName
                .toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            const slug = baseSlug + '-' + Date.now().toString(36);

            await dataService.createStore({
                coachId: user.id,
                name: newShopName,
                category: newShopCategory || 'Genel',
                slug: slug,
                description: 'Yeni dükkan'
            } as any);

            setIsCreateModalOpen(false);
            setNewShopName('');
            setNewShopCategory('');
            toast.success('Dükkanın başarıyla açıldı! 🎉');
            loadData();
        } catch (error: any) {
            console.error('Store creation error:', error);
            toast.error(error?.message || 'Dükkan oluşturulamadı');
        }
    };

    const handleUpdateStore = async () => {
        if (!store) return;
        try {
            await dataService.updateStore({ ...store, ...editData });
            setIsEditModalOpen(false);
            toast.success('Dükkan bilgileri güncellendi');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Güncelleme başarısız');
        }
    };

    const openEditModal = () => {
        if (!store) return;
        setEditData({ name: store.name, description: store.description, category: store.category, logoEmoji: store.logoEmoji, themeColor: store.themeColor });
        setIsEditModalOpen(true);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-primary/20">
                    <Store className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Henüz Dükkanın Yok</h1>
                <p className="text-slate-500 font-medium max-w-md mb-8">
                    Dükkanını aç, paketlerini ve programlarını satışa sun. Öğrenciler seni bulsun!
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 h-14 shadow-xl shadow-primary/20">
                    <Store className="w-5 h-5 mr-2" /> Dükkanımı Aç
                </Button>

                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Dükkanını Aç" size="sm">
                    <div className="space-y-4 py-4">
                        <Input label="Dükkan Adı" placeholder="Örn: Ahmet Koç Performance" value={newShopName} onChange={e => setNewShopName(e.target.value)} />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                            <select
                                value={newShopCategory}
                                onChange={e => setNewShopCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="">Kategori seçin...</option>
                                {sports.map(sport => (
                                    <option key={sport.id} value={sport.name}>{sport.icon} {sport.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleCreateStore} fullWidth className="bg-primary hover:bg-primary/90 text-white font-bold h-12">
                            Dükkanı Oluştur 🚀
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Store Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white border-2 border-slate-100 p-8 md:p-10 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-4xl shadow-sm grayscale">
                            {store.logoEmoji || '🏋️'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{store.name}</h1>
                            <p className="text-slate-500 font-medium mt-1">{store.category} • {store.description?.slice(0, 60)}...</p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {store.rating}</span>
                                <span className="text-sm font-bold text-slate-400">({store.reviewCount} değerlendirme)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={openEditModal} className="border-slate-200 font-bold">
                            <Edit className="w-4 h-4 mr-2" /> Düzenle
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Gelir', value: `₺${(store.totalRevenue || 0).toLocaleString('tr-TR')}`, icon: DollarSign, color: 'text-primary bg-primary/10' },
                    { label: 'Toplam Öğrenci', value: store.totalStudents || 0, icon: Users, color: 'text-primary bg-primary/10' },
                    { label: 'Aktif Paket', value: packages.length, icon: Package, color: 'text-primary bg-primary/10' },
                    { label: 'Değerlendirme', value: reviews.length, icon: Star, color: 'text-primary bg-primary/10' },
                ].map((stat) => (
                    <Card key={stat.label} className="border-slate-200">
                        <CardContent className="p-5">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reviews */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Son Değerlendirmeler</CardTitle>
                </CardHeader>
                <CardContent>
                    {reviews.length === 0 ? (
                        <p className="text-center text-slate-400 py-6">Henüz değerlendirme yok.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xs">
                                                {review.studentName?.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900 text-sm">{review.studentName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Dükkanı Düzenle" size="lg">
                <div className="space-y-4 py-4">
                    <Input label="Dükkan Adı" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                        <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                            <select
                                value={editData.category}
                                onChange={e => setEditData({ ...editData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="">Kategori seçin...</option>
                                {sports.map(sport => (
                                    <option key={sport.id} value={sport.name}>{sport.icon} {sport.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input label="Logo Emoji" value={editData.logoEmoji} onChange={e => setEditData({ ...editData, logoEmoji: e.target.value })} placeholder="🏋️" />
                    </div>
                    <Button onClick={handleUpdateStore} fullWidth className="bg-primary hover:bg-primary/90 text-white font-bold h-12">Kaydet</Button>
                </div>
            </Modal>
        </div>
    );
}
