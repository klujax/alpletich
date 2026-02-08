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
        <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 border-b bg-white/80 backdrop-blur-md border-slate-200 mb-2 lg:rounded-2xl lg:mb-4 lg:mt-2 lg:mx-auto lg:max-w-7xl lg:top-4 transition-all">
            {/* Left Side: Search Bar & Quick Actions */}
            <div className="flex flex-1 items-center gap-4">
                <div className="relative hidden md:block w-full max-w-2xl">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Koç, program veya branş ara..."
                        className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-full text-sm w-full"
                    />
                </div>

                {/* Quick Link to Marketplace/Store */}
                {user.role === 'student' && (
                    <Link href="/marketplace" className="ml-auto">
                        <Button size="sm" variant="ghost" className="hidden md:flex text-slate-600 hover:text-green-600 hover:bg-green-50 font-bold">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Pazaryeri
                        </Button>
                    </Link>
                )}
                {user.role === 'coach' && (
                    <Link href="/marketplace" className="ml-auto">
                        <Button size="sm" variant="ghost" className="hidden md:flex text-slate-600 hover:text-green-600 hover:hover:bg-green-50 font-bold">
                            <Store className="w-4 h-4 mr-2" />
                            Dükkanım
                        </Button>
                    </Link>
                )}
            </div>

            {/* Right Side: Panel Name, User Actions */}
            <div className="flex items-center gap-4">



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
                    <DropdownMenuContent className="w-56" align="end">
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
                        {/* Marketplace Link also in dropdown for mobile access primarily */}
                        <DropdownMenuItem onClick={() => router.push('/marketplace')} className="cursor-pointer md:hidden">
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
