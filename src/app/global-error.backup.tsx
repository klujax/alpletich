'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2>Bir şeyler yanlış gitti!</h2>
                    <p>{error?.message || 'Bilinmeyen bir hata oluştu.'}</p>
                    <button
                        onClick={() => reset()}
                        style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Tekrar Dene
                    </button>
                </div>
            </body>
        </html>
    );
}
