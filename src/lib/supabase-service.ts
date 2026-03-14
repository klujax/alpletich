
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

        if (error || !data) return null;
        return data as Profile;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        const sb = getSupabase() as any;
        // Profile type already uses snake_case keys, no conversion needed
        return await sb.from('profiles').update(updates).eq('id', userId);
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
        // Try to fetch from sport_categories table first
        try {
            const sb = getSupabase() as any;
            const { data, error } = await sb.from('sport_categories').select('*').order('name');
            if (!error && data && data.length > 0) {
                return data.map((s: any) => ({
                    id: s.id,
                    coachId: s.coach_id || 'system',
                    name: s.name,
                    icon: s.icon || '🏋️',
                    description: s.description || '',
                    color: s.color || 'slate',
                    isSystemDefault: s.is_system_default ?? true,
                    createdAt: s.created_at
                }));
            }
        } catch {
            // Table might not exist, fall through to defaults
        }

        // Fallback: Return system default sports
        return [
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
    },

    async createSport(sport: any): Promise<any> {
        try {
            const sb = getSupabase() as any;
            const dbSport = {
                name: sport.name,
                icon: sport.icon,
                description: sport.description,
                color: sport.color,
                coach_id: sport.coachId || null,
                is_system_default: false
            };
            const { data, error } = await sb.from('sport_categories').insert(dbSport).select().single();
            if (error) throw error;
            return {
                id: data.id,
                coachId: data.coach_id || '',
                name: data.name,
                icon: data.icon,
                description: data.description,
                color: data.color,
                isSystemDefault: data.is_system_default,
                createdAt: data.created_at
            };
        } catch (err) {
            console.warn('Sport creation failed (table may not exist):', err);
            // Return a generated sport object as fallback
            return {
                id: sport.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 5),
                ...sport,
                createdAt: new Date().toISOString()
            };
        }
    },

    async deleteSport(sportId: string): Promise<boolean> {
        try {
            const sb = getSupabase() as any;
            const { error } = await sb.from('sport_categories').delete().eq('id', sportId);
            return !error;
        } catch {
            console.warn('Sport deletion failed (table may not exist)');
            return false;
        }
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

        // Fetch enrollments for all classes
        const classIds = (data || []).map((c: any) => c.id);
        let enrollments: any[] = [];
        if (classIds.length > 0) {
            const { data: enrollData } = await sb
                .from('class_enrollments')
                .select('class_id, user_id')
                .in('class_id', classIds);
            enrollments = enrollData || [];
        }

        // Map classes with their enrolled participants
        return (data || []).map((c: any) => {
            const classEnrollments = enrollments
                .filter((e: any) => e.class_id === c.id)
                .map((e: any) => e.user_id);
            return {
                id: c.id,
                coachId: c.coach_id,
                shopId: c.shop_id,
                packageId: c.package_id,
                title: c.title,
                description: c.description || '',
                sport: c.sport || '',
                scheduledAt: c.scheduled_at,
                durationMinutes: c.duration_minutes || 60,
                maxParticipants: c.max_participants || 20,
                enrolledParticipants: classEnrollments,
                meetingLink: c.meeting_link,
                status: c.status,
                price: c.price || 0,
                createdAt: c.created_at,
                recurrence: c.recurrence,
                recurrenceDays: c.recurrence_days,
                recurrenceTime: c.recurrence_time,
            } as GroupClass;
        });
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

        const { data: userProfile } = await sb.from('profiles').select('role').eq('id', userId).single();
        const role = userProfile?.role;

        const { data: messages, error } = await sb
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        const camelMessagesRaw = toCamels(messages || []);
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

        const activePartners = new Set<string>();

        // Fetch valid partners (students for coach, coaches for student)
        try {
            if (role === 'coach') {
                const students = await this.getCoachStudents(userId);
                students.forEach(s => {
                    activePartners.add(s.id);
                    partnerIds.add(s.id);
                });
            } else if (role === 'student') {
                const purchases = await this.getPurchases(userId);
                purchases.forEach((p: any) => {
                    // Check if package has chat support
                    const hasSharedChat = p.packageSnapshot?.has_chat_support === true || p.packageSnapshot?.hasChatSupport === true;
                    if (p.coachId && p.status === 'active' && hasSharedChat) {
                        activePartners.add(p.coachId);
                        partnerIds.add(p.coachId);
                    }
                });
            }
        } catch (e) {
            console.warn("Could not fetch active partners:", e);
        }

        if (partnerIds.size === 0) return [];

        const { data: profiles } = await sb
            .from('profiles')
            .select('*')
            .in('id', Array.from(partnerIds));

        if (!profiles) return [];

        const camelProfiles = toCamels(profiles) as Profile[];

        // Yalnızca mesajı olanları veya "aktif partner" olanları filtrele (eski ama package süresi bitmiş mesajlar kalsın)
        return camelProfiles
            .filter(p => lastMessages.has(p.id) || activePartners.has(p.id))
            .map((partner) => {
                const lastMsg = lastMessages.get(partner.id);
                return {
                    partner,
                    lastMessage: lastMsg || null,
                    unreadCount: unreadCounts.get(partner.id) || 0
                } as unknown as Conversation;
            })
            .sort((a, b) => {
                const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return timeB - timeA;
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

    async listFiles(bucket: string, folderPath?: string) {
        const sb = getSupabase();
        const { data, error } = await sb.storage.from(bucket).list(folderPath || '', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) throw error;
        
        return data.map(file => {
            const path = folderPath ? `${folderPath}/${file.name}` : file.name;
            const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(path);
            return {
                name: file.name,
                url: publicUrl,
                created_at: file.created_at,
                size: file.metadata?.size || 0
            };
        });
    },

    async deleteFile(bucket: string, path: string) {
        const sb = getSupabase();
        const { error } = await sb.storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
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
                // Fetch profile from Supabase - profile columns are already snake_case matching Profile type
                const { data: profile } = await getSupabase().from('profiles').select('*').eq('id', data.user.id).single();
                if (profile) return profile as Profile;
            }
        } catch (err) {
            console.warn("Supabase getUser failed, falling back to localStorage:", err);
        }
        // Fallback: read from localStorage (set during signUp/signIn)
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
