'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Bir Hata Oluştu!</h2>
            <p className="text-slate-500 mb-6">İsteğiniz işlenirken beklenmeyen bir hata oluştu.</p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-green-600 text-white rounded-xl shadow font-bold hover:bg-green-700 transition"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
