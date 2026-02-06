'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, dataService, SalesPackage, SportCategory } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Check, Store, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Step = 'role_selection' | 'sport' | 'package' | 'register';

function RegisterContent() {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role'); // 'coach' or 'student'

    const [step, setStep] = useState<Step>('role_selection');
    const [role, setRole] = useState<'student' | 'coach' | null>(null);

    // Initial role setup from URL
    useEffect(() => {
        if (initialRole === 'coach') {
            setRole('coach');
            setStep('register');
        } else if (initialRole === 'student') {
            setRole('student');
            setStep('sport'); // Student flow starts with sport selection
        }
    }, [initialRole]);

    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<SalesPackage | null>(null);
    const [availablePackages, setAvailablePackages] = useState<SalesPackage[]>([]);
    const [availableSports, setAvailableSports] = useState<SportCategory[]>([]);

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

    const filteredPackages = availablePackages.filter(p => p.sport === selectedSport && p.isPublished);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        storeName: '', // For coaches
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRoleSelect = (selectedRole: 'student' | 'coach') => {
        setRole(selectedRole);
        if (selectedRole === 'coach') {
            setStep('register');
        } else {
            setStep('sport');
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (role === 'student' && typeof window !== 'undefined') {
                localStorage.setItem('user_sport_package', JSON.stringify({
                    sport: selectedSport,
                    packageId: selectedPackage?.id,
                    packageData: selectedPackage,
                    createdAt: new Date().toISOString(),
                }));
            }

            // Coach metadata inclusion
            const metadata = role === 'coach' ? { storeName: formData.storeName } : {}; // You'd need to update signIn signature to accept metadata or handle separately

            const { user, error } = await authService.signUp(
                formData.email,
                role || 'student',
                formData.fullName,
                formData.password
            );

            if (error) throw new Error(error);

            if (user) {
                if (role === 'coach') {
                    router.push('/coach'); // Redirect to coach dashboard
                } else {
                    router.push('/student'); // Redirect to student dashboard
                }
            }

        } catch (err: any) {
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions
    const selectedSportData = availableSports.find(s => s.id === selectedSport);
    const getSportColor = (color: string, type: 'bg' | 'text' | 'border' | 'from' | 'ring') => {
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

    // Render Role Selection
    if (step === 'role_selection') {
        return (
            <div className="animate-in fade-in zoom-in duration-500 w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Nasıl Katılmak İstersin?</h1>
                    <p className="text-slate-500">Alpletich dünyasındaki rolünü seç.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Student Selection */}
                    <button
                        onClick={() => handleRoleSelect('student')}
                        className="group p-8 rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left relative overflow-hidden"
                    >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Öğrenciyim</h3>
                        <p className="text-slate-500 font-medium">Hedefime uygun programı bulup kendimi geliştirmek istiyorum.</p>
                    </button>

                    {/* Coach Selection */}
                    <button
                        onClick={() => handleRoleSelect('coach')}
                        className="group p-8 rounded-3xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left relative overflow-hidden"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform">
                            <Store className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Koçum / Eğitmenim</h3>
                        <p className="text-slate-500 font-medium">Dükkanımı açıp programlarımı satmak ve öğrenci koçluğu yapmak istiyorum.</p>
                    </button>
                </div>
                <div className="text-center mt-8">
                    <p className="text-slate-500 font-medium">
                        Zaten hesabın var mı? <Link href="/login" className="text-green-600 font-bold hover:underline">Giriş Yap</Link>
                    </p>
                </div>
            </div>
        );
    }

    // Render existing student flow (Sport -> Package)
    if (step === 'sport') {
        // ... (Keep existing Sport UI but update buttons)
        return (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 w-full max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setStep('role_selection')} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Rol Seçimine Dön
                </Button>
                <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">🎯 Spor Dalını Seç</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Hangi alanda gelişmek istiyorsun?</CardDescription>
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
                                    <h3 className={cn("font-bold text-lg mb-1", selectedSport === sport.id ? getSportColor(sport.color, 'text') : "text-slate-900")}>
                                        {sport.name}
                                    </h3>
                                    {selectedSport === sport.id && (
                                        <div className={cn("mt-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", getSportColor(sport.color, 'bg'), getSportColor(sport.color, 'text'))}>
                                            <Check className="w-3 h-3" /> Seçildi
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button fullWidth className="mt-6" disabled={!selectedSport} onClick={() => setStep('package')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                            Devam Et
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 'package') {
        // ... (Keep existing Package UI)
        return (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 w-full max-w-4xl mx-auto">
                <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                    <CardHeader className="text-center pb-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-3xl">{selectedSportData?.icon}</span>
                            <span className={cn("font-bold text-lg", getSportColor(selectedSportData?.color || 'blue', 'text'))}>{selectedSportData?.name}</span>
                        </div>
                        <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">💎 Paketini Seç</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredPackages.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 font-medium">Bu spor dalı için henüz aktif paket bulunmamaktadır.</p>
                                <Button variant="ghost" onClick={() => setStep('sport')} className="mt-4">Geri Dön</Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredPackages.map((pkg) => (
                                    <button key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={cn("p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden", selectedPackage?.id === pkg.id ? "bg-green-50 border-green-300 ring-2 ring-offset-2 ring-green-500" : "bg-white border-slate-200 hover:border-slate-300")}>
                                        <div className="absolute top-3 right-3"><div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">{pkg.totalWeeks} Hafta</div></div>
                                        <h3 className="font-bold text-lg mb-2 text-slate-900 pr-12">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4"><span className="text-3xl font-black text-slate-900">₺{pkg.price}</span><span className="text-slate-500 text-sm">/ {pkg.accessDuration}</span></div>
                                        <div className="space-y-2 mb-4">
                                            {pkg.features.slice(0, 4).map((feature, i) => (<div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /><span className="text-slate-700 line-clamp-1">{feature}</span></div>))}
                                        </div>
                                        {selectedPackage?.id === pkg.id && (<div className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700"><Check className="w-3 h-3" /> Seçildi</div>)}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setStep('sport')} leftIcon={<ArrowLeft className="w-4 h-4" />}>Geri</Button>
                            <Button fullWidth disabled={!selectedPackage} onClick={() => setStep('register')} rightIcon={<ArrowRight className="w-4 h-4" />}>Devam Et</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Register Form (Unified for both roles)
    return (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300 w-full max-w-md mx-auto">
            <Button variant="ghost" onClick={() => role === 'coach' ? setStep('role_selection') : setStep('package')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
            </Button>
            <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <CardHeader className="text-center pb-2">
                    {role === 'coach' ? (
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Store className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">Dükkanını Aç</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Hemen koç hesabını oluştur.</CardDescription>
                        </div>
                    ) : (
                        <div className="mb-4">
                            {/* Selected Package Summary */}
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4 mx-auto bg-green-100 text-green-800">
                                <span className="text-xl">{selectedSportData?.icon}</span>
                                <span className="font-bold">{selectedSportData?.name}</span>
                            </div>
                            <CardTitle className="text-2xl text-slate-900 font-bold tracking-tight">Kayıt Ol</CardTitle>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Ad Soyad"
                            label="İsim"
                            leftIcon={<User className="w-4 h-4" />}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                        {role === 'coach' && (
                            <Input
                                type="text"
                                placeholder="Örn: Ahmet Hoca Fitness"
                                label="Dükkan / İşletme Adı"
                                leftIcon={<Store className="w-4 h-4" />}
                                value={formData.storeName}
                                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                required
                            />
                        )}
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

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        {role === 'student' && selectedPackage && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-600 font-medium">Ödenecek Tutar</span>
                                    <span className="font-black text-xl text-green-600">₺{selectedPackage.price}</span>
                                </div>
                            </div>
                        )}

                        <Button type="submit" fullWidth isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                            {role === 'coach' ? 'Dükkanı Oluştur' : 'Kayıt Ol ve Öde'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterContent />
        </Suspense>
    )
}
