import { supabase, isSupabaseConfigured } from './supabase';
import { UserRole, Exercise, Profile, WeeklyPlan, ProgressLog } from '@/types/database';

export type { UserRole, Exercise, Profile, WeeklyPlan, ProgressLog };

export interface SalesPackage {
    id: string;
    coachId: string;
    name: string;
    description: string;
    price: number;
    accessDuration: string; // e.g., "1 Ay", "Sınırsız" - Erişim süresi
    packageType: 'workout' | 'nutrition' | 'bundle'; // Paket Tipi
    totalWeeks: number; // Program uzunluğu
    programContent: WeeklyPlan[]; // Haftalık şablonlar
    sport: string;
    features: string[];
    isPublished: boolean;
    hasChatSupport?: boolean; // Yeni alan
    createdAt: string;
}

export interface GymStore {
    id: string;
    coachId: string;
    name: string; // "Ahmet Hoca Performance Hall"
    slug: string; // "ahmet-hoca-performance"
    description: string;
    logoUrl?: string; // Basit bir emoji veya renk kodu da olabilir şimdilik
    themeColor: string; // Mağaza tema rengi
    instagramUrl?: string;
    category: string; // "Fitness Studio", "Pilates", "Performance Center"
}

export interface SportCategory {
    id: string;
    coachId: string; // Hangi koç oluşturdu (Admin de olabilir ama şimdilik koç bazlı)
    name: string; // "Zıplama", "Yoga", "Powerlifting"
    icon: string; // Emoji veya ikon kodu
    description: string;
    color: string; // "orange", "blue" etc.
    isSystemDefault?: boolean; // Basketbol, Futbol gibi silinemeyenler
}

// Mock Packages
export const MOCK_PACKAGES: SalesPackage[] = [
    {
        id: 'pkg_1',
        coachId: '1',
        name: 'Elit Basketbol Programı',
        description: 'Özel şut teknikleri ve kondisyon antrenmanları.',
        price: 999,
        accessDuration: '1 Ay',
        packageType: 'workout',
        totalWeeks: 4,
        programContent: [], // Detaylı içerik burada tutulacak
        sport: 'basketball',
        features: ['Birebir Şut Analizi', 'Haftalık 3 Görüntülü Görüşme', 'Özel Beslenme Planı'],
        hasChatSupport: true,
        isPublished: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_2',
        coachId: '1',
        name: 'Futbol Kondisyon Paketi',
        description: 'Profesyonel oyuncular için dayanıklılık programı.',
        price: 750,
        accessDuration: '2 Ay',
        packageType: 'bundle',
        totalWeeks: 8,
        programContent: [],
        sport: 'football',
        features: ['Hız ve Patlayıcılık Antrenmanları', 'Sakatlık Önleme Rehberi'],
        isPublished: true,
        createdAt: new Date().toISOString()
    }
];

// Mock Default Sports
export const DEFAULT_SPORTS: SportCategory[] = [
    {
        id: 'basketball',
        coachId: 'system',
        name: 'Basketbol',
        icon: '🏀',
        description: 'Şut teknikleri, dripling, kondisyon',
        color: 'orange',
        isSystemDefault: true
    },
    {
        id: 'football',
        coachId: 'system',
        name: 'Futbol',
        icon: '⚽',
        description: 'Top kontrolü, taktik, dayanıklılık',
        color: 'green',
        isSystemDefault: true
    },
    {
        id: 'swimming',
        coachId: 'system',
        name: 'Yüzme',
        icon: '🏊',
        description: 'Stil geliştirme, tempo, nefes teknikleri',
        color: 'blue',
        isSystemDefault: true
    },
    {
        id: 'fitness',
        coachId: 'system',
        name: 'Fitness',
        icon: '🏋️',
        description: 'Kas geliştirme, kilo verme, güç',
        color: 'purple',
        isSystemDefault: true
    }
];

