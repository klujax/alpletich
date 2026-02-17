'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, MoveRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);
        await new Promise(resolve => setTimeout(resolve, 600));

        try {
            const { user, error } = await authService.signIn(email, password);
            if (error) throw new Error(error);

            if (user) {
                const profile = user;
                if (profile.role === 'admin') router.push('/admin');
                else if (profile.role === 'coach') router.push('/coach');
                else router.push('/student');
            }

        } catch (err: any) {
            const msg = (err.message || '');
            const lowerMsg = msg.toLowerCase();

            if (lowerMsg.includes('email not confirmed') ||
                lowerMsg.includes('not confirmed') ||
                lowerMsg.includes('onay linkine') ||
                lowerMsg.includes('doğrulayın')) {
                setError('E-posta adresi doğrulanmamış.');
            } else {
                console.error('Login error:', err);
                if (err.status === 400 || lowerMsg.includes('400')) {
                    setError('E-posta veya şifre hatalı ve ya e-posta doğrulanmamış. Lütfen bilgilerinizi kontrol edin.');
                } else if (err.status === 429 || lowerMsg.includes('429')) {
                    setError('Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyip tekrar deneyin.');
                } else {
                    setError(err.message || 'Giriş yapılamadı. Tekrar deneyin.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Lütfen önce e-posta adresinizi girin.');
            return;
        }
        setResendLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const { error } = await authService.resendConfirmation(email);
            if (error) throw error;
            setSuccessMsg('Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu, spam ve diğer klasörleri kontrol edin.');
        } catch (err: any) {
            console.error(err);
            setError('E-posta gönderilemedi: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full mb-6 lg:mb-8 text-center">
                <button onClick={() => router.push('/')} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-600 flex items-center gap-1 mx-auto mb-3 lg:mb-4">
                    <ArrowLeft className="w-3 h-3" /> Ana Sayfaya Dön
                </button>
                <h1 className="text-3xl lg:text-2xl font-black text-slate-900 mb-1 lg:mb-2 tracking-tighter">Tekrar Hoşgeldiniz</h1>
                <p className="text-xs lg:text-sm font-bold text-slate-400">Devam etmek için giriş yapın.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3 lg:space-y-3">
                <div className="space-y-3">
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                    />
                    <div className="space-y-1.5">
                        <Input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 lg:h-10 border-2 border-slate-100 focus:border-green-600 rounded-xl lg:rounded-lg px-4 font-bold text-sm"
                        />
                        <div className="text-right">
                            <Link href="#" className="text-[10px] lg:text-xs font-bold text-slate-400 hover:text-green-600 transition-colors">
                                Şifremi Unuttum?
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-center space-y-1.5">
                        <p className="text-xs font-bold text-red-500">{error}</p>
                        {error === 'E-posta adresi doğrulanmamış.' && (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="text-xs font-bold text-green-600 hover:text-green-700 underline"
                            >
                                {resendLoading ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
                            </button>
                        )}
                    </div>
                )}
                {successMsg && <p className="text-xs font-bold text-green-600 text-center">{successMsg}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 lg:h-10 rounded-xl lg:rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-base lg:text-sm transition-transform active:scale-95 shadow-lg shadow-green-600/20"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-6 lg:mt-8 text-center px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-xl border-2 border-slate-50 w-full">
                <p className="text-xs lg:text-sm font-bold text-slate-400 mb-2 lg:mb-3">
                    Henüz bir hesabınız yok mu?
                </p>
                <Link
                    href="/register"
                    className="text-slate-900 font-black hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Hemen Kayıt Ol <MoveRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
