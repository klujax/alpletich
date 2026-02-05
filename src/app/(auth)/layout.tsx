import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Advanced Tech Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Base Noise Layer */}
                <div className="absolute inset-0 noise opacity-[0.03] mix-blend-overlay" />

                {/* Main Grid System */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#16a34a0a_1px,transparent_1px),linear-gradient(to_bottom,#16a34a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Secondary Dotted Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(#16a34a12_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

                {/* Dynamic Light Beams */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-[-100%] w-[100%] h-full bg-[linear-gradient(90deg,transparent_0%,rgba(22,163,74,0.02)_50%,transparent_100%)] animate-beam" />
                </div>

                {/* Premium Glowing Orbs */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/30 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/20 rounded-full blur-[100px] animate-pulse-slow [animation-delay:2s]" />
            </div>


            {/* Header */}
            <header className="relative z-20 p-6">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                        <Dumbbell className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-green-600 transition-colors">
                        ALPHLETICH
                    </span>
                </Link>
            </header>

            {/* Content */}
            <main className="relative z-10 flex items-start justify-center px-4 py-8 pb-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-slate-400">
                © 2026 Alphletich. Tüm hakları saklıdır.
            </footer>
        </div>
    );
}
