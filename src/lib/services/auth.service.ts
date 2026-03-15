/**
 * Auth Service — Kimlik doğrulama işlemleri
 */

import { getSupabase } from '../supabase';
import type { Profile } from '@/types/database';

export const authService = {
    async signIn(email: string, password?: string) {
        const sb = getSupabase();
        if (password) {
            return await sb.auth.signInWithPassword({ email, password });
        }
        return await sb.auth.signInWithOtp({ email });
    },

    async signUp(email: string, password?: string, metadata?: Record<string, unknown>) {
        const sb = getSupabase();
        if (!password) throw new Error('Şifre gereklidir.');
        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined;

        return await sb.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: redirectUrl,
            },
        });
    },

    async signOut() {
        return await getSupabase().auth.signOut();
    },

    async getUser(): Promise<Profile | null> {
        try {
            const { data } = await getSupabase().auth.getUser();
            if (data.user) {
                const { data: profile } = await getSupabase()
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                if (profile) return profile as Profile;
            }
        } catch (err) {
            console.warn('Supabase getUser failed:', err);
        }
        return null;
    },

    async resendConfirmation(email: string) {
        const sb = getSupabase();
        return await sb.auth.resend({ type: 'signup', email });
    },
};
