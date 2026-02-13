
import { UserRole, Profile } from '@/types/database';

export type { UserRole, Profile };

export interface SalesPackage {
    id: string;
    coachId: string;
    shopId: string;
    name: string;
    description: string;
    price: number;
    accessDuration: string;
    packageType: 'coaching' | 'program';
    totalWeeks: number;
    sport: string;
    features: string[];
    isPublished: boolean;
    hasChatSupport: boolean;
    hasGroupClass: boolean;
    maxStudents: number;
    enrolledStudents: number;
    rating: number;
    reviewCount: number;
    programContent: any[];
    workoutPlan?: WorkoutDay[];
    nutritionPlan?: NutritionDay[];
    createdAt: string;
}

export interface Exercise {
    id: string;
    name: string;
    targetMuscle: string;
    sets: number;
    reps: string;
    restSeconds: number;
    videoUrl?: string;
}

export interface WorkoutDay {
    dayName: string;
    focusArea?: string;
    exercises: Exercise[];
}

export interface ProgressEntry {
    id: string;
    studentId: string;
    date: string;
    weight?: number;
    bodyFat?: number;
    notes?: string;
    photoUrl?: string;
}

export interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    description?: string;
}

export interface NutritionDay {
    dayName: string;
    meals: {
        type: 'Kahvaltı' | 'Öğle Yemeği' | 'Akşam Yemeği' | 'Ara Öğün';
        items: Meal[];
    }[];
}

export interface GymStore {
    id: string;
    coachId: string;
    name: string;
    slug: string;
    description: string;
    logoEmoji: string;
    themeColor: string;
    instagramUrl?: string;
    category: string;
    isActive: boolean;
    isBanned: boolean;
    banReason?: string;
    totalRevenue: number;
    totalStudents: number;
    rating: number;
    reviewCount: number;
    createdAt: string;
}

export interface SportCategory {
    id: string;
    coachId: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    isSystemDefault?: boolean;
}

export interface GroupClass {
    id: string;
    coachId: string;
    shopId: string;
    packageId?: string;
    title: string;
    description: string;
    sport: string;
    scheduledAt: string;
    durationMinutes: number;
    maxParticipants: number;
    enrolledParticipants: string[];
    meetingLink?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    price: number;
    createdAt: string;
    recurrence?: 'none' | 'weekly';
    recurrenceDays?: number[]; // 0=Sun, 1=Mon...
    recurrenceTime?: string; // HH:mm
}

export interface Purchase {
    id: string;
    studentId: string;
    coachId: string;
    shopId: string;
    packageId?: string;
    groupClassId?: string;
    type: 'package' | 'group_class';
    packageName: string;
    price: number;
    status: 'active' | 'expired' | 'refunded';
    purchasedAt: string;
    expiresAt?: string;
    packageSnapshot?: any;
}

export interface Review {
    id: string;
    studentId: string;
    studentName: string;
    coachId: string;
    shopId: string;
    packageId?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string;
    timestamp: string;
    read: boolean;
}

export interface Conversation {
    partnerId: string;
    partnerName: string;
    partnerRole: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    partnerAvatar?: string;
}
