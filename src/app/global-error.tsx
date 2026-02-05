'use client';

// Global error page renders outside the root layout
// so it must have its own html/body tags and cannot use any providers

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="tr">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Hata - Alphletich</title>
            </head>
            <body style={{ margin: 0, padding: 0 }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f1f5f9',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem'
                    }}>
                        <div style={{
                            fontSize: '6rem',
                            fontWeight: 900,
                            color: '#e2e8f0',
                            marginBottom: '1rem'
                        }}>
                            ⚠️
                        </div>
                        <h1 style={{
                            fontSize: '1.875rem',
                            color: '#1e293b',
                            marginBottom: '1rem',
                            fontWeight: 700
                        }}>
                            Bir şeyler yanlış gitti
                        </h1>
                        <p style={{
                            color: '#64748b',
                            marginBottom: '2rem',
                            maxWidth: '400px'
                        }}>
                            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                backgroundColor: '#16a34a',
                                color: 'white',
                                padding: '12px 32px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 600,
                                boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
