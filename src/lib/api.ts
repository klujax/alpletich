/**
 * API Service - Backend abstraction layer
 * 
 * Bu dosya Supabase backend'ini kullanır.
 * Eğer Supabase yapılandırılmamışsa, mock-service'e fallback yapar.
 */

import { supabase, isSupabaseConfigured, getSupabase } from './supabase';
import {
    Profile,
    Exercise,
    ExerciseCategory,
    NutritionPlan,
    ProgressLog,
    UserRole
} from '@/types/database';

// =============================================
// AUTH SERVICE
// =============================================
export const authAPI = {
    /**
     * Kullanıcı girişi
     */
    signIn: async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            const { authService } = await import('./mock-service');
            // Mock service doesn't use password
            return authService.signIn(email);
        }

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

    /**
     * Kullanıcı kaydı
     */
    signUp: async (email: string, password: string, role: UserRole, fullName: string) => {
        if (!isSupabaseConfigured) {
            const { authService } = await import('./mock-service');
            return authService.signUp(email, role, fullName);
        }

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
        if (!isSupabaseConfigured) {
            const { authService } = await import('./mock-service');
            return authService.signOut();
        }

        const sb = getSupabase();
        await sb.auth.signOut();
    },

    /**
     * Mevcut kullanıcıyı getir
     */
    getUser: (): Profile | null => {
        if (!isSupabaseConfigured) {
            // Senkron mock
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('sportaly_user');
                if (stored) return JSON.parse(stored);
            }
            return null;
        }
        return null; // Supabase için async çağrı lazım
    },

    /**
     * Profil güncelle
     */
    updateProfile: async (userId: string, updates: Partial<Profile>) => {
        if (!isSupabaseConfigured) {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('sportaly_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    const updated = { ...user, ...updates };
                    localStorage.setItem('sportaly_user', JSON.stringify(updated));
                }
            }
            return { error: null };
        }

        const sb = getSupabase() as any;
        const { error } = await sb
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        return { error: error?.message || null };
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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return dataService.getStudents();
        }

        const sb = getSupabase() as any;
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return [];

        const { data } = await sb
            .from('coach_students')
            .select(`
                student:profiles!student_id(*)
            `)
            .eq('coach_id', user.id)
            .eq('status', 'active');

        return data?.map((d: any) => d.student as Profile) || [];
    },

    /**
     * Öğrenci ekle
     */
    addStudent: async (fullName: string, email: string): Promise<Profile> => {
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).addStudent(fullName, email);
        }

        // Supabase için
        throw new Error('Supabase addStudent not implemented');
    },

    /**
     * Öğrenci detayını getir
     */
    getStudentById: async (studentId: string): Promise<Profile | null> => {
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            const students = await dataService.getStudents();
            return students.find((s: Profile) => s.id === studentId) || null;
        }

        const sb = getSupabase();
        const { data } = await sb
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single();

        return data;
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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).getExercises();
        }

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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).addExercise(exercise);
        }

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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).getNutritionPlans();
        }

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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).getNutritionPlan(studentId);
        }

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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).addNutritionPlan(plan) as unknown as NutritionPlan;
        }

        const sb = getSupabase();
        const { data } = await sb
            .from('nutrition_plans')
            .insert(plan)
            .select()
            .single();

        return (data || null) as unknown as NutritionPlan;
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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).getProgressHistory(studentId);
        }

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
        if (!isSupabaseConfigured) {
            const { dataService } = await import('./mock-service');
            return (dataService as any).addProgressLog(log) as any;
        }

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
        // Her zaman mock kullan (Supabase'de henüz yok)
        const { dataService } = await import('./mock-service');
        return dataService.getMessages(userId, partnerId);
    },

    /**
     * Mesaj gönder
     */
    sendMessage: async (senderId: string, receiverId: string, content: string, imageUrl?: string) => {
        const { dataService } = await import('./mock-service');
        return dataService.sendMessage(senderId, receiverId, content, imageUrl);
    },

    /**
     * Konuşmaları getir
     */
    getConversations: async (userId: string) => {
        const { dataService } = await import('./mock-service');
        return dataService.getConversations(userId);
    },

    /**
     * Mesajları okundu işaretle
     */
    markAsRead: async (userId: string, partnerId: string) => {
        const { dataService } = await import('./mock-service');
        return dataService.markMessagesAsRead(userId, partnerId);
    }
};

// =============================================
// PACKAGES/SPORTS SERVICE
// =============================================
export const packagesAPI = {
    /**
     * Paketleri getir
     */
    getPackages: async () => {
        const { dataService } = await import('./mock-service');
        return dataService.getPackages();
    },

    /**
     * Paket oluştur
     */
    createPackage: async (pkg: any) => {
        const { dataService } = await import('./mock-service');
        return dataService.createPackage(pkg);
    },

    /**
     * Sporları getir
     */
    getSports: async () => {
        const { dataService } = await import('./mock-service');
        return dataService.getSports();
    },

    /**
     * Spor ekle
     */
    addSport: async (sport: any) => {
        const { dataService } = await import('./mock-service');
        return dataService.createSport(sport);
    },

    /**
     * Spor sil
     */
    deleteSport: async (sportId: string) => {
        const { dataService } = await import('./mock-service');
        return dataService.deleteSport(sportId);
    }
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

    // Helper: hangi backend kullanılıyor
    isUsingSupabase: isSupabaseConfigured
};

export default api;
