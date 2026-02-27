export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
                <div className="w-full h-full absolute inset-0 pointer-events-none opacity-[0.03] noise" />
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                    {/* Logo */}
                    <div className="flex justify-center mb-6 lg:mb-8">
                        <img src="/sp-logo.png" alt="SP Logo" className="h-16 sm:h-20 lg:h-24 w-auto object-contain" />
                    </div>
                    {/* Card wrapper for desktop */}
                    <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:border lg:border-slate-100 lg:p-10 lg:mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                © 2026 Sportaly. Tüm hakları saklıdır.
            </footer>
        </div>
    );
}
