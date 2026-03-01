'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center px-6">
                <div className="mb-8">
                    <span className="text-6xl font-black text-slate-200">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Bir hata oluştu
                </h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {error?.message || 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    );
}
