/**
 * Profile Service — Profil CRUD işlemleri
 */

import { getSupabase } from '../supabase';
import type { Profile } from '@/types/database';

export const profileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await getSupabase()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) return null;
        return data as Profile;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        return await getSupabase()
            .from('profiles')
            .update(updates as any)
            .eq('id', userId);
    },

    async resetPassword(email: string) {
        return await getSupabase().auth.resetPasswordForEmail(email, {
            redirectTo: typeof window !== 'undefined'
                ? `${window.location.origin}/settings`
                : undefined,
        });
    },

    async setActiveProgram(userId: string, packageId: string) {
        const { error } = await getSupabase()
            .from('profiles')
            .update({ active_program_id: packageId } as any)
            .eq('id', userId);

        if (error) {
            console.error('Error setting active program:', error);
            await getSupabase().auth.updateUser({
                data: { active_program_id: packageId },
            });
        }
        return !error;
    },
};
