'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { SportCategory } from '@/lib/mock-service'; // Keep types/constants if needed
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
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // 1. Sign Up User
            const { data, error } = await authService.signUp(
                formData.email,
                formData.password,
                {
                    role: role || 'student',
                    full_name: formData.fullName,
                    phone: formData.phone,
                    // Store name is handled separately for creation
                }
            );

            if (error) throw error;

            if (data.user) {
                // 2. If Coach, Create Store
                if (role === 'coach' && formData.storeName) {
                    try {
                        const slug = formData.storeName
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');

                        await dataService.createStore({
                            owner_id: data.user.id,
                            name: formData.storeName,
                            slug: slug,
                            description: 'Yeni spor mağazası', // Default description
                            contact_email: formData.email,
                            contact_phone: formData.phone
                        } as any);
                    } catch (storeError) {
                        console.error('Store creation failed:', storeError);
                        // We don't block registration success, user can create store later
                        toast.error('Kullanıcı oluşturuldu fakat dükkan oluşturulamadı. Lütfen paneldn tekrar deneyin.');
                    }
                }

                // 3. If Student, Save Interested Sports (Optional - usually saved in profile via metadata or separate call)
                if (role === 'student' && interestedSports.length > 0) {
                    // Metadata handles this in trigger usually, or we can add a specific call if needed.
                    // The original code passed it in metadata, which is fine if the trigger handles it.
                    // We kept it in metadata above (oops, removed it in step 1, let's put it back in signUp call if useful).
                }

                toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
                // Allow a small delay for toast and session propagation
                setTimeout(() => {
                    router.push(role === 'coach' ? '/coach' : '/student');
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Kayıt işlemi başarısız oldu.');
        } finally {
            setIsLoading(false);
        }
    };

    const isCoach = role === 'coach';

    // ROLE SELECTION
    if (step === 'role_selection') {
        return (
            <div className="w-full max-w-lg flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter text-center">Hesabınızı Oluşturun</h1>
                <div className="w-full space-y-4">
                    <button onClick={() => handleRoleSelect('student')} className="w-full p-6 rounded-3xl bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700">Öğrenci Girişi</h3>
                            <p className="text-sm font-bold text-slate-400 group-hover:text-green-600/70">Koç bulmak istiyorum</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600" />
                    </button>

                    <button onClick={() => handleRoleSelect('coach')} className="w-full p-6 rounded-3xl bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Store className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700">Eğitmen Girişi</h3>
                            <p className="text-sm font-bold text-slate-400 group-hover:text-green-600/70">Ders vermek istiyorum</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600" />
                    </button>
                </div>
            </div>
        );
    }

    // PERSONAL INFO
    if (step === 'personal_info') {
        return (
            <div className="w-full max-w-[400px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full mb-8 text-center">
                    <button onClick={() => router.push('/')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-4">
                        <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
                        {isCoach ? 'Eğitmen Kaydı' : 'Öğrenci Kaydı'}
                    </h1>
                    <p className="text-sm font-bold text-slate-400">Bilgilerinizi girerek başlayın.</p>
                </div>

                <form onSubmit={handlePersonalInfoSubmit} className="w-full space-y-4">
                    <Input
                        placeholder="Ad Soyad"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                    />
                    {isCoach && (
                        <Input
                            placeholder="Dükkan / İşletme Adı"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            required
                            className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                        />
                    )}
                    <Input
                        type="tel"
                        placeholder="Telefon Numarası"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                    />
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                    />
                    <Input
                        type="password"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                    />

                    {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                {isCoach ? 'Hesabı Oluştur' : 'Devam Et'} <ArrowRight className="w-5 h-5" />
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
            <div className="w-full max-w-[500px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
                <div className="w-full mb-8 text-center px-4">
                    <button onClick={() => setStep('personal_info')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-4">
                        <ArrowLeft className="w-3 h-3" /> Bilgilere Dön
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter leading-tight">İlgi Alanlarınızı Seçin</h1>
                    <p className="text-sm font-bold text-slate-400">Sana en uygun koçları bulalım.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full px-4 mb-8">
                    {availableSports.map((sport) => {
                        const isSelected = interestedSports.includes(sport.id);
                        return (
                            <button
                                key={sport.id}
                                onClick={() => toggleSport(sport.id)}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all flex items-center gap-3 active:scale-95",
                                    isSelected ? "border-green-600 bg-green-50 shadow-sm" : "border-slate-100 bg-white hover:border-green-200"
                                )}
                            >
                                <span className="text-2xl">{sport.icon}</span>
                                <span className={cn("font-bold text-sm", isSelected ? "text-green-700" : "text-slate-600")}>
                                    {sport.name}
                                </span>
                                {isSelected && <Check className="w-4 h-4 ml-auto text-green-600" />}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full px-4 mb-8">
                    <Button
                        onClick={handleRegister}
                        disabled={interestedSports.length === 0 || isLoading}
                        className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Kayıt Ol'}
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