// Mock Stores
export const MOCK_STORES: GymStore[] = [
    {
        id: 'gym_1',
        coachId: '1',
        name: 'Iron Temple Studio',
        slug: 'iron-temple',
        description: 'Sınırlarını zorlamak isteyenler için profesyonel güç ve kondisyon merkezi.',
        themeColor: 'blue',
        category: 'Performance Center',
        instagramUrl: 'instagram.com/irontemple'
    }
];

// Mock Data
export const MOCK_USERS: Profile[] = [
    {
        id: '1',
        email: 'koc@test.com',
        full_name: 'Ahmet Koç',
        role: 'coach',
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        email: 'ogrenci@test.com',
        full_name: 'Mehmet Öğrenci',
        role: 'student',
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

export const MOCK_EXERCISES: Exercise[] = [
    {
        id: '1',
        name: 'Bench Press',
        description: 'Göğüs kasları için temel egzersiz.',
        instructions: 'Sırta uzanın, barı indirin ve kaldırın.',
        difficulty: 'intermediate',
        muscle_groups: ['göğüs', 'triceps'],
        duration_seconds: 300,
        animation_type: 'video',
        animation_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        category_id: null,
        created_by: '1',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Squat',
        description: 'Bacak ve kalça gelişimi için.',
        instructions: 'Ayaklar omuz genişliğinde, çömel ve kalk.',
        difficulty: 'beginner',
        muscle_groups: ['bacak', 'kalça'],
        duration_seconds: 400,
        animation_type: 'video',
        animation_url: 'https://www.youtube.com/watch?v=aclHkVaku9U',
        category_id: null,
        created_by: '1',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

export const MOCK_NUTRITION_PLANS: any[] = [
    {
        id: '1',
        name: 'Kilo Verme Diyeti',
        coach_id: '1',
        student_id: '2',
        calories: 2200,
        macros: { protein: 180, carbs: 200, fat: 70 },
        meals: [
            { id: '1', type: 'breakfast', name: 'Yulaf Lapası', details: '50g yulaf, 1 ölçek whey, çilek', calories: 450 },
            { id: '2', type: 'lunch', name: 'Izgara Tavuk', details: '200g tavuk göğsü, 100g pirinç, salata', calories: 600 },
            { id: '3', type: 'snack', name: 'Badem & Muz', details: '10 badem, 1 muz', calories: 200 },
            { id: '4', type: 'dinner', name: 'Somon Izgara', details: '150g somon, fırında sebze', calories: 550 },
        ]
    }
];

export const MOCK_PROGRESS_LOGS = [
    { date: '2024-01-01', weight: 85, fat: 20 },
    { date: '2024-01-08', weight: 84.2, fat: 19.5 },
    { date: '2024-01-15', weight: 83.5, fat: 19.0 },
    { date: '2024-01-22', weight: 82.8, fat: 18.5 },
];

// Mock Messages
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string;
    timestamp: string;
    read: boolean;
}

export let MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        senderId: '2', // Öğrenci
        receiverId: '1', // Koç
        content: 'Merhaba hocam, bugünkü antrenmanı tamamladım!',
        timestamp: '2026-02-02T10:30:00',
        read: true,
    },
    {
        id: '2',
        senderId: '1', // Koç
        receiverId: '2', // Öğrenci
        content: 'Harika! Form kontrolü için fotoğraf atabilir misin?',
        timestamp: '2026-02-02T10:35:00',
        read: true,
    },
    {
        id: '3',
        senderId: '2',
        receiverId: '1',
        content: 'Tabii hocam, işte bugünkü antrenman sonrası:',
        timestamp: '2026-02-02T10:40:00',
        read: true,
    },
    {
        id: '4',
        senderId: '1',
        receiverId: '2',
        content: 'Çok iyi görünüyor, ilerleme kaydediyorsun. Yarın bacak antrenmanını unutma!',
        timestamp: '2026-02-02T10:45:00',
        read: false,
    },
];

// Local Storage Keys
const STORAGE_KEY_USER = 'alperen_spor_user';
const STORAGE_KEY_MESSAGES = 'alperen_spor_messages';

// Mock Auth Service
export const authService = {
    signIn: async (email: string, password?: string) => {
        // SUPABASE IMPLEMENTATION
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password: password || '123456', // Fallback if not provided (should be provided)
                });

                if (error) return { user: null, error: error.message };

                if (data.user) {
                    // Fetch full profile (including role)
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    if (profileError) return { user: null, error: 'Profil bilgileri alınamadı.' };

                    if (profile) {
                        const userProfile = profile as Profile;
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
                            document.cookie = `mock_role=${userProfile.role}; path=/`;
                        }
                        return { user: userProfile, error: null };
                    }
                }
                return { user: null, error: 'Kullanıcı bulunamadı.' };
            } catch (err: any) {
                return { user: null, error: err.message };
            }
        }

        // MOCK IMPLEMENTATION
        // Simüle edilmiş bekleme süresi
        await new Promise(resolve => setTimeout(resolve, 1000));

        let user = MOCK_USERS.find(u => u.email === email);

        // If not found in static mock data, check localStorage for registered students
        if (!user && typeof window !== 'undefined') {
            const storedStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
            user = storedStudents.find((u: Profile) => u.email === email);

            // Also check for coach if we had storage for them (future proofing)
            // const storedCoaches = ...
        }

        if (user) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
                document.cookie = `mock_role=${user.role}; path=/`;
            }
            return { user, error: null };
        }
        return { user: null, error: 'Kullanıcı bulunamadı (Mock: koc@test.com veya ogrenci@test.com deneyin)' };
    },

    signUp: async (email: string, role: UserRole, fullName: string, password?: string) => {
        // SUPABASE IMPLEMENTATION
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password: password || '123456',
                    options: {
                        data: {
                            full_name: fullName,
                            role: role
                        }
                    }
                });

                if (error) return { user: null, error: error.message };

                if (data.user) {
                    // Profile is created by Trigger automatically
                    // But we construct the profile object to return it immediately
                    const newUser: Profile = {
                        id: data.user.id,
                        email: email,
                        role: role,
                        full_name: fullName,
                        avatar_url: null,
                        phone: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    if (typeof window !== 'undefined') {
                        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
                        document.cookie = `mock_role=${role}; path=/`;
                    }

                    return { user: newUser, error: null };
                }
            } catch (err: any) {
                return { user: null, error: err.message };
            }
        }

        // MOCK IMPLEMENTATION
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newUser: Profile = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            role,
            full_name: fullName,
            avatar_url: null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Update memory
        MOCK_USERS.push(newUser);

        if (typeof window !== 'undefined') {
            // Set current session
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
            document.cookie = `mock_role=${newUser.role}; path=/`;

            // Add to global users list (for coach to see)
            if (role === 'student') {
                const currentStudents: any[] = JSON.parse(localStorage.getItem('mock_students') || '[]');
                currentStudents.push(newUser);
                localStorage.setItem('mock_students', JSON.stringify(currentStudents));
            }
        }
        return { user: newUser, error: null };
    },

    signOut: async () => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        }

        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY_USER);
            document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
    },

    getUser: () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_USER);
            return stored ? JSON.parse(stored) : null;
        }
        return null;
    }
};

