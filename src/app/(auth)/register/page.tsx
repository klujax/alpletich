'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { SportCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Store, Phone, Check, Loader2, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'role_selection' | 'personal_info' | 'sport_selection';

function RegisterContent() {
    const searchParams = useSearchParams();
    const initialRole = searchParams?.get('role') || null;
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
        height: '',
        weight: '',
        location: '',
        sportsHistory: '',
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

        try {
            // Trim whitespace from email
            const cleanEmail = formData.email.trim();
            const cleanPassword = formData.password;

            if (!cleanEmail || !cleanEmail.includes('@')) {
                setError('Lütfen geçerli bir e-posta adresi girin.');
                setIsLoading(false);
                return;
            }

            // Supabase signUp: (email, password, metadata)
            const { data, error: signUpError } = await authService.signUp(
                cleanEmail,
                cleanPassword,
                {
                    full_name: formData.fullName,
                    role: role || 'student',
                    phone: formData.phone || null,
                    interested_sports: interestedSports.length > 0 ? interestedSports : null,
                    height: formData.height || null,
                    weight: formData.weight || null,
                    location: formData.location || null,
                    sports_history: formData.sportsHistory || null,
                    store_name: formData.storeName || null,
                }
            );

            if (signUpError) {
                throw signUpError;
            }

            if (data?.user) {
                // Check if email confirmation is required (no session = confirmation needed)
                if (!data.session) {
                    // Email confirmation required
                    toast.success('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.');
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
                    return;
                }

                // Session exists - email auto-confirmed, proceed normally
                // Create/update profile in profiles table
                const profileData = {
                    id: data.user.id,
                    email: cleanEmail,
                    full_name: formData.fullName,
                    role: role || 'student',
                    phone: formData.phone || null,
                    interested_sports: interestedSports.length > 0 ? interestedSports : undefined,
                    height: formData.height ? Number(formData.height) : undefined,
                    weight: formData.weight ? Number(formData.weight) : undefined,
                    location: formData.location || undefined,
                    sports_history: formData.sportsHistory || undefined,
                };

                try {
                    await dataService.updateProfile(data.user.id, profileData);
                } catch (profileErr) {
                    console.warn('Profile update failed (trigger may have created it):', profileErr);
                }

                // If coach, create store
                if (role === 'coach' && formData.storeName) {
                    try {
                        await dataService.createStore({
                            coachId: data.user.id,
                            name: formData.storeName,
                            slug: formData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                            description: '',
                            logoEmoji: '🏋️',
                            themeColor: 'green',
                            category: 'Fitness',
                        } as any);
                    } catch (storeErr) {
                        console.warn('Store creation failed, can be created later:', storeErr);
                    }
                }

                // Store profile in localStorage for session fallback
                if (typeof window !== 'undefined') {
                    localStorage.setItem('sportaly_user', JSON.stringify(profileData));
                }

                toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
                setTimeout(() => {
                    router.push(role === 'coach' ? '/coach' : '/student');
                }, 1000);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            const msg = (err.message || '').toLowerCase();
            if (msg.includes('already') || msg.includes('zaten') || msg.includes('already been registered')) {
                setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
            } else if (err.status === 429 || msg.includes('429') || msg.includes('rate limit')) {
                setError('Çok fazla deneme. Lütfen farklı bir e-posta kullanın veya 1 saat bekleyin.');
            } else if (msg.includes('type error') || msg.includes('database error')) {
                setError('Bir sistem hatası oluştu. Lütfen tekrar deneyin.');
            } else if (msg.includes('invalid') && msg.includes('email')) {
                setError('Geçersiz e-posta adresi formati. Lütfen başında veya sonunda boşluk bırakmadan e-posta girin.');
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
                <h1 className="text-2xl md:text-lg font-black text-slate-900 mb-5 md:mb-4 tracking-tighter text-center">Hesabınızı Oluşturun</h1>
                <div className="w-full space-y-2.5 md:space-y-2">
                    <button onClick={() => handleRoleSelect('student')} className="w-full p-4 md:p-3 rounded-2xl md:rounded-lg bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-3 md:gap-2.5">
                        <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <UserCheck className="w-5 h-5 md:w-4 md:h-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700 text-sm md:text-xs">Öğrenci Girişi</h3>
                            <p className="text-xs md:text-[10px] font-bold text-slate-400 group-hover:text-green-600/70">Koç bulmak istiyorum</p>
                        </div>
                        <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-200 group-hover:text-green-600" />
                    </button>

                    <button onClick={() => handleRoleSelect('coach')} className="w-full p-4 md:p-3 rounded-2xl md:rounded-lg bg-white border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 text-left transition-all duration-200 group flex items-center gap-3 md:gap-2.5">
                        <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Store className="w-5 h-5 md:w-4 md:h-4" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 group-hover:text-green-700 text-sm md:text-xs">Eğitmen Girişi</h3>
                            <p className="text-xs md:text-[10px] font-bold text-slate-400 group-hover:text-green-600/70">Ders vermek istiyorum</p>
                        </div>
                        <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-200 group-hover:text-green-600" />
                    </button>
                </div>
            </div>
        );
    }

    // PERSONAL INFO
    if (step === 'personal_info') {
        return (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full mb-5 md:mb-3 text-center">
                    <button onClick={() => { setStep('role_selection'); setRole(null); }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-2">
                        <ArrowLeft className="w-3 h-3" /> Geri Dön
                    </button>
                    <h1 className="text-2xl md:text-lg font-black text-slate-900 mb-1 tracking-tighter">
                        {isCoach ? 'Eğitmen Kaydı' : 'Öğrenci Kaydı'}
                    </h1>
                    <p className="text-xs md:text-[11px] font-bold text-slate-400">Bilgilerinizi girerek başlayın.</p>
                </div>

                <form onSubmit={handlePersonalInfoSubmit} className="w-full space-y-2.5 md:space-y-2">
                    <Input
                        placeholder="Ad Soyad"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                    />
                    {isCoach && (
                        <Input
                            placeholder="Nerede Hocalık Yapıyorsunuz? (Dükkan / İşletme Adı)"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            required
                            className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                        />
                    )}
                    <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        className="flex w-full h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 focus-visible:outline-none focus:ring-0 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs bg-white text-slate-900 appearance-none"
                    >
                        <option value="" disabled>Nerede Yaşıyorsunuz? (İl Seçin)</option>
                        {["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"].map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2.5 md:gap-2">
                        <Input
                            type="number"
                            placeholder="Boy (cm)"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            required
                            className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                        />
                        <Input
                            type="number"
                            placeholder="Kilo (kg)"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            required
                            className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                        />
                    </div>
                    {!isCoach && (
                        <Input
                            placeholder="Spor Geçmişiniz (Örn: 2 yıl fitness, yüzme vb.)"
                            value={formData.sportsHistory}
                            onChange={(e) => setFormData({ ...formData, sportsHistory: e.target.value })}
                            className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                        />
                    )}
                    <Input
                        type="tel"
                        placeholder="Telefon Numarası"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                    />
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                    />
                    <Input
                        type="password"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                    />

                    {error && <p className="text-xs md:text-[11px] font-bold text-red-500 text-center">{error}</p>}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 md:h-9 rounded-xl md:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-sm md:text-xs transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                Devam Et <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="mt-4 md:mt-3 text-center">
                    <p className="text-xs md:text-[11px] font-bold text-slate-400">
                        Zaten hesabınız var mı?{' '}
                        <Link href="/login" className="text-green-600 hover:text-green-700 underline">Giriş Yapın</Link>
                    </p>
                </div>
            </div>
        );
    }

    // SPORT SELECTION
    if (step === 'sport_selection') {
        return (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
                <div className="w-full mb-5 md:mb-3 text-center">
                    <button onClick={() => setStep('personal_info')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-2">
                        <ArrowLeft className="w-3 h-3" /> Bilgilere Dön
                    </button>
                    <h1 className="text-2xl md:text-lg font-black text-slate-900 mb-1 tracking-tighter leading-tight">İlgi Alanlarınızı Seçin</h1>
                    <p className="text-xs md:text-[11px] font-bold text-slate-400">
                        {isCoach ? 'Uzmanlık alanlarınızı/ilgilenilen branşları seçin.' : 'Sana en uygun koçları bulalım.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-1.5 w-full mb-5 md:mb-3">
                    {availableSports.map((sport) => {
                        const isSelected = interestedSports.includes(sport.id);
                        return (
                            <button
                                key={sport.id}
                                onClick={() => toggleSport(sport.id)}
                                className={cn(
                                    "p-2.5 md:p-2 rounded-xl md:rounded-lg border-2 transition-all flex items-center gap-2 active:scale-95",
                                    isSelected ? "border-green-600 bg-green-50 shadow-sm" : "border-slate-100 bg-white hover:border-green-200"
                                )}
                            >
                                <span className="text-base md:text-sm">{sport.icon}</span>
                                <span className={cn("font-bold text-xs md:text-[10px]", isSelected ? "text-green-700" : "text-slate-600")}>
                                    {sport.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 md:w-2.5 md:h-2.5 ml-auto text-green-600" />}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full">
                    <Button
                        onClick={handleRegister}
                        disabled={interestedSports.length === 0 || isLoading}
                        className="w-full h-11 md:h-9 rounded-xl md:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-sm md:text-xs transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kayıt Ol'}
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
