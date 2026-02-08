'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, Filter, MapPin, TrendingUp, DollarSign } from 'lucide-react';

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
            {/* Header / Search Section */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <span className="text-green-600">Alpletich</span> Pazaryeri
                        </h1>
                    </div>

                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Koç, branş veya program ara..."
                            className="pl-10 h-12 bg-slate-100 border-transparent focus:bg-white transition-all rounded-xl text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <Filter className="w-4 h-4 text-slate-500" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Categories / Filters Scroll */}
                <div className="container mx-auto px-4 pb-4 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2">
                        {['Tümü', 'Vücut Geliştirme', 'Yoga', 'Pilates', 'Crossfit', 'Kilo Verme', 'Beslenme'].map((cat) => (
                            <button key={cat} className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-medium text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">

                {/* Banners / Featured */}
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

                {/* Section Title */}
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Popüler Dükkanlar</h2>

                {/* Coach Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCoaches.map((coach) => (
                        <Link href={`/marketplace/${coach.id}`} key={coach.id} className="group">
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-green-200">
                                {/* Cover Image / Header */}
                                <div className="h-48 relative bg-slate-100">
                                    <Image
                                        src={coach.image}
                                        alt={coach.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                        {coach.rating} <span className="text-slate-400 font-normal">({coach.reviewCount})</span>
                                    </div>
                                    {coach.isOnline && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm animate-pulse-slow">
                                            Müsait
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors text-lg">{coach.name}</h3>
                                            <p className="text-sm text-slate-500">{coach.title}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm -mt-10 z-10">
                                            <span className="font-bold text-slate-700 text-sm">{coach.name.charAt(0)}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {coach.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer / Price */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Başlangıç</span>
                                            <span className="font-bold text-green-700 text-lg">₺{coach.minPrice}</span>
                                        </div>
                                        <Button size="sm" className="rounded-xl px-6 bg-slate-900 text-white hover:bg-green-600 transition-colors">
                                            Dükkana Git
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
