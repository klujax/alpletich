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

        const supabase = getSupabase() as any;

        const { data, error } = await supabase
            .from('reviews')
            .insert(dbReview)
            .select()
            .single();

        if (error) throw error;

        // Proactively update shop average rating and review count
        if (review.shopId) {
            const { data: allShopReviews } = await supabase
                .from('reviews')
                .select('rating')
                .eq('shop_id', review.shopId);

            if (allShopReviews && allShopReviews.length > 0) {
                const totalRating = allShopReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
                const avgRating = totalRating / allShopReviews.length;
                
                await supabase
                    .from('gym_stores')
                    .update({ 
                        rating: parseFloat(avgRating.toFixed(1)),
                        review_count: allShopReviews.length
                    })
                    .eq('id', review.shopId);
            }
        }

        // Also update package rating if packageId exists
        if (review.packageId) {
            const { data: allPkgReviews } = await supabase
                .from('reviews')
                .select('rating')
                .eq('package_id', review.packageId);

            if (allPkgReviews && allPkgReviews.length > 0) {
                const totalRating = allPkgReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
                const avgRating = totalRating / allPkgReviews.length;
                
                await supabase
                    .from('sales_packages')
                    .update({ 
                        rating: parseFloat(avgRating.toFixed(1)),
                        review_count: allPkgReviews.length
                    })
                    .eq('id', review.packageId);
            }
        }

        return toCamels(data);
    },
};
