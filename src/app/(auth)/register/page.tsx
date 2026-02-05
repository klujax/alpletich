'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Check, Crown, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { cn } from '@/lib/utils';

import { dataService, SalesPackage, SportCategory } from '@/lib/mock-service';
import { useEffect } from 'react';

// Link component will be dynamic now



// ... (SPORT_PACKAGES remains as is for categories)

type Step = 'sport' | 'package' | 'register';

export default function RegisterPage() {
    const [step, setStep] = useState<Step>('sport');
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<SalesPackage | null>(null);
    const [availablePackages, setAvailablePackages] = useState<SalesPackage[]>([]);

    const [availableSports, setAvailableSports] = useState<SportCategory[]>([]);

    // Paketleri ve Sporları yükle
    useEffect(() => {
        const loadData = async () => {
            const [pkgs, sports] = await Promise.all([
                dataService.getPackages(),
                dataService.getSports()
            ]);
            setAvailableSports(sports);
            setAvailablePackages(pkgs);
        };
        loadData();
    }, []);

    // Seçilen spora göre paketleri filtrele
    const filteredPackages = availablePackages.filter(p => p.sport === selectedSport && p.isPublished);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Seçilen paketi kaydet
            if (typeof window !== 'undefined') {
                localStorage.setItem('user_sport_package', JSON.stringify({
                    sport: selectedSport,
                    packageId: selectedPackage?.id, // ID kaydediyoruz
                    packageData: selectedPackage,
                    createdAt: new Date().toISOString(),
                }));
            }

            // Student rolü ata
            const role = 'student';

            const { user, error } = await authService.signUp(
                formData.email,
                role,
                formData.fullName,
                formData.password
            );

            if (error) throw new Error(error);

            if (user) {
                // Burada normalde backend'e seçilen paketi de kaydetmek gerekir
                // Şimdilik sadece kullanıcıyı yönlendiriyoruz
                router.push('/student');
            }

        } catch (err: any) {
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedSportData = availableSports.find(s => s.id === selectedSport);

    // Dynamic Color Helper
    const getSportColor = (color: string, type: 'bg' | 'text' | 'border' | 'from' | 'ring') => {
        // Tailwind class mapping fallback
        const map: any = {
            orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-500' },
            green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', ring: 'ring-green-500' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-500' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-500' },
            red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', ring: 'ring-pink-500' },
            teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', ring: 'ring-teal-500' },
        };
        return map[color] ? map[color][type] : map['blue'][type];
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {['sport', 'package', 'register'].map((s, index) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                            step === s
                                ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                                : index < ['sport', 'package', 'register'].indexOf(step)
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-400"
                        )}>
                            {index < ['sport', 'package', 'register'].indexOf(step) ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        {index < 2 && (
                            <div className={cn(
                                "w-16 h-1 rounded-full transition-all",
                                index < ['sport', 'package', 'register'].indexOf(step)
                                    ? "bg-green-500"
                                    : "bg-slate-200"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <div>
                {/* Step 1: Spor Seçimi */}
                {step === 'sport' && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                        <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">
                                    🎯 Spor Dalını Seç
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium">
                                    Hangi alanda gelişmek istiyorsun?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {availableSports.map((sport) => (
                                        <button
                                            key={sport.id}
                                            onClick={() => setSelectedSport(sport.id)}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 text-left transition-all",
                                                selectedSport === sport.id
                                                    ? `${getSportColor(sport.color, 'bg')} ${getSportColor(sport.color, 'border')} ring-2 ring-offset-2 ${getSportColor(sport.color, 'ring')}`
                                                    : "bg-white border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="text-4xl mb-3">{sport.icon}</div>
                                            <h3 className={cn(
                                                "font-bold text-lg mb-1",
                                                selectedSport === sport.id ? getSportColor(sport.color, 'text') : "text-slate-900"
                                            )}>
                                                {sport.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2">{sport.description}</p>
                                            {selectedSport === sport.id && (
                                                <div className={cn(
                                                    "mt-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                                    getSportColor(sport.color, 'bg'), getSportColor(sport.color, 'text')
                                                )}>
                                                    <Check className="w-3 h-3" /> Seçildi
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    fullWidth
                                    className="mt-6"
                                    disabled={!selectedSport}
                                    onClick={() => setStep('package')}
                                    rightIcon={<ArrowRight className="w-4 h-4" />}
                                >
                                    Devam Et
                                </Button>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 text-center text-sm border-t border-slate-100 pt-6">
                                <div className="text-slate-500 font-medium">
                                    Zaten hesabınız var mı?{' '}
                                    <Link
                                        href="/login"
                                        className="text-green-600 hover:text-green-700 font-bold transition-colors hover:underline"
                                    >
                                        Giriş Yap
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* Step 2: Paket Seçimi */}
                {step === 'package' && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                        <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                            <CardHeader className="text-center pb-2">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-3xl">{selectedSportData?.icon}</span>
                                    <span className={cn("font-bold text-lg", getSportColor(selectedSportData?.color || 'blue', 'text'))}>
                                        {selectedSportData?.name}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">
                                    💎 Paketini Seç
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium">
                                    Senin için en uygun paketi belirle
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {filteredPackages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500 font-medium">Bu spor dalı için henüz aktif paket bulunmamaktadır.</p>
                                        <Button variant="ghost" onClick={() => setStep('sport')} className="mt-4">
                                            Geri Dön
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {filteredPackages.map((pkg) => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => setSelectedPackage(pkg)}
                                                className={cn(
                                                    "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                                                    selectedPackage?.id === pkg.id
                                                        ? "bg-green-50 border-green-300 ring-2 ring-offset-2 ring-green-500"
                                                        : "bg-white border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                        {pkg.totalWeeks} Hafta
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-lg mb-2 text-slate-900 pr-12">
                                                    {pkg.name}
                                                </h3>

                                                <div className="flex items-baseline gap-1 mb-4">
                                                    <span className="text-3xl font-black text-slate-900">₺{pkg.price}</span>
                                                    <span className="text-slate-500 text-sm">/ {pkg.accessDuration}</span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {pkg.features.slice(0, 4).map((feature, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm">
                                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                            <span className="text-slate-700 line-clamp-1">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {selectedPackage?.id === pkg.id && (
                                                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                        <Check className="w-3 h-3" /> Seçildi
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep('sport')}
                                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                                    >
                                        Geri
                                    </Button>
                                    <Button
                                        fullWidth
                                        disabled={!selectedPackage}
                                        onClick={() => setStep('register')}
                                        rightIcon={<ArrowRight className="w-4 h-4" />}
                                    >
                                        Devam Et
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Kayıt Formu */}
                {step === 'register' && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                        <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50 max-w-md mx-auto">
                            <CardHeader className="text-center pb-2">
                                {/* Seçilen paket özeti */}
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4 mx-auto bg-green-100 text-green-800">
                                    <span className="text-xl">{selectedSportData?.icon}</span>
                                    <span className="font-bold">{selectedSportData?.name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                                        {selectedPackage?.accessDuration} Erişim
                                    </span>
                                </div>

                                <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">
                                    ✍️ Hesabını Oluştur
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium">
                                    Son adım! Bilgilerini gir ve başla.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-4">
                                        <Input
                                            type="text"
                                            placeholder="Ad Soyad"
                                            label="İsim"
                                            leftIcon={<User className="w-4 h-4" />}
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            type="email"
                                            placeholder="ornek@email.com"
                                            label="E-posta"
                                            leftIcon={<Mail className="w-4 h-4" />}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            label="Şifre"
                                            leftIcon={<Lock className="w-4 h-4" />}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                                            {error}
                                        </div>
                                    )}

                                    {/* Fiyat Özeti */}
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-600 font-medium">Seçilen Paket</span>
                                            <span className="font-bold text-slate-900">
                                                {selectedPackage?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                            <span className="text-slate-600 font-medium">Paket Tutarı</span>
                                            <span className="font-black text-xl text-green-600">
                                                ₺{selectedPackage?.price}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep('package')}
                                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                                        >
                                            Geri
                                        </Button>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            isLoading={isLoading}
                                            rightIcon={<ArrowRight className="w-4 h-4" />}
                                        >
                                            {selectedPackage ? 'Satın Al ve Kaydol' : 'Kaydol'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 text-center text-sm border-t border-slate-100 pt-6">
                                <p className="text-xs text-slate-400">
                                    Kayıt olarak <span className="underline">Kullanım Şartlarını</span> ve <span className="underline">Gizlilik Politikasını</span> kabul etmiş olursunuz.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </div >
    );
}
