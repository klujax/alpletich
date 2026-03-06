'use client';

import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { Purchase, GymStore, Review, Profile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Trophy, Star, MessageCircle, Calendar, PlayCircle, Award, Store, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function StudentCoachesPage() {
    const [coaches, setCoaches] = useState<{ coach: Profile; store: GymStore | null; purchases: Purchase[]; reviews: Review[] }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const [isComplaintMode, setIsComplaintMode] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (user) {
            const purchases = await dataService.getPurchases(user.id);
            const stores = await dataService.getStores();
            const reviews = await dataService.getReviews();

            const coachMap = new Map<string, any>();
            for (const p of purchases) {
                if (!coachMap.has(p.coachId)) {
                    coachMap.set(p.coachId, { purchases: [], reviews: [] });
                }
                coachMap.get(p.coachId).purchases.push(p);
            }

            const coachDetails = await Promise.all(
                Array.from(coachMap.keys()).map(async (coachId) => {
                    const coachProfile = await dataService.getProfile(coachId).catch(() => null);
                    if (!coachProfile) return null;

                    const store = stores.find(s => s.coachId === coachId) || null;
                    const coachReviews = reviews.filter(r => r.coachId === coachId && (r.userId === user.id || r.studentId === user.id));

                    return {
                        coach: coachProfile as Profile,
                        store,
                        purchases: coachMap.get(coachId).purchases as Purchase[],
                        reviews: coachReviews as Review[]
                    };
                })
            );

            setCoaches(coachDetails.filter(Boolean) as any);
        }
        setIsLoading(false);
    };

    const handleSubmitReview = async () => {
        const user = await authService.getUser();
        if (!user || !selectedCoachId) return;
        if (!reviewComment.trim()) { toast.error(isComplaintMode ? 'Şikayet metni boş olamaz' : 'Yorum yazmalısınız'); return; }

        let shopId = selectedShopId;
        if (!shopId) {
            const coachData = coaches.find(c => c.coach.id === selectedCoachId);
            shopId = coachData?.purchases[0]?.shopId || '';
        }

        if (!shopId) {
            toast.error('Koçun mağazası bulunamadı, işlem yapılamıyor.');
            return;
        }

        const finalRating = isComplaintMode ? 1 : reviewRating;
        const finalComment = isComplaintMode ? `🚨 ŞİKAYET: ${reviewComment}` : reviewComment;

        try {
            await dataService.createReview({
                userId: user.id, // Supabase expects user_id
                coachId: selectedCoachId,
                shopId: shopId,
                rating: finalRating,
                comment: finalComment,
            });

            setIsReviewModalOpen(false);
            setReviewComment('');
            setReviewRating(5);
            toast.success(isComplaintMode ? 'Şikayetiniz sisteme ve koçun mağazasına kaydedildi.' : 'Değerlendirmeniz gönderildi! ⭐');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('İşlem tamamlanamadı.');
        }
    };

    const openReviewModal = (coachId: string, shopId: string | null, isComplaint: boolean = false) => {
        setSelectedCoachId(coachId);
        setSelectedShopId(shopId);
        setIsComplaintMode(isComplaint);
        setReviewRating(isComplaint ? 1 : 5);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Koçlarım</h1>
                <p className="text-slate-500 font-medium">Ders aldığın koçları değerlendir, şikayet et ve iletişimde kal</p>
            </div>

            {coaches.length === 0 ? (
                <div className="text-center py-16">
                    <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Henüz koçun yok</h2>
                    <p className="text-slate-500 mb-6">Pazaryerinden bir paket satın aldığında koçun burada görünür</p>
                    <Link href="/marketplace">
                        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">Pazaryerine Git</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coaches.map(({ coach, store, purchases, reviews }) => {
                        const hasChatSupport = purchases.some(p => p.status === 'active' && (p.packageSnapshot?.has_chat_support === true || p.packageSnapshot?.hasChatSupport === true));

                        return (
                            <Card key={coach.id} className="border-slate-200 hover:shadow-xl transition-all overflow-hidden flex flex-col">
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 border-2 border-green-200 flex items-center justify-center text-2xl font-black text-green-700">
                                            {coach.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{coach.full_name}</h3>
                                            {store && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Store className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-500 font-medium">{store.name}</span>
                                                    {store.rating > 0 && (
                                                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 ml-2">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {store.rating}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Satın alınan paketler */}
                                    <div className="space-y-2 mb-5">
                                        {purchases.map(p => (
                                            <div key={p.id} className={`text-xs font-bold px-3 py-2 rounded-lg border ${p.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                📦 {p.packageName} • {p.status === 'active' ? 'Aktif' : 'Süresi doldu'} • ₺{p.price}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mevcut değerlendirmeler */}
                                    {reviews.length > 0 && (
                                        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                                            <div className="flex items-center gap-1 mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < reviews[0].rating ? (reviews[0].comment.includes('ŞİKAYET') ? 'text-red-500 fill-red-500' : 'text-amber-400 fill-amber-400') : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${reviews[0].comment.includes('ŞİKAYET') ? 'text-red-600' : 'text-slate-600'}`}>{reviews[0].comment}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-auto">
                                        {hasChatSupport ? (
                                            <Link href={`/chat?partner=${coach.id}`} className="flex-1">
                                                <Button variant="outline" fullWidth className="border-slate-200 hover:bg-slate-50 font-bold text-sm">
                                                    <MessageCircle className="w-4 h-4 mr-1" /> Mesaj
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="flex-1" title="Satın aldığınız paket mesajlaşma özelliği içermiyor">
                                                <Button disabled variant="outline" fullWidth className="border-slate-200 font-bold text-sm opacity-50 cursor-not-allowed">
                                                    <MessageCircle className="w-4 h-4 mr-1 text-slate-400" /> Mesaj
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            className="border-amber-200 text-amber-600 hover:bg-amber-50 font-bold text-sm flex-1"
                                            onClick={() => openReviewModal(coach.id, store?.id || null, false)}
                                        >
                                            <Star className="w-4 h-4 mr-1" /> Değerlendir
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm flex-1"
                                            onClick={() => openReviewModal(coach.id, store?.id || null, true)}
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-1" /> Şikayet Et
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Review & Complaint Modal */}
            <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={isComplaintMode ? "Koçu Şikayet Et" : "Koçunu Değerlendir"} size="sm">
                <div className="space-y-5 py-4">
                    {!isComplaintMode && (
                        <div className="text-center">
                            <p className="text-sm text-slate-500 font-medium mb-3">Puanınız</p>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-125">
                                        <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isComplaintMode && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>Şikayetiniz mağaza puanını olumsuz etkileyecek ve herkese açık olarak paylaşılacaktır.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {isComplaintMode ? "Şikayet Nedeni" : "Yorumunuz"}
                        </label>
                        <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            rows={4}
                            placeholder={isComplaintMode ? "Lütfen yaşadığınız sorunu detaylıca açıklayın..." : "Koçunuz hakkında deneyimlerinizi paylaşın..."}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border-2 transition-all font-medium resize-none",
                                isComplaintMode
                                    ? "border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            )}
                        />
                    </div>

                    <Button
                        onClick={handleSubmitReview}
                        fullWidth
                        className={cn(
                            "text-white font-bold h-12",
                            isComplaintMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isComplaintMode ? "Şikayeti Bildir 🚨" : "Değerlendirmeyi Gönder ⭐"}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
