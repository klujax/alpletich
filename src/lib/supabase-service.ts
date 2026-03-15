/**
 * UYUMLULUK KATMANI — Eski import'lar için proxy
 * 
 * ⚠️ Bu dosya DEPRECATED (kullanımdan kaldırılmış).
 * Yeni kodlarda doğrudan `@/lib/services` modüllerini kullanın.
 * 
 * Örnek:
 *   import { authService, packageService } from '@/lib/services';
 */

import { authService } from './services/auth.service';
import { profileService } from './services/profile.service';
import { storeService } from './services/store.service';
import { packageService } from './services/package.service';
import { purchaseService } from './services/purchase.service';
import { classService } from './services/class.service';
import { messageService } from './services/message.service';
import { reviewService } from './services/review.service';
import { progressService } from './services/progress.service';
import { storageService } from './services/storage.service';
import type { SystemStats } from './types';
import { getSupabase } from './supabase';

// Legacy: supabaseDataService — eski koda uyumluluk
export const supabaseDataService = {
    // Profile
    getProfile: profileService.getProfile,
    updateProfile: profileService.updateProfile,
    resetPassword: profileService.resetPassword,
    setActiveProgram: profileService.setActiveProgram,
    updateUserMetadata: async (_userId: string, metadata: any) => {
        return await getSupabase().auth.updateUser({ data: metadata });
    },

    // Sports
    getSports: packageService.getSports,
    createSport: packageService.createSport,
    deleteSport: packageService.deleteSport,

    // Stores
    getStores: storeService.getStores,
    getCoachStore: storeService.getCoachStore,
    getStoreById: storeService.getStoreById,
    getStoreByOwnerId: storeService.getStoreByOwnerId,
    createStore: storeService.createStore,
    updateStore: storeService.updateStore,

    // Packages
    getPackages: packageService.getPackages,
    createPackage: packageService.createPackage,
    updatePackage: packageService.updatePackage,
    deletePackage: packageService.deletePackage,

    // Group Classes
    getGroupClasses: classService.getGroupClasses,
    createGroupClass: classService.createGroupClass,
    enrollClass: classService.enrollClass,

    // Purchases
    getPurchases: purchaseService.getPurchases,
    purchasePackage: purchaseService.purchasePackage,
    getCoachPurchases: purchaseService.getCoachPurchases,
    getCoachStudents: purchaseService.getCoachStudents,

    // Reviews
    getReviews: reviewService.getReviews,
    createReview: reviewService.createReview,

    // Progress
    getProgress: progressService.getProgress,
    createProgress: progressService.createProgress,

    // Messages
    getMessages: messageService.getMessages,
    markMessagesAsRead: messageService.markMessagesAsRead,
    getConversations: messageService.getConversations,
    sendMessage: messageService.sendMessage,
    subscribeToMessages: messageService.subscribeToMessages,

    // Storage
    uploadFile: storageService.uploadFile,
    listFiles: storageService.listFiles,
    deleteFile: storageService.deleteFile,

    // Admin — Bu işlemler artık API route'lardan yapılmalı
    async getAllUsers() {
        const { data } = await (getSupabase() as any).from('profiles').select('*');
        return data || [];
    },
    async banUser(userId: string, _reason?: string) {
        const { error } = await (getSupabase() as any)
            .from('profiles')
            .update({ is_banned: true })
            .eq('id', userId);
        return !error;
    },
    async unbanUser(userId: string) {
        const { error } = await (getSupabase() as any)
            .from('profiles')
            .update({ is_banned: false })
            .eq('id', userId);
        return !error;
    },
    async deleteUser(userId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.auth.admin.deleteUser(userId);
        if (error) {
            const { error: profileError } = await sb.from('profiles').delete().eq('id', userId);
            return !profileError;
        }
        return true;
    },

    // Financials
    async getStoreFinancials(storeId: string) {
        const { data: purchases } = await (getSupabase() as any)
            .from('purchases')
            .select('*')
            .eq('shop_id', storeId);

        const totalRevenue = purchases
            ? purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0)
            : 0;
        const totalExpenses = totalRevenue * 0.2;
        const netProfit = totalRevenue - totalExpenses;

        return {
            storeId,
            totalRevenue,
            totalExpenses,
            netProfit,
            monthlyData: [
                { month: 'Oca', revenue: totalRevenue * 0.1, expenses: totalExpenses * 0.1 },
                { month: 'Şub', revenue: totalRevenue * 0.15, expenses: totalExpenses * 0.15 },
                { month: 'Mar', revenue: totalRevenue * 0.2, expenses: totalExpenses * 0.2 },
                { month: 'Nis', revenue: totalRevenue * 0.25, expenses: totalExpenses * 0.25 },
                { month: 'May', revenue: totalRevenue * 0.3, expenses: totalExpenses * 0.3 },
            ],
            recentTransactions: [],
        };
    },

    async getSystemStats(): Promise<SystemStats> {
        const sb = getSupabase() as any;

        const { count: totalUsers } = await sb.from('profiles').select('*', { count: 'exact', head: true });
        const { count: totalCoaches } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach');
        const { count: totalStudents } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: bannedUsers } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true);
        const { count: totalStores } = await sb.from('gym_stores').select('*', { count: 'exact', head: true });
        const { count: activeStores } = await sb.from('gym_stores').select('*', { count: 'exact', head: true }).eq('is_active', true);
        const { count: bannedStores } = await sb.from('gym_stores').select('*', { count: 'exact', head: true }).eq('is_banned', true);

        const { data: purchases } = await sb.from('purchases').select('amount_paid');
        const totalRevenue = purchases ? purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) : 0;
        const totalPurchases = purchases ? purchases.length : 0;
        const totalExpenses = totalRevenue * 0.2;

        return {
            totalUsers: totalUsers || 0,
            totalCoaches: totalCoaches || 0,
            totalStudents: totalStudents || 0,
            bannedUsers: bannedUsers || 0,
            totalStores: totalStores || 0,
            activeStores: activeStores || 0,
            bannedStores: bannedStores || 0,
            totalPurchases,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            platformCommission: totalRevenue * 0.1,
            monthlyGrowth: 15,
        };
    },
};

// Legacy: supabaseAuthService — eski koda uyumluluk
export const supabaseAuthService = {
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    getUser: authService.getUser,
    resendConfirmation: authService.resendConfirmation,
    updateProfile: profileService.updateProfile,
    resetPassword: profileService.resetPassword,
};
