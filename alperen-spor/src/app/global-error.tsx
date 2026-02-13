import React from 'react';

const GlobalError: React.FC<{ error: Error }> = ({ error }) => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Something went wrong</h1>
            <p>{error.message}</p>
            <p>Please try again later.</p>
        </div>
    );
};

export default GlobalError;