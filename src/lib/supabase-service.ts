
import { getSupabase, supabase } from './supabase';
import {
    GroupClass,
    Purchase,
    SalesPackage,
    GymStore,
    UserRole,
    Profile,
    Message,
    Conversation,
    Review
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
        const sb = getSupabase() as any;
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        if (error) return null;
        return data as unknown as Profile;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        const sb = getSupabase() as any;
        const dbUpdates = toSnakes(updates);
        return await sb.from('profiles').update(dbUpdates).eq('id', userId);
    },

    // --- SPORTS ---
    async getSports(): Promise<any[]> {
        // Return static list for now as per mock-service, or fetch from DB if table exists.
        // Assuming static for simplicity and consistency with current frontend expectations.
        return [
            { id: 'fitness', name: 'Fitness', icon: '🏋️' },
            { id: 'yoga', name: 'Yoga', icon: '🧘' },
            { id: 'pilates', name: 'Pilates', icon: '🤸' },
            { id: 'swimming', name: 'Yüzme', icon: '🏊' },
            { id: 'basketball', name: 'Basketbol', icon: '🏀' },
            { id: 'football', name: 'Futbol', icon: '⚽' },
            { id: 'tennis', name: 'Tenis', icon: '🎾' },
            { id: 'boxing', name: 'Boks', icon: '🥊' },
            { id: 'kickboxing', name: 'Kick Boks', icon: '🥋' },
            { id: 'crossfit', name: 'Crossfit', icon: '🏋️‍♂️' },
        ];
    },

    // --- STORES ---
    async getStores(): Promise<GymStore[]> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('gym_stores').select('*');
        return toCamels(data || []);
    },

    async getCoachStore(coachId: string): Promise<GymStore | undefined> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('gym_stores').select('*').eq('coach_id', coachId).single();
        return data ? toCamels(data) : undefined;
    },

    async getStoreById(storeId: string): Promise<GymStore | null> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('gym_stores').select('*').eq('id', storeId).single();
        return data ? toCamels(data) : null;
    },

    async createStore(store: Partial<GymStore>) {
        const sb = getSupabase() as any;
        const dbStore = toSnakes(store);
        delete dbStore.id; // Allow DB to generate ID
        const { data, error } = await sb.from('gym_stores').insert(dbStore).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    async updateStore(store: Partial<GymStore>) {
        const sb = getSupabase() as any;
        const dbStore = toSnakes(store);
        const { id, ...updates } = dbStore;
        const { data, error } = await sb.from('gym_stores').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    // --- PACKAGES ---
    async getPackages(coachId?: string): Promise<SalesPackage[]> {
        const sb = getSupabase() as any;
        let query = sb.from('sales_packages').select('*');
        if (coachId) query = query.eq('coach_id', coachId);

        const { data } = await query;
        return toCamels(data || []);
    },

    async createPackage(pkg: Omit<SalesPackage, 'id' | 'createdAt'>) {
        const sb = getSupabase() as any;
        const dbPkg = toSnakes(pkg);
        const { data, error } = await sb.from('sales_packages').insert(dbPkg).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    async updatePackage(pkg: Partial<SalesPackage>) {
        const sb = getSupabase() as any;
        const dbPkg = toSnakes(pkg);
        const { id, ...updates } = dbPkg;
        const { data, error } = await sb.from('sales_packages').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    async deletePackage(packageId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.from('sales_packages').delete().eq('id', packageId);
        if (error) throw error;
        return true;
    },

    // --- GROUP CLASSES ---
    async getGroupClasses(): Promise<GroupClass[]> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('group_classes').select('*').order('scheduled_at', { ascending: true });

        // Auto-renewal logic is mocked in frontend, but specialized backend job needed for real.
        // For now, we return what's in DB.
        return toCamels(data || []);
    },

    async createGroupClass(cls: Partial<GroupClass>) {
        const sb = getSupabase() as any;
        const dbCls = toSnakes(cls);
        // Ensure ID is auto-generated if omitted
        delete dbCls.id;
        const { data, error } = await sb.from('group_classes').insert(dbCls).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    async enrollClass(classId: string, userId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.from('class_enrollments').insert({ class_id: classId, user_id: userId });
        if (error) throw error;

        // Update local count? Usually handled by trigger or refetch.
        return true;
    },

    // --- PURCHASES ---
    async getPurchases(userId?: string): Promise<Purchase[]> {
        const sb = getSupabase() as any;
        // Join with Package to get details
        let query = sb
            .from('purchases')
            .select(`
                *,
                package:sales_packages(*) 
            `);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) return [];

        return data.map((p: any) => ({
            id: p.id,
            studentId: p.user_id,
            userId: p.user_id, // Backward compatibility
            coachId: p.package?.coach_id || '', // Derived from package
            shopId: p.shop_id,
            packageId: p.package_id,
            type: 'package', // Default for now
            packageName: p.package?.name || 'Unknown Package',
            price: p.amount_paid,
            amountPaid: p.amount_paid,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
            status: p.status,
            packageSnapshot: p.package_snapshot
        })) as unknown as Purchase[]; // Aggressive casting to satisfy interface
    },

    async purchasePackage(userId: string, packageId: string): Promise<Purchase> {
        const sb = getSupabase() as any;

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
        // We use 'any' cast for 'insert' payload to bypass strict type checking against potentially outdated Database definitions
        // especially if 'sales_packages' or schema is slightly different in local types vs remote
        const { data: purchase, error } = await sb.from('purchases').insert({
            user_id: userId,
            package_id: packageId,
            shop_id: pkg.shop_id,
            amount_paid: pkg.price,
            status: 'active',
            purchased_at: new Date().toISOString(), // Use current time
            expires_at: expiresAt,
            package_snapshot: pkg
        } as any).select().single();

        if (error) throw error;


        // Return mapped purchase
        return {
            ...toCamels(purchase),
            studentId: userId,
            coachId: pkg.coach_id,
            type: 'package',
            packageName: pkg.name
        } as unknown as Purchase;
    },

    // --- REVIEWS ---
    async getReviews(shopId?: string, coachId?: string): Promise<Review[]> {
        const sb = getSupabase() as any;
        let query = sb.from('reviews').select('*');
        if (shopId) query = query.eq('shop_id', shopId);
        if (coachId) query = query.eq('coach_id', coachId);

        const { data } = await query;
        return toCamels(data || []);
    },

    async createReview(review: Partial<Review>) {
        const sb = getSupabase() as any;
        const dbReview = toSnakes(review);
        delete dbReview.id;
        const { data, error } = await sb.from('reviews').insert(dbReview).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    // --- PROGRESS ---
    async getProgress(studentId: string): Promise<any[]> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('progress_entries').select('*').eq('student_id', studentId).order('date', { ascending: true });
        return toCamels(data || []);
    },

    async createProgress(entry: any) {
        const sb = getSupabase() as any;
        const dbEntry = toSnakes(entry);
        const { data, error } = await sb.from('progress_entries').insert(dbEntry).select().single();
        if (error) throw error;
        return toCamels(data);
    },

    // --- MESSAGES ---
    async getMessages(userId: string, partnerId: string): Promise<Message[]> {
        const sb = getSupabase() as any;
        const { data } = await sb
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
            .order('timestamp', { ascending: true });

        const camelData = toCamels(data || []);
        return camelData.map((m: any) => ({
            ...m,
            read: m.isRead !== undefined ? m.isRead : m.read
        }));
    },

    async markMessagesAsRead(userId: string, senderId: string) {
        const sb = getSupabase() as any;
        await sb.from('messages')
            .update({ read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', senderId);
        return true;
    },

    // --- MESSAGES (Basic) ---
    async getConversations(userId: string): Promise<Conversation[]> {
        const sb = getSupabase() as any;

        const { data: messages, error } = await sb
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('timestamp', { ascending: false });

        if (error || !messages) return [];

        const camelMessagesRaw = toCamels(messages);
        const camelMessages = (camelMessagesRaw || []).map((m: any) => ({
            ...m,
            read: m.isRead !== undefined ? m.isRead : m.read
        })) as Message[];
        const partnerIds = new Set<string>();
        const lastMessages = new Map<string, Message>();
        const unreadCounts = new Map<string, number>();

        camelMessages.forEach((msg) => {
            const isSender = msg.senderId === userId;
            const partnerId = isSender ? msg.receiverId : msg.senderId;

            if (!partnerIds.has(partnerId)) {
                partnerIds.add(partnerId);
                lastMessages.set(partnerId, msg);
            }

            if (!isSender && !msg.read) {
                unreadCounts.set(partnerId, (unreadCounts.get(partnerId) || 0) + 1);
            }
        });

        if (partnerIds.size === 0) return [];

        const { data: profiles } = await sb
            .from('profiles')
            .select('*')
            .in('id', Array.from(partnerIds));

        if (!profiles) return [];

        // Profiles might not have camelCase keys if coming straight from DB via select('*')? 
        // toCamels handles it if we wrap it, but Profile interface usually expects snake_case from DB raw or we need mapping?
        // Wait, supabaseDataService uses toCamels everywhere. Let's use it for profiles too.
        const camelProfiles = toCamels(profiles) as Profile[];

        return camelProfiles.map((partner) => {
            const lastMsg = lastMessages.get(partner.id);
            return {
                partner,
                lastMessage: lastMsg,
                unreadCount: unreadCounts.get(partner.id) || 0
            };
        });
    },

    async sendMessage(senderId: string, receiverId: string, content: string, imageUrl?: string) {
        const sb = getSupabase() as any;
        const { data, error } = await sb.from('messages').insert({
            sender_id: senderId,
            receiver_id: receiverId,
            content: content,
            image_url: imageUrl
        }).select().single();
        if (error) throw error;
        const camelData = toCamels(data);
        return {
            ...camelData,
            read: camelData.isRead !== undefined ? camelData.isRead : camelData.read
        };
    },

    // --- ADMIN ---
    async getAllUsers() {
        const sb = getSupabase() as any;
        const { data } = await sb.from('profiles').select('*');
        return (data || []) as unknown as Profile[];
    },

    async banUser(userId: string, reason?: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.from('profiles').update({ is_banned: true }).eq('id', userId);
        return !error;
    },

    async unbanUser(userId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.from('profiles').update({ is_banned: false }).eq('id', userId);
        return !error;
    },

    async deleteUser(userId: string) {
        // This might require cascading deletes or admin API
        const sb = getSupabase() as any;
        const { error } = await sb.auth.admin.deleteUser(userId);
        if (error) {
            console.error("Supabase Admin delete failed (client might not have permission):", error);
            // Fallback: just delete from profiles if auth delete fails/not accessible
            const { error: profileError } = await sb.from('profiles').delete().eq('id', userId);
            return !profileError;
        }
        return true;
    },

    // --- STORAGE ---
    async uploadFile(bucket: string, path: string, file: File) {
        const sb = getSupabase();
        const { data, error } = await sb.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });
        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    },

    // --- REALTIME ---
    subscribeToMessages(callback: (payload: any) => void) {
        const sb = getSupabase();
        return sb
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => callback(payload)
            )
            .subscribe();
    }
};

export const supabaseAuthService = {
    // Basic Auth wrappers
    async signIn(email: string, password?: string) {
        const sb = getSupabase();
        if (password) {
            return await sb.auth.signInWithPassword({ email, password });
        }
        return await sb.auth.signInWithOtp({ email });
    },

    async signUp(email: string, password?: string, metadata?: any) {
        const sb = getSupabase();
        return await sb.auth.signUp({
            email,
            password: password || '123456', // Default fallback or error if needed, but signup usually implies password
            options: {
                data: metadata
            }
        });
    },

    async signOut() {
        return await getSupabase().auth.signOut();
    },

    async getUser() {
        const { data } = await getSupabase().auth.getUser();
        if (!data.user) return null;
        // Fetch profile
        const { data: profile } = await getSupabase().from('profiles').select('*').eq('id', data.user.id).single();
        return profile ? (toCamels(profile) as Profile) : null;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        return supabaseDataService.updateProfile(userId, updates);
    }
};
