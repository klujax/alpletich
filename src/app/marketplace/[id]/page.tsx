'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ShieldCheck, ChevronLeft, ShoppingCart, Plus, Minus } from 'lucide-react';

// Mock Data (In a real app, fetch from Supabase based on ID)
const COACH_DETAILS = {
    id: '1',
    name: 'Ahmet Yılmaz',
    title: 'Elite Fitness Koçu',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    rating: 9.8,
    reviewCount: 124,
    location: 'İstanbul / Kadıköy',
    responseTime: '15 dk içinde',
    description: '10 yıllık tecrübem ile hedeflerinize ulaşmanızda size rehberlik ediyorum. Vücut geliştirme ve fonksiyonel antrenman konusunda uzmanım.',
    tags: ['Vücut Geliştirme', 'Kilo Verme', 'Powerlifting'],
    products: [
        {
            id: 'p1',
            name: '4 Haftalık Başlangıç Paketi',
            description: 'Spora yeni başlayanlar için temel antrenman ve beslenme programı.',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
            popular: true,
        },
        {
            id: 'p2',
            name: '8 Haftalık Değişim Programı',
            description: 'Ciddi sonuçlar almak isteyenler için yoğun antrenman planı.',
            price: 2800,
            image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
            popular: false,
        },
        {
            id: 'p3',
            name: 'Online Koçluk (Aylık)',
            description: 'Haftalık görüşmeler ve 7/24 WhatsApp desteği ile birebir koçluk.',
            price: 3500,
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
            popular: false,
        },
    ]
};

export default function CoachShopPage() {
    const params = useParams();
    const [cart, setCart] = useState<{ [key: string]: number }>({});

    const addToCart = (productId: string) => {
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const newCount = (prev[productId] || 0) - 1;
            if (newCount <= 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newCount };
        });
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((total, [id, count]) => {
        const product = COACH_DETAILS.products.find(p => p.id === id);
        return total + (product ? product.price * count : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Image */}
            <div className="relative h-48 md:h-64 bg-slate-900">
                <Image
                    src={COACH_DETAILS.coverImage}
                    alt="Cover"
                    fill
                    className="object-cover opacity-60"
                />
                <Link href="/marketplace" className="absolute top-4 left-4 z-10">
                    <Button variant="secondary" size="sm" className="rounded-full bg-white/20 backdrop-blur-md text-white border-none hover:bg-white/30">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Geri Dön
                    </Button>
                </Link>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10">
                {/* Coach Info Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                                <Image src={COACH_DETAILS.image} alt={COACH_DETAILS.name} fill className="object-cover" />
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                                Müsait
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900">{COACH_DETAILS.name}</h1>
                                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                                    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    <span className="font-bold text-orange-700">{COACH_DETAILS.rating}</span>
                                    <span className="text-orange-400 text-sm">({COACH_DETAILS.reviewCount} Değerlendirme)</span>
                                </div>
                            </div>

                            <p className="text-slate-500 font-medium mb-4">{COACH_DETAILS.title}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {COACH_DETAILS.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Cevap süresi: <span className="text-green-600 font-bold">{COACH_DETAILS.responseTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    Doğrulanmış Koç
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed max-w-2xl">
                                {COACH_DETAILS.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {COACH_DETAILS.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Menu / Products Section */}
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-green-500 rounded-full block"></span>
                    Paketler ve Programlar
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COACH_DETAILS.products.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                            <div className="h-48 relative bg-slate-100">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                {product.popular && (
                                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-lg shadow-sm">
                                        EN ÇOK TERCİH EDİLEN
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{product.name}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between mt-4 md:mt-6">
                                    <span className="text-xl font-black text-green-600">₺{product.price}</span>

                                    {cart[product.id] ? (
                                        <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                                            <button
                                                onClick={() => removeFromCart(product.id)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-red-500 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-slate-900 w-4 text-center">{cart[product.id]}</span>
                                            <button
                                                onClick={() => addToCart(product.id)}
                                                className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-lg shadow-sm text-white hover:bg-green-600 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => addToCart(product.id)}
                                            size="sm"
                                            className="px-6 rounded-xl bg-slate-900 hover:bg-green-600 font-bold transition-colors"
                                        >
                                            Sepete Ekle
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Cart Button (Mobile/Web) */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center relative">
                                <ShoppingCart className="w-6 h-6 text-green-400" />
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Toplam Tutar</span>
                                <span className="text-xl font-black">₺{totalPrice}</span>
                            </div>
                        </div>
                        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl px-6 h-12">
                            Sepeti Onayla
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
