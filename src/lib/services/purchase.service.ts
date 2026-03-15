/**
 * Purchase Service — Satın alma işlemleri
 */

import { getSupabase } from '../supabase';
import { toCamels } from './supabase-helpers';
import type { Purchase } from '../types';
import type { Profile } from '@/types/database';

export const purchaseService = {
    async getPurchases(userId?: string): Promise<Purchase[]> {
        let query = (getSupabase() as any)
            .from('purchases')
            .select(`*, package:sales_packages(*)`);

        if (userId) query = query.eq('user_id', userId);

        const { data, error } = await query;
        if (error) {
            console.warn('getPurchases error:', error.message);
            return [];
        }

        return data.map((p: any) => ({
            id: p.id,
            studentId: p.user_id,
            userId: p.user_id,
            coachId: p.package?.coach_id || '',
            shopId: p.shop_id,
            packageId: p.package_id,
            type: 'package' as const,
            packageName: p.package?.name || 'Unknown Package',
            price: p.amount_paid,
            amountPaid: p.amount_paid,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
            status: p.status,
            packageSnapshot: p.package_snapshot,
        }));
    },

    async purchasePackage(userId: string, packageId: string): Promise<Purchase> {
        const sb = getSupabase() as any;

        const { data: pkg } = await sb
            .from('sales_packages')
            .select('*')
            .eq('id', packageId)
            .single();
        if (!pkg) throw new Error('Package not found');

        let expiresAt = null;
        if (pkg.package_type === 'coaching' && pkg.total_weeks) {
            const date = new Date();
            date.setDate(date.getDate() + pkg.total_weeks * 7);
            expiresAt = date.toISOString();
        }

        const { data: purchase, error } = await sb
            .from('purchases')
            .insert({
                user_id: userId,
                package_id: packageId,
                shop_id: pkg.shop_id,
                amount_paid: pkg.price,
                status: 'active',
                purchased_at: new Date().toISOString(),
                expires_at: expiresAt,
                package_snapshot: pkg,
            } as any)
            .select()
            .single();

        if (error) throw error;

        return {
            ...toCamels(purchase),
            studentId: userId,
            coachId: pkg.coach_id,
            type: 'package',
            packageName: pkg.name,
        } as unknown as Purchase;
    },

    async getCoachPurchases(coachId: string): Promise<Purchase[]> {
        const { data, error } = await (getSupabase() as any)
            .from('purchases')
            .select(`*, package:sales_packages!inner(coach_id, name)`)
            .eq('package.coach_id', coachId);

        if (error || !data) return [];

        return data.map((p: any) => ({
            id: p.id,
            studentId: p.user_id,
            userId: p.user_id,
            coachId: p.package?.coach_id || coachId,
            shopId: p.shop_id,
            packageId: p.package_id,
            type: 'package' as const,
            packageName: p.package?.name || 'Unknown Package',
            price: p.amount_paid,
            amountPaid: p.amount_paid,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
            status: p.status,
            packageSnapshot: p.package_snapshot,
        }));
    },

    async getCoachStudents(coachId: string): Promise<Profile[]> {
        const { data } = await (getSupabase() as any)
            .from('coach_students')
            .select(`student:profiles(*)`)
            .eq('coach_id', coachId)
            .eq('status', 'active');

        return data ? data.map((d: any) => d.student) : [];
    },
};
