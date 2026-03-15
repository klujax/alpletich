/**
 * API Service - Backend abstraction layer
 * 
 * Bu dosya tamamen Supabase backend'ini kullanır.
 * Mock-service bağımlılığı kaldırılmıştır.
 */

import { isSupabaseConfigured, getSupabase } from './supabase';
import { supabaseDataService, supabaseAuthService } from './supabase-service';
import {
    Profile,
    Exercise,
    ExerciseCategory,
    NutritionPlan,
    ProgressLog,
    UserRole
} from '@/types/database';
import {
    SalesPackage,
    SportCategory,
    GymStore,
    Purchase,
    GroupClass,
    Review,
    Message,
    Conversation,
    SystemStats,
} from './types';

// =============================================
// AUTH SERVICE
// =============================================
export const authAPI = {
    /**
     * Kullanıcı girişi
     */
    signIn: async (email: string, password: string) => {
        const sb = getSupabase();
        const { data, error } = await sb.auth.signInWithPassword({ email, password });

        if (error) return { user: null, error: error.message };

        const { data: profile } = await sb
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profile && typeof window !== 'undefined') {
            localStorage.setItem('sportaly_user', JSON.stringify(profile));
            document.cookie = `mock_role=${(profile as any).role}; path=/`;
        }

        return { user: profile, error: null };
    },

    /**
     * Kullanıcı kaydı
     */
    signUp: async (email: string, password: string, role: UserRole, fullName: string) => {
        const sb = getSupabase();
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });

        if (error) return { user: null, error: error.message };

        return { user: data.user, error: null };
    },

    /**
     * Çıkış yap
     */
    signOut: async () => {
        const sb = getSupabase();
        await sb.auth.signOut();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('sportaly_user');
            document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
    },

    /**
     * Mevcut kullanıcıyı getir
     */
    getUser: (): Profile | null => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sportaly_user');
            if (stored) return JSON.parse(stored);
        }
        return null;
    },

    /**
     * Profil güncelle
     */
    updateProfile: async (userId: string, updates: Partial<Profile>) => {
        const result = await supabaseDataService.updateProfile(userId, updates);

        if (!result.error && typeof window !== 'undefined') {
            const stored = localStorage.getItem('sportaly_user');
            if (stored) {
                const user = JSON.parse(stored);
                const updated = { ...user, ...updates };
                localStorage.setItem('sportaly_user', JSON.stringify(updated));
            }
        }

        return { error: result.error?.message || null };
    }
};

// =============================================
// STUDENTS SERVICE
// =============================================
export const studentsAPI = {
    /**
     * Koçun öğrencilerini getir
     */
    getStudents: async (): Promise<Profile[]> => {
        const sb = getSupabase() as any;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return [];

        // Try coach_students table first
        try {
            const students = await supabaseDataService.getCoachStudents(user.id);
            if (students && students.length > 0) return students;
        } catch {
            // Fallback: get students from purchases
        }

        // Fallback: Get students from active purchases
        const purchases = await supabaseDataService.getCoachPurchases(user.id);
        const studentIds = [...new Set(purchases.map((p: any) => p.studentId || p.userId))];
        
        const profiles: Profile[] = [];
        for (const id of studentIds) {
            if (id) {
                const profile = await supabaseDataService.getProfile(id);
                if (profile) profiles.push(profile);
            }
        }
        return profiles;
    },

    /**
     * Öğrenci ekle (koç-öğrenci ilişkisi oluştur)
     */
    addStudent: async (fullName: string, email: string): Promise<Profile> => {
        const sb = getSupabase() as any;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error('Oturum açmanız gerekiyor.');

        // Find or create student profile by email
        const { data: existingProfile } = await sb
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (!existingProfile) {
            throw new Error('Bu e-posta adresine sahip bir kullanıcı bulunamadı. Öğrencinin önce kayıt olması gerekiyor.');
        }

        // Create coach-student relationship
        const { error: relationError } = await sb.from('coach_students').insert({
            coach_id: user.id,
            student_id: existingProfile.id,
            status: 'active'
        });

        if (relationError && !relationError.message?.includes('duplicate')) {
            throw new Error('Öğrenci eklenirken bir hata oluştu: ' + relationError.message);
        }

        return existingProfile as Profile;
    },

    /**
     * Öğrenci detayını getir
     */
    getStudentById: async (studentId: string): Promise<Profile | null> => {
        return supabaseDataService.getProfile(studentId);
    }
};

