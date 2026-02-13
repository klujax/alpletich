import { supabase, isSupabaseConfigured } from './supabase';
import { supabaseDataService, supabaseAuthService } from './supabase-service';
import {
    GroupClass, SalesPackage, Purchase, GymStore,
    Profile, UserRole, SportCategory, Exercise,
    WorkoutDay, NutritionDay, Review, Message,
    ProgressEntry, Meal
} from './types';

export * from './types';

// =============================================
// MOCK DATA (Retained for local fallback)
// =============================================

export const DEFAULT_SPORTS: SportCategory[] = [
    // Takım Sporları
    { id: 'football', coachId: 'system', name: 'Futbol', icon: '⚽', description: 'Taktik, kondisyon, top kontrolü', color: 'green', isSystemDefault: true },
    { id: 'basketball', coachId: 'system', name: 'Basketbol', icon: '🏀', description: 'Şut, dribling, kondisyon', color: 'orange', isSystemDefault: true },
    { id: 'volleyball', coachId: 'system', name: 'Voleybol', icon: '🏐', description: 'Smaç, manşet, takım oyunu', color: 'pink', isSystemDefault: true },
    { id: 'handball', coachId: 'system', name: 'Hentbol', icon: '🤾', description: 'Hız, güç, koordinasyon', color: 'red', isSystemDefault: true },

    // Dövüş Sporları
    { id: 'boxing', coachId: 'system', name: 'Boks', icon: '🥊', description: 'Yumruk teknikleri, savunma, kondisyon', color: 'red', isSystemDefault: true },
    { id: 'kickboxing', coachId: 'system', name: 'Kick Boks', icon: '🦵', description: 'Tekme, yumruk kombinasyonları', color: 'orange', isSystemDefault: true },
    { id: 'taekwondo', coachId: 'system', name: 'Tekvando', icon: '🥋', description: 'Yüksek tekme teknikleri, disiplin', color: 'blue', isSystemDefault: true },
    { id: 'muaythai', coachId: 'system', name: 'Muay Thai', icon: '👊', description: 'Diz, dirsek, sert vuruşlar', color: 'red', isSystemDefault: true },
    { id: 'mma', coachId: 'system', name: 'MMA', icon: '🤼', description: 'Karma dövüş sanatları', color: 'slate', isSystemDefault: true },
    { id: 'wrestling', coachId: 'system', name: 'Güreş', icon: '🤼‍♂️', description: 'Grekoromen ve serbest stil teknikleri', color: 'yellow', isSystemDefault: true },
    { id: 'judo', coachId: 'system', name: 'Judo', icon: '🥋', description: 'Fırlatma, tutuş teknikleri', color: 'blue', isSystemDefault: true },
    { id: 'karate', coachId: 'system', name: 'Karate', icon: '🥋', description: 'Kata, kumite, disiplin', color: 'red', isSystemDefault: true },

    // Raket Sporları
    { id: 'tennis', coachId: 'system', name: 'Tenis', icon: '🎾', description: 'Servis, forehand, backhand', color: 'green', isSystemDefault: true },
    { id: 'table_tennis', coachId: 'system', name: 'Masa Tenisi', icon: '🏓', description: 'Hız, refleks, spin', color: 'blue', isSystemDefault: true },
    { id: 'badminton', coachId: 'system', name: 'Badminton', icon: '🏸', description: 'Çeviklik, hız, teknik', color: 'teal', isSystemDefault: true },

    // Su Sporları
    { id: 'swimming', coachId: 'system', name: 'Yüzme', icon: '🏊', description: 'Serbest, sırtüstü, kelebek', color: 'blue', isSystemDefault: true },
    { id: 'water_polo', coachId: 'system', name: 'Sutopu', icon: '🤽', description: 'Su içi kondisyon ve takım oyunu', color: 'cyan', isSystemDefault: true },

    // Fitness & Wellness
    { id: 'fitness', coachId: 'system', name: 'Fitness', icon: '🏋️', description: 'Vücut geliştirme, güç, hipertrofi', color: 'slate', isSystemDefault: true },
    { id: 'pilates', coachId: 'system', name: 'Pilates', icon: '🧘‍♀️', description: 'Core gücü, esneklik, duruş', color: 'pink', isSystemDefault: true },
    { id: 'yoga', coachId: 'system', name: 'Yoga', icon: '🧘', description: 'Zihin-beden dengesi, esneklik', color: 'purple', isSystemDefault: true },
    { id: 'crossfit', coachId: 'system', name: 'CrossFit', icon: '⛓️', description: 'Yüksek yoğunluklu fonksiyonel antrenman', color: 'slate', isSystemDefault: true },
    { id: 'calisthenics', coachId: 'system', name: 'Kalistenik', icon: '🤸‍♂️', description: 'Vücut ağırlığı ile antrenman', color: 'orange', isSystemDefault: true },

    // Atletizm & Doğa
    { id: 'athletics', coachId: 'system', name: 'Atletizm', icon: '🏃', description: 'Koşu, atlama, atma branşları', color: 'yellow', isSystemDefault: true },
    { id: 'running', coachId: 'system', name: 'Koşu', icon: '🏃‍♂️', description: 'Maraton, sprint, jogging', color: 'green', isSystemDefault: true },
    { id: 'cycling', coachId: 'system', name: 'Bisiklet', icon: '🚴', description: 'Yol, dağ bisikleti kondisyonu', color: 'sky', isSystemDefault: true },
    { id: 'archery', coachId: 'system', name: 'Okçuluk', icon: '🏹', description: 'Odaklanma, isabet, teknik', color: 'amber', isSystemDefault: true },
    { id: 'gymnastics', coachId: 'system', name: 'Cimnastik', icon: '🤸‍♀️', description: 'Esneklik, denge, güç', color: 'purple', isSystemDefault: true },
];

