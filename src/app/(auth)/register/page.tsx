'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, dataService } from '@/lib/mock-service';
import { SportCategory } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Store, Target, Phone, Check, Loader2, Sparkles, Dumbbell, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'role_selection' | 'personal_info' | 'sport_selection';

function RegisterContent() {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role');
    const router = useRouter();

    const [step, setStep] = useState<Step>('role_selection');
    const [role, setRole] = useState<'student' | 'coach' | null>(null);
    const [availableSports, setAvailableSports] = useState<SportCategory[]>([]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        storeName: '',
    });

    const [interestedSports, setInterestedSports] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialRole === 'coach') {
            setRole('coach');
            setStep('personal_info');
        } else if (initialRole === 'student') {
            setRole('student');
            setStep('personal_info');
        }
    }, [initialRole]);

    useEffect(() => {
        const loadSports = async () => {
            const sports = await dataService.getSports();
            setAvailableSports(sports);
        };
        loadSports();
    }, []);

    const handleRoleSelect = (selectedRole: 'student' | 'coach') => {
        setRole(selectedRole);
        setStep('personal_info');
    }

    const toggleSport = (sportId: string) => {
        setInterestedSports(prev =>
            prev.includes(sportId)
                ? prev.filter(id => id !== sportId)
                : [...prev, sportId]
        );
    };

    const handlePersonalInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (role === 'student') setStep('sport_selection');
        else handleRegister();
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 400));

        try {
            const { user, error: signUpError } = await authService.signUp(
                formData.email,
                role || 'student',
                formData.fullName,
                formData.password,
                formData.phone,
                interestedSports,
                formData.storeName
            );

            if (signUpError) {
                if (signUpError.includes("Kayıt başarılı")) {
                    toast.success('Kayıt başarılı! E-posta adresinizi kontrol edin.', {
                        description: 'Spam klasörünü de kontrol etmeyi unutmayın.',
                        duration: 6000,
                    });
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
                    return;
                }
                throw new Error(signUpError);
            }

            if (user) {
                toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
                setTimeout(() => {
                    router.push(role === 'coach' ? '/coach' : '/student');
                }, 1000);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            const msg = err.message || '';
            if (msg.includes('already') || msg.includes('zaten')) {
                setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
            } else if (err.status === 429 || msg.includes('429') || msg.includes('rate limit')) {
                setError('E-posta gönderim limiti aşıldı. Lütfen farklı bir e-posta adresi kullanın veya 1 saat bekleyin.');
            } else if (msg.includes('Type error') || msg.includes('Database error')) {
                setError('Bir sistem hatası oluştu. Lütfen tekrar deneyin.');
            } else {
                setError(msg || 'Kayıt işlemi başarısız oldu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isCoach = role === 'coach';

    // ROLE SELECTION
    if (step === 'role_selection') {
        return (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl lg:text-2xl font-black text-slate-900 mb-6 lg:mb-6 tracking-tighter text-center">Hesabınızı Oluşturun</h1>
                <div className="w-full space-y-3">
                    <button onClick={() => handleRoleSelect('student')} className="w-full p-4 lg:p-4 rounded-2xl lg:rounded-xl bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-4">
                        <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-xl lg:rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <UserCheck className="w-5 h-5 lg:w-4 lg:h-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700 text-sm lg:text-sm">Öğrenci Girişi</h3>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-green-600/70">Koç bulmak istiyorum</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-green-600" />
                    </button>

                    <button onClick={() => handleRoleSelect('coach')} className="w-full p-4 lg:p-4 rounded-2xl lg:rounded-xl bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-4">
                        <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-xl lg:rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Store className="w-5 h-5 lg:w-4 lg:h-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700 text-sm lg:text-sm">Eğitmen Girişi</h3>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-green-600/70">Ders vermek istiyorum</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-green-600" />
                    </button>
                </div>
            </div>
        );
    }

    // PERSONAL INFO
    if (step === 'personal_info') {
        return (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full mb-6 lg:mb-6 text-center">
                    <button onClick={() => router.push('/')} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-3">
                        <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                    </button>
                    <h1 className="text-2xl lg:text-xl font-black text-slate-900 mb-1 tracking-tighter">
                        {isCoach ? 'Eğitmen Kaydı' : 'Öğrenci Kaydı'}
                    </h1>
                    <p className="text-xs lg:text-sm font-bold text-slate-400">Bilgilerinizi girerek başlayın.</p>
                </div>

                <form onSubmit={handlePersonalInfoSubmit} className="w-full space-y-3">
                    <Input
                        placeholder="Ad Soyad"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                    />
                    {isCoach && (
                        <Input
                            placeholder="Dükkan / İşletme Adı"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            required
                            className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                        />
                    )}
                    <Input
                        type="tel"
                        placeholder="Telefon Numarası"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                    />
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                    />
                    <Input
                        type="password"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                    />

                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 lg:h-10 rounded-xl lg:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-base lg:text-sm transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                {isCoach ? 'Hesabı Oluştur' : 'Devam Et'} <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        );
    }

    // SPORT SELECTION
    if (step === 'sport_selection') {
        return (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
                <div className="w-full mb-6 text-center">
                    <button onClick={() => setStep('personal_info')} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-3">
                        <ArrowLeft className="w-3 h-3" /> Bilgilere Dön
                    </button>
                    <h1 className="text-2xl lg:text-xl font-black text-slate-900 mb-1 tracking-tighter leading-tight">İlgi Alanlarınızı Seçin</h1>
                    <p className="text-xs lg:text-sm font-bold text-slate-400">Sana en uygun koçları bulalım.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-2 w-full mb-6">
                    {availableSports.map((sport) => {
                        const isSelected = interestedSports.includes(sport.id);
                        return (
                            <button
                                key={sport.id}
                                onClick={() => toggleSport(sport.id)}
                                className={cn(
                                    "p-3 lg:p-2.5 rounded-xl lg:rounded-lg border-2 transition-all flex items-center gap-2 active:scale-95",
                                    isSelected ? "border-green-600 bg-green-50 shadow-sm" : "border-slate-100 bg-white hover:border-green-200"
                                )}
                            >
                                <span className="text-lg lg:text-base">{sport.icon}</span>
                                <span className={cn("font-bold text-xs", isSelected ? "text-green-700" : "text-slate-600")}>
                                    {sport.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 ml-auto text-green-600" />}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full">
                    <Button
                        onClick={handleRegister}
                        disabled={interestedSports.length === 0 || isLoading}
                        className="w-full h-12 lg:h-10 rounded-xl lg:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-base lg:text-sm transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kayıt Ol'}
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterContent />
        </Suspense>
    )
}
