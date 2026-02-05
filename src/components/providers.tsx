'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
        </ThemeProvider>
    );
}
