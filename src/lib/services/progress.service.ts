/**
 * Progress Service — İlerleme kayıtları
 */

import { getSupabase } from '../supabase';
import { toCamels, toSnakes } from './supabase-helpers';

export const progressService = {
    async getProgress(studentId: string): Promise<any[]> {
        const { data } = await (getSupabase() as any)
            .from('progress_entries')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: true });
        return toCamels(data || []);
    },

    async createProgress(entry: any) {
        const dbEntry = toSnakes(entry);
        const { data, error } = await (getSupabase() as any)
            .from('progress_entries')
            .insert(dbEntry)
            .select()
            .single();
        if (error) throw error;
        return toCamels(data);
    },
};
