/**
 * Class Service — Grup dersleri
 */

import { getSupabase } from '../supabase';
import type { GroupClass } from '../types';

export const classService = {
    async getGroupClasses(coachId?: string, shopId?: string): Promise<GroupClass[]> {
        const sb = getSupabase() as any;
        let query = sb.from('group_classes').select('*').order('scheduled_at', { ascending: true });

        if (coachId) query = query.eq('coach_id', coachId);
        if (shopId) query = query.eq('shop_id', shopId);

        const { data, error } = await query;
        if (error) {
            console.warn('getGroupClasses error:', error.message);
            return [];
        }

        // Fetch enrollments
        const classIds = (data || []).map((c: any) => c.id);
        let enrollments: any[] = [];
        if (classIds.length > 0) {
            const { data: enrollData } = await sb
                .from('class_enrollments')
                .select('class_id, user_id')
                .in('class_id', classIds);
            enrollments = enrollData || [];
        }

        return (data || []).map((c: any) => {
            const classEnrollments = enrollments
                .filter((e: any) => e.class_id === c.id)
                .map((e: any) => e.user_id);

            return {
                id: c.id,
                coachId: c.coach_id,
                shopId: c.shop_id,
                packageId: c.package_id,
                title: c.title,
                description: c.description || '',
                sport: c.sport || '',
                scheduledAt: c.scheduled_at,
                durationMinutes: c.duration_minutes || 60,
                maxParticipants: c.max_participants || 20,
                enrolledParticipants: classEnrollments,
                meetingLink: c.meeting_link,
                status: c.status,
                price: c.price || 0,
                createdAt: c.created_at,
                recurrence: c.recurrence,
                recurrenceDays: c.recurrence_days,
                recurrenceTime: c.recurrence_time,
            } as GroupClass;
        });
    },

    async createGroupClass(cls: Partial<GroupClass>) {
        const { toSnakes } = await import('./supabase-helpers');
        const { toCamels } = await import('./supabase-helpers');
        const dbCls = toSnakes(cls);
        delete (dbCls as any).id;

        const { data, error } = await (getSupabase() as any)
            .from('group_classes')
            .insert(dbCls)
            .select()
            .single();

        if (error) throw error;
        return toCamels(data);
    },

    async enrollClass(classId: string, userId: string) {
        const { error } = await (getSupabase() as any)
            .from('class_enrollments')
            .insert({ class_id: classId, user_id: userId });
        if (error) throw error;
        return true;
    },
};
