/**
 * Package Service — Satış paketleri + Spor kategorileri
 */

import { getSupabase } from '../supabase';
import type { SalesPackage } from '../types';

const DEFAULT_SPORTS = [
    { id: 'football', coachId: 'system', name: 'Futbol', icon: '⚽', description: 'Taktik, kondisyon, top kontrolü', color: 'green', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'basketball', coachId: 'system', name: 'Basketbol', icon: '🏀', description: 'Şut, dribling, kondisyon', color: 'orange', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'volleyball', coachId: 'system', name: 'Voleybol', icon: '🏐', description: 'Smaç, manşet, takım oyunu', color: 'pink', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'boxing', coachId: 'system', name: 'Boks', icon: '🥊', description: 'Yumruk teknikleri, savunma, kondisyon', color: 'red', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'kickboxing', coachId: 'system', name: 'Kick Boks', icon: '🦵', description: 'Tekme, yumruk kombinasyonları', color: 'orange', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'taekwondo', coachId: 'system', name: 'Tekvando', icon: '🥋', description: 'Yüksek tekme teknikleri, disiplin', color: 'blue', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'muaythai', coachId: 'system', name: 'Muay Thai', icon: '👊', description: 'Diz, dirsek, sert vuruşlar', color: 'red', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'mma', coachId: 'system', name: 'MMA', icon: '🤼', description: 'Karma dövüş sanatları', color: 'slate', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'wrestling', coachId: 'system', name: 'Güreş', icon: '🤼‍♂️', description: 'Grekoromen ve serbest stil', color: 'yellow', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'judo', coachId: 'system', name: 'Judo', icon: '🥋', description: 'Fırlatma, tutuş teknikleri', color: 'blue', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'karate', coachId: 'system', name: 'Karate', icon: '🥋', description: 'Kata, kumite, disiplin', color: 'red', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'tennis', coachId: 'system', name: 'Tenis', icon: '🎾', description: 'Servis, forehand, backhand', color: 'green', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'table_tennis', coachId: 'system', name: 'Masa Tenisi', icon: '🏓', description: 'Hız, refleks, spin', color: 'blue', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'badminton', coachId: 'system', name: 'Badminton', icon: '🏸', description: 'Çeviklik, hız, teknik', color: 'teal', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'swimming', coachId: 'system', name: 'Yüzme', icon: '🏊', description: 'Serbest, sırtüstü, kelebek', color: 'blue', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'fitness', coachId: 'system', name: 'Fitness', icon: '🏋️', description: 'Vücut geliştirme, güç, hipertrofi', color: 'slate', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'pilates', coachId: 'system', name: 'Pilates', icon: '🧘‍♀️', description: 'Core gücü, esneklik, duruş', color: 'pink', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'yoga', coachId: 'system', name: 'Yoga', icon: '🧘', description: 'Zihin-beden dengesi, esneklik', color: 'purple', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'crossfit', coachId: 'system', name: 'CrossFit', icon: '⛓️', description: 'Yüksek yoğunluklu fonksiyonel antrenman', color: 'slate', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'calisthenics', coachId: 'system', name: 'Kalistenik', icon: '🤸‍♂️', description: 'Vücut ağırlığı ile antrenman', color: 'orange', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'athletics', coachId: 'system', name: 'Atletizm', icon: '🏃', description: 'Koşu, atlama, atma branşları', color: 'yellow', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'running', coachId: 'system', name: 'Koşu', icon: '🏃‍♂️', description: 'Maraton, sprint, jogging', color: 'green', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cycling', coachId: 'system', name: 'Bisiklet', icon: '🚴', description: 'Yol, dağ bisikleti kondisyonu', color: 'sky', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'archery', coachId: 'system', name: 'Okçuluk', icon: '🏹', description: 'Odaklanma, isabet, teknik', color: 'amber', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'gymnastics', coachId: 'system', name: 'Cimnastik', icon: '🤸‍♀️', description: 'Esneklik, denge, güç', color: 'purple', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'dance', coachId: 'system', name: 'Dans', icon: '💃', description: 'Ritim, hareket, ifade', color: 'rose', isSystemDefault: true, createdAt: '2025-01-01T00:00:00Z' },
];

function mapPackageRow(d: any): SalesPackage {
    return {
        id: d.id,
        coachId: d.coach_id,
        shopId: d.shop_id,
        name: d.name,
        description: d.description || '',
        price: d.price,
        packageType: d.package_type,
        totalWeeks: d.total_weeks || 4,
        features: d.features || [],
        workoutPlan: d.workout_plan || undefined,
        nutritionPlan: d.nutrition_plan || undefined,
        isPublished: d.is_published || false,
        createdAt: d.created_at,
        accessDuration: d.access_duration || (d.total_weeks ? `${d.total_weeks} Hafta` : 'Süresiz'),
        sport: d.sport || 'Fitness',
        hasChatSupport: d.has_chat_support || false,
        hasGroupClass: d.has_group_class || false,
        maxStudents: d.max_students || 50,
        enrolledStudents: d.enrolled_students || 0,
        rating: d.rating || 0,
        reviewCount: d.review_count || 0,
        programContent: d.program_content || [],
    };
}

export const packageService = {
    // --- SPORTS ---
    async getSports(): Promise<any[]> {
        try {
            const { data, error } = await (getSupabase() as any)
                .from('sport_categories')
                .select('*')
                .order('name');

            if (!error && data && data.length > 0) {
                return data.map((s: any) => ({
                    id: s.id,
                    coachId: s.coach_id || 'system',
                    name: s.name,
                    icon: s.icon || '🏋️',
                    description: s.description || '',
                    color: s.color || 'slate',
                    isSystemDefault: s.is_system_default ?? true,
                    createdAt: s.created_at,
                }));
            }
        } catch {
            // Table might not exist
        }
        return DEFAULT_SPORTS;
    },

    async createSport(sport: any): Promise<any> {
        try {
            const dbSport = {
                name: sport.name,
                icon: sport.icon,
                description: sport.description,
                color: sport.color,
                coach_id: sport.coachId || null,
                is_system_default: false,
            };
            const { data, error } = await (getSupabase() as any)
                .from('sport_categories')
                .insert(dbSport)
                .select()
                .single();

            if (error) throw error;
            return {
                id: data.id,
                coachId: data.coach_id || '',
                name: data.name,
                icon: data.icon,
                description: data.description,
                color: data.color,
                isSystemDefault: data.is_system_default,
                createdAt: data.created_at,
            };
        } catch (err) {
            console.warn('Sport creation failed:', err);
            return {
                id: sport.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 5),
                ...sport,
                createdAt: new Date().toISOString(),
            };
        }
    },

    async deleteSport(sportId: string): Promise<boolean> {
        try {
            const { error } = await (getSupabase() as any)
                .from('sport_categories')
                .delete()
                .eq('id', sportId);
            return !error;
        } catch {
            console.warn('Sport deletion failed');
            return false;
        }
    },

    // --- PACKAGES ---
    async getPackages(coachId?: string): Promise<SalesPackage[]> {
        let query = (getSupabase() as any).from('sales_packages').select('*');
        if (coachId) query = query.eq('coach_id', coachId);

        const { data, error } = await query;
        if (error) {
            console.warn('getPackages error:', error.message);
            return [];
        }
        return data.map(mapPackageRow);
    },

    async createPackage(pkg: Omit<SalesPackage, 'id' | 'createdAt'>) {
        const dbPkg = {
            shop_id: pkg.shopId,
            coach_id: pkg.coachId,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            package_type: pkg.packageType,
            total_weeks: pkg.totalWeeks,
            features: pkg.features,
            workout_plan: pkg.workoutPlan,
            nutrition_plan: pkg.nutritionPlan,
            is_published: pkg.isPublished,
        };
        const { data, error } = await (getSupabase() as any)
            .from('sales_packages')
            .insert(dbPkg)
            .select()
            .single();

        if (error) throw error;
        return { ...pkg, id: data.id, createdAt: data.created_at } as SalesPackage;
    },

    async updatePackage(pkg: Partial<SalesPackage>) {
        const dbPkg: any = {};
        if (pkg.shopId !== undefined) dbPkg.shop_id = pkg.shopId;
        if (pkg.coachId !== undefined) dbPkg.coach_id = pkg.coachId;
        if (pkg.name !== undefined) dbPkg.name = pkg.name;
        if (pkg.description !== undefined) dbPkg.description = pkg.description;
        if (pkg.price !== undefined) dbPkg.price = pkg.price;
        if (pkg.packageType !== undefined) dbPkg.package_type = pkg.packageType;
        if (pkg.totalWeeks !== undefined) dbPkg.total_weeks = pkg.totalWeeks;
        if (pkg.features !== undefined) dbPkg.features = pkg.features;
        if (pkg.workoutPlan !== undefined) dbPkg.workout_plan = pkg.workoutPlan;
        if (pkg.nutritionPlan !== undefined) dbPkg.nutrition_plan = pkg.nutritionPlan;
        if (pkg.isPublished !== undefined) dbPkg.is_published = pkg.isPublished;

        const { data, error } = await (getSupabase() as any)
            .from('sales_packages')
            .update(dbPkg)
            .eq('id', pkg.id)
            .select()
            .single();

        if (error) throw error;
        return { ...pkg, id: data.id, createdAt: data.created_at } as SalesPackage;
    },

    async deletePackage(packageId: string) {
        const { error } = await (getSupabase() as any)
            .from('sales_packages')
            .delete()
            .eq('id', packageId);
        if (error) throw error;
        return true;
    },
};
