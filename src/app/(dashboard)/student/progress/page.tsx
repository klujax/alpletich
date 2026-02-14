'use client';

import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { ProgressEntry } from '@/lib/types'; // Use types from lib/types
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function StudentProgressPage() {
    const [entries, setEntries] = useState<ProgressEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = await authService.getUser();
        if (user) {
            const data = await dataService.getProgress(user.id);
            setEntries(data || []);
        }
        setIsLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = await authService.getUser();
        if (!user) return;

        if (!weight) {
            toast.error('Kilo giriniz');
            return;
        }

        try {
            await dataService.createProgress({
                studentId: user.id,
                date,
                weight: Number(weight),
                bodyFat: bodyFat ? Number(bodyFat) : undefined,
            });
            toast.success('Gelişim kaydedildi! 💪');
            setWeight('');
            setBodyFat('');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Bir hata oluştu');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const chartData = entries.map(e => ({
        date: new Date(e.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        weight: e.weight,
        fat: e.bodyFat
    }));

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">İlerleme Takibi</h1>
                    <p className="text-slate-500 font-medium">Vücut ölçümlerini kaydet ve gelişimini gör.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="lg:col-span-1 border-slate-200 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Yeni Ölçüm Ekle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input
                                label="Tarih"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                            <Input
                                label="Kilo (kg)"
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="Örn: 75.5"
                            />
                            <Input
                                label="Yağ Oranı (%)"
                                type="number"
                                step="0.1"
                                value={bodyFat}
                                onChange={e => setBodyFat(e.target.value)}
                                placeholder="Örn: 15.2 (Opsiyonel)"
                            />
                            <Button fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold h-12">
                                Kaydet
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    {entries.length > 0 ? (
                        <>
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                        Kilo Grafiği
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#16a34a"
                                                strokeWidth={3}
                                                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Tarih</th>
                                            <th className="px-6 py-4">Kilo</th>
                                            <th className="px-6 py-4">Yağ Oranı</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[...entries].reverse().map((entry) => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    {new Date(entry.date).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 font-black text-slate-900">{entry.weight} kg</td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {entry.bodyFat ? `%${entry.bodyFat}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center p-6">
                            <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz veri yok</h3>
                            <p className="text-slate-500">İlk ölçümünü soldaki formdan ekle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
