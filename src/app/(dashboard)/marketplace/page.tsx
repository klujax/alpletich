'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, Filter, MapPin, TrendingUp, DollarSign, Store } from 'lucide-react';

// Mock Data for Marketplace
const MOCK_COACHES = [
    {
        id: '1',
        name: 'Ahmet Yılmaz',
        title: 'Elite Fitness Koçu',
        rating: 9.8,
        reviewCount: 124,
        image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80',
        tags: ['Vücut Geliştirme', 'Kilo Verme', 'Uzaktan Koçluk'],
        minPrice: 1500,
        isOnline: true,
    },
    {
        id: '2',
        name: 'Ayşe Demir',
        title: 'Yoga & Pilates Eğitmeni',
        rating: 9.9,
        reviewCount: 89,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
        tags: ['Yoga', 'Pilates', 'Esneklik'],
        minPrice: 1200,
        isOnline: false,
    },
    {
        id: '3',
        name: 'Mehmet Öz',
        title: 'Crossfit Uzmanı',
        rating: 9.5,
        reviewCount: 56,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        tags: ['Crossfit', 'Kondisyon', 'Güç'],
        minPrice: 2000,
        isOnline: true,
    },
    {
        id: '4',
        name: 'Zeynep Kaya',
        title: 'Beslenme Uzmanı & Koç',
        rating: 9.7,
        reviewCount: 212,
        image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80',
        tags: ['Beslenme', 'Diyet', 'Yaşam Koçluğu'],
        minPrice: 1000,
        isOnline: true,
    },
];

import { MotivationQuote } from '@/components/dashboard/motivation-quote';

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Protect the route
    useEffect(() => {
        // Check for user session using the correct key
        const session = localStorage.getItem('alperen_spor_user');
        if (!session) {
            router.push('/register?role=student');
        }
    }, [router]);

    const filteredCoaches = MOCK_COACHES.filter(coach =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20 overflow-x-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full px-4 sm:px-6">
                {/* Motivation Section */}
                <div className="pt-2 mb-8">
                    <MotivationQuote />
                </div>

                {/* Main Content Area */}
                <div className="space-y-12">

                    {/* Banners / Featured Section - Top for high visibility but sleek */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#333] rounded-[2rem] p-8 text-white overflow-hidden shadow-2xl shadow-black/10 transition-transform active:scale-[0.98]">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-2">
                                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-green-500/30">
                                        Özel Teklif
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black mb-2 tracking-tight">Yaz Kampanyası</h3>
                                <p className="text-slate-400 mb-6 text-sm max-w-[200px] leading-relaxed font-medium">Seçili koçlarda %20 indirim fırsatını kaçırma.</p>
                                <div className="mt-auto">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white rounded-2xl px-8 font-bold border-none shadow-xl shadow-green-600/20 transition-all group-hover:px-10">
                                        Fırsatları Gör
                                    </Button>
                                </div>
                            </div>
                            <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 transform -rotate-12 transition-transform group-hover:scale-110" />
                        </div>

                        <div className="group relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2rem] p-8 text-white overflow-hidden shadow-2xl shadow-green-600/10 transition-transform active:scale-[0.98]">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-2">
                                    <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/30">
                                        Popüler
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black mb-2 tracking-tight">Yeni Başlayanlar</h3>
                                <p className="text-green-50/70 mb-6 text-sm max-w-[200px] leading-relaxed font-medium">Spora yeni başlayanlar için en etkili programlar.</p>
                                <div className="mt-auto">
                                    <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-slate-100 rounded-2xl px-8 font-bold border-none shadow-xl transition-all group-hover:px-10">
                                        Keşfet
                                    </Button>
                                </div>
                            </div>
                            <Star className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 transform rotate-12 transition-transform group-hover:scale-110" />
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                                    <Store className="w-5 h-5" />
                                </div>
                                Popüler Dükkanlar
                            </h2>
                            <p className="text-slate-500 font-medium text-sm ml-13">Türkiye'nin en iyi koçları ile hedefine ulaş.</p>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <Button variant="ghost" className="rounded-xl font-bold text-slate-600 hover:bg-slate-100">Tümünü Gör</Button>
                        </div>
                    </div>

                    {/* Coach Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {filteredCoaches.map((coach, index) => (
                            <Link href={`/marketplace/${coach.id}`} key={coach.id} className="group">
                                <div className="relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full hover:border-green-500/20">

                                    {/* Cover Image Area */}
                                    <div className="h-56 relative bg-slate-50 shrink-0 m-3 rounded-[2rem] overflow-hidden">
                                        <Image
                                            src={coach.image}
                                            alt={coach.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Floating Glass Badges */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <div className="bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[11px] font-black text-slate-800 shadow-xl border border-white/40 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                                {coach.rating} <span className="text-slate-500 font-bold opacity-60">({coach.reviewCount})</span>
                                            </div>
                                            {coach.isOnline && (
                                                <div className="bg-green-500/80 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-[10px] font-black shadow-xl border border-green-400/30 flex items-center gap-1.5 uppercase tracking-wider animate-pulse-slow">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                                    Aktif
                                                </div>
                                            )}
                                        </div>

                                        {/* Wishlist / Save Button (Aesthetic) */}
                                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white shadow-xl">
                                                <TrendingUp className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-0.5">
                                                <h3 className="font-black text-slate-950 group-hover:text-green-600 transition-colors text-xl leading-tight line-clamp-1">{coach.name}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{coach.title}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-[#fafafa] flex items-center justify-center border border-slate-100 shadow-inner shrink-0 group-hover:bg-green-50 transition-colors">
                                                <span className="font-black text-slate-400 text-lg group-hover:text-green-600">{coach.name.charAt(0)}</span>
                                            </div>
                                        </div>

                                        {/* Tags with Modern Style */}
                                        <div className="flex flex-wrap gap-2 mb-6 h-6 overflow-hidden">
                                            {coach.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-green-50 group-hover:text-green-600 transition-colors uppercase tracking-tight">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Footer Area - Wide & Clean */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başlangıç</span>
                                                <span className="font-black text-slate-950 text-2xl tracking-tighter italic">₺{coach.minPrice}</span>
                                            </div>
                                            <Button size="lg" className="bg-slate-900 text-white hover:bg-green-600 hover:scale-105 active:scale-95 transition-all rounded-2xl h-12 px-6 shadow-xl shadow-black/5 border-none font-black text-xs uppercase tracking-widest">
                                                Gör
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Subtle Gradient Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Bottom CTA / Spacer */}
                    <div className="py-20 text-center">
                        <div className="inline-block p-1 rounded-full bg-slate-100 mb-6">
                            <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-bold text-slate-600">Her hafta 10+ yeni koç katılıyor</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Kendine Uygun Koçu Bul</h2>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8 leading-relaxed">Uzman eğitmenler eşliğinde hayalindeki vücuda kavuşmak için hemen bir program seç.</p>
                        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-10 border-2 border-slate-200 font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                            Yardım Al
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


