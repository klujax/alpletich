export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
                <div className="w-full h-full absolute inset-0 pointer-events-none opacity-[0.03] noise" />
                <div className="w-full max-w-sm md:max-w-xs mx-auto">
                    {children}
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                © 2026 Tüm hakları saklıdır.
            </footer>
        </div>
    );
}
