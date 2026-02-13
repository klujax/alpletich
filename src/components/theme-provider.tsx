'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
    isDark: false,
    mounted: false
});

function ThemeScript() {
    // Inline script to prevent flash of unstyled content
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        try {
                            var theme = localStorage.getItem('alphletich-theme');
                            if (theme === 'dark') {
                                document.documentElement.classList.add('dark');
                            } else {
                                document.documentElement.classList.remove('dark');
                            }
                        } catch (e) {}
                    })();
                `
            }}
        />
    );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Force light theme and disable dark mode
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('alphletich-theme', 'light');
    }, []);

    const value = useMemo(() => ({
        theme: 'light' as Theme,
        toggleTheme: () => { },
        isDark: false,
        mounted: true
    }), []);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    return context;
}
