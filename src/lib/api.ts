/**
 * API Service - Frontend-facing API katmanı
 *
 * Tüm veriler Supabase backend'inden gelir.
 * Admin işlemleri server-side API route'lara taşınmıştır.
 */

import { getSupabase } from './supabase';
import {
    authService,
    profileService,
    packageService,
    storeService,
    purchaseService,
    classService,
    messageService,
    reviewService,
    storageService,
} from './services';
import type { Profile } from '@/types/database';
import type {
    SalesPackage,
    GymStore,
    Purchase,
    GroupClass,
    Review,
} from './types';

// =============================================
// AUTH SERVICE
// =============================================
export const authAPI = {
    signIn: async (email: string, password: string) => {
        const sb = getSupabase();
        const { data, error } = await sb.auth.signInWithPassword({ email, password });

        if (error) return { user: null, error: error.message };

        const { data: profile } = await sb
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return { user: profile, error: null };
    },

    signUp: async (email: string, password: string, role: string, fullName: string) => {
        const sb = getSupabase();
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role },
            },
        });

        if (error) return { user: null, error: error.message };
        return { user: data.user, error: null };
    },

    signOut: async () => {
        await getSupabase().auth.signOut();
    },

    getUser: async (): Promise<Profile | null> => {
        return authService.getUser();
    },

    updateProfile: async (userId: string, updates: Partial<Profile>) => {
        const result = await profileService.updateProfile(userId, updates);
        return { error: result.error?.message || null };
    },
};

// =============================================
// STUDENTS SERVICE
// =============================================
export const studentsAPI = {
    getStudents: async (): Promise<Profile[]> => {
        const sb = getSupabase() as any;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return [];

        try {
            const students = await purchaseService.getCoachStudents(user.id);
            if (students && students.length > 0) return students;
        } catch {
            // Fallback
        }

        const purchases = await purchaseService.getCoachPurchases(user.id);
        const studentIds = [...new Set(purchases.map((p: any) => p.studentId || p.userId))];

        const profiles: Profile[] = [];
        for (const id of studentIds) {
            if (id) {
                const profile = await profileService.getProfile(id);
                if (profile) profiles.push(profile);
            }
        }
        return profiles;
    },

    addStudent: async (fullName: string, email: string): Promise<Profile> => {
        const sb = getSupabase() as any;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error('Oturum açmanız gerekiyor.');

        const { data: existingProfile } = await sb
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (!existingProfile) {
            throw new Error('Bu e-posta adresine sahip bir kullanıcı bulunamadı.');
        }

        const { error: relationError } = await sb.from('coach_students').insert({
            coach_id: user.id,
            student_id: existingProfile.id,
            status: 'active',
        });

        if (relationError && !relationError.message?.includes('duplicate')) {
            throw new Error('Öğrenci eklenirken hata: ' + relationError.message);
        }

        return existingProfile as Profile;
    },

    getStudentById: async (studentId: string): Promise<Profile | null> => {
        return profileService.getProfile(studentId);
    },
};

// =============================================
// EXERCISES SERVICE
// =============================================
export const exercisesAPI = {
    getExercises: async () => {
        const sb = getSupabase();
        const { data } = await sb
            .from('exercises')
            .select('*, category:exercise_categories(*)')
            .order('name');
        return data || [];
    },

    createExercise: async (exercise: any) => {
        const sb = getSupabase();
        const { data } = await sb
            .from('exercises')
            .insert(exercise as any)
            .select()
            .single();
        return data;
    },
};

