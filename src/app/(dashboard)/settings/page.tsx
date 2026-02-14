'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, Lock, User, Shield, LogOut, Loader2, Save, Smartphone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/mock-service'; // Use real service
import { Profile } from '@/types/database';

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<Profile | null>(null);

    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const userData = await authService.getUser();
            if (userData) {
                setUser(userData);
                setFullName(userData.full_name || '');
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // supabase-service updateProfile might return slightly different structure, check it
            const { user: updatedUser, error } = await authService.updateProfile(user.id, {
                full_name: fullName,
                phone: phone,
                email: email
            });

            if (error) {
                toast.error(error.message || 'Güncelleme hatası');
            } else if (updatedUser) {
                setUser(updatedUser);
                toast.success('Profil bilgileriniz güncellendi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await authService.signOut();
        toast.success('Çıkış yapıldı.');
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fade-in space-y-8 px-4 md:px-0">
            <header className="mb-4">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ayarlar</h1>
                <p className="text-slate-500 font-medium">Hesap bilgilerinizi ve tercihlerinizi yönetin.</p>
            </header>

            {/* Profile Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-green-600" />
                        <CardTitle className="font-bold text-lg text-slate-800">Profil Bilgileri</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Ad Soyad</Label>
                            <Input
                                id="fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-slate-50 border-slate-200 font-medium focus-visible:ring-green-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 font-medium focus-visible:ring-green-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 font-medium focus-visible:ring-green-500"
                                    placeholder="+90 5XX XXX XX XX"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <CardTitle className="font-bold text-lg text-slate-800">Güvenlik</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white">
                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-700">İki Aşamalı Doğrulama</Label>
                            <p className="text-sm text-slate-400">Giriş yaparken ekstra güvenlik katmanı.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                        <Button variant="outline" className="w-full justify-start text-slate-600 font-bold hover:text-slate-900">
                            <Lock className="w-4 h-4 mr-2" /> Şifre Değiştir
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <CardTitle className="font-bold text-lg text-slate-800">Bildirimler</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-700">Ders Hatırlatmaları</Label>
                            <p className="text-sm text-slate-400">Antrenman ve derslerden önce bildirim al.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-700">Mesaj Bildirimleri</Label>
                            <p className="text-sm text-slate-400">Koçundan yeni mesaj geldiğinde haber ver.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
                <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Değişiklikleri Kaydet
                </Button>
            </div>

            {/* Logout Section - At the very bottom */}
            <div className="pt-8 border-t border-slate-100 mt-12">
                <Card
                    className="border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer group"
                    onClick={handleLogout}
                >
                    <CardHeader className="p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-red-600">Oturumu Kapat</CardTitle>
                                <CardDescription className="text-red-400 font-medium">Hesabından güvenli bir şekilde çıkış yap.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