export const MOCK_USERS: Profile[] = [
    {
        id: '1', email: 'koc@test.com', full_name: 'Ahmet Koç', role: 'coach',
        avatar_url: null, phone: '+90 532 111 22 33',
        created_at: '2025-06-15T10:00:00Z', updated_at: new Date().toISOString(),
    },
    {
        id: '2', email: 'ogrenci@test.com', full_name: 'Mehmet Öğrenci', role: 'student',
        avatar_url: null, phone: '+90 533 444 55 66',
        interested_sports: ['basketball', 'fitness'],
        created_at: '2025-08-20T14:30:00Z', updated_at: new Date().toISOString(),
    },
    {
        id: '3', email: 'selin.yilmaz@gmail.com', full_name: 'Selin Yılmaz', role: 'student',
        avatar_url: null, phone: '+90 535 777 88 99',
        interested_sports: ['swimming', 'yoga'],
        created_at: '2025-12-01T09:15:00Z', updated_at: new Date().toISOString(),
    },
    {
        id: '4', email: 'can.demir@outlook.com', full_name: 'Can Demir', role: 'coach',
        avatar_url: null, phone: '+90 542 333 44 55',
        created_at: '2025-09-10T16:45:00Z', updated_at: new Date().toISOString(),
    },
    {
        id: '5', email: 'ayse.kara@gmail.com', full_name: 'Ayşe Kara', role: 'student',
        avatar_url: null, phone: '+90 545 666 77 88',
        created_at: '2025-11-05T12:00:00Z', updated_at: new Date().toISOString(),
    },
    {
        id: 'admin_1', email: 'superadmin@sportaly.com', full_name: 'Sportaly Admin', role: 'admin',
        avatar_url: null, phone: '+90 500 000 00 00',
        created_at: '2025-01-01T00:00:00Z', updated_at: new Date().toISOString(),
    }
];

export const MOCK_STORES: GymStore[] = [
    {
        id: 'shop_1', coachId: '1', name: 'Ahmet Koç Performance', slug: 'ahmet-koc-performance',
        description: 'Profesyonel basketbol ve fitness eğitimleri. 10+ yıllık deneyim ile hedefinize ulaşın.',
        logoEmoji: '🏀', themeColor: 'orange', category: 'Basketbol & Fitness',
        isActive: true, isBanned: false, totalRevenue: 45200, totalStudents: 28,
        rating: 4.8, reviewCount: 42, createdAt: '2025-07-01T10:00:00Z',
    },
    {
        id: 'shop_2', coachId: '4', name: 'Can Demir Yüzme Akademi', slug: 'can-demir-yuzme',
        description: 'Her yaş ve seviye için yüzme dersleri. Suyun gücünü keşfedin.',
        logoEmoji: '🏊', themeColor: 'blue', category: 'Yüzme',
        isActive: true, isBanned: false, totalRevenue: 32800, totalStudents: 15,
        rating: 4.6, reviewCount: 23, createdAt: '2025-09-15T14:00:00Z',
    }
];

