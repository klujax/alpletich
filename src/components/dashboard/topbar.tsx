'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Package, ShoppingBag, Menu, Search, Store } from 'lucide-react';
import { authService } from '@/lib/mock-service';

export function DashboardTopbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
    }, []);

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/');
    };

    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 border-b bg-white/80 backdrop-blur-md border-slate-200 mb-6 lg:rounded-2xl lg:mb-8 lg:mt-2 lg:mx-auto lg:max-w-7xl lg:top-4 transition-all">
            {/* Left Side: Motivation or Search */}
            <div className="flex flex-1 items-center gap-4">
                {/* Motivation Text (Simplified) */}
                <div className="hidden lg:flex items-center text-sm font-medium text-slate-500 italic">
                    <span className="mr-2">💡</span>
                    <span>"Asla pes etme. Bugünün zorluğu, yarının gücüdür."</span>
                </div>
            </div>

            {/* Right Side: Search, Panel Name, User Actions */}
            <div className="flex items-center gap-4">

                {/* Search Bar */}
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Ara..."
                        className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-full text-sm"
                    />
                </div>

                {/* Panel Name */}
                <div className="hidden md:block font-bold text-slate-700 text-sm">
                    {user.role === 'coach' ? 'Koç Paneli' : 'Öğrenci Paneli'}
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-green-500/20">
                            <Avatar className="h-9 w-9 border border-slate-200">
                                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-slate-900">{user.full_name}</p>
                                <p className="text-xs leading-none text-slate-500 font-mono truncate">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(user.role === 'coach' ? '/coach/settings' : '/student/settings')} className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profilim</span>
                        </DropdownMenuItem>
                        {user.role === 'student' && (
                            <DropdownMenuItem onClick={() => router.push('/student/packages')} className="cursor-pointer">
                                <Package className="mr-2 h-4 w-4" />
                                <span className="flex-1">Paketlerim</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => router.push('/marketplace')} className="cursor-pointer">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>Pazaryeri</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(user.role === 'coach' ? '/coach/settings' : '/student/settings')} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Ayarlar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Çıkış Yap</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
