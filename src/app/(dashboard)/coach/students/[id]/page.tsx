'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Package, Calendar } from 'lucide-react';
import { dataService, authService, Purchase, MOCK_USERS } from '@/lib/mock-service';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function StudentDetailPage() {
    const params = useParams();
    const studentId = params.id as string;
    const [student, setStudent] = useState<any>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const user = authService.getUser();
            if (!user) return;

            const studentData = MOCK_USERS.find(u => u.id === studentId);
            setStudent(studentData);

            const allPurchases = await dataService.getPurchases(studentId);
            const myPurchases = allPurchases.filter((p: Purchase) => p.coachId === user.id);
            setPurchases(myPurchases);
            setIsLoading(false);
        }
        load();
    }, [studentId]);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!student) return (
        <div className="text-center py-16">
            <p className="text-slate-500 font-bold">Öğrenci bulunamadı</p>
            <Link href="/coach/students"><Button variant="outline" className="mt-4">Geri Dön</Button></Link>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <Link href="/coach/students" className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-sm gap-2 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Öğrencilerime Dön
            </Link>

            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-2xl">
                    {student.full_name?.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">{student.full_name}</h1>
                    <p className="text-slate-500 font-medium">{student.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-green-600" /> Satın Aldığı Paketler
                        </h2>
                        {purchases.length === 0 ? (
                            <p className="text-slate-400 text-sm">Bu öğrenci henüz paket satın almadı.</p>
                        ) : (
                            <div className="space-y-3">
                                {purchases.map(p => (
                                    <div key={p.id} className={`p-4 rounded-xl border ${p.status === 'active' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900">{p.packageName}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    <Calendar className="w-3 h-3 inline mr-1" />
                                                    {new Date(p.purchasedAt).toLocaleDateString('tr-TR')}
                                                    {p.expiresAt && ` → ${new Date(p.expiresAt).toLocaleDateString('tr-TR')}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-green-600">₺{p.price}</p>
                                                <span className={`text-[10px] font-bold uppercase ${p.status === 'active' ? 'text-green-500' : 'text-slate-400'}`}>
                                                    {p.status === 'active' ? 'Aktif' : 'Süresi doldu'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-black text-slate-900 mb-4">İletişim</h2>
                        <Link href={`/chat?partner=${studentId}`}>
                            <Button fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold">
                                <MessageCircle className="w-4 h-4 mr-2" /> Mesaj Gönder
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