export const MOCK_PACKAGES: SalesPackage[] = [
    {
        id: 'pkg_1', coachId: '1', shopId: 'shop_1', name: 'Elit Basketbol Programı',
        description: 'Özel şut teknikleri ve kondisyon antrenmanları ile seviyeni yükselt.',
        price: 999, accessDuration: '1 Ay', packageType: 'coaching', totalWeeks: 4,
        sport: 'basketball', features: ['Birebir Şut Analizi', 'Haftalık 3 Görüntülü Görüşme', 'Özel Beslenme Planı', 'Whatsapp destek'],
        isPublished: true, hasChatSupport: true, hasGroupClass: false,
        maxStudents: 10, enrolledStudents: 7, rating: 4.9, reviewCount: 12,
        programContent: [], createdAt: new Date().toISOString(),
        workoutPlan: [
            {
                dayName: 'Pazartesi - Şut Tekniği',
                focusArea: 'Üst Vücut & Şut',
                exercises: [
                    { id: 'ex_1', name: 'Serbest Atış', targetMuscle: 'Omuz/Bilek', sets: 5, reps: '20 Tekrar', restSeconds: 60, videoUrl: '#' },
                    { id: 'ex_2', name: 'Dribling + Şut', targetMuscle: 'Tüm Vücut', sets: 4, reps: '15 Tekrar', restSeconds: 90, videoUrl: '#' },
                    { id: 'ex_3', name: 'Şınav', targetMuscle: 'Göğüs/Triceps', sets: 3, reps: '12 Tekrar', restSeconds: 45, videoUrl: '#' }
                ]
            },
            {
                dayName: 'Çarşamba - Kondisyon',
                focusArea: 'Kardiyo & Bacak',
                exercises: [
                    { id: 'ex_4', name: 'İp Atlama', targetMuscle: 'Kardiyo', sets: 5, reps: '2 Dakika', restSeconds: 60 },
                    { id: 'ex_5', name: 'Box Jump', targetMuscle: 'Bacak', sets: 4, reps: '10 Tekrar', restSeconds: 90 },
                    { id: 'ex_6', name: 'Defansif Kayma', targetMuscle: 'Bacak/Kalça', sets: 4, reps: '30 Saniye', restSeconds: 60 }
                ]
            },
            {
                dayName: 'Cuma - Maç Simülasyonu',
                focusArea: 'Oyun Bilgisi',
                exercises: [
                    { id: 'ex_7', name: '3v3 Maç', targetMuscle: 'Tüm Vücut', sets: 1, reps: '30 Dakika', restSeconds: 0 }
                ]
            }
        ],
        nutritionPlan: [
            {
                dayName: 'Hafta İçi Standart',
                meals: [
                    {
                        type: 'Kahvaltı',
                        items: [{ id: 'm_1', name: 'Yulaf Lapası', calories: 350, protein: 12, carbs: 60, fat: 6, ingredients: ['Yulaf', 'Süt', 'Muz', 'Ceviz'] }]
                    },
                    {
                        type: 'Öğle Yemeği',
                        items: [{ id: 'm_2', name: 'Izgara Tavuk & Pilav', calories: 550, protein: 40, carbs: 70, fat: 10, ingredients: ['Tavuk Göğsü', 'Basmati Pirinç', 'Brokoli'] }]
                    },
                    {
                        type: 'Akşam Yemeği',
                        items: [{ id: 'm_3', name: 'Ton Balıklı Salata', calories: 300, protein: 25, carbs: 10, fat: 15, ingredients: ['Ton Balığı', 'Yeşillik', 'Zeytinyağı'] }]
                    }
                ]
            }
        ]
    },
    {
        id: 'pkg_2', coachId: '1', shopId: 'shop_1', name: 'Fitness Başlangıç Programı',
        description: 'Sıfırdan başlayanlar için 8 haftalık kapsamlı fitness programı.',
        price: 750, accessDuration: '2 Ay', packageType: 'program', totalWeeks: 8,
        sport: 'fitness', features: ['Video Anlatımlı Egzersizler', 'Haftalık Plan Güncellemesi', 'Beslenme Rehberi'],
        isPublished: true, hasChatSupport: false, hasGroupClass: true,
        maxStudents: 30, enrolledStudents: 22, rating: 4.7, reviewCount: 18,
        programContent: [], createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_3', coachId: '4', shopId: 'shop_2', name: 'Yüzme Kondisyon Paketi',
        description: 'Profesyonel yüzücüler için dayanıklılık ve hız programı.',
        price: 1200, accessDuration: '3 Ay', packageType: 'coaching', totalWeeks: 12,
        sport: 'swimming', features: ['Birebir Teknik Analiz', 'Su İçi Video Çekim', 'Performans Takibi', 'Haftalık Grup Dersi'],
        isPublished: true, hasChatSupport: true, hasGroupClass: true,
        maxStudents: 8, enrolledStudents: 5, rating: 4.8, reviewCount: 8,
        programContent: [], createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_4', coachId: '1', shopId: 'shop_1', name: 'Grup Basketbol Antrenmanı',
        description: 'Her hafta canlı grup antrenmanı ile basketbol becerilerini geliştir.',
        price: 450, accessDuration: '1 Ay', packageType: 'coaching', totalWeeks: 4,
        sport: 'basketball', features: ['Haftada 2 Canlı Ders', 'Takım Çalışması', 'Maç Analizi'],
        isPublished: true, hasChatSupport: false, hasGroupClass: true,
        maxStudents: 20, enrolledStudents: 14, rating: 4.5, reviewCount: 9,
        programContent: [], createdAt: new Date().toISOString()
    },
];

export const MOCK_GROUP_CLASSES: GroupClass[] = [
    {
        id: 'gc_1', coachId: '1', shopId: 'shop_1', packageId: 'pkg_4',
        title: 'Basketbol Teknik Antrenmanı', description: 'Şut ve dribling üzerine yoğun çalışma',
        sport: 'basketball', scheduledAt: '2026-02-12T18:00:00Z', durationMinutes: 60,
        maxParticipants: 20, enrolledParticipants: ['2', '3', '5'],
        meetingLink: 'https://meet.google.com/abc-defg-hij', status: 'scheduled',
        price: 0, createdAt: new Date().toISOString()
    },
    {
        id: 'gc_2', coachId: '1', shopId: 'shop_1',
        title: 'Fitness HIIT Grup Dersi', description: 'Yüksek tempolu interval antrenmanı',
        sport: 'fitness', scheduledAt: '2026-02-13T10:00:00Z', durationMinutes: 45,
        maxParticipants: 30, enrolledParticipants: ['2', '5'],
        meetingLink: 'https://meet.google.com/xyz-uvwt-lmn', status: 'scheduled',
        price: 150, createdAt: new Date().toISOString()
    },
    {
        id: 'gc_3', coachId: '4', shopId: 'shop_2',
        title: 'Yüzme Teknik Geliştirme', description: 'Serbest stil ve kurbağalama teknik çalışması',
        sport: 'swimming', scheduledAt: '2026-02-14T16:00:00Z', durationMinutes: 90,
        maxParticipants: 8, enrolledParticipants: ['3'],
        status: 'scheduled', price: 200, createdAt: new Date().toISOString()
    }
];

