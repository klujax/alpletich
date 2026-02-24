import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center px-6">
                <div className="mb-8">
                    <span className="text-8xl font-black text-slate-200">404</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                    Sayfa Bulunamadı
                </h1>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