// =============================================
// EXERCISES SERVICE
// =============================================
export const exercisesAPI = {
    /**
     * Egzersizleri getir
     */
    getExercises: async (): Promise<Exercise[]> => {
        const sb = getSupabase();
        const { data } = await sb
            .from('exercises')
            .select('*, category:exercise_categories(*)')
            .order('name');

        return data || [];
    },

    /**
     * Egzersiz oluştur
     */
    createExercise: async (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> => {
        const sb = getSupabase();
        const { data } = await sb
            .from('exercises')
            .insert(exercise as any)
            .select()
            .single();

        return (data || null) as unknown as Exercise;
    }
};

// =============================================
// NUTRITION SERVICE
// =============================================
export const nutritionAPI = {
    /**
     * Beslenme planlarını getir
     */
    getNutritionPlans: async (): Promise<NutritionPlan[]> => {
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

    /**
     * Öğrencinin beslenme planını getir
     */
    getStudentNutritionPlan: async (studentId: string): Promise<NutritionPlan | null> => {
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

    /**
     * Beslenme planı oluştur
     */
    createNutritionPlan: async (plan: any): Promise<NutritionPlan> => {
        const sb = getSupabase();
        const { meals, ...planData } = plan;

        const { data: createdPlan, error } = await sb
            .from('nutrition_plans')
            .insert(planData)
            .select()
            .single();

        if (error) throw error;

        // Insert meals if provided
        if (meals && meals.length > 0 && createdPlan) {
            const mealsWithPlanId = meals.map((meal: any, index: number) => ({
                ...meal,
                nutrition_plan_id: (createdPlan as any).id,
                order_index: index
            }));

            await sb.from('meals').insert(mealsWithPlanId);
        }

        return (createdPlan || null) as unknown as NutritionPlan;
    },

    /**
     * Beslenme planı güncelle
     */
    updateNutritionPlan: async (planId: string, updates: any): Promise<NutritionPlan | null> => {
        const sb = getSupabase();
        const { meals, ...planData } = updates;

        const { data, error } = await sb
            .from('nutrition_plans')
            // @ts-expect-error (TS2345 type mismatch)
            .update(planData)
            .eq('id', planId)
            .select()
            .single();

        if (error) throw error;

        // Update meals if provided
        if (meals) {
            // Delete old meals
            await sb.from('meals').delete().eq('nutrition_plan_id', planId);
            // Insert new meals
            if (meals.length > 0) {
                const mealsWithPlanId = meals.map((meal: any, index: number) => ({
                    ...meal,
                    nutrition_plan_id: planId,
                    order_index: index
                }));
                await sb.from('meals').insert(mealsWithPlanId);
            }
        }

        return data as unknown as NutritionPlan;
    },

    /**
     * Beslenme planı sil
     */
    deleteNutritionPlan: async (planId: string): Promise<boolean> => {
        const sb = getSupabase();
        // Meals will be cascade deleted if FK is set, otherwise delete manually
        await sb.from('meals').delete().eq('nutrition_plan_id', planId);
        const { error } = await sb.from('nutrition_plans').delete().eq('id', planId);
        return !error;
    }
};

// =============================================
// PROGRESS SERVICE
// =============================================
export const progressAPI = {
    /**
     * İlerleme kayıtlarını getir
     */
    getProgressLogs: async (studentId: string): Promise<any[]> => {
        const sb = getSupabase();
        const { data } = await sb
            .from('progress_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('logged_at', { ascending: false });

        return data || [];
    },

    /**
     * İlerleme kaydı ekle
     */
    addProgressLog: async (studentId: string, log: any): Promise<ProgressLog | null> => {
        const sb = getSupabase();
        const { data } = await sb
            .from('progress_logs')
            .insert({ student_id: studentId, ...log } as any)
            .select()
            .single();

        return data as ProgressLog | null;
    }
};

// =============================================
// MESSAGES SERVICE
// =============================================
export const messagesAPI = {
    /**
     * Mesajları getir
     */
    getMessages: async (userId: string, partnerId: string) => {
        return supabaseDataService.getMessages(userId, partnerId);
    },

    /**
     * Mesaj gönder
     */
    sendMessage: async (senderId: string, receiverId: string, content: string, imageUrl?: string) => {
        return supabaseDataService.sendMessage(senderId, receiverId, content, imageUrl);
    },

    /**
     * Konuşmaları getir
     */
    getConversations: async (userId: string) => {
        return supabaseDataService.getConversations(userId);
    },

    /**
     * Mesajları okundu işaretle
     */
    markAsRead: async (userId: string, partnerId: string) => {
        return supabaseDataService.markMessagesAsRead(userId, partnerId);
    },

    /**
     * Gerçek zamanlı mesaj subscribe
     */
    subscribeToMessages: (callback: (payload: any) => void) => {
        return supabaseDataService.subscribeToMessages(callback);
    }
};

// =============================================
// PACKAGES/SPORTS SERVICE
// =============================================
export const packagesAPI = {
    /**
     * Paketleri getir
     */
    getPackages: async (coachId?: string) => {
        return supabaseDataService.getPackages(coachId);
    },

    /**
     * Paket oluştur
     */
    createPackage: async (pkg: any) => {
        return supabaseDataService.createPackage(pkg);
    },

    /**
     * Paket güncelle
     */
    updatePackage: async (pkg: any) => {
        return supabaseDataService.updatePackage(pkg);
    },

    /**
     * Paket sil
     */
    deletePackage: async (packageId: string) => {
        return supabaseDataService.deletePackage(packageId);
    },

    /**
     * Sporları getir
     */
    getSports: async () => {
        return supabaseDataService.getSports();
    },

    /**
     * Spor ekle
     */
    addSport: async (sport: any) => {
        return supabaseDataService.createSport(sport);
    },

    /**
     * Spor sil
     */
    deleteSport: async (sportId: string) => {
        return supabaseDataService.deleteSport(sportId);
    }
};

// =============================================
// STORES SERVICE
// =============================================
export const storesAPI = {
    getStores: async () => supabaseDataService.getStores(),
    getStoreById: async (storeId: string) => supabaseDataService.getStoreById(storeId),
    getStoreByCoachId: async (coachId: string) => supabaseDataService.getCoachStore(coachId),
    getStoreByOwnerId: async (ownerId: string) => supabaseDataService.getStoreByOwnerId(ownerId),
    createStore: async (store: Partial<GymStore>) => supabaseDataService.createStore(store),
    updateStore: async (store: Partial<GymStore>) => supabaseDataService.updateStore(store),
};

// =============================================
// PURCHASES SERVICE
// =============================================
export const purchasesAPI = {
    getPurchases: async (userId?: string) => supabaseDataService.getPurchases(userId),
    purchasePackage: async (userId: string, packageId: string) => supabaseDataService.purchasePackage(userId, packageId),
    getCoachPurchases: async (coachId: string) => supabaseDataService.getCoachPurchases(coachId),
};

// =============================================
// REVIEWS SERVICE
// =============================================
export const reviewsAPI = {
    getReviews: async (shopId?: string, coachId?: string) => supabaseDataService.getReviews(shopId, coachId),
    createReview: async (review: Partial<Review>) => supabaseDataService.createReview(review),
};

// =============================================
// GROUP CLASSES SERVICE
// =============================================
export const classesAPI = {
    getGroupClasses: async (coachId?: string, shopId?: string) => supabaseDataService.getGroupClasses(coachId, shopId),
    createGroupClass: async (cls: Partial<GroupClass>) => supabaseDataService.createGroupClass(cls),
    enrollClass: async (classId: string, userId: string) => supabaseDataService.enrollClass(classId, userId),
};

// =============================================
// ADMIN SERVICE
// =============================================
export const adminAPI = {
    getAllUsers: async () => supabaseDataService.getAllUsers(),
    banUser: async (userId: string, reason?: string) => supabaseDataService.banUser(userId, reason),
    unbanUser: async (userId: string) => supabaseDataService.unbanUser(userId),
    deleteUser: async (userId: string) => supabaseDataService.deleteUser(userId),
    getSystemStats: async () => supabaseDataService.getSystemStats(),
    getStoreFinancials: async (storeId: string) => supabaseDataService.getStoreFinancials(storeId),
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

    // Helper: backend bilgisi
    isUsingSupabase: true
};

export default api;