export const MOCK_PURCHASES: Purchase[] = [
    {
        id: 'pur_1', studentId: '2', coachId: '1', shopId: 'shop_1', packageId: 'pkg_1',
        type: 'package', packageName: 'Elit Basketbol Programı', price: 999,
        status: 'active', purchasedAt: '2026-01-15T10:00:00Z', expiresAt: '2026-02-15T10:00:00Z'
    },
    {
        id: 'pur_2', studentId: '2', coachId: '1', shopId: 'shop_1', packageId: 'pkg_4',
        type: 'package', packageName: 'Grup Basketbol Antrenmanı', price: 450,
        status: 'active', purchasedAt: '2026-01-20T14:00:00Z', expiresAt: '2026-02-20T14:00:00Z'
    },
    {
        id: 'pur_3', studentId: '3', coachId: '4', shopId: 'shop_2', packageId: 'pkg_3',
        type: 'package', packageName: 'Yüzme Kondisyon Paketi', price: 1200,
        status: 'active', purchasedAt: '2026-01-10T09:00:00Z', expiresAt: '2026-04-10T09:00:00Z'
    },
    {
        id: 'pur_4', studentId: '5', coachId: '1', shopId: 'shop_1', packageId: 'pkg_2',
        type: 'package', packageName: 'Fitness Başlangıç Programı', price: 750,
        status: 'active', purchasedAt: '2026-02-01T11:00:00Z', expiresAt: '2026-04-01T11:00:00Z'
    },
];

export const MOCK_REVIEWS: Review[] = [
    {
        id: 'rev_1', studentId: '2', studentName: 'Mehmet Öğrenci', coachId: '1', shopId: 'shop_1', packageId: 'pkg_1',
        rating: 5, comment: 'Ahmet hoca gerçekten çok ilgili. Şut tekniğim gözle görülür şekilde gelişti. Kesinlikle tavsiye ederim!',
        createdAt: '2026-02-01T14:30:00Z'
    },
    {
        id: 'rev_2', studentId: '5', studentName: 'Ayşe Kara', coachId: '1', shopId: 'shop_1', packageId: 'pkg_2',
        rating: 4, comment: 'Program gayet kapsamlı ve anlaşılır. Ama biraz daha video içerik olabilirdi.',
        createdAt: '2026-02-05T09:00:00Z'
    },
    {
        id: 'rev_3', studentId: '3', studentName: 'Selin Yılmaz', coachId: '4', shopId: 'shop_2', packageId: 'pkg_3',
        rating: 5, comment: 'Can hoca yüzme konusunda çok deneyimli. Su içi video analizleri harika!',
        createdAt: '2026-02-03T16:00:00Z'
    },
];

export let MOCK_MESSAGES: Message[] = [
    { id: '1', senderId: '2', receiverId: '1', content: 'Merhaba hocam, bugünkü antrenmanı tamamladım!', timestamp: '2026-02-02T10:30:00', read: true },
    { id: '2', senderId: '1', receiverId: '2', content: 'Harika! Form kontrolü için fotoğraf atabilir misin?', timestamp: '2026-02-02T10:35:00', read: true },
    { id: '3', senderId: '2', receiverId: '1', content: 'Tabii hocam, işte bugünkü antrenman sonrası:', timestamp: '2026-02-02T10:40:00', read: true },
    { id: '4', senderId: '1', receiverId: '2', content: 'Çok iyi görünüyor, ilerleme kaydediyorsun. Yarın bacak antrenmanını unutma!', timestamp: '2026-02-02T10:45:00', read: false },
];

// =============================================
// LOCAL STORAGE KEYS
// =============================================
const STORAGE_KEY_USER = 'sportaly_user';
const STORAGE_KEY_MESSAGES = 'sportaly_messages';

