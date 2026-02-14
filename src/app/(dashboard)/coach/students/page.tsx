'use client';

import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { Purchase } from '@/lib/mock-service'; // Keep types from mock service
import { Profile } from '@/lib/types'; // Use proper Profile type
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function CoachStudentsPage() {
    const [students, setStudents] = useState<Profile[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (!user) return;

        // In a real app we would have a specific query for this
        // For now, get all purchases and filter for this coach, then get unique students
        const allPurchases = await dataService.getPurchases();
        const myPurchases = allPurchases.filter((p: Purchase) => p.coachId === user.id);
        const studentIds = Array.from(new Set(myPurchases.map(p => p.studentId)));

        // Fetch student profiles
        // We need a bulk fetch method or loop. Loop for now as num students is small
        // Ideally: dataService.getProfiles(studentIds)
        const studentProfiles: Profile[] = [];
        for (const id of studentIds) {
            const profile = await dataService.getProfile(id);
            if (profile) studentProfiles.push(profile);
        }

        setStudents(studentProfiles);
        setPurchases(myPurchases);
        setIsLoading(false);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Öğrencilerim</h1>
                    <p className="text-slate-500 font-medium">Paketlerini satın alan öğrencilerin</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text" placeholder="Öğrenci ara..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-medium text-sm"
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center py-16">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {searchQuery ? 'Öğrenci bulunamadı' : 'Henüz kayıtlı öğrencin yok'}
                    </h2>
                    <p className="text-slate-500">Paketlerini satışa sun, öğrenciler seni bulsun</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => {
                        const studentPurchases = purchases.filter(p => p.studentId === student.id);
                        const activePurchases = studentPurchases.filter(p => p.status === 'active');

                        return (
                            <Card key={student.id} className="border-slate-200 hover:shadow-xl transition-all overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-lg">
                                            {student.full_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg">{student.full_name}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {activePurchases.map(p => (
                                            <div key={p.id} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                📦 {p.packageName}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/chat?partner=${student.id}`} className="flex-1">
                                            <Button variant="outline" fullWidth className="border-slate-200 font-bold text-sm">
                                                <MessageCircle className="w-4 h-4 mr-2" /> Mesaj
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
