/**
 * Store Service — Mağaza (GymStore) işlemleri
 */

import { getSupabase } from '../supabase';
import { toCamels, toSnakes } from './supabase-helpers';
import type { GymStore } from '../types';

export const storeService = {
    async getStores(): Promise<GymStore[]> {
        const { data, error } = await getSupabase()
            .from('gym_stores')
            .select('*');

        if (error) {
            console.warn('Supabase getStores error:', error.message);
            return [];
        }
        return toCamels(data || []);
    },

    async getCoachStore(coachId: string): Promise<GymStore | undefined> {
        const { data, error } = await (getSupabase() as any)
            .from('gym_stores')
            .select('*')
            .eq('coach_id', coachId)
            .maybeSingle();

        if (error) console.warn('getCoachStore error:', error.message);
        return data ? toCamels(data) : undefined;
    },

    async getStoreById(storeId: string): Promise<GymStore | null> {
        const { data, error } = await (getSupabase() as any)
            .from('gym_stores')
            .select('*')
            .eq('id', storeId)
            .maybeSingle();

        if (error) console.warn('getStoreById error:', error.message);
        return data ? toCamels(data) : null;
    },

    async getStoreByOwnerId(ownerId: string): Promise<GymStore | null> {
        const { data } = await (getSupabase() as any)
            .from('gym_stores')
            .select('*')
            .eq('coach_id', ownerId)
            .maybeSingle();

        return data ? toCamels(data) : null;
    },

    async createStore(store: Partial<GymStore>) {
        const dbStore = toSnakes(store);
        delete (dbStore as any).id;
        const { data, error } = await (getSupabase() as any)
            .from('gym_stores')
            .insert(dbStore)
            .select()
            .single();

        if (error) throw error;
        return toCamels(data);
    },

    async updateStore(store: Partial<GymStore>) {
        const dbStore = toSnakes(store);
        const { id, ...updates } = dbStore as any;
        const { data, error } = await (getSupabase() as any)
            .from('gym_stores')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return toCamels(data);
    },
};
