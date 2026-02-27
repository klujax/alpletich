'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
    Plus, CalendarDays, Users, Clock, Video, Link2, CheckCircle, XCircle
} from 'lucide-react';
import { supabaseDataService as dataService, supabaseAuthService as authService } from '@/lib/supabase-service';
import { GroupClass, GymStore, SportCategory } from '@/lib/types';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function CoachClassesPage() {
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [store, setStore] = useState<GymStore | null>(null);
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', sport: '', date: '', time: '',
        durationMinutes: '60', maxParticipants: '20', meetingLink: '', price: '0',
        recurrence: false, recurrenceDays: [] as number[]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (!user) return;

        // Supabase implementation quirks: some methods might return promises directly, some might not match mock EXACTLY.
        // We will fetch stores and find the coach's store manually if getStoreByCoachId doesn't exist.

        const [cls, stores, sportsData] = await Promise.all([
            dataService.getGroupClasses(), // Supabase service usually returns all, need to filter by coachId
            dataService.getStores(),
            dataService.getSports(),
        ]);

        const myStore = stores.find(s => s.coachId === user.id) || null;
        const myClasses = cls.filter((c: GroupClass) => c.coachId === user.id);

        setClasses(myClasses);
        setStore(myStore);
        setSports(sportsData);
        setIsLoading(false);
    };

    const handleCreate = async () => {
        const user = await authService.getUser();
        if (!user || !store) { toast.error('Önce dükkanınızı açmalısınız'); return; }
        if (!form.title || !form.date || !form.time) { toast.error('Başlık, tarih ve saat gerekli'); return; }

        await dataService.createGroupClass({
            coachId: user.id,
            shopId: store.id,
            title: form.title,
            description: form.description,
            sport: form.sport,
            scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
            durationMinutes: Number(form.durationMinutes),
            maxParticipants: Number(form.maxParticipants),
            meetingLink: form.meetingLink,
            price: Number(form.price),
            recurrence: form.recurrence ? 'weekly' : 'none',
            recurrenceDays: form.recurrence ? form.recurrenceDays : [],
            recurrenceTime: form.time,
        });
        setIsModalOpen(false);
        setForm({
            title: '', description: '', sport: '', date: '', time: '',
            durationMinutes: '60', maxParticipants: '20', meetingLink: '', price: '0',
            recurrence: false, recurrenceDays: []
        });
        toast.success('Grup dersi oluşturuldu! 📅');
        loadData();
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
        live: 'bg-green-50 text-green-600 border-green-100',
        completed: 'bg-slate-50 text-slate-400 border-slate-100',
        cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const statusLabels: Record<string, string> = {
        scheduled: 'Planlandı', live: 'Canlı', completed: 'Tamamlandı', cancelled: 'İptal'
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grup Dersleri</h1>
                    <p className="text-slate-500 font-medium">Canlı grup derslerini planla ve yönet</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6">
                    <Plus className="w-5 h-5 mr-2" /> Yeni Ders Planla
                </Button>
            </div>

            {classes.length === 0 ? (
                <div className="text-center py-16">
                    <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Henüz grup dersi yok</h2>
                    <p className="text-slate-500 mb-6">Öğrencilerine canlı grup dersleri ver</p>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> İlk Dersini Planla
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {classes.map((cls) => (
                        <Card key={cls.id} className="border-slate-200 hover:shadow-lg transition-all overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusColors[cls.status]}`}>
                                            {statusLabels[cls.status]}
                                        </span>
                                        <h3 className="text-lg font-black text-slate-900 mt-2">{cls.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{cls.description}</p>
                                    </div>
                                    {cls.price > 0 && (
                                        <div className="text-xl font-black text-green-600">₺{cls.price}</div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        {new Date(cls.scheduledAt).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        <Clock className="w-3.5 h-3.5" />
                                        {cls.durationMinutes} dk
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        <Users className="w-3.5 h-3.5" />
                                        {(cls.enrolledParticipants?.length || 0)}/{cls.maxParticipants}
                                    </span>
                                </div>

                                {cls.meetingLink && cls.status === 'scheduled' && (
                                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" fullWidth className="border-green-200 text-green-600 hover:bg-green-50 font-bold">
                                            <Video className="w-4 h-4 mr-2" /> Canlı Derse Katıl
                                        </Button>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Class Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Grup Dersi Planla" size="lg">
                <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                    <Input label="Ders Başlığı *" placeholder="Örn: Basketbol Teknik Antrenmanı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tarih *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        <Input label="Saat *" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <Switch id="recurrence" checked={form.recurrence} onCheckedChange={(c: boolean) => setForm({ ...form, recurrence: c })} />
                        <Label htmlFor="recurrence" className="text-sm font-bold text-slate-900">Her hafta tekrarla</Label>
                    </div>

                    {form.recurrence && (
                        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tekrar Günleri</label>
                            <div className="flex flex-wrap gap-2">
                                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const newDays = form.recurrenceDays.includes(idx)
                                                ? form.recurrenceDays.filter(d => d !== idx)
                                                : [...form.recurrenceDays, idx].sort();
                                            setForm({ ...form, recurrenceDays: newDays });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.recurrenceDays.includes(idx)
                                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Süre (dk)" type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} />
                        <Input label="Max Katılımcı" type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} />
                        <Input label="Fiyat (₺)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Spor Branşı</label>
                        <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 font-medium">
                            <option value="">Seçiniz</option>
                            {sports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                        </select>
                    </div>

                    <Input label="Meeting Linki" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} />

                    <Button onClick={handleCreate} fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 mt-2">
                        Dersi Oluştur 📅
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
