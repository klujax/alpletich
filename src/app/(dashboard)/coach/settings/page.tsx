'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, Lock, Save, Plus, Camera, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { authService, dataService, Profile } from '@/lib/mock-service';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Profil Formu
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
    });

    // Şifre Değiştirme
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Yeni Hoca Ekleme
    const [newCoach, setNewCoach] = useState({
        full_name: '',
        email: '',
        password: '' // Mock ortamda direkt şifre yaratıyoruz
    });
    const [isAddingCoach, setIsAddingCoach] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const currentUser = authService.getUser();
        if (currentUser) {
            setUser(currentUser);
            setFormData({
                full_name: currentUser.full_name,
                email: currentUser.email,
                phone: currentUser.phone || '',
            });
        }
        setIsLoading(false);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);

        try {
            // Mock update simulation
            const updatedUser = { ...user, ...formData };
            // Gerçek update metodu mock-service'de olmadığı için localUser update ediyoruz
            if (typeof window !== 'undefined') {
                localStorage.setItem('alperen_spor_user', JSON.stringify(updatedUser));
            }

            // Re-fetch to update state
            await loadUser();
            toast.success('Profil bilgileri güncellendi');
        } catch (error) {
            toast.error('Güncelleme başarısız');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCoach = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingCoach(true);

        try {
            if (newCoach.password.length < 6) {
                toast.error('Şifre en az 6 karakter olmalı');
                return;
            }

            // authService.signUp fonksiyonunu kullanabiliriz
            // Role: 'coach'
            const { user: newUser, error } = await authService.signUp(
                newCoach.email,
                'coach',
                newCoach.full_name
            );

            if (error) throw new Error(error);

            toast.success('Yeni hoca başarıyla eklendi');
            setNewCoach({ full_name: '', email: '', password: '' });

        } catch (error: any) {
            toast.error(error.message || 'Hoca eklenirken bir hata oluştu');
        } finally {
            setIsAddingCoach(false);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ayarlar</h1>
                <p className="text-slate-500 font-medium mt-1">
                    Profilinizi yönetin ve sistem ayarlarını yapılandırın.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sol Taraf: Profil & Şifre */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profil Bilgileri */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-green-600" />
                                <CardTitle className="text-lg text-slate-900">Profil Bilgileri</CardTitle>
                            </div>
                            <CardDescription>Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                            {user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-slate-400">
                                                    {(user?.full_name || 'K').slice(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Ad Soyad"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        leftIcon={<User className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Telefon"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        leftIcon={<Phone className="w-4 h-4" />}
                                        placeholder="+90 555 ..."
                                    />
                                </div>
                                <Input
                                    label="E-posta"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    disabled
                                    className="bg-slate-50"
                                />

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" isLoading={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Save className="w-4 h-4 mr-2" />
                                        Değişiklikleri Kaydet
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Şifre Değiştirme (Mock - UI Only) */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <CardTitle className="text-lg text-slate-900">Güvenlik</CardTitle>
                            </div>
                            <CardDescription>Şifrenizi güncellemek için aşağıdaki alanları doldurun.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    label="Mevcut Şifre"
                                    placeholder="••••••••"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="password"
                                        label="Yeni Şifre"
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-4 h-4" />}
                                    />
                                    <Input
                                        type="password"
                                        label="Yeni Şifre (Tekrar)"
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-4 h-4" />}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button variant="outline" onClick={() => toast.success('Şifre güncellendi (Demo)')}>
                                        Şifreyi Güncelle
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Taraf: Hoca Ekleme */}
                <div className="space-y-8">
                    <Card className="border-slate-200 shadow-sm h-fit sticky top-6">
                        <CardHeader className="bg-gradient-to-br from-green-600 to-green-700 text-white border-b border-white/10 pb-6 rounded-t-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <UserPlus className="w-5 h-5 text-white" />
                                <CardTitle className="text-lg text-white">Yeni Hoca Ekle</CardTitle>
                            </div>
                            <CardDescription className="text-green-50">
                                Sisteme yeni bir antrenör veya yardımcı koç ekleyin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddCoach} className="space-y-4">
                                <Input
                                    label="Ad Soyad"
                                    placeholder="Örn: Mehmet Yılmaz"
                                    value={newCoach.full_name}
                                    onChange={(e) => setNewCoach({ ...newCoach, full_name: e.target.value })}
                                    required
                                />
                                <Input
                                    type="email"
                                    label="E-posta"
                                    placeholder="hoca@alperenspor.com"
                                    value={newCoach.email}
                                    onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                                    required
                                />
                                <Input
                                    type="password"
                                    label="Geçici Şifre"
                                    placeholder="••••••••"
                                    value={newCoach.password}
                                    onChange={(e) => setNewCoach({ ...newCoach, password: e.target.value })}
                                    required
                                />

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        fullWidth
                                        isLoading={isAddingCoach}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Hocayı Kaydet
                                    </Button>
                                    <p className="text-xs text-slate-500 mt-3 text-center">
                                        Eklenen hoca kendi e-posta ve şifresiyle sisteme giriş yapabilir.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
