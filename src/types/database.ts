// =============================================
// DATABASE TYPES FOR FITNESS COACHING APP
// =============================================

export type UserRole = 'coach' | 'student';

export type RelationshipStatus = 'pending' | 'active' | 'inactive';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type AnimationType = 'lottie' | 'video' | 'gif' | 'css';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// =============================================
// TABLE TYPES
// =============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachStudent {
  id: string;
  coach_id: string;
  student_id: string;
  status: RelationshipStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Profile;
  coach?: Profile;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  animation_url: string | null;
  animation_type: AnimationType;
  category_id: string | null;
  muscle_groups: string[] | null;
  difficulty: Difficulty;
  duration_seconds: number | null;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: ExerciseCategory;
}

export interface WorkoutPlan {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  difficulty: Difficulty;
  created_at: string;
  updated_at: string;
}

export interface AssignedWorkout {
  id: string;
  student_id: string;
  coach_id: string;
  workout_plan_id: string | null;
  exercise_id: string;
  day_of_week: number | null;
  sets: number;
  reps: number;
  rest_seconds: number | null;
  weight_kg: number | null;
  notes: string | null;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  exercise?: Exercise;
  student?: Profile;
  workout_plan?: WorkoutPlan;
}

export interface NutritionPlan {
  id: string;
  student_id: string;
  coach_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  daily_calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: Profile;
  meals?: Meal[];
}

export interface Meal {
  id: string;
  nutrition_plan_id: string;
  meal_type: MealType;
  name: string;
  description: string | null;
  meal_details: string | null;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  time_of_day: string | null;
  order_index: number;
  created_at: string;
}

export interface ProgressLog {
  id: string;
  student_id: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  notes: string | null;
  photo_urls: string[] | null;
  logged_at: string;
  created_at: string;
  // Mock compatibility helper
  date?: string;
  weight?: number;
  fat?: number;
  photos?: string[];
}

export interface WeeklyPlan {
  studentId: string;
  workouts: {
    [key: string]: (Exercise & { instanceId: string })[];
  };
  nutrition: {
    [key: string]: {
      id: string;
      name: string;
      calories: number;
    }[];
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  // Mock compatibility
  senderId?: string;
  receiverId?: string;
  timestamp?: string;
  read?: boolean;
  imageUrl?: string;
}

export interface SportCategory {
  id: string;
  coach_id: string | null;
  name: string;
  icon: string | null;
  description: string | null;
  color: string;
  is_system_default: boolean;
  created_at: string;
}

export interface SalesPackage {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  price: number;
  access_duration: string;
  package_type: 'workout' | 'nutrition' | 'bundle';
  total_weeks: number;
  sport_category_id: string | null;
  features: string[] | null;
  has_chat_support: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// DATABASE SCHEMA TYPE
// =============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      coach_students: {
        Row: CoachStudent;
        Insert: Omit<CoachStudent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CoachStudent, 'id' | 'created_at'>>;
      };
      exercise_categories: {
        Row: ExerciseCategory;
        Insert: Omit<ExerciseCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ExerciseCategory, 'id' | 'created_at'>>;
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>;
      };
      workout_plans: {
        Row: WorkoutPlan;
        Insert: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WorkoutPlan, 'id' | 'created_at'>>;
      };
      assigned_workouts: {
        Row: AssignedWorkout;
        Insert: Omit<AssignedWorkout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AssignedWorkout, 'id' | 'created_at'>>;
      };
      nutrition_plans: {
        Row: NutritionPlan;
        Insert: Omit<NutritionPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NutritionPlan, 'id' | 'created_at'>>;
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, 'id' | 'created_at'>;
        Update: Partial<Omit<Meal, 'id' | 'created_at'>>;
      };
      progress_logs: {
        Row: ProgressLog;
        Insert: Omit<ProgressLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ProgressLog, 'id' | 'created_at'>>;
      };
    };
  };
}
