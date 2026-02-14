'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseAuthService as authService } from '@/lib/supabase-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, MoveRight, ArrowLeft } from 'lucide-react';

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
        await new Promise(resolve => setTimeout(resolve, 600));

        try {
            const { data, error } = await authService.signIn(email, password);
            if (error) throw error;

            if (data.user) {
                const profile = await authService.getUser();
                if (profile) {
                    if (profile.role === 'admin') router.push('/admin');
                    else if (profile.role === 'coach') router.push('/coach');
                    else router.push('/student');
                } else {
                    // Fallback if profile not found immediately (e.g. slight delay in trigger)
                    // But since triggers are usually fast or if we use metadata...
                    // Let's try metadata first if profile fails?
                    const role = data.user.user_metadata?.role;
                    if (role === 'admin') router.push('/admin');
                    else if (role === 'coach') router.push('/coach');
                    else router.push('/student');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.status === 400 || (err.message && err.message.includes('400'))) {
                setError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
            } else if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('not confirmed'))) {
                setError('Lütfen önce e-posta adresinize gelen doğrulama linkine tıklayarak hesabınızı onaylayın. (Spam klasörünü kontrol etmeyi unutmayın)');
            } else if (err.status === 429 || (err.message && err.message.includes('429'))) {
                setError('Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyip tekrar deneyin.');
            } else {
                setError(err.message || 'Giriş yapılamadı. Tekrar deneyin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full mb-10 text-center">
                <button onClick={() => router.push('/')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-4">
                    <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                </button>
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Tekrar Hoşgeldiniz</h1>
                <p className="text-sm font-bold text-slate-400">Devam etmek için giriş yapın.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="space-y-4">
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                    />
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 border-2 border-slate-100 focus:border-green-600 rounded-2xl px-5 font-bold"
                        />
                        <div className="text-right">
                            <Link href="#" className="text-xs font-bold text-slate-400 hover:text-green-600 transition-colors">
                                Şifremi Unuttum?
                            </Link>
                        </div>
                    </div>
                </div>

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-10 text-center px-6 py-4 rounded-3xl border-2 border-slate-50">
                <p className="text-sm font-bold text-slate-400 mb-3">
                    Henüz bir hesabınız yok mu?
                </p>
                <Link
                    href="/register"
                    className="text-slate-900 font-black hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all flex items-center justify-center gap-2"
                >
                    Hemen Kayıt Ol <MoveRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
