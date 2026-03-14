'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, RefreshCw, Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

function CheckoutResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const packageId = searchParams.get('packageId');

    const isSuccess = status === 'success';

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 animate-in fade-in duration-700">
            <div className="max-w-lg w-full text-center">
                {/* İkon */}
                <div className={`
                    w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center
                    animate-in zoom-in-50 duration-500
                    ${isSuccess
                        ? 'bg-gradient-to-br from-green-100 to-green-50 shadow-xl shadow-green-100'
                        : 'bg-gradient-to-br from-red-100 to-red-50 shadow-xl shadow-red-100'
                    }
                `}>
                    {isSuccess ? (
                        <CheckCircle2 className="w-14 h-14 text-green-600" />
                    ) : (
                        <XCircle className="w-14 h-14 text-red-500" />
                    )}
                </div>

                {/* Başlık */}
                <h1 className={`text-3xl font-black tracking-tight mb-3 ${isSuccess ? 'text-slate-900' : 'text-slate-900'}`}>
                    {isSuccess ? 'Ödeme Başarılı! 🎉' : 'Ödeme Başarısız'}
                </h1>

                {/* Açıklama */}
                <p className="text-slate-500 font-medium text-lg mb-2 max-w-sm mx-auto">
                    {isSuccess
                        ? 'Paket satın alımın başarıyla tamamlandı. Hemen eğitime başlayabilirsin!'
                        : message || 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.'
                    }
                </p>

                {/* Başarı detayları */}
                {isSuccess && (
                    <div className="my-8 p-5 bg-green-50 rounded-2xl border border-green-100 animate-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-sm">
                            <Sparkles className="w-4 h-4" />
                            Paket hesabına tanımlandı
                        </div>
                    </div>
                )}

                {/* Hata mesajı */}
                {!isSuccess && message && (
                    <div className="my-6 p-4 bg-red-50 rounded-2xl border border-red-100 text-sm font-bold text-red-600">
                        {message}
                    </div>
                )}

                {/* Butonlar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    {isSuccess ? (
                        <>
                            <Link href="/student/packages">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-black rounded-xl h-14 px-8 shadow-lg shadow-green-600/20 w-full sm:w-auto">
                                    <ShoppingBag className="w-5 h-5 mr-2" />
                                    Paketlerime Git
                                </Button>
                            </Link>
                            <Link href="/student">
                                <Button variant="outline" className="font-bold rounded-xl h-14 px-8 border-slate-200 w-full sm:w-auto">
                                    <Home className="w-5 h-5 mr-2" />
                                    Ana Sayfaya Dön
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => router.back()}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-14 px-8 w-full sm:w-auto"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Tekrar Dene
                            </Button>
                            <Link href="/marketplace">
                                <Button variant="outline" className="font-bold rounded-xl h-14 px-8 border-slate-200 w-full sm:w-auto">
                                    <ArrowRight className="w-5 h-5 mr-2" />
                                    Paketlere Dön
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Alt bilgi */}
                <p className="text-[10px] text-slate-400 font-bold mt-10 uppercase tracking-widest">
                    {isSuccess ? 'Sportaly ile başarıya bir adım daha yakınsın' : 'Sorun devam ederse destek@sportaly.com adresinden ulaşın'}
                </p>
            </div>
        </div>
    );
}

export default function CheckoutResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CheckoutResultContent />
        </Suspense>
    );
}
