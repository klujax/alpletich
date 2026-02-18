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
            const msg = (err.message || '');
            console.error('Login error:', err);

            if (err.status === 400 || msg.includes('400') || msg.includes('Invalid login')) {
                setError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
            } else if (err.status === 429 || msg.includes('429')) {
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
            <div className="w-full mb-5 md:mb-4 text-center">
                <button onClick={() => router.push('/')} className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-2 md:mb-2">
                    <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                </button>
                <h1 className="text-2xl md:text-lg font-black text-slate-900 mb-1 tracking-tighter">Tekrar Hoşgeldiniz</h1>
                <p className="text-xs md:text-[11px] font-bold text-slate-400">Devam etmek için giriş yapın.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-2.5 md:space-y-2">
                <div className="space-y-2.5 md:space-y-2">
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
                    />
                    <div className="space-y-1">
                        <Input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 md:h-9 border-2 border-slate-100 focus:border-green-600 rounded-xl md:rounded-lg px-4 md:px-3 font-bold text-sm md:text-xs"
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
                    className="w-full h-11 md:h-9 rounded-xl md:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-sm md:text-xs transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-5 md:mt-4 text-center px-4 md:px-3 py-3 md:py-2.5 rounded-2xl md:rounded-lg border-2 border-slate-50 w-full">
                <p className="text-xs md:text-[11px] font-bold text-slate-400 mb-2 md:mb-1.5">
                    Henüz bir hesabınız yok mu?
                </p>
                <Link
                    href="/register"
                    className="text-slate-900 font-black hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-xs"
                >
                    Hemen Kayıt Ol <MoveRight className="w-4 h-4 md:w-3 md:h-3" />
                </Link>
            </div>
        </div>
    );
}
