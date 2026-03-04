import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
            <h2 className="text-4xl font-black text-slate-900 mb-4">404</h2>
            <p className="text-slate-500 font-medium mb-8">Aradığınız sayfa bulunamadı.</p>
            <Link href="/">
                <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition">Ana Sayfa</button>
            </Link>
        </div>
    );
}
