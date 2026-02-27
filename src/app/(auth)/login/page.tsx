'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseAuthService as authService } from '@/lib/supabase-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, MoveRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await authService.signIn(email, password);
            if (error) throw error;

            if (data?.user) {
                // Fetch profile to get role
                const profile = await authService.getUser();
                if (profile) {
                    // Store in localStorage for session fallback
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('sportaly_user', JSON.stringify(profile));
                    }
                    if (profile.role === 'admin') router.push('/admin');
                    else if (profile.role === 'coach') router.push('/coach');
                    else router.push('/student');
                }
            }

        } catch (err: any) {
            const msg = (err.message || '').toLowerCase();
            console.error('Login error:', err);

            if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
                setError('E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin veya yeni doğrulama maili isteyin.');
            } else if (err.status === 400 || msg.includes('invalid login') || msg.includes('invalid_credentials')) {
                setError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
            } else if (err.status === 429 || msg.includes('429') || msg.includes('rate limit')) {
                setError('Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyip tekrar deneyin.');
            } else {
                setError(err.message || 'Giriş yapılamadı. Tekrar deneyin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full mb-5 lg:mb-6 text-center">
                <button onClick={() => router.push('/')} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-2">
                    <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                </button>
                <h1 className="text-2xl lg:text-2xl font-black text-slate-900 mb-1 tracking-tighter">Tekrar Hoşgeldiniz</h1>
                <p className="text-xs lg:text-sm font-bold text-slate-400">Devam etmek için giriş yapın.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3 lg:space-y-3.5">
                <div className="space-y-3 lg:space-y-3.5">
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 lg:h-12 border-2 border-slate-100 focus:border-green-600 rounded-xl px-4 font-bold text-sm lg:text-base"
                    />
                    <div className="space-y-1">
                        <Input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 lg:h-12 border-2 border-slate-100 focus:border-green-600 rounded-xl px-4 font-bold text-sm lg:text-base"
                        />
                        <div className="text-right">
                            <Link href="#" className="text-[10px] md:text-[10px] font-bold text-slate-400 hover:text-green-600 transition-colors">
                                Şifremi Unuttum?
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-xs md:text-[11px] font-bold text-red-500 text-center">{error}</p>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 lg:h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm lg:text-base transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-5 lg:mt-6 text-center px-4 py-3 rounded-2xl border-2 border-slate-50 w-full">
                <p className="text-xs lg:text-sm font-bold text-slate-400 mb-2">
                    Henüz bir hesabınız yok mu?
                </p>
                <Link
                    href="/register"
                    className="text-slate-900 font-black hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                    Hemen Kayıt Ol <MoveRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
