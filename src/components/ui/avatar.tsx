"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// import * as AvatarPrimitive from "@radix-ui/react-avatar" // SKIPPING RADIX FOR NOW

export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    if (!src) return null;
    return (
        <img
            src={src}
            alt={alt}
            className={cn("aspect-square h-full w-full", className)}
            {...props}
        />
    )
}

export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-slate-100",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
