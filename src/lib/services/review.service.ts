/**
 * Review Service — Değerlendirmeler
 */

import { getSupabase } from '../supabase';
import { toCamels, toSnakes } from './supabase-helpers';
import type { Review } from '../types';

export const reviewService = {
    async getReviews(shopId?: string, coachId?: string): Promise<Review[]> {
        let query = (getSupabase() as any).from('reviews').select('*');
        if (shopId) query = query.eq('shop_id', shopId);
        if (coachId) query = query.eq('coach_id', coachId);

        const { data } = await query;
        return toCamels(data || []);
    },

    async createReview(review: Partial<Review>) {
        const dbReview = toSnakes(review);
        delete (dbReview as any).id;

        const { data, error } = await (getSupabase() as any)
            .from('reviews')
            .insert(dbReview)
            .select()
            .single();

        if (error) throw error;
        return toCamels(data);
    },
};
