"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownContext = React.createContext<{ isOpen: boolean; setIsOpen: (v: boolean) => void }>({
    isOpen: false,
    setIsOpen: () => { }
});

// Simplified Dropdown using standard React state + absolute positioning
// Mimics the Radix API used in Topbar but simpler

interface DropdownMenuProps {
    children: React.ReactNode;
}
export function DropdownMenu({ children }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Provide context to children
    const contextValue = { isOpen, setIsOpen };

    return (
        <DropdownContext.Provider value={contextValue}>
            <div className="relative inline-block text-left" ref={containerRef}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export function DropdownMenuTrigger({ asChild, children, ...props }: any) {
    const { isOpen, setIsOpen } = React.useContext(DropdownContext);

    const child = React.Children.only(children) as React.ReactElement;

    return React.cloneElement(child, {
        onClick: (e: React.MouseEvent) => {
            child.props.onClick?.(e);
            setIsOpen(!isOpen);
        }
    });
}

export function DropdownMenuContent({ className, align = 'center', children, ...props }: any) {
    const { isOpen } = React.useContext(DropdownContext);
    if (!isOpen) return null;

    const alignClass = align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2';

    return (
        <div
            className={cn(
                "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                alignClass,
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function DropdownMenuItem({ className, children, onClick, ...props }: any) {
    const { setIsOpen } = React.useContext(DropdownContext);

    return (
        <div
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                setIsOpen(false);
            }}
            {...props}
        >
            {children}
        </div>
    )
}


export function DropdownMenuLabel({ className, ...props }: any) {
    return (
        <div
            className={cn("px-2 py-1.5 text-sm font-semibold", className)}
            {...props}
        />
    )
}

export function DropdownMenuSeparator({ className, ...props }: any) {
    return (
        <div
            className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
            {...props}
        />
    )
}