// =============================================
// NUTRITION SERVICE
// =============================================
export const nutritionAPI = {
    getNutritionPlans: async () => {
        const sb = getSupabase();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return [];

        const { data } = await sb
            .from('nutrition_plans')
            .select('*, student:profiles!student_id(*), meals(*)')
            .eq('coach_id', user.id)
            .order('created_at', { ascending: false });
        return data || [];
    },

    getStudentNutritionPlan: async (studentId: string) => {
        const sb = getSupabase();
        const { data } = await sb
            .from('nutrition_plans')
            .select('*, meals(*)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return data;
    },

    createNutritionPlan: async (plan: any) => {
        const sb = getSupabase();
        const { meals, ...planData } = plan;
        const { data: createdPlan, error } = await sb
            .from('nutrition_plans')
            .insert(planData)
            .select()
            .single();

        if (error) throw error;

        if (meals && meals.length > 0 && createdPlan) {
            const mealsWithPlanId = meals.map((meal: any, index: number) => ({
                ...meal,
                nutrition_plan_id: (createdPlan as any).id,
                order_index: index,
            }));
            await sb.from('meals').insert(mealsWithPlanId);
        }
        return createdPlan;
    },

    updateNutritionPlan: async (planId: string, updates: any) => {
        const sb = getSupabase();
        const { meals, ...planData } = updates;

        const { data, error } = await sb
            .from('nutrition_plans')
            // @ts-expect-error (type mismatch)
            .update(planData)
            .eq('id', planId)
            .select()
            .single();

        if (error) throw error;

        if (meals) {
            await sb.from('meals').delete().eq('nutrition_plan_id', planId);
            if (meals.length > 0) {
                const mealsWithPlanId = meals.map((meal: any, index: number) => ({
                    ...meal,
                    nutrition_plan_id: planId,
                    order_index: index,
                }));
                await sb.from('meals').insert(mealsWithPlanId);
            }
        }
        return data;
    },

    deleteNutritionPlan: async (planId: string): Promise<boolean> => {
        const sb = getSupabase();
        await sb.from('meals').delete().eq('nutrition_plan_id', planId);
        const { error } = await sb.from('nutrition_plans').delete().eq('id', planId);
        return !error;
    },
};

// =============================================
// PROGRESS SERVICE
// =============================================
export const progressAPI = {
    getProgressLogs: async (studentId: string) => {
        const sb = getSupabase();
        const { data } = await sb
            .from('progress_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('logged_at', { ascending: false });
        return data || [];
    },

    addProgressLog: async (studentId: string, log: any) => {
        const sb = getSupabase();
        const { data } = await sb
            .from('progress_logs')
            .insert({ student_id: studentId, ...log } as any)
            .select()
            .single();
        return data;
    },
};

// =============================================
// MESSAGES SERVICE
// =============================================
export const messagesAPI = {
    getMessages: (userId: string, partnerId: string) =>
        messageService.getMessages(userId, partnerId),
    sendMessage: (senderId: string, receiverId: string, content: string, imageUrl?: string) =>
        messageService.sendMessage(senderId, receiverId, content, imageUrl),
    getConversations: (userId: string) =>
        messageService.getConversations(userId),
    markAsRead: (userId: string, partnerId: string) =>
        messageService.markMessagesAsRead(userId, partnerId),
    subscribeToMessages: (callback: (payload: any) => void) =>
        messageService.subscribeToMessages(callback),
};

// =============================================
// PACKAGES/SPORTS SERVICE
// =============================================
export const packagesAPI = {
    getPackages: (coachId?: string) => packageService.getPackages(coachId),
    createPackage: (pkg: any) => packageService.createPackage(pkg),
    updatePackage: (pkg: any) => packageService.updatePackage(pkg),
    deletePackage: (packageId: string) => packageService.deletePackage(packageId),
    getSports: () => packageService.getSports(),
    addSport: (sport: any) => packageService.createSport(sport),
    deleteSport: (sportId: string) => packageService.deleteSport(sportId),
};

// =============================================
// STORES SERVICE
// =============================================
export const storesAPI = {
    getStores: () => storeService.getStores(),
    getStoreById: (storeId: string) => storeService.getStoreById(storeId),
    getStoreByCoachId: (coachId: string) => storeService.getCoachStore(coachId),
    getStoreByOwnerId: (ownerId: string) => storeService.getStoreByOwnerId(ownerId),
    createStore: (store: Partial<GymStore>) => storeService.createStore(store),
    updateStore: (store: Partial<GymStore>) => storeService.updateStore(store),
};

// =============================================
// PURCHASES SERVICE
// =============================================
export const purchasesAPI = {
    getPurchases: (userId?: string) => purchaseService.getPurchases(userId),
    purchasePackage: (userId: string, packageId: string) =>
        purchaseService.purchasePackage(userId, packageId),
    getCoachPurchases: (coachId: string) => purchaseService.getCoachPurchases(coachId),
};

// =============================================
// REVIEWS SERVICE
// =============================================
export const reviewsAPI = {
    getReviews: (shopId?: string, coachId?: string) => reviewService.getReviews(shopId, coachId),
    createReview: (review: Partial<Review>) => reviewService.createReview(review),
};

// =============================================
// GROUP CLASSES SERVICE
// =============================================
export const classesAPI = {
    getGroupClasses: (coachId?: string, shopId?: string) =>
        classService.getGroupClasses(coachId, shopId),
    createGroupClass: (cls: Partial<GroupClass>) => classService.createGroupClass(cls),
    enrollClass: (classId: string, userId: string) => classService.enrollClass(classId, userId),
};

// =============================================
// ADMIN SERVICE — Server-side API route'lar üzerinden
// =============================================
export const adminAPI = {
    getAllUsers: async () => {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },
    banUser: async (userId: string, reason?: string) => {
        const res = await fetch('/api/admin/users/ban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, reason }),
        });
        return res.ok;
    },
    unbanUser: async (userId: string) => {
        const res = await fetch('/api/admin/users/unban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        return res.ok;
    },
    deleteUser: async (userId: string) => {
        const res = await fetch('/api/admin/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        return res.ok;
    },
    getSystemStats: async () => {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },
    getStoreFinancials: async (storeId: string) => {
        const res = await fetch(`/api/admin/financials?storeId=${storeId}`);
        if (!res.ok) throw new Error('Failed to fetch financials');
        return res.json();
    },
};

// =============================================
// Unified API export
// =============================================
export const api = {
    auth: authAPI,
    students: studentsAPI,
    exercises: exercisesAPI,
    nutrition: nutritionAPI,
    progress: progressAPI,
    messages: messagesAPI,
    packages: packagesAPI,
    stores: storesAPI,
    purchases: purchasesAPI,
    reviews: reviewsAPI,
    classes: classesAPI,
    admin: adminAPI,
    isUsingSupabase: true,
};

export default api;
