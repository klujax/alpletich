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
                // Mock service returns the profile directly as 'user'
                const profile = user;
                // OR we can fetch it again if needed, but signIn returns it.
                // const profile = authService.getUser(); 

                if (profile.role === 'admin') router.push('/admin');
                else if (profile.role === 'coach') router.push('/coach');
                else router.push('/student');
            }

        } catch (err: any) {
            const msg = (err.message || '');
            const lowerMsg = msg.toLowerCase();

            // Check for verification error (Supabase standard or our custom Turkish message)
            if (lowerMsg.includes('email not confirmed') ||
                lowerMsg.includes('not confirmed') ||
                lowerMsg.includes('onay linkine') ||
                lowerMsg.includes('doğrulayın')) {

                // This is an expected state, so we don't log it as an error
                setError('E-posta adresi doğrulanmamış.');
            } else {
                // Log actual unexpected errors
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

                {error && (
                    <div className="text-center space-y-2">
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