// =============================================
// AUTH SERVICE
// =============================================
export const authService = {
    signIn: async (email: string, password?: string) => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email, password: password || '123456',
                });
                if (error) return { user: null, error: error.message };
                if (data.user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles').select('*').eq('id', data.user.id).single();
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
            } catch (err: any) { return { user: null, error: err.message }; }
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        let user = MOCK_USERS.find(u => u.email === email);
        if (!user && typeof window !== 'undefined') {
            const storedStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
            user = storedStudents.find((u: Profile) => u.email === email);
        }
        if (user) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
                document.cookie = `mock_role=${user.role}; path=/`;
            }
            return { user, error: null };
        }
        return { user: null, error: 'Kullanıcı bulunamadı (Mock: koc@test.com, ogrenci@test.com veya superadmin@sportaly.com deneyin)' };
    },

    signUp: async (email: string, role: UserRole, fullName: string, password?: string, phone?: string, interestedSports?: string[]) => {
        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email, password: password || '123456',
                    options: { data: { full_name: fullName, role: role, phone: phone, interested_sports: interestedSports } }
                });
                if (error) return { user: null, error: error.message };
                if (data.user) {
                    const newUser: Profile = {
                        id: data.user.id, email, role, full_name: fullName,
                        avatar_url: null, phone: phone || null,
                        interested_sports: interestedSports,
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                    };
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
                        document.cookie = `mock_role=${role}; path=/`;
                    }
                    return { user: newUser, error: null };
                }
            } catch (err: any) { return { user: null, error: err.message }; }
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        const newUser: Profile = {
            id: Math.random().toString(36).substr(2, 9), email, role,
            full_name: fullName, avatar_url: null, phone: phone || null,
            interested_sports: interestedSports,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        };
        MOCK_USERS.push(newUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
            document.cookie = `mock_role=${newUser.role}; path=/`;
            if (role === 'student') {
                const currentStudents: any[] = JSON.parse(localStorage.getItem('mock_students') || '[]');
                currentStudents.push(newUser);
                localStorage.setItem('mock_students', JSON.stringify(currentStudents));
            }
        }
        return { user: newUser, error: null };
    },

    updateProfile: async (userId: string, updates: Partial<Profile>) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(STORAGE_KEY_USER);
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.id === userId) {
                    const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
                    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));

                    // Update in mock_students if student
                    if (updatedUser.role === 'student') {
                        const studentsStr = localStorage.getItem('mock_students');
                        if (studentsStr) {
                            const students = JSON.parse(studentsStr);
                            const idx = students.findIndex((s: Profile) => s.id === userId);
                            if (idx >= 0) {
                                students[idx] = updatedUser;
                                localStorage.setItem('mock_students', JSON.stringify(students));
                            }
                        }
                    }

                    return { user: updatedUser, error: null };
                }
            }
        }
        return { user: null, error: 'Kullanıcı bulunamadı.' };
    },

    signOut: async () => {
        if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
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
    },

};

