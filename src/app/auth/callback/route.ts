import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const origin = requestUrl.origin;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        // Handle PKCE flow (code exchange)
        if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Auth callback code exchange error:', error);
                return NextResponse.redirect(`${origin}/login?error=auth_error&message=${encodeURIComponent(error.message)}`);
            }

            if (data.user) {
                return redirectByRole(origin, supabase, data.user);
            }
        }

        // Handle token hash flow (email confirmation via link)
        if (token_hash && type) {
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash,
                type: type as any,
            });

            if (error) {
                console.error('Auth callback OTP verification error:', error);
                return NextResponse.redirect(`${origin}/login?error=verification_error&message=${encodeURIComponent(error.message)}`);
            }

            if (data.user) {
                return redirectByRole(origin, supabase, data.user);
            }
        }
    } catch (err) {
        console.error('Auth callback exception:', err);
    }

    // Fallback: redirect to login
    return NextResponse.redirect(`${origin}/login`);
}

async function redirectByRole(origin: string, supabase: any, user: any) {
    // Check user role from profile or metadata
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role || user.user_metadata?.role || 'student';

    if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
    } else if (role === 'coach') {
        return NextResponse.redirect(`${origin}/coach`);
    } else {
        return NextResponse.redirect(`${origin}/student`);
    }
}
