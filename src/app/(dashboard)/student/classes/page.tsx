'use client';

import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { GroupClass } from '@/lib/mock-service'; // Keep types 
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, Video, ChevronRight } from 'lucide-react';
import { Profile } from '@/lib/types';
import { Purchase } from '@/lib/mock-service';

export const dynamic = 'force-dynamic';

export default function StudentClassesPage() {
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [coaches, setCoaches] = useState<Record<string, Profile>>({});

    useEffect(() => {
        async function load() {
            const user = await authService.getUser();
            if (!user) return;

            // 1. Get my coaches from active purchases
            // Note: dataService.getPurchases() in Supabase implementation gets ALL purchases for now
            // We need to filter by studentId if RLS doesn't do it automatically (RLS usually does, but checking implementation is safer)
            const allPurchases = await dataService.getPurchases();
            const myPurchases = allPurchases.filter((p: Purchase) => p.studentId === user.id);

            const activePurchases = myPurchases.filter(p => p.status === 'active' && (!p.expiresAt || new Date(p.expiresAt) > new Date()));
            const myCoachIds = Array.from(new Set(activePurchases.map(p => p.coachId)));

            // 2. Get all classes
            const allClasses = await dataService.getGroupClasses();

            // 3. Filter classes:
            // - I am enrolled OR
            // - It is from one of my coaches (and scheduled/live) OR
            // - It is a system class
            const relevantClasses = allClasses.filter((c: GroupClass) =>
                (c.enrolledParticipants && c.enrolledParticipants.includes(user.id)) ||
                (myCoachIds.includes(c.coachId) && (c.status === 'scheduled' || c.status === 'live')) ||
                c.coachId === 'system'
            );

            // Sort by date descending (nearest first)
            relevantClasses.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

            // 4. Fetch coach profiles for these classes
            const coachIdsToFetch = Array.from(new Set(relevantClasses.map(c => c.coachId).filter(id => id !== 'system')));
            const coachMap: Record<string, Profile> = {};
            for (const id of coachIdsToFetch) {
                const profile = await dataService.getProfile(id);
                if (profile) coachMap[id] = profile;
            }

            setCoaches(coachMap);
            setClasses(relevantClasses);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const upcoming = classes.filter(c => c.status === 'scheduled');
    const past = classes.filter(c => c.status === 'completed');

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grup Derslerim</h1>
                <p className="text-slate-500 font-medium">Katıldığın ve yaklaşan canlı dersler</p>
            </div>

            {upcoming.length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Yaklaşan ({upcoming.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcoming.map(cls => {
                            const coach = coaches[cls.coachId];
                            return (
                                <Card key={cls.id} className="border-blue-100 hover:shadow-lg transition-all overflow-hidden">
                                    <div className="h-1.5 bg-blue-500" />
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-black text-slate-900 mb-1">{cls.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-3">Koç: {coach?.full_name || 'Bilinmiyor'}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="flex items-center gap-1 text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg">
                                                <Clock className="w-3.5 h-3.5" /> {cls.durationMinutes} dk
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg">
                                                <Users className="w-3.5 h-3.5" /> {cls.enrolledParticipants.length}/{cls.maxParticipants}
                                            </span>
                                        </div>

                                        {cls.meetingLink && (
                                            <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                                                <Button fullWidth className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                                    <Video className="w-4 h-4 mr-2" /> Canlı Yayına Bağlan
                                                </Button>
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-slate-400 mb-4">Geçmiş Dersler ({past.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {past.map(cls => (
                            <Card key={cls.id} className="border-slate-100 opacity-60">
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-slate-600">{cls.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(cls.scheduledAt).toLocaleDateString('tr-TR')} • {cls.durationMinutes} dk
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {classes.length === 0 && (
                <div className="text-center py-16">
                    <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Henüz planlanmış canlı ders yok</h2>
                    <p className="text-slate-500">Koçların yayın açtığında burada göreceksin</p>
                </div>
            )}
        </div>
    );
}
