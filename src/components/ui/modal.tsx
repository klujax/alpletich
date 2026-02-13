'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full h-full m-0 rounded-none'
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md'
}: ModalProps) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                setVisible(true);
            });
        } else {
            setVisible(false);
            timeout = setTimeout(() => {
                document.body.style.overflow = 'unset';
            }, 200); // Wait for transition
        }
        return () => {
            clearTimeout(timeout);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Modal Overlay/Backdrop */}
            <div
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200",
                    visible ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Modal Content Wrapper */}
            <div
                className={cn(
                    'relative w-full bg-white border border-slate-200 rounded-[2rem] shadow-2xl flex flex-col pointer-events-auto max-h-[90vh] z-10 overflow-hidden transition-all duration-200',
                    visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-5",
                    sizeClasses[size]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white rounded-t-2xl">
                        <div className="space-y-1">
                            {title && <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>}
                            {description && <p className="text-sm font-bold text-slate-500">{description}</p>}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <X className="w-5 h-5" />
                            <span className="sr-only">Kapat</span>
                        </Button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
