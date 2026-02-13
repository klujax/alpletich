
import { getSupabase, supabase } from './supabase';
import {
    GroupClass,
    Purchase,
    SalesPackage,
    GymStore,
    UserRole,
    Profile,
    Message,
    Conversation
} from './types';

// HELPER: Map snake_case to camelCase
function toCamels(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamels);

    const newObj: any = {};
    for (const key in obj) {
        // Convert snake_case to camelCase
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[newKey] = toCamels(obj[key]);
    }
    return newObj;
}

// HELPER: Map camelCase to snake_case for DB inserts
function toSnakes(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakes);

    const newObj: any = {};
    for (const key in obj) {
        // Convert camelCase to snake_case
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        newObj[newKey] = toSnakes(obj[key]);
    }
    return newObj;
}

export const supabaseDataService = {
    // --- AUTH ---
    async getProfile(userId: string): Promise<Profile | null> {
        const sb = getSupabase();
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return toCamels(data);
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        const sb = getSupabase();
        const dbUpdates = toSnakes(updates);
        return await sb.from('profiles').update(dbUpdates).eq('id', userId);
    },

    // --- STORES ---
    async getStores(): Promise<GymStore[]> {
        const sb = getSupabase();
        const { data } = await sb.from('gym_stores').select('*');
        return toCamels(data || []);
    },

    async getCoachStore(coachId: string): Promise<GymStore | undefined> {
        const sb = getSupabase();
        const { data } = await sb.from('gym_stores').select('*').eq('owner_id', coachId).single();
        return data ? toCamels(data) : undefined;
    },

    // --- PACKAGES ---
    async getPackages(coachId?: string): Promise<SalesPackage[]> {
        const sb = getSupabase();
        let query = sb.from('sales_packages').select('*');
        if (coachId) query = query.eq('coach_id', coachId);

        const { data } = await query;
        return toCamels(data || []);
    },

    async createPackage(pkg: Omit<SalesPackage, 'id' | 'createdAt'>) {
        const sb = getSupabase();
        const dbPkg = toSnakes(pkg);
        const { data, error } = await sb.from('sales_packages').insert(dbPkg).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    // --- GROUP CLASSES ---
    async getGroupClasses(): Promise<GroupClass[]> {
        const sb = getSupabase();
        const { data } = await sb.from('group_classes').select('*').order('scheduled_at', { ascending: true });

        // Auto-renewal logic is mocked in frontend, but specialized backend job needed for real.
        // For now, we return what's in DB.
        return toCamels(data || []);
    },

    async createGroupClass(cls: Partial<GroupClass>) {
        const sb = getSupabase();
        const dbCls = toSnakes(cls);
        // Ensure ID is auto-generated if omitted
        delete dbCls.id;
        const { data, error } = await sb.from('group_classes').insert(dbCls).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    async enrollClass(classId: string, userId: string) {
        const sb = getSupabase();
        const { error } = await sb.from('class_enrollments').insert({ class_id: classId, user_id: userId });
        if (error) throw error;

        // Update local count? Usually handled by trigger or refetch.
        return true;
    },

    // --- PURCHASES ---
    async getPurchases(userId: string): Promise<Purchase[]> {
        const sb = getSupabase();
        // Join with Package to get details
        const { data, error } = await sb
            .from('purchases')
            .select(`
                *,
                package:sales_packages(*) 
            `)
            .eq('user_id', userId);

        if (error) return [];

        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            shopId: p.shop_id,
            packageId: p.package_id,
            packageName: p.package?.name || 'Unknown Package',
            amountPaid: p.amount_paid,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
            status: p.status,
            packageSnapshot: p.package_snapshot
        }));
    },

    async purchasePackage(userId: string, packageId: string): Promise<Purchase> {
        const sb = getSupabase();

        // 1. Get Package
        const { data: pkg } = await sb.from('sales_packages').select('*').eq('id', packageId).single();
        if (!pkg) throw new Error("Package not found");

        // 2. Calculate Expiry
        let expiresAt = null;
        if (pkg.package_type === 'coaching' && pkg.duration_weeks) {
            const date = new Date();
            date.setDate(date.getDate() + (pkg.duration_weeks * 7));
            expiresAt = date.toISOString();
        }

        // 3. Insert Purchase
        const { data: purchase, error } = await sb.from('purchases').insert({
            user_id: userId,
            package_id: packageId,
            shop_id: pkg.shop_id,
            amount_paid: pkg.price,
            status: 'active',
            expires_at: expiresAt,
            package_snapshot: pkg
        }).select().single();

        if (error) throw error;
        return toCamels(purchase);
    },

    // --- MESSAGES (Basic) ---
    async getConversations(userId: string): Promise<Conversation[]> {
        const sb = getSupabase();
        // This query works if we have a robust message history.
        // For simplicity, we might just query profiles of known contacts.
        // Complex to rewrite entire 'group by' logic in Supabase client without RPC.
        // Placeholder:
        return [];
    },

    async sendMessage(senderId: string, receiverId: string, content: string) {
        const sb = getSupabase();
        const { data, error } = await sb.from('messages').insert({
            sender_id: senderId,
            receiver_id: receiverId,
            content: content
        }).select().single();
        if (error) throw error;
        return toCamels(data);
    }
};

export const supabaseAuthService = {
    // Basic Auth wrappers
    async signIn(email: string) {
        // Supabase usually requires password or magic link.
        // We cannot simulate the "Mock: Just Email" flow easily with real Supabase Auth 
        // unless we force Magic Link.
        // Assuming Password flow for 'production'.
        const sb = getSupabase();
        // Since we don't have password from mock frontend components (some just ask email),
        // we might fail here unless frontend is updated.
        // Mock components use: signIn(email).
        // Real Supabase needs signInWithOtp({ email }).
        return await sb.auth.signInWithOtp({ email });
    },

    async signOut() {
        return await getSupabase().auth.signOut();
    },

    async getUser() {
        const { data } = await getSupabase().auth.getUser();
        if (!data.user) return null;
        // Fetch profile
        const { data: profile } = await getSupabase().from('profiles').select('*').eq('id', data.user.id).single();
        return toCamels(profile);
    }
};
