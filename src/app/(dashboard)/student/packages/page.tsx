'use client';

import { useEffect, useState } from 'react';
import { Package, Calendar, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { Purchase } from '@/lib/mock-service';

export const dynamic = 'force-dynamic';

export default function StudentPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const user = await authService.getUser();
            if (!user) return;

            // Get Purchases
            const allPurchases = await dataService.getPurchases();
            const myPurchases = allPurchases.filter((p: Purchase) => p.studentId === user.id);

            // Map to UI model
            const mappedPackages = await Promise.all(myPurchases.map(async (p: Purchase) => {
                let coachName = 'Bilinmiyor';
                if (p.coachId) {
                    const coach = await dataService.getProfile(p.coachId);
                    if (coach) coachName = coach.full_name || 'Bilinmiyor';
                }

                const isProgram = p.packageSnapshot?.packageType === 'program';

                return {
                    id: p.id,
                    name: p.packageName,
                    coachName: coachName,
                    type: isProgram ? 'program' : 'coaching',
                    startDate: new Date(p.purchasedAt).toLocaleDateString('tr-TR'),
                    endDate: p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz',
                    status: p.status,
                    progress: Math.floor(Math.random() * 100), // Placeholder progress
                    features: p.packageSnapshot?.features || [],
                    price: p.price
                };
            }));

            setPackages(mappedPackages);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paketlerim</h1>
                    <p className="text-slate-500 mt-1">Satın aldığın eğitim paketlerini ve aboneliklerini buradan yönetebilirsin.</p>
                </div>
                <Link href="/marketplace">
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Yeni Paket Al
                    </Button>
                </Link>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                    // Logic: Users want to access content even after expiration
                    const isActive = pkg.status === 'active';
                    const isProgram = pkg.type === 'program';
                    // We only highlight active items or lifetime programs with green
                    const isHighlighted = isActive || isProgram;

                    return (
                        <div
                            key={pkg.id}
                            className={`
                                relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
                                ${isHighlighted
                                    ? 'border-green-200 shadow-lg shadow-green-900/5 hover:shadow-xl hover:shadow-green-900/10 hover:-translate-y-1'
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
                                }
                            `}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                {pkg.status === 'active' ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                        Aktif
                                    </span>
                                ) : pkg.type === 'program' ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Satın Alındı
                                    </span>
                                ) : pkg.status === 'expired' ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                        Süresi Doldu
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                        Beklemede
                                    </span>
                                )}
                            </div>

                            <div className="p-6">
                                {/* Icon & Title */}
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Package className={`w-6 h-6 ${isHighlighted ? 'text-green-600' : 'text-slate-400'}`} />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    {pkg.coachName}
                                </p>

                                {/* Dates */}
                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex items-center text-slate-600 bg-slate-50 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        <span>Başlangıç: <span className="font-semibold">{pkg.startDate}</span></span>
                                    </div>
                                    {pkg.type !== 'program' && (
                                        <div className="flex items-center text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                            <span>Bitiş: <span className="font-semibold">{pkg.endDate}</span></span>
                                        </div>
                                    )}
                                    {pkg.type === 'program' && (
                                        <div className="flex items-center text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                            <span>Süre: <span className="font-semibold">Ömür Boyu</span></span>
                                        </div>
                                    )}
                                </div>

                                {/* Features List */}
                                <div className="space-y-2 mb-6">
                                    {pkg.features.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-start text-xs text-slate-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-500 shrink-0 mt-0.5" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Bar (if active) */}
                                {(pkg.status === 'active' || pkg.type === 'program') && (
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                                            <span className="text-slate-600">İlerleme</span>
                                            <span className="text-green-600">{pkg.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${pkg.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">₺{pkg.price}</span>
                                <Link href={`/student/workouts`}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={isHighlighted
                                            ? "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                                            : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                        }
                                    >
                                        Programı Görüntüle
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State Handled naturally by map if empty, but adding a placeholder card if no packages */}
                {packages.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Bir Paketin Yok</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">Hedeflerine ulaşmak için sana en uygun koçu bul ve hemen bir paket satın al.</p>
                        <Link href="/marketplace">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Paketleri İncele
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
