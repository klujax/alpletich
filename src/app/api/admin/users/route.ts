/**
 * Admin API: Kullanıcı Listesi
 * Sadece admin rolündeki kullanıcılar erişebilir
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
    try {
        // Auth kontrolü - token'dan kullanıcıyı doğrula
        const authHeader = request.headers.get('authorization');
        const supabaseAnon = createClient(
            supabaseUrl,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Cookie'den session al
        const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
            request.cookies.get('sb-access-token')?.value ||
            authHeader?.replace('Bearer ', '') || ''
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        // Admin kontrolü
        const { data: profile } = await supabaseAnon
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        // Service key ile tüm kullanıcıları çek
        if (!supabaseServiceKey) {
            // Service key yoksa anon key ile devam et (kısıtlı)
            const { data } = await supabaseAnon.from('profiles').select('*');
            return NextResponse.json(data || []);
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data } = await supabaseAdmin.from('profiles').select('*');
        return NextResponse.json(data || []);

    } catch (error: any) {
        console.error('Admin users API error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
