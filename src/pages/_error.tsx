import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>{statusCode || 'Hata'}</h1>
            <p>
                {statusCode
                    ? `Sunucuda ${statusCode} hatası oluştu.`
                    : 'İstemcide bir hata oluştu.'}
            </p>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
