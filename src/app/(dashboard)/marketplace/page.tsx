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
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="w-full pt-2 mb-4">
                <MotivationQuote />
            </div>
            {/* Header / Search Section */}
            {/* Main Content */}
            <div className="w-full">

                {/* Section Title */}
                <h2 className="text-xl font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 p-1.5 rounded-lg"><Store className="w-5 h-5" /></span>
                    Popüler Dükkanlar
                </h2>

                {/* Coach Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
                    {filteredCoaches.map((coach) => (
                        <Link href={`/marketplace/${coach.id}`} key={coach.id} className="group">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-green-200 h-full flex flex-col">
                                {/* Cover Image / Header */}
                                <div className="h-40 relative bg-slate-100 shrink-0">
                                    <Image
                                        src={coach.image}
                                        alt={coach.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1">
                                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                        {coach.rating} <span className="text-slate-400 font-normal">({coach.reviewCount})</span>
                                    </div>
                                    {/* ... rest of card ... */}
                                    {coach.isOnline && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm animate-pulse-slow">
                                            Müsait
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors text-base line-clamp-1">{coach.name}</h3>
                                            <p className="text-xs text-slate-500 line-clamp-1">{coach.title}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm -mt-8 z-10 shrink-0">
                                            <span className="font-bold text-slate-700 text-xs">{coach.name.charAt(0)}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mb-3 mt-1">
                                        {coach.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer / Price */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400">Başlangıç</span>
                                            <span className="font-bold text-green-700 text-base">₺{coach.minPrice}</span>
                                        </div>
                                        <Button size="sm" className="h-7 text-xs rounded-lg px-3 bg-slate-900 text-white hover:bg-green-600 transition-colors">
                                            Dükkana Git
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Banners / Featured - Moved Bottom */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Yaz Kampanyası</h3>
                            <p className="mb-4 text-green-100">Seçili koçlarda %20 indirim fırsatı başladı.</p>
                            <Button variant="secondary" size="sm" className="text-green-700">Fırsatları Gör</Button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                            <TrendingUp className="w-40 h-40" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden hidden md:block">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Yeni Başlayanlar</h3>
                            <p className="mb-4 text-blue-100">Spora yeni başlayanlar için en iyi programlar.</p>
                            <Button variant="secondary" size="sm" className="text-blue-700">Keşfet</Button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                            <Star className="w-40 h-40" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
