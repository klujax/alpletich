/**
 * Admin API: Kullanıcı Ban/Unban/Delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function verifyAdmin(request: NextRequest) {
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const authHeader = request.headers.get('authorization');

    const { data: { user }, error } = await supabaseAnon.auth.getUser(
        request.cookies.get('sb-access-token')?.value ||
        authHeader?.replace('Bearer ', '') || ''
    );

    if (error || !user) return null;

    const { data: profile } = await supabaseAnon
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return null;
    return user;
}

// POST /api/admin/users/ban
export async function POST(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { userId, action, reason } = await request.json();
    if (!userId || !action) {
        return NextResponse.json({ error: 'userId ve action gerekli' }, { status: 400 });
    }

    const sb = supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey)
        : createClient(supabaseUrl, supabaseAnonKey);

    try {
        switch (action) {
            case 'ban': {
                const { error } = await sb
                    .from('profiles')
                    .update({ is_banned: true } as any)
                    .eq('id', userId);
                if (error) throw error;
                return NextResponse.json({ success: true });
            }
            case 'unban': {
                const { error } = await sb
                    .from('profiles')
                    .update({ is_banned: false } as any)
                    .eq('id', userId);
                if (error) throw error;
                return NextResponse.json({ success: true });
            }
            case 'delete': {
                if (supabaseServiceKey) {
                    const adminSb = createClient(supabaseUrl, supabaseServiceKey);
                    await (adminSb as any).auth.admin.deleteUser(userId);
                } else {
                    await sb.from('profiles').delete().eq('id', userId);
                }
                return NextResponse.json({ success: true });
            }
            default:
                return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Admin action error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