// =============================================
// DATA SERVICE
// =============================================
export const dataService = {
    // -- SPORTS --
    // -- SPORTS --
    getSports: async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        // Always return DEFAULT_SPORTS to ensure users see the latest system-defined sports.
        // We bypass localStorage for sports to prevent stale data.
        if (typeof window !== 'undefined') {
            // Optional: Update localStorage just in case other components read from it directly, though they should use this service.
            localStorage.setItem('mock_sports', JSON.stringify(DEFAULT_SPORTS));
        }
        return DEFAULT_SPORTS;
    },

    createSport: async (sport: Omit<SportCategory, 'id'>) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newSport: SportCategory = { ...sport, id: sport.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 5) };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_sports');
            const sports = stored ? JSON.parse(stored) : DEFAULT_SPORTS;
            sports.push(newSport);
            localStorage.setItem('mock_sports', JSON.stringify(sports));
        }
        return newSport;
    },

    deleteSport: async (sportId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_sports');
            if (stored) {
                const sports = JSON.parse(stored);
                localStorage.setItem('mock_sports', JSON.stringify(sports.filter((s: any) => s.id !== sportId)));
            }
        }
        return true;
    },

    // -- STORES / DÜKKANLAR --
    getStores: async () => {
        if (isSupabaseConfigured) return supabaseDataService.getStores();
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            if (stored) return JSON.parse(stored);
            localStorage.setItem('mock_stores', JSON.stringify(MOCK_STORES));
        }
        return MOCK_STORES;
    },

    getStoreByCoachId: async (coachId: string): Promise<GymStore | null> => {
        const stores = await dataService.getStores();
        return stores.find((s: GymStore) => s.coachId === coachId) || null;
    },

    getStoreById: async (storeId: string): Promise<GymStore | null> => {
        const stores = await dataService.getStores();
        return stores.find((s: GymStore) => s.id === storeId) || null;
    },

    createStore: async (coachId: string, name: string, category: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newStore: GymStore = {
            id: 'shop_' + Math.random().toString(36).substr(2, 6),
            coachId, name,
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: 'Yeni açılan dükkan. Açıklama ekleniyor...',
            logoEmoji: '🏋️', themeColor: 'green', category,
            isActive: true, isBanned: false, totalRevenue: 0, totalStudents: 0,
            rating: 0, reviewCount: 0, createdAt: new Date().toISOString(),
        };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            const stores = stored ? JSON.parse(stored) : MOCK_STORES;
            stores.push(newStore);
            localStorage.setItem('mock_stores', JSON.stringify(stores));
        }
        return newStore;
    },

    updateStore: async (storeData: GymStore) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            const stores = stored ? JSON.parse(stored) : MOCK_STORES;
            const idx = stores.findIndex((s: GymStore) => s.id === storeData.id);
            if (idx >= 0) stores[idx] = storeData; else stores.push(storeData);
            localStorage.setItem('mock_stores', JSON.stringify(stores));
        }
        return storeData;
    },

    // -- PACKAGES / PAKETLER --
    getPackages: async (coachId?: string) => {
        if (isSupabaseConfigured) return supabaseDataService.getPackages(coachId);
        await new Promise(resolve => setTimeout(resolve, 300));
        let packages = MOCK_PACKAGES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            if (stored) packages = JSON.parse(stored);
            else localStorage.setItem('mock_packages', JSON.stringify(MOCK_PACKAGES));
        }
        if (coachId) return packages.filter((p: SalesPackage) => p.coachId === coachId);
        return packages;
    },

    getPackagesByShop: async (shopId: string) => {
        const packages = await dataService.getPackages();
        return packages.filter((p: SalesPackage) => p.shopId === shopId && p.isPublished);
    },

    getPackagesBySport: async (sportId: string) => {
        const packages = await dataService.getPackages();
        return packages.filter((p: SalesPackage) => p.sport === sportId && p.isPublished);
    },

    createPackage: async (pkg: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newPackage: SalesPackage = {
            ...pkg,
            id: 'pkg_' + Math.random().toString(36).substr(2, 6),
            enrolledStudents: 0, rating: 0, reviewCount: 0,
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

    updatePackage: async (pkg: SalesPackage) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            const packages = stored ? JSON.parse(stored) : MOCK_PACKAGES;
            const updated = packages.map((p: SalesPackage) => p.id === pkg.id ? pkg : p);
            localStorage.setItem('mock_packages', JSON.stringify(updated));
        }
        return pkg;
    },

    deletePackage: async (packageId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_packages');
            const packages = stored ? JSON.parse(stored) : MOCK_PACKAGES;
            localStorage.setItem('mock_packages', JSON.stringify(packages.filter((p: SalesPackage) => p.id !== packageId)));
        }
    },

    // -- GROUP CLASSES / GRUP DERSLERİ --
    getGroupClasses: async (coachId?: string) => {
        if (isSupabaseConfigured) {
            const classes = await supabaseDataService.getGroupClasses();
            return coachId ? classes.filter(c => c.coachId === coachId) : classes;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        let classes: GroupClass[] = MOCK_GROUP_CLASSES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_group_classes');
            if (stored) classes = JSON.parse(stored);
            else localStorage.setItem('mock_group_classes', JSON.stringify(MOCK_GROUP_CLASSES));
        }

        // Auto-renew recurring classes
        const now = new Date();
        let classesChanged = false;
        const newClasses: GroupClass[] = [];

        classes.forEach(cls => {
            if (cls.recurrence === 'weekly' && cls.status === 'scheduled') {
                const classDate = new Date(cls.scheduledAt);
                // Assume class is done if 2 hours passed since start (simple logic)
                const endDate = new Date(classDate.getTime() + Math.max(cls.durationMinutes + 60, 120) * 60000);

                if (now > endDate) {
                    cls.status = 'completed';
                    classesChanged = true;

                    if (cls.recurrenceDays && cls.recurrenceDays.length > 0) {
                        const days = [...cls.recurrenceDays].sort((a, b) => a - b);
                        const currentDay = classDate.getDay();

                        let nextDay = days.find(d => d > currentDay);
                        let daysToAdd = 0;

                        if (nextDay !== undefined) {
                            daysToAdd = nextDay - currentDay;
                        } else {
                            nextDay = days[0];
                            daysToAdd = (7 - currentDay) + nextDay;
                        }

                        const nextDate = new Date(classDate);
                        nextDate.setDate(nextDate.getDate() + daysToAdd);

                        if (cls.recurrenceTime) {
                            const [h, m] = cls.recurrenceTime.split(':').map(Number);
                            nextDate.setHours(h, m, 0, 0);
                        }

                        const newClass: GroupClass = {
                            ...cls,
                            id: 'gc_auto_' + Math.random().toString(36).substr(2, 9),
                            status: 'scheduled',
                            scheduledAt: nextDate.toISOString(),
                            enrolledParticipants: [],
                            createdAt: new Date().toISOString()
                        };
                        newClasses.push(newClass);
                    }
                }
            }
        });

        if (classesChanged && typeof window !== 'undefined') {
            classes.push(...newClasses);
            localStorage.setItem('mock_group_classes', JSON.stringify(classes));
        }

        if (coachId) return classes.filter((c: GroupClass) => c.coachId === coachId);
        return classes;
    },

    createGroupClass: async (gc: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newClass: GroupClass = {
            ...gc,
            id: 'gc_' + Math.random().toString(36).substr(2, 6),
            enrolledParticipants: [],
            status: 'scheduled',
            createdAt: new Date().toISOString(),
        };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_group_classes');
            const classes = stored ? JSON.parse(stored) : MOCK_GROUP_CLASSES;
            classes.push(newClass);
            localStorage.setItem('mock_group_classes', JSON.stringify(classes));
        }
        return newClass;
    },

    joinGroupClass: async (classId: string, studentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_group_classes');
            const classes = stored ? JSON.parse(stored) : MOCK_GROUP_CLASSES;
            const cls = classes.find((c: GroupClass) => c.id === classId);
            if (cls && !cls.enrolledParticipants.includes(studentId)) {
                cls.enrolledParticipants.push(studentId);
                localStorage.setItem('mock_group_classes', JSON.stringify(classes));
            }
            return cls;
        }
        return null;
    },

    // -- PURCHASES / SATIN ALMALAR --
    getPurchases: async (studentId?: string) => {
        if (isSupabaseConfigured && studentId) return supabaseDataService.getPurchases(studentId);
        await new Promise(resolve => setTimeout(resolve, 300));
        let purchases = MOCK_PURCHASES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_purchases');
            if (stored) purchases = JSON.parse(stored);
            else localStorage.setItem('mock_purchases', JSON.stringify(MOCK_PURCHASES));
        }
        if (studentId) return purchases.filter((p: Purchase) => p.studentId === studentId);
        return purchases;
    },

    createPurchase: async (purchase: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newPurchase: Purchase = {
            ...purchase,
            id: 'pur_' + Math.random().toString(36).substr(2, 6),
            status: 'active',
            purchasedAt: new Date().toISOString(),
        };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_purchases');
            const purchases = stored ? JSON.parse(stored) : MOCK_PURCHASES;
            purchases.push(newPurchase);
            localStorage.setItem('mock_purchases', JSON.stringify(purchases));
        }
        return newPurchase;
    },

    // -- REVIEWS / DEĞERLENDİRMELER --
    getReviews: async (shopId?: string, coachId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let reviews = MOCK_REVIEWS;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_reviews');
            if (stored) reviews = JSON.parse(stored);
            else localStorage.setItem('mock_reviews', JSON.stringify(MOCK_REVIEWS));
        }
        if (shopId) return reviews.filter((r: Review) => r.shopId === shopId);
        if (coachId) return reviews.filter((r: Review) => r.coachId === coachId);
        return reviews;
    },

    createReview: async (review: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newReview: Review = {
            ...review,
            id: 'rev_' + Math.random().toString(36).substr(2, 6),
            createdAt: new Date().toISOString(),
        };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_reviews');
            const reviews = stored ? JSON.parse(stored) : MOCK_REVIEWS;
            reviews.push(newReview);
            localStorage.setItem('mock_reviews', JSON.stringify(reviews));
        }
        return newReview;
    },

    // -- MESSAGES / MESAJLAR --
    getMessages: async (userId: string, partnerId: string) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        let messages = MOCK_MESSAGES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) messages = JSON.parse(stored);
            else localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(MOCK_MESSAGES));
        }
        return messages.filter(m =>
            (m.senderId === userId && m.receiverId === partnerId) ||
            (m.senderId === partnerId && m.receiverId === userId)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },

    sendMessage: async (senderId: string, receiverId: string, content: string, imageUrl?: string) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            senderId, receiverId, content, imageUrl,
            timestamp: new Date().toISOString(), read: false,
        };
        MOCK_MESSAGES.push(newMessage);
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
                const messages = stored ? JSON.parse(stored) : MOCK_MESSAGES;
                messages.push(newMessage);
                localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
            } catch { /* quota exceeded */ }
        }
        return newMessage;
    },

    getConversations: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        let messages = MOCK_MESSAGES;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) messages = JSON.parse(stored);
        }
        const partnerIds = new Set<string>();
        messages.forEach(m => {
            if (m.senderId === userId) partnerIds.add(m.receiverId);
            if (m.receiverId === userId) partnerIds.add(m.senderId);
        });
        const conversations = [];
        for (const partnerId of partnerIds) {
            const partner = MOCK_USERS.find(u => u.id === partnerId);
            const convMessages = messages.filter(m =>
                (m.senderId === userId && m.receiverId === partnerId) || (m.senderId === partnerId && m.receiverId === userId)
            ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const unreadCount = convMessages.filter(m => m.receiverId === userId && !m.read).length;
            if (partner && convMessages.length > 0) {
                conversations.push({ partner, lastMessage: convMessages[0], unreadCount });
            }
        }
        return conversations;
    },

    markMessagesAsRead: async (userId: string, senderId: string) => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (stored) {
                const messages: Message[] = JSON.parse(stored);
                messages.forEach(m => { if (m.senderId === senderId && m.receiverId === userId) m.read = true; });
                localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
            }
        }
    },

    // -- STUDENTS --
    getStudents: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_students');
            if (stored) return JSON.parse(stored);
            const defaultStudents = MOCK_USERS.filter(u => u.role === 'student');
            localStorage.setItem('mock_students', JSON.stringify(defaultStudents));
            return defaultStudents;
        }
        return MOCK_USERS.filter(u => u.role === 'student');
    },

    getStudentsByCoach: async (coachId: string) => {
        const purchases = await dataService.getPurchases();
        const studentIds = [...new Set(purchases.filter((p: Purchase) => p.coachId === coachId && p.status === 'active').map((p: Purchase) => p.studentId))];
        const allStudents = await dataService.getStudents();
        return allStudents.filter((s: Profile) => studentIds.includes(s.id));
    },

    // -- CHAT PERMISSION CHECK --
    canStudentChat: async (studentId: string, coachId: string) => {
        const purchases = await dataService.getPurchases(studentId);
        const activePurchases = purchases.filter((p: Purchase) =>
            p.coachId === coachId &&
            p.status === 'active' &&
            (!p.expiresAt || new Date(p.expiresAt) > new Date())
        );

        if (activePurchases.length === 0) return false;

        const allPackages = await dataService.getPackages(coachId);

        return activePurchases.some((purchase: Purchase) => {
            const pkg = allPackages.find((p: SalesPackage) => p.id === purchase.packageId);
            return pkg?.hasChatSupport === true;
        });
    },

    // -- ADMIN METHODS --
    getAllUsers: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_users_admin');
            if (stored) return JSON.parse(stored);
            localStorage.setItem('mock_users_admin', JSON.stringify(MOCK_USERS));
        }
        return MOCK_USERS;
    },

    banUser: async (userId: string, reason?: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_users_admin');
            if (stored) {
                const users = JSON.parse(stored);
                const updated = users.map((u: any) => u.id === userId ? { ...u, is_banned: true, ban_reason: reason } : u);
                localStorage.setItem('mock_users_admin', JSON.stringify(updated));
                return true;
            }
        }
        return false;
    },

    unbanUser: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_users_admin');
            if (stored) {
                const users = JSON.parse(stored);
                const updated = users.map((u: any) => u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u);
                localStorage.setItem('mock_users_admin', JSON.stringify(updated));
                return true;
            }
        }
        return false;
    },

    deleteUser: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_users_admin');
            if (stored) {
                const users = JSON.parse(stored);
                localStorage.setItem('mock_users_admin', JSON.stringify(users.filter((u: any) => u.id !== userId)));
                return true;
            }
        }
        return false;
    },

    banStore: async (storeId: string, reason?: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            if (stored) {
                const stores = JSON.parse(stored);
                const updated = stores.map((s: GymStore) => s.id === storeId ? { ...s, isBanned: true, isActive: false, banReason: reason } : s);
                localStorage.setItem('mock_stores', JSON.stringify(updated));
                return true;
            }
        }
        return false;
    },

    unbanStore: async (storeId: string) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_stores');
            if (stored) {
                const stores = JSON.parse(stored);
                const updated = stores.map((s: GymStore) => s.id === storeId ? { ...s, isBanned: false, isActive: true, banReason: undefined } : s);
                localStorage.setItem('mock_stores', JSON.stringify(updated));
                return true;
            }
        }
        return false;
    },

    setActiveProgram: async (userId: string, packageId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Update user profile in local storage
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(STORAGE_KEY_USER);
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.id === userId) {
                    user.active_program_id = packageId;
                    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
                }
            }

            // Also update in MOCK_USERS / mock_students if persisted
            const storedStudentsStr = localStorage.getItem('mock_students');
            if (storedStudentsStr) {
                const students = JSON.parse(storedStudentsStr);
                const idx = students.findIndex((s: Profile) => s.id === userId);
                if (idx >= 0) {
                    students[idx].active_program_id = packageId;
                    localStorage.setItem('mock_students', JSON.stringify(students));
                }
            }
        }
        return { success: true };
    },

    getSystemStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const users = await dataService.getAllUsers();
        const stores = await dataService.getStores();
        const purchases = await dataService.getPurchases();
        const totalRevenue = purchases.reduce((sum: number, p: Purchase) => sum + p.price, 0);
        const platformCommission = Math.floor(totalRevenue * 0.10);

        return {
            totalUsers: users.length,
            totalCoaches: users.filter((u: any) => u.role === 'coach').length,
            totalStudents: users.filter((u: any) => u.role === 'student').length,
            bannedUsers: users.filter((u: any) => u.is_banned).length,
            totalStores: stores.length,
            activeStores: stores.filter((s: GymStore) => s.isActive && !s.isBanned).length,
            bannedStores: stores.filter((s: GymStore) => s.isBanned).length,
            totalPurchases: purchases.length,
            totalRevenue,
            platformCommission,
            netProfit: platformCommission,
            totalExpenses: Math.floor(platformCommission * 0.3),
            monthlyGrowth: 12.5,
        };
    },

    getStoreFinancials: async (storeId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const purchases = await dataService.getPurchases();
        const storePurchases = purchases.filter((p: Purchase) => p.shopId === storeId);
        const totalRevenue = storePurchases.reduce((sum: number, p: Purchase) => sum + p.price, 0);

        return {
            storeId, totalRevenue,
            totalExpenses: Math.floor(totalRevenue * 0.1),
            netProfit: totalRevenue - Math.floor(totalRevenue * 0.1),
            totalSales: storePurchases.length,
            monthlyData: [
                { month: 'Ocak', revenue: 8500, expenses: 850 },
                { month: 'Şubat', revenue: 12200, expenses: 1220 },
                { month: 'Mart', revenue: 15000, expenses: 1500 },
            ],
        };
    },

    // -- PROGRESS / İLERLEME --
    getProgress: async (studentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let progress: ProgressEntry[] = [];
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_progress');
            if (stored) progress = JSON.parse(stored);
        }
        return progress.filter(p => p.studentId === studentId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    createProgress: async (entry: Omit<ProgressEntry, 'id'>) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newEntry: ProgressEntry = {
            ...entry,
            id: 'prog_' + Math.random().toString(36).substr(2, 9),
        };
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mock_progress');
            const progress = stored ? JSON.parse(stored) : [];
            progress.push(newEntry);
            localStorage.setItem('mock_progress', JSON.stringify(progress));
        }
        return newEntry;
    },
};
