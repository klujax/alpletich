import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full h-full absolute inset-0 pointer-events-none opacity-[0.03] noise" />
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="p-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                © 2026 Tüm hakları saklıdır.
            </footer>
        </div>
    );
}