// Mock Data Service
export const dataService = {
    getExercises: async (coachId?: string) => {
        // SUPABASE
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching exercises:', error);
                return [];
            }

            // Client-side filtering if complex OR logic is needed and not covered by simple query
            // But RLS manages security. Here we replicate the mock logic:
            if (coachId) {
                return (data as Exercise[]).filter(e => e.created_by === coachId || e.is_public);
            }
            return data as Exercise[];
        }

        // MOCK
        await new Promise(resolve => setTimeout(resolve, 300));
        let exercises = MOCK_EXERCISES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_exercises');
            if (stored) {
                exercises = JSON.parse(stored);
            } else {
                localStorage.setItem('mock_exercises', JSON.stringify(MOCK_EXERCISES));
            }
        }
        // Filter: show coach's own exercises + public exercises from others
        if (coachId) {
            return exercises.filter(e => e.created_by === coachId || e.is_public);
        }
        return exercises;
    },

    addExercise: async (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newExercise: Exercise = {
            ...exercise,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_exercises');
            const exercises = stored ? JSON.parse(stored) : MOCK_EXERCISES;
            exercises.push(newExercise);
            localStorage.setItem('mock_exercises', JSON.stringify(exercises));
        }
        return newExercise;
    },

    updateExercise: async (exercise: Exercise) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_exercises');
            let exercises = stored ? JSON.parse(stored) : MOCK_EXERCISES;
            exercises = exercises.map((e: Exercise) =>
                e.id === exercise.id ? { ...exercise, updated_at: new Date().toISOString() } : e
            );
            localStorage.setItem('mock_exercises', JSON.stringify(exercises));
        }
        return exercise;
    },

    deleteExercise: async (exerciseId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_exercises');
            let exercises = stored ? JSON.parse(stored) : MOCK_EXERCISES;
            exercises = exercises.filter((e: Exercise) => e.id !== exerciseId);
            localStorage.setItem('mock_exercises', JSON.stringify(exercises));
        }
        return { success: true };
    },


    getStudentStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get exercises from localStorage or use default
        let exercises = MOCK_EXERCISES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_exercises');
            if (stored) exercises = JSON.parse(stored);
        }

        // Get nutrition plans from localStorage or use default
        let nutritionPlans = MOCK_NUTRITION_PLANS;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_nutrition_plans');
            if (stored) nutritionPlans = JSON.parse(stored);
        }

        // Get students count
        const students = MOCK_USERS.filter(u => u.role === 'student');

        return {
            activeStudents: students.length,
            programs: nutritionPlans.length + exercises.length,
            completedWorkouts: Math.floor(Math.random() * 20) + 10 // Simulated
        };
    },

    getTodaysWorkout: async () => {
        return [
            { id: '101', exercise: MOCK_EXERCISES[0], sets: 3, reps: 12, is_completed: false },
            { id: '102', exercise: MOCK_EXERCISES[1], sets: 4, reps: 10, is_completed: true }
        ];
    },

    getStudents: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_students');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // Initialize with default students
                const defaultStudents = MOCK_USERS.filter(u => u.role === 'student');
                localStorage.setItem('mock_students', JSON.stringify(defaultStudents));
                return defaultStudents;
            }
        }
        return MOCK_USERS.filter(u => u.role === 'student');
    },

    addStudent: async (fullName: string, email: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newStudent: Profile = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            full_name: fullName,
            role: 'student',
            avatar_url: null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Update memory
        MOCK_USERS.push(newStudent);

        // Update localStorage
        if (typeof window !== 'undefined') {
            const currentStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
            currentStudents.push(newStudent);
            localStorage.setItem('mock_students', JSON.stringify(currentStudents));
        }

        return newStudent;
    },

    getNutritionPlan: async (studentId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!studentId) return null;

        let plans = MOCK_NUTRITION_PLANS;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_nutrition_plans');
            if (stored) {
                plans = JSON.parse(stored);
            }
        }

        const userPlans = plans.filter(p => p.student_id === studentId);
        if (userPlans.length > 0) {
            return userPlans[userPlans.length - 1];
        }
        return null;
    },

    getNutritionPlans: async (coachId?: string) => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_nutrition_plans');
            if (stored) {
                const plans = JSON.parse(stored);
                if (coachId) return plans.filter((p: any) => p.coach_id === coachId);
                return plans;
            } else {
                // Init local storage
                localStorage.setItem('mock_nutrition_plans', JSON.stringify(MOCK_NUTRITION_PLANS));
            }
        }
        if (coachId) return MOCK_NUTRITION_PLANS.filter(p => p.coach_id === coachId);
        return MOCK_NUTRITION_PLANS;
    },

    addNutritionPlan: async (plan: any) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newPlan = { ...plan, id: Math.random().toString(36).substr(2, 9) };

        // Update Memory
        MOCK_NUTRITION_PLANS.push(newPlan);

        // Update Local Storage
        if (typeof window !== 'undefined') {
            const currentPlans = JSON.parse(localStorage.getItem('mock_nutrition_plans') || JSON.stringify(MOCK_NUTRITION_PLANS));
            currentPlans.push(newPlan);
            localStorage.setItem('mock_nutrition_plans', JSON.stringify(currentPlans));
        }

        return newPlan;
    },

    assignNutritionPlan: async (planId: string, studentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));

        // Get current plans from storage
        let currentPlans = [...MOCK_NUTRITION_PLANS];
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_nutrition_plans');
            if (stored) currentPlans = JSON.parse(stored);
        }

        const plan = currentPlans.find(p => p.id === planId);
        if (!plan) return null;

        // Check if student already has this plan assigned (same base name)
        const baseName = plan.name.replace(' (Atandı)', '');
        const existingAssignment = currentPlans.find(
            p => p.student_id === studentId && (p.name === baseName || p.name === `${baseName} (Atandı)`)
        );

        if (existingAssignment) {
            // Student already has this plan, just return existing
            return existingAssignment;
        }

        // Check if this is a template (no student_id) being assigned
        if (!plan.student_id) {
            // Update the original plan to be assigned to this student
            plan.student_id = studentId;

            // Update in storage
            if (typeof window !== 'undefined') {
                localStorage.setItem('mock_nutrition_plans', JSON.stringify(currentPlans));
            }

            return plan;
        }

        // If the source plan already belongs to another student, create a copy
        const assignedPlan = {
            ...plan,
            id: Math.random().toString(36).substr(2, 9),
            student_id: studentId,
            name: baseName
        };

        currentPlans.push(assignedPlan);

        if (typeof window !== 'undefined') {
            localStorage.setItem('mock_nutrition_plans', JSON.stringify(currentPlans));
        }

        return assignedPlan;
    },
    getProgressHistory: async (studentId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        let logs = MOCK_PROGRESS_LOGS;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_progress_logs');
            if (stored) {
                logs = JSON.parse(stored);
            } else {
                localStorage.setItem('mock_progress_logs', JSON.stringify(MOCK_PROGRESS_LOGS));
            }
        }

        // Filter by studentId if needed (in a real app), for now return all or filter if structure supports it
        // Assuming MOCK_PROGRESS_LOGS structure is simple for now, but we can extend it.
        return logs;
    },

    addProgressLog: async (log: { weight: number; fat?: number; photos?: string[] }) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newLog = {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            weight: log.weight,
            fat: log.fat || 0,
            photos: log.photos || []
        };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_progress_logs');
            const logs = stored ? JSON.parse(stored) : MOCK_PROGRESS_LOGS;
            logs.push(newLog);
            // Sort by date
            logs.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            localStorage.setItem('mock_progress_logs', JSON.stringify(logs));
        }

        return newLog;
    },

    // -- WEEKLY PLAN METHODS --
    getWeeklyPlan: async (studentId: string): Promise<WeeklyPlan> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`weekly_plan_${studentId}`);
            if (stored) return JSON.parse(stored);
        }
        // Default empty plan
        return {
            studentId,
            workouts: {
                'Pazartesi': [], 'Salı': [], 'Çarşamba': [], 'Perşembe': [], 'Cuma': [], 'Cumartesi': [], 'Pazar': []
            },
            nutrition: {
                'Pazartesi': [], 'Salı': [], 'Çarşamba': [], 'Perşembe': [], 'Cuma': [], 'Cumartesi': [], 'Pazar': []
            }
        };
    },

    saveWeeklyPlan: async (studentId: string, plan: WeeklyPlan) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            localStorage.setItem(`weekly_plan_${studentId}`, JSON.stringify(plan));
        }
        return plan;
    },

    // -- NEW METHODS FOR STUDENT DETAILS --
    getStudentById: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_students');
            if (stored) {
                const students = JSON.parse(stored);
                const found = students.find((u: any) => u.id === id);
                if (found) return found;
            }
        }

        return MOCK_USERS.find(u => u.id === id);
    },

    getStudentProgram: async (studentId: string) => {
        // Demo: Öğrenciye atanmış programları dön
        return {
            workouts: [
                { id: 'p1', name: 'Hipertrofi Programı - Gün 1: Göğüs', assignedDate: '2024-02-01', status: 'active', completion: 12 },
                { id: 'p2', name: 'Hipertrofi Programı - Gün 2: Sırt', assignedDate: '2024-02-02', status: 'pending', completion: 0 },
            ],
            nutrition: MOCK_NUTRITION_PLANS.find(p => p.student_id === studentId) || null,
            stats: {
                attendance: 92,
                weight_change: -1.5,
                last_login: '2 saat önce'
            }
        };
    },

    // -- MESSAGING FUNCTIONS --
    getMessages: async (userId: string, otherUserId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        let messages = MOCK_MESSAGES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) {
                messages = JSON.parse(stored);
            } else {
                localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(MOCK_MESSAGES));
            }
        }

        // Filter messages between these two users
        return messages.filter(m =>
            (m.senderId === userId && m.receiverId === otherUserId) ||
            (m.senderId === otherUserId && m.receiverId === userId)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },

    sendMessage: async (senderId: string, receiverId: string, content: string, imageUrl?: string) => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            senderId,
            receiverId,
            content,
            imageUrl,
            timestamp: new Date().toISOString(),
            read: false,
        };

        // Update memory
        MOCK_MESSAGES.push(newMessage);

        // Update localStorage
        // Update localStorage
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
                const messages = stored ? JSON.parse(stored) : MOCK_MESSAGES;
                messages.push(newMessage);
                localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
            } catch (error) {
                console.warn('LocalStorage quota exceeded. Attempting to save without image data.');

                // Fallback: If saving failed (likely due to image size), try saving without the image
                if (imageUrl) {
                    try {
                        const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
                        const messages = stored ? JSON.parse(stored) : MOCK_MESSAGES;

                        // Create a fallback message without the heavy image data
                        const fallbackMessage = {
                            ...newMessage,
                            imageUrl: undefined,
                            content: `${newMessage.content} (🖼️ Görsel, tarayıcı hafızası dolu olduğu için kaydedilemedi)`
                        };

                        messages.push(fallbackMessage);
                        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
                    } catch (retryError) {
                        console.error('Failed to save fallback message:', retryError);
                    }
                }
            }
        }

        return newMessage;
    },

    getConversations: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        let messages = MOCK_MESSAGES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) messages = JSON.parse(stored);
        }

        // Get unique conversation partners
        const partnerIds = new Set<string>();
        messages.forEach(m => {
            if (m.senderId === userId) partnerIds.add(m.receiverId);
            if (m.receiverId === userId) partnerIds.add(m.senderId);
        });

        // Get partner details and last message
        const conversations = [];
        for (const partnerId of partnerIds) {
            const partner = MOCK_USERS.find(u => u.id === partnerId);
            const conversationMessages = messages.filter(m =>
                (m.senderId === userId && m.receiverId === partnerId) ||
                (m.senderId === partnerId && m.receiverId === userId)
            ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const unreadCount = conversationMessages.filter(m =>
                m.receiverId === userId && !m.read
            ).length;

            if (partner && conversationMessages.length > 0) {
                conversations.push({
                    partner,
                    lastMessage: conversationMessages[0],
                    unreadCount,
                });
            }
        }

        return conversations;
    },

    markMessagesAsRead: async (userId: string, senderId: string) => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) {
                const messages: Message[] = JSON.parse(stored);
                messages.forEach(m => {
                    if (m.senderId === senderId && m.receiverId === userId) {
                        m.read = true;
                    }
                });
                localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
            }
        }
    },

    // -- PACKAGES METHODS --
    getPackages: async (coachId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let packages = MOCK_PACKAGES;

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            if (stored) {
                packages = JSON.parse(stored);
            } else {
                localStorage.setItem('mock_packages', JSON.stringify(MOCK_PACKAGES));
            }
        }

        if (coachId) {
            return packages.filter(p => p.coachId === coachId);
        }
        return packages;
    },

    createPackage: async (pkg: Omit<SalesPackage, 'id' | 'createdAt'>) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newPackage: SalesPackage = {
            ...pkg,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            const packages = stored ? JSON.parse(stored) : MOCK_PACKAGES;
            packages.push(newPackage);
            localStorage.setItem('mock_packages', JSON.stringify(packages));
        }

        return newPackage;
    },

    deletePackage: async (packageId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            const packages = stored ? JSON.parse(stored) : MOCK_PACKAGES;
            const updatedPackages = packages.filter((p: SalesPackage) => p.id !== packageId);
            localStorage.setItem('mock_packages', JSON.stringify(updatedPackages));
        }
    },

    updatePackage: async (pkg: SalesPackage) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            const packages = stored ? JSON.parse(stored) : MOCK_PACKAGES;
            const updatedPackages = packages.map((p: SalesPackage) => p.id === pkg.id ? pkg : p);
            localStorage.setItem('mock_packages', JSON.stringify(updatedPackages));
        }
        return pkg;
    },

    // -- STORE METHODS --
    getGymStore: async (coachId: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        let stores = MOCK_STORES;

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            if (stored) {
                stores = JSON.parse(stored);
            } else {
                localStorage.setItem('mock_stores', JSON.stringify(MOCK_STORES));
            }
        }

        return stores.find(s => s.coachId === coachId) || null;
    },

    getGymStoreBySlug: async (slug: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        let stores = MOCK_STORES;

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            if (stored) stores = JSON.parse(stored);
        }

        return stores.find(s => s.slug === slug) || null;
    },

    updateGymStore: async (storeData: GymStore) => {
        await new Promise(resolve => setTimeout(resolve, 600));

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            let stores = stored ? JSON.parse(stored) : MOCK_STORES;

            const existingIndex = stores.findIndex((s: GymStore) => s.id === storeData.id);
            if (existingIndex >= 0) {
                stores[existingIndex] = storeData;
            } else {
                stores.push(storeData);
            }

            localStorage.setItem('mock_stores', JSON.stringify(stores));
        }
        return storeData;
    },

    createGymStore: async (coachId: string, name: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const newStore: GymStore = {
            id: Math.random().toString(36).substr(2, 9),
            coachId,
            name,
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: 'Henüz açıklama girilmedi.',
            themeColor: 'green',
            category: 'Personal Training'
        };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            let stores = stored ? JSON.parse(stored) : MOCK_STORES;
            stores.push(newStore);
            localStorage.setItem('mock_stores', JSON.stringify(stores));
        }
        return newStore;
    },

    // -- SPORT CATEGORY METHODS --
    getSports: async (coachId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        let sports = DEFAULT_SPORTS;

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_sports');
            if (stored) {
                sports = JSON.parse(stored);
            } else {
                localStorage.setItem('mock_sports', JSON.stringify(DEFAULT_SPORTS));
            }
        }

        // Return all sports (system defaults + coach specific)
        // In a real multi-tenant app, we might filter coach specific ones only for that coach's store
        // But for registration, we show all available.
        return sports;
    },

    createSport: async (sport: Omit<SportCategory, 'id'>) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newSport: SportCategory = {
            ...sport,
            id: sport.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 5)
        };

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_sports');
            let sports = stored ? JSON.parse(stored) : DEFAULT_SPORTS;
            sports.push(newSport);
            localStorage.setItem('mock_sports', JSON.stringify(sports));
        }
        return newSport;
    },

    deleteSport: async (sportId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_sports');
            let sports = stored ? JSON.parse(stored) : DEFAULT_SPORTS;
            // Only delete if not system default
            sports = sports.filter((s: SportCategory) => s.id !== sportId || s.isSystemDefault);
            localStorage.setItem('mock_sports', JSON.stringify(sports));
        }
    }
};
