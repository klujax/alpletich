
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
    Review,
    SystemStats,
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

    async resetPassword(email: string) {
        const sb = getSupabase() as any;
        return await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/settings',
        });
    },

    async updateUserMetadata(userId: string, metadata: any) {
        const sb = getSupabase() as any;
        // Supabase Auth stores metadata in raw_user_meta_data column on auth.users table
        // We can update it via updateUser method
        return await sb.auth.updateUser({
            data: metadata
        });
    },

    async setActiveProgram(userId: string, packageId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb
            .from('profiles')
            .update({ active_program_id: packageId })
            .eq('id', userId);

        if (error) {
            console.error("Error setting active program:", error);
            // Fallback to metadata if column doesn't exist yet (for smooth migration)
            await sb.auth.updateUser({
                data: { active_program_id: packageId }
            });
        }
        return !error;
    },

    // --- SPORTS ---
    async getSports(): Promise<any[]> {
        // Return static list for now as per mock-service
        return [
            { id: 'fitness', name: 'Fitness', icon: '🏋️', coachId: '', description: '', color: 'bg-blue-500', createdAt: new Date().toISOString() },
            { id: 'yoga', name: 'Yoga', icon: '🧘', coachId: '', description: '', color: 'bg-indigo-500', createdAt: new Date().toISOString() },
            { id: 'pilates', name: 'Pilates', icon: '🤸', coachId: '', description: '', color: 'bg-pink-500', createdAt: new Date().toISOString() },
            { id: 'swimming', name: 'Yüzme', icon: '🏊', coachId: '', description: '', color: 'bg-cyan-500', createdAt: new Date().toISOString() },
            { id: 'basketball', name: 'Basketbol', icon: '🏀', coachId: '', description: '', color: 'bg-orange-500', createdAt: new Date().toISOString() },
            { id: 'football', name: 'Futbol', icon: '⚽', coachId: '', description: '', color: 'bg-green-500', createdAt: new Date().toISOString() },
            { id: 'volleyball', name: 'Voleybol', icon: '🏐', coachId: '', description: '', color: 'bg-yellow-500', createdAt: new Date().toISOString() },
            { id: 'tennis', name: 'Tenis', icon: '🎾', coachId: '', description: '', color: 'bg-lime-500', createdAt: new Date().toISOString() },
            { id: 'table_tennis', name: 'Masa Tenisi', icon: '🏓', coachId: '', description: '', color: 'bg-red-400', createdAt: new Date().toISOString() },
            { id: 'boxing', name: 'Boks', icon: '🥊', coachId: '', description: '', color: 'bg-red-600', createdAt: new Date().toISOString() },
            { id: 'kickboxing', name: 'Kick Boks', icon: '🥋', coachId: '', description: '', color: 'bg-red-700', createdAt: new Date().toISOString() },
            { id: 'karate', name: 'Karate', icon: '🥋', coachId: '', description: '', color: 'bg-stone-800', createdAt: new Date().toISOString() },
            { id: 'taekwondo', name: 'Tekvando', icon: '🥋', coachId: '', description: '', color: 'bg-blue-800', createdAt: new Date().toISOString() },
            { id: 'wrestling', name: 'Güreş', icon: '🤼', coachId: '', description: '', color: 'bg-amber-700', createdAt: new Date().toISOString() },
            { id: 'crossfit', name: 'Crossfit', icon: '🏋️‍♂️', coachId: '', description: '', color: 'bg-slate-900', createdAt: new Date().toISOString() },
            { id: 'gymnastics', name: 'Jimnastik', icon: '🤸‍♀️', coachId: '', description: '', color: 'bg-purple-500', createdAt: new Date().toISOString() },
            { id: 'dance', name: 'Dans', icon: '💃', coachId: '', description: '', color: 'bg-rose-500', createdAt: new Date().toISOString() },
            { id: 'chess', name: 'Satranç', icon: '♟️', coachId: '', description: '', color: 'bg-slate-700', createdAt: new Date().toISOString() },
            { id: 'archery', name: 'Okçuluk', icon: '🏹', coachId: '', description: '', color: 'bg-teal-600', createdAt: new Date().toISOString() },
            { id: 'cycling', name: 'Bisiklet', icon: '🚴', coachId: '', description: '', color: 'bg-sky-500', createdAt: new Date().toISOString() },
            { id: 'running', name: 'Koşu', icon: '🏃', coachId: '', description: '', color: 'bg-orange-400', createdAt: new Date().toISOString() },
        ];
    },

    // --- STORES ---
    async getStores(): Promise<GymStore[]> {
        const sb = getSupabase() as any;
        const { data, error } = await sb.from('gym_stores').select('*');
        if (error) {
            console.warn('Supabase getStores error (Table missing?):', error.message);
            return [];
        }
        return toCamels(data || []);
    },

    async getCoachStore(coachId: string): Promise<GymStore | undefined> {
        const sb = getSupabase() as any;
        const { data, error } = await sb.from('gym_stores').select('*').eq('coach_id', coachId).maybeSingle();

        if (error) {
            console.warn('Supabase getCoachStore error:', error.message);
        }
        return data ? toCamels(data) : undefined;
    },

    async getStoreById(storeId: string): Promise<GymStore | null> {
        const sb = getSupabase() as any;
        const { data, error } = await sb.from('gym_stores').select('*').eq('id', storeId).maybeSingle();
        if (error) {
            console.warn('Supabase getStoreById error:', error.message);
        }
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

        const { data, error } = await query;
        if (error) {
            console.warn('Supabase getPackages error (Table missing?):', error.message);
            return [];
        }

        return data.map((d: any) => ({
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
            // Virtual UI fields or from DB
            accessDuration: d.access_duration || (d.total_weeks ? `${d.total_weeks} Hafta` : 'Süresiz'),
            sport: d.sport || 'Fitness',
            hasChatSupport: d.has_chat_support || false,
            hasGroupClass: d.has_group_class || false,
            maxStudents: d.max_students || 50,
            enrolledStudents: d.enrolled_students || 0,
            rating: d.rating || 0,
            reviewCount: d.review_count || 0,
            programContent: d.program_content || []
        })) as SalesPackage[];
    },

    async createPackage(pkg: Omit<SalesPackage, 'id' | 'createdAt'>) {
        const sb = getSupabase() as any;
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
            is_published: pkg.isPublished
        };
        const { data, error } = await sb.from('sales_packages').insert(dbPkg).select().single();
        if (error) throw error;

        return {
            ...pkg,
            id: data.id,
            createdAt: data.created_at
        } as SalesPackage;
    },

    async updatePackage(pkg: Partial<SalesPackage>) {
        const sb = getSupabase() as any;
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

        const { data, error } = await sb.from('sales_packages').update(dbPkg).eq('id', pkg.id).select().single();
        if (error) throw error;

        return {
            ...pkg,
            id: data.id,
            createdAt: data.created_at
        } as SalesPackage;
    },

    async deletePackage(packageId: string) {
        const sb = getSupabase() as any;
        const { error } = await sb.from('sales_packages').delete().eq('id', packageId);
        if (error) throw error;
        return true;
    },

    // --- GROUP CLASSES ---
    async getGroupClasses(coachId?: string, shopId?: string): Promise<GroupClass[]> {
        const sb = getSupabase() as any;
        let query = sb.from('group_classes').select('*').order('scheduled_at', { ascending: true });

        if (coachId) query = query.eq('coach_id', coachId);
        if (shopId) query = query.eq('shop_id', shopId);

        const { data, error } = await query;
        if (error) {
            if (error.code === '404' || error.message.includes('404')) {
                console.error('CRITICAL: "group_classes" table not found within Supabase. Please run "supabase/migrations/999_fix_all_missing_tables.sql" in your Supabase SQL Editor.');
            } else {
                console.warn('Supabase getGroupClasses error:', error.message);
            }
            return [];
        }

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

        if (error) {
            console.warn('Supabase getPurchases error (Table missing?):', error.message);
            return [];
        }

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
        if (pkg.package_type === 'coaching' && pkg.total_weeks) {
            const date = new Date();
            date.setDate(date.getDate() + (pkg.total_weeks * 7));
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
            .order('created_at', { ascending: true });

        const camelData = toCamels(data || []);
        return camelData.map((m: any) => ({
            ...m,
            timestamp: m.createdAt,
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
            .order('created_at', { ascending: false });

        if (error || !messages) return [];

        const camelMessagesRaw = toCamels(messages);
        const camelMessages = (camelMessagesRaw || []).map((m: any) => ({
            ...m,
            timestamp: m.createdAt,
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
            timestamp: camelData.createdAt,
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
    },
    async getStoreFinancials(storeId: string) {
        const sb = getSupabase() as any;

        // Get store purchases
        const { data: purchases } = await sb.from('purchases').select('*').eq('shop_id', storeId);

        const totalRevenue = purchases ? purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) : 0;
        const totalExpenses = totalRevenue * 0.2; // Mock
        const netProfit = totalRevenue - totalExpenses;

        // Mock monthly data
        const monthlyData = [
            { month: 'Oca', revenue: totalRevenue * 0.1, expenses: totalExpenses * 0.1 },
            { month: 'Şub', revenue: totalRevenue * 0.15, expenses: totalExpenses * 0.15 },
            { month: 'Mar', revenue: totalRevenue * 0.2, expenses: totalExpenses * 0.2 },
            { month: 'Nis', revenue: totalRevenue * 0.25, expenses: totalExpenses * 0.25 },
            { month: 'May', revenue: totalRevenue * 0.3, expenses: totalExpenses * 0.3 },
        ];

        return {
            storeId,
            totalRevenue,
            totalExpenses,
            netProfit,
            monthlyData,
            recentTransactions: [] // Mock empty for now
        };
    },
    async getStoreByOwnerId(ownerId: string): Promise<GymStore | null> {
        const sb = getSupabase() as any;
        const { data } = await sb.from('gym_stores').select('*').eq('coach_id', ownerId).maybeSingle();
        return data ? toCamels(data) : null;
    },

    async getCoachStudents(coachId: string): Promise<Profile[]> {
        const sb = getSupabase() as any;
        // Coach-Student relationship is usually in a separate table like 'coach_students'
        // But for verified purchases or specific logic, we might query differently.
        // Assuming 'coach_students' table exists based on types.database.ts
        const { data } = await sb
            .from('coach_students')
            .select(`
                student:profiles(*)
            `)
            .eq('coach_id', coachId)
            .eq('status', 'active');

        return data ? data.map((d: any) => d.student) : [];
    },

    async getCoachPurchases(coachId: string): Promise<Purchase[]> {
        const sb = getSupabase() as any;
        // Query purchases joined with packages to filter by coach_id
        const { data, error } = await sb
            .from('purchases')
            .select(`
                *,
                package:sales_packages!inner(coach_id, name)
            `)
            .eq('package.coach_id', coachId); // !inner join allows filtering on joined table

        if (error || !data) return [];

        return data.map((p: any) => ({
            id: p.id,
            studentId: p.user_id,
            userId: p.user_id,
            coachId: p.package?.coach_id || coachId,
            shopId: p.shop_id,
            packageId: p.package_id,
            type: 'package',
            packageName: p.package?.name || 'Unknown Package',
            price: p.amount_paid,
            amountPaid: p.amount_paid,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
            status: p.status,
            packageSnapshot: p.package_snapshot
        })) as unknown as Purchase[];
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

        // Purchases & Revenue
        const { data: purchases } = await sb.from('purchases').select('amount_paid');
        const totalRevenue = purchases ? purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) : 0;
        const totalPurchases = purchases ? purchases.length : 0;

        // Mocking expenses and growth for now as they require time-series data or complex queries
        const totalExpenses = totalRevenue * 0.2;
        const netProfit = totalRevenue - totalExpenses;
        const platformCommission = totalRevenue * 0.1;
        const monthlyGrowth = 15; // Mock

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
            netProfit,
            platformCommission,
            monthlyGrowth
        };
    },

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
        if (!password) throw new Error('Şifre gereklidir.');
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
        return await sb.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: redirectUrl
            }
        });
    },

    async signOut() {
        return await getSupabase().auth.signOut();
    },

    async getUser() {
        try {
            const { data } = await getSupabase().auth.getUser();
            if (data.user) {
                // Fetch profile from Supabase
                const { data: profile } = await getSupabase().from('profiles').select('*').eq('id', data.user.id).single();
                if (profile) return toCamels(profile) as Profile;
            }
        } catch (err) {
            console.warn("Supabase getUser failed, falling back to localStorage:", err);
        }
        // Fallback: read from localStorage (set during signUp/signIn in mock-service)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sportaly_user');
            if (stored) {
                try {
                    return JSON.parse(stored) as Profile;
                } catch { }
            }
        }
        return null;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        return supabaseDataService.updateProfile(userId, updates);
    },
    async resetPassword(email: string) {
        return supabaseDataService.resetPassword(email);
    },
    async resendConfirmation(email: string) {
        const sb = getSupabase();
        return await sb.auth.resend({ type: 'signup', email });
    }
};
