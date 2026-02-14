import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = false; // Boolean(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (isSupabaseConfigured) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
}

export { supabase };

// Helper to get supabase client with error
export function getSupabase() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
    }
    return supabase;
}
