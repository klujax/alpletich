'use client';

import { useState, useRef } from 'react';
import { User, MapPin, Camera, Trophy, Medal, Star, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authService } from '@/lib/mock-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Simple Label component to replace the missing import
const Label = ({ htmlFor, children, className }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>
        {children}
    </label>
);

export default function ProfilePage() {
    const [user, setUser] = useState<any>(authService.getUser() || {
        name: 'Emir Buğra',
        email: 'emir@example.com',
        role: 'student',
        avatar_url: 'https://github.com/shadcn.png'
    });

    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: user?.full_name || user?.name || '',
        bio: user?.bio || '',
        sports: user?.sports || 'Fitness, Yüzme, Pilates'
    });

    const handleSave = async () => {
        const updates = {
            full_name: formData.full_name,
        };

        const { error } = await authService.updateProfile(user.id, updates);

        if (error) {
            toast.error('Profil güncellenirken hata oluştu');
            return;
        }

        setUser({ ...user, ...updates, bio: formData.bio, sports: formData.sports });

        toast.success('Profil güncellendi', {
            description: 'Değişikliklerin başarıyla kaydedildi.'
        });
        setIsEditing(false);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setUser({ ...user, avatar_url: base64String });

            const { error } = await authService.updateProfile(user.id, { avatar_url: base64String });

            if (error) {
                toast.error('Fotoğraf yüklenirken hata oluştu');
            } else {
                toast.success('Profil fotoğrafı güncellendi');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-4xl mx-auto pb-28 lg:pb-10 animate-fade-in">
            {/* Profile Header */}
            <div className="relative mb-28 sm:mb-32 md:mb-20 group">
                <div className="h-28 sm:h-36 md:h-48 w-full bg-slate-50 border-b border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-green-50 rounded-full blur-3xl -mr-24 sm:-mr-32 -mt-24 sm:-mt-32" />
                </div>

                <div className="absolute -bottom-20 sm:-bottom-24 md:-bottom-12 left-0 md:left-12 w-full md:w-auto flex flex-col md:flex-row items-center md:items-end gap-2 sm:gap-4 md:gap-6 px-4 md:px-0">
                    <div className="relative group/avatar">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-4 border-white shadow-xl bg-white overflow-hidden relative">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name || user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                    <User className="w-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16" />
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2.5 bg-green-600 rounded-xl sm:rounded-2xl text-white shadow-lg border-2 border-white hover:bg-green-700 transition-all hover:scale-110 z-10 cursor-pointer"
                        >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                    <div className="mb-0 sm:mb-2 md:mb-4 text-center md:text-left">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{user.full_name || user.name}</h1>
                        <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-50 border border-green-100 inline-block">
                            <p className="text-[9px] sm:text-[10px] font-black text-green-700 uppercase tracking-widest leading-none">
                                {user.role === 'coach' ? 'Antrenör' : 'Öğrenci'} Üye
                            </p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-auto md:bottom-4 md:right-8">
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? undefined : "outline"}
                        className={cn(
                            "rounded-xl sm:rounded-2xl px-4 sm:px-6 h-9 sm:h-12 text-xs sm:text-sm font-black transition-all bg-white/80 backdrop-blur-sm md:bg-transparent",
                            isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "border-2 border-slate-100 hover:border-green-600 hover:text-green-600"
                        )}
                    >
                        {isEditing ? 'Kaydet' : 'Düzenle'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-3 sm:px-4">
                {/* Left Column - Stats */}
                <div className="space-y-4 sm:space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                            <CardTitle className="text-base sm:text-lg font-bold">İstatistikler</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 px-4 sm:px-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Tamamlanan</p>
                                    <p className="text-base sm:text-xl font-black text-slate-900">12 Antrenman</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Rozetler</p>
                                    <p className="text-base sm:text-xl font-black text-slate-900">4 Kazanıldı</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Puan</p>
                                    <p className="text-base sm:text-xl font-black text-slate-900">2,450 XP</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                </div>

                {/* Right Column - Form */}
                <div className="md:col-span-2 space-y-4 sm:space-y-6">
                    <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Kişisel Bilgiler</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Profil bilgilerini buradan güncelleyebilirsin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="name" className="text-xs sm:text-sm">Ad Soyad</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            readOnly={!isEditing}
                                            className="pl-8 sm:pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm h-9 sm:h-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="username" className="text-xs sm:text-sm">E-posta</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 sm:top-3 text-slate-400 text-xs sm:text-sm">@</span>
                                        <Input
                                            id="email"
                                            defaultValue={user.email}
                                            readOnly={true}
                                            className="pl-7 bg-slate-50 border-slate-200 focus:bg-white transition-colors opacity-70 text-sm h-9 sm:h-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="sports" className="text-xs sm:text-sm">İlgilendiği Sporlar</Label>
                                    <div className="relative">
                                        <Dumbbell className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                        <Input
                                            id="sports"
                                            value={formData.sports}
                                            onChange={(e) => setFormData({ ...formData, sports: e.target.value })}
                                            readOnly={!isEditing}
                                            className="pl-8 sm:pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm h-9 sm:h-10"
                                            placeholder="Örn: Fitness, Basketbol..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="bio" className="text-xs sm:text-sm">Hakkımda</Label>
                                <textarea
                                    id="bio"
                                    rows={3}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all resize-none"
                                    readOnly={!isEditing}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-2 pt-2 sm:pt-4">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-xs sm:text-sm h-8 sm:h-10">İptal</Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm h-8 sm:h-10"
                                        onClick={handleSave}
                                    >
                                        Değişiklikleri Kaydet
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
