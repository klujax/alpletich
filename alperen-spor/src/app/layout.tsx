import React from 'react';
import { Providers } from '../components/providers';
import '../globals.css';

const Layout = ({ children }) => {
    return (
        <Providers>
            <html lang="en">
                <head>
                    <title>Your App Title</title>
                </head>
                <body>
                    <header>
                        <h1>Your App Header</h1>
                    </header>
                    <main>{children}</main>
                    <footer>
                        <p>Your App Footer</p>
                    </footer>
                </body>
            </html>
        </Providers>
    );
};

export default Layout;