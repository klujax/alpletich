'use client';

import { useEffect, useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';

const quotes = [
    "Asla pes etme. Bugünün zorluğu, yarının gücüdür.",
    "Her antrenman seni hedefine bir adım daha yaklaştırır.",
    "Zorluklar seni güçlendirmek içindir, yıkmak için değil.",
    "Bugün yaptıkların yarınki seni yaratır. En iyisini yap.",
    "Acı geçicidir, ama başarı ve gurur kalıcıdır.",
    "İnanmak, başarmanın yarısıdır. Kendine güven.",
    "Limitlerini zorla. Gelişim konfor alanının dışında başlar.",
    "Şampiyonlar salonlarda değil, içlerindeki tutkuyla doğar.",
    "Bahaneler kalori yakmaz. Harekete geç!",
    "Disiplin, ne istediğini şimdi ile en çok istediğin şey arasında seçim yapmaktır."
];

export function MotivationQuote() {
    const [quote, setQuote] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Select a random quote on mount (client-side only to avoid hydration mismatch)
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[randomIndex]);
        setIsVisible(true);
    }, []);

    if (!quote) return null;

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
        border border-primary/10 shadow-sm
        transition-all duration-700 ease-out transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
        >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse-slow"></div>

            <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="p-3 bg-background/50 backdrop-blur-md rounded-full border border-primary/20 shadow-sm shrink-0">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>

                <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground/80 text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                        Günün Motivasyonu
                    </h3>
                    <p className="text-lg md:text-xl font-medium text-foreground italic leading-relaxed">
                        "{quote}"
                    </p>
                </div>

                <div className="hidden sm:block opacity-20 transform rotate-12">
                    <Quote className="w-16 h-16 text-primary" />
                </div>
            </div>
        </div>
    );
}
