'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, Shield, Lock, ArrowLeft, Check, Store, Star, Clock, Award, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { SalesPackage, GymStore } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const packageId = params.packageId as string;

    const [pkg, setPkg] = useState<SalesPackage | null>(null);
    const [store, setStore] = useState<GymStore | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPackage();
    }, [packageId]);

    const loadPackage = async () => {
        try {
            const user = await authService.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const packages = await dataService.getPackages();
            const foundPkg = packages.find(p => p.id === packageId);
            if (!foundPkg) {
                setError('Paket bulunamadı');
                setIsLoading(false);
                return;
            }
            setPkg(foundPkg);

            const stores = await dataService.getStores();
            const foundStore = stores.find(s => s.id === foundPkg.shopId);
            setStore(foundStore || null);

            setIsLoading(false);
        } catch (err) {
            console.error('Load error:', err);
            setError('Bir hata oluştu');
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!pkg) return;

        setIsProcessing(true);
        setError(null);

        try {
            const user = await authService.getUser();
            if (!user) {
                toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
                router.push('/login');
                return;
            }

            const response = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: pkg.id,
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.full_name || '',
                    userPhone: user.phone || '',
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Ödeme formu oluşturulamadı');
                toast.error(data.error || 'Ödeme başlatılamadı');
                setIsProcessing(false);
                return;
            }

            // iyzico checkout form HTML'ini göster
            if (data.checkoutFormContent) {
                setCheckoutFormHtml(data.checkoutFormContent);
            } else if (data.paymentPageUrl) {
                // Alternatif: iyzico ödeme sayfasına yönlendir
                window.location.href = data.paymentPageUrl;
            }

        } catch (err: any) {
            console.error('Payment error:', err);
            setError('Ödeme başlatılırken hata oluştu');
            toast.error('Ödeme başlatılamadı');
        } finally {
            setIsProcessing(false);
        }
    };

    // iyzico form HTML'ini render ettikten sonra script'leri çalıştır
    useEffect(() => {
        if (checkoutFormHtml) {
            // iyzico checkout form scriptlerini yükle
            const container = document.getElementById('iyzico-checkout-form');
            if (container) {
                container.innerHTML = checkoutFormHtml;
                // Script taglarını yeniden ekle (innerHTML script çalıştırmaz)
                const scripts = container.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    script.parentNode?.replaceChild(newScript, script);
                });
            }
        }
    }, [checkoutFormHtml]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Paket bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error && !pkg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{error}</h2>
                <p className="text-slate-500 font-medium mb-6">Lütfen tekrar deneyin veya farklı bir paket seçin.</p>
                <Link href="/marketplace">
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Paketlere Dön
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 lg:pb-10 px-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ödeme</h1>
                    <p className="text-sm text-slate-500 font-bold">Güvenli ödeme ile paketini satın al</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sol: Paket Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Paket Kartı */}
                    <Card className="border-2 border-green-100 bg-gradient-to-br from-white to-green-50/30 shadow-lg overflow-hidden">
                        <CardContent className="p-6">
                            {/* Mağaza */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl">
                                    {store?.logoEmoji || '🏪'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{store?.name || 'Mağaza'}</p>
                                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        {store?.rating || '5.0'}
                                    </div>
                                </div>
                            </div>

                            {/* Paket Detayı */}
                            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{pkg?.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-3">{pkg?.description}</p>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Süre</p>
                                    <p className="text-sm font-black text-slate-900">{pkg?.accessDuration}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Program</p>
                                    <p className="text-sm font-black text-slate-900">{pkg?.totalWeeks} Hafta</p>
                                </div>
                            </div>

                            {/* Özellikler */}
                            {pkg?.features && pkg.features.length > 0 && (
                                <div className="space-y-2 mb-5">
                                    {pkg.features.slice(0, 4).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fiyat */}
                            <div className="pt-4 border-t border-green-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-500">Toplam</span>
                                    <span className="text-3xl font-black text-green-600">₺{pkg?.price}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Güvenlik Bilgisi */}
                    <div className="space-y-3">
                        {[
                            { icon: Shield, text: '256-bit SSL şifreleme ile güvende', color: 'text-green-600 bg-green-50' },
                            { icon: Lock, text: 'Kart bilgileri iyzico tarafından korunur', color: 'text-blue-600 bg-blue-50' },
                            { icon: CreditCard, text: 'Taksit seçenekleri mevcuttur', color: 'text-purple-600 bg-purple-50' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ: Ödeme Formu */}
                <div className="lg:col-span-3">
                    {checkoutFormHtml ? (
                        // iyzico Checkout Form
                        <Card className="border-2 border-slate-100 shadow-lg overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Kart Bilgileri</p>
                                        <p className="text-[10px] font-bold text-slate-400">iyzico güvenli ödeme</p>
                                    </div>
                                </div>
                                <div id="iyzico-checkout-form" className="p-4 min-h-[400px]" />
                            </CardContent>
                        </Card>
                    ) : (
                        // Ödeme Başlat Ekranı
                        <Card className="border-2 border-slate-100 shadow-lg overflow-hidden">
                            <CardContent className="p-8 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                    <CreditCard className="w-10 h-10 text-green-600" />
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                    Ödemeye Hazır mısın?
                                </h2>
                                <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                                    <strong className="text-green-600">₺{pkg?.price}</strong> tutarında güvenli ödeme yaparak
                                    <strong className="text-slate-700"> {pkg?.name}</strong> paketine hemen erişim sağla.
                                </p>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-extrabold text-red-600 animate-in shake duration-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                            Ödeme Hazırlanıyor...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                            Güvenli Ödemeye Geç — ₺{pkg?.price}
                                        </>
                                    )}
                                </Button>

                                <div className="mt-8">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">
                                        Desteklenen Ödeme Yöntemleri
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {/* Visa */}
                                        <div className="h-8 px-3 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:border-blue-200 transition-colors group/logo">
                                            <span className="text-[14px] font-black italic text-[#1a1f71] group-hover:scale-110 transition-transform">VISA</span>
                                        </div>
                                        {/* Mastercard */}
                                        <div className="h-8 px-3 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:border-orange-200 transition-colors group/logo">
                                            <div className="flex items-center gap-1.5 group-hover:scale-110 transition-transform">
                                                <div className="flex -space-x-2">
                                                    <div className="w-4 h-4 rounded-full bg-[#eb001b] opacity-90" />
                                                    <div className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-90" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-700">mastercard</span>
                                            </div>
                                        </div>
                                        {/* Troy */}
                                        <div className="h-8 px-3 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:border-red-200 transition-colors group/logo">
                                            <div className="flex items-center gap-1 group-hover:scale-110 transition-transform">
                                                <span className="text-[13px] font-black text-slate-900 tracking-tighter">TR</span>
                                                <span className="text-[13px] font-black text-red-600 tracking-tighter">OY</span>
                                            </div>
                                        </div>
                                        {/* Amex */}
                                        <div className="h-8 px-3 rounded-lg bg-[#016fd0] flex items-center justify-center shadow-sm hover:brightness-110 transition-all group/logo">
                                            <span className="text-[10px] font-black text-white group-hover:scale-110 transition-transform">AMEX</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-6 opacity-60">
                                    <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">3D Secure</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                        <Lock className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">PCI-DSS</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
