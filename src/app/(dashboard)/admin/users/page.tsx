'use client';

import { useEffect, useState } from 'react';
import { supabaseDataService } from '@/lib/supabase-service'; // Fixed import
import {
    Users,
    Search,
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    Shield,
    ShieldOff,
    Trash2,
    MoreVertical,
    GraduationCap,
    Dumbbell,
    Ban,
    CheckCircle,
    MessageCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn, getInitials } from '@/lib/utils';
import Link from 'next/link';

interface UserWithBan {
    id: string;
    email: string;
    full_name: string | null;
    role: 'coach' | 'student' | 'admin';
    phone: string | null;
    created_at: string;
    is_banned?: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithBan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'coach' | 'student'>('all');
    const [selectedUser, setSelectedUser] = useState<UserWithBan | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        const data = await supabaseDataService.getAllUsers();
        // Filter out admin users - only show coaches and students
        // Need to cast to compatible type or ensure getAllUsers returns compatible generic
        setUsers(data.filter((u: any) => u.role !== 'admin') as unknown as UserWithBan[]);
        setIsLoading(false);
    };

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        setActionLoading(true);
        if (isBanned) {
            await supabaseDataService.unbanUser(userId);
        } else {
            await supabaseDataService.banUser(userId);
        }
        await loadUsers();
        setActionLoading(false);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        await supabaseDataService.deleteUser(selectedUser.id);
        await loadUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
        setActionLoading(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone?.includes(searchTerm) || false);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        coaches: users.filter(u => u.role === 'coach').length,
        students: users.filter(u => u.role === 'student').length,
        banned: users.filter(u => u.is_banned).length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/admin" className="inline-flex items-center text-slate-400 hover:text-slate-950 font-black text-xs uppercase tracking-widest transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Geri Dön
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter italic leading-none uppercase">
                        TÜM <span className="text-slate-300">KULLANICILAR</span>
                    </h1>
                    <p className="text-slate-500 font-bold max-w-xl">Sistemdeki tüm eğitmen ve öğrencileri yönet, banla veya sil.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative">
                        <Input
                            placeholder="İsim, e-posta veya telefon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-16 pl-14 rounded-[2rem] border-2 border-slate-100 focus:border-blue-500 bg-white shadow-xl shadow-slate-200/20"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-[2rem] flex flex-col justify-between h-32 relative overflow-hidden group">
                    <Users className="absolute top-4 right-4 w-10 h-10 text-white/10" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam</div>
                    <div className="text-4xl font-black italic">{stats.total}</div>
                </div>
                <button onClick={() => setRoleFilter(roleFilter === 'coach' ? 'all' : 'coach')} className={cn(
                    "p-6 rounded-[2rem] flex flex-col justify-between h-32 relative overflow-hidden group text-left transition-all",
                    roleFilter === 'coach' ? "bg-blue-600 text-white ring-4 ring-blue-300" : "bg-blue-100 text-blue-900"
                )}>
                    <Dumbbell className={cn("absolute top-4 right-4 w-10 h-10", roleFilter === 'coach' ? "text-white/20" : "text-blue-200")} />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Eğitmenler</div>
                    <div className="text-4xl font-black italic">{stats.coaches}</div>
                </button>
                <button onClick={() => setRoleFilter(roleFilter === 'student' ? 'all' : 'student')} className={cn(
                    "p-6 rounded-[2rem] flex flex-col justify-between h-32 relative overflow-hidden group text-left transition-all",
                    roleFilter === 'student' ? "bg-emerald-600 text-white ring-4 ring-emerald-300" : "bg-emerald-100 text-emerald-900"
                )}>
                    <GraduationCap className={cn("absolute top-4 right-4 w-10 h-10", roleFilter === 'student' ? "text-white/20" : "text-emerald-200")} />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Öğrenciler</div>
                    <div className="text-4xl font-black italic">{stats.students}</div>
                </button>
                <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-6 rounded-[2rem] flex flex-col justify-between h-32 relative overflow-hidden group">
                    <Ban className="absolute top-4 right-4 w-10 h-10 text-white/10" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Banlı</div>
                    <div className="text-4xl font-black italic">{stats.banned}</div>
                </div>
            </div>

            {/* Users Table */}
            <Card className="rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80 border-b-2 border-slate-100">
                            <tr>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kullanıcı</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">İletişim</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kayıt Tarihi</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum</th>
                                <th className="text-center px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={cn(
                                    "hover:bg-slate-50/50 transition-colors",
                                    user.is_banned && "bg-rose-50/30"
                                )}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-inner",
                                                user.is_banned ? "bg-rose-100 text-rose-600" :
                                                    user.role === 'coach' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                                            )}>
                                                {getInitials(user.full_name || user.email)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-slate-900 uppercase tracking-tight truncate">{user.full_name || 'İsimsiz'}</span>
                                                <span className="text-xs font-bold text-slate-400 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                {user.phone || '-'}
                                            </div>
                                            {user.phone && (
                                                <a
                                                    href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-black text-green-600 hover:text-green-700 uppercase"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                            user.role === 'coach' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {user.role === 'coach' ? 'Eğitmen' : 'Öğrenci'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {user.is_banned ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                                                <Ban className="w-3 h-3" />
                                                Banlı
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                                                <CheckCircle className="w-3 h-3" />
                                                Aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleBanUser(user.id, !!user.is_banned)}
                                                disabled={actionLoading}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl",
                                                    user.is_banned ? "hover:bg-emerald-100 text-emerald-600" : "hover:bg-amber-100 text-amber-600"
                                                )}
                                            >
                                                {user.is_banned ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                className="px-6 rounded-xl bg-green-600 hover:bg-green-700 font-bold transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center">
                                        <div className="text-slate-400 font-bold">Kullanıcı bulunamadı</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                title="Kullanıcıyı Sil"
                size="sm"
            >
                <div className="py-6 text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-rose-600" />
                    </div>
                    <p className="text-slate-600 font-bold mb-2">
                        <strong className="text-slate-900">{selectedUser?.full_name}</strong> adlı kullanıcıyı silmek istediğinize emin misiniz?
                    </p>
                    <p className="text-sm text-slate-400">Bu işlem geri alınamaz.</p>

                    <div className="flex gap-4 mt-8">
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                            className="h-12 rounded-2xl"
                        >
                            İptal
                        </Button>
                        <Button
                            fullWidth
                            onClick={handleDeleteUser}
                            isLoading={actionLoading}
                            className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
