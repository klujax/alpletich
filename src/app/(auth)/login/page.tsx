'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authService } from '@/lib/mock-service'; // Mock Service kullanıyoruz
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
            // Login
            const { user, error } = await authService.signIn(email, password);

            if (error) throw new Error(error);

            if (user) {
                // Role göre yönlendirme
                if (user.role === 'coach') {
                    router.push('/coach');
                } else {
                    router.push('/student');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Giriş yapılamadı');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card variant="default" className="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-slate-900 font-bold tracking-tight">
                        Giriş Yap
                    </CardTitle>
                    <CardDescription className="text-center text-slate-500 font-medium">
                        Hesabınıza giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="ornek@email.com"
                                label="E-posta"
                                leftIcon={<Mail className="w-4 h-4" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                label="Şifre"
                                leftIcon={<Lock className="w-4 h-4" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            className="mt-6"
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            Giriş Yap
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center text-sm border-t border-slate-100 pt-6">
                    <div className="text-slate-500 font-medium">
                        Hesabınız yok mu?{' '}
                        <Link
                            href="/register"
                            className="text-green-600 hover:text-green-700 font-bold transition-colors hover:underline"
                        >
                            Kayıt Ol
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
