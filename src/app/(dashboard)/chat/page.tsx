'use client';

import { useEffect, useState } from 'react';
import { CoachChat } from '@/components/dashboard/chat/coach-chat';
import { StudentChat } from '@/components/dashboard/chat/student-chat';
import { authService, Profile } from '@/lib/mock-service';

export default function ChatPage() {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    // Hide mobile bottom nav and layout padding when chat is open
    useEffect(() => {
        // Remove layout padding for full-screen chat on mobile
        const main = document.querySelector('main');
        if (main) {
            main.style.paddingBottom = '0';
        }
        // Hide mobile bottom nav
        const bottomNav = document.querySelector('.lg\\:hidden > .fixed.bottom-0') as HTMLElement;
        const bottomNavParent = bottomNav?.parentElement as HTMLElement;
        if (bottomNavParent) {
            bottomNavParent.style.display = 'none';
        }

        return () => {
            if (main) {
                main.style.paddingBottom = '';
            }
            if (bottomNavParent) {
                bottomNavParent.style.display = '';
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <div>Oturum açmanız gerekiyor.</div>;
    }

    return (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 lg:mt-0">
            {user.role === 'coach' ? <CoachChat /> : <StudentChat />}
        </div>
    );
}
