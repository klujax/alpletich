'use client';

import { useEffect, useState, useRef } from 'react';
import { dataService } from '@/lib/mock-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Scale, Activity as ActivityIcon, Camera, ChevronRight, Calendar, Plus, X, Upload } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function ProgressPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [weight, setWeight] = useState('');
    const [fat, setFat] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await dataService.getProgressHistory();
        setLogs(data);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await dataService.addProgressLog({
                weight: parseFloat(weight),
                fat: fat ? parseFloat(fat) : undefined,
                photos: selectedImage ? [selectedImage] : []
            });

            toast.success('Gelişim kaydı başarıyla eklendi!');
            setIsModalOpen(false);
            resetForm();
            await loadData();
        } catch (error) {
            toast.error('Kayıt eklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setWeight('');
        setFat('');
        setSelectedImage(null);
    };

    const currentWeight = logs[logs.length - 1]?.weight;
    const startWeight = logs[0]?.weight;
    const weightChange = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Gelişim Yolculuğum</h1>
                    <p className="text-slate-700 font-bold">Değişimi izle, hedeflerine bir adım daha yaklaş.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-6 bg-green-700 text-white rounded-2xl font-black shadow-lg shadow-green-200 hover:bg-green-800 transition-all text-lg"
                >
                    <Camera className="w-5 h-5" />
                    Yeni Kayıt Ekle
                </Button>
            </header>

            {/* Özet Kartları */}
            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <Card hover className="border-slate-200 shadow-xl shadow-slate-200/40">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-green-100 rounded-2xl">
                                <Scale className="w-8 h-8 text-green-700" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Mevcut Kilo</p>
                                <div className="text-3xl font-black text-slate-950">{currentWeight || '-'} <span className="text-sm font-bold text-slate-500">kg</span></div>
                                <div className={`text-sm mt-1 font-black flex items-center ${Number(weightChange) <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    <TrendingUp className={`w-4 h-4 mr-1 ${Number(weightChange) <= 0 ? 'rotate-180' : ''}`} />
                                    {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg değişim
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card hover className="border-slate-200 shadow-xl shadow-slate-200/40">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-emerald-100 rounded-2xl">
                                <ActivityIcon className="w-8 h-8 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Yağ Oranı</p>
                                <div className="text-3xl font-black text-slate-950">%{logs[logs.length - 1]?.fat || '-'}</div>
                                <p className="text-xs text-slate-700 font-black mt-1">Son ölçüme göre stabil</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card hover className="border-slate-200 shadow-xl shadow-slate-200/40">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-emerald-100 rounded-2xl">
                                <Calendar className="w-8 h-8 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Aktif Günler</p>
                                <div className="text-3xl font-black text-slate-950">24 <span className="text-sm font-bold text-slate-500">Gün</span></div>
                                <p className="text-xs text-slate-700 font-black mt-1">Bu ay toplam</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Grafik Alanı */}
            <Card className="border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-xl font-black text-slate-900">Vücut Analizi</CardTitle>
                    <CardDescription className="text-slate-600 font-bold">Kilo ve yağ oranı değişiminin zamana göre dağılımı.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={logs} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={12}
                                    fontWeight={800}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#16a34a"
                                    fontSize={12}
                                    fontWeight={800}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    unit="kg"
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#10b981"
                                    fontSize={12}
                                    fontWeight={800}
                                    tickLine={false}
                                    axisLine={false}
                                    unit="%"
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontSize: '13px', fontWeight: '900' }}
                                />
                                <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontWeight: 'bold' }} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="weight"
                                    name="Kilo (kg)"
                                    stroke="#16a34a"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="fat"
                                    name="Yağ Oranı (%)"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorFat)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Geçmiş Tablosu */}
            <Card className="border-slate-200 shadow-xl shadow-slate-200/40">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="font-black text-slate-900">Ölçüm Geçmişi</CardTitle>
                    <CardDescription className="text-slate-600 font-bold">Tüm zamanların detaylı ölçüm verileri.</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[400px]">
                        <thead className="bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[11px] border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-5">Tarih</th>
                                <th className="px-6 py-5">Ağırlık</th>
                                <th className="px-6 py-5">Yağ Oranı</th>
                                <th className="px-6 py-5 text-right">Durum</th>
                                <th className="px-6 py-5 text-right">Fotoğraf</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {logs.slice().reverse().map((log, i) => {
                                const prevLog = logs[logs.length - 2 - i];
                                const change = prevLog ? (log.weight - prevLog.weight).toFixed(1) : 0;
                                return (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">{log.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{log.weight} <span className="text-slate-500">kg</span></td>
                                        <td className="px-6 py-4 font-bold text-slate-800">%{log.fat || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {Number(change) !== 0 ? (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${Number(change) > 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                    {Number(change) > 0 ? '+' : ''}{change} kg
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-bold">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {log.photos && log.photos.length > 0 && (
                                                <button
                                                    onClick={() => window.open(log.photos[0], '_blank')}
                                                    className="text-green-600 hover:text-green-700 font-bold underline"
                                                >
                                                    Görüntüle
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Yeni Kayıt Ekleme Modalı */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title="Yeni Gelişim Kaydı"
                size="md"
            >
                <form onSubmit={handleAddLog} className="space-y-6 pt-2">
                    <div className="space-y-4">
                        <Input
                            label="Kilo (kg)"
                            type="number"
                            step="0.1"
                            placeholder="Örn: 75.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            leftIcon={<Scale className="w-4 h-4" />}
                        />

                        <Input
                            label="Yağ Oranı (%) - Opsiyonel"
                            type="number"
                            step="0.1"
                            placeholder="Örn: 18.5"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                            leftIcon={<ActivityIcon className="w-4 h-4" />}
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Form Fotoğrafı</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />

                            {!selectedImage ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-green-100 group-hover:text-green-600 text-slate-400 transition-colors">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 group-hover:text-green-700">Fotoğraf Yükle</p>
                                    <p className="text-xs text-slate-400">Gelişimini görselleştir</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200">
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="flex-1 h-12"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl"
                            isLoading={isLoading}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Kaydı Ekle
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

