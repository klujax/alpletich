/**
 * Admin API: Sistem istatistikleri
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
    try {
        const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
        const authHeader = request.headers.get('authorization');

        const { data: { user }, error } = await supabaseAnon.auth.getUser(
            request.cookies.get('sb-access-token')?.value ||
            authHeader?.replace('Bearer ', '') || ''
        );

        if (error || !user) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
        }

        const { data: profile } = await supabaseAnon
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const sb = supabaseServiceKey
            ? createClient(supabaseUrl, supabaseServiceKey)
            : supabaseAnon;

        const [
            { count: totalUsers },
            { count: totalCoaches },
            { count: totalStudents },
            { count: bannedUsers },
            { count: totalStores },
            { count: activeStores },
            { count: bannedStores },
            { data: purchases },
        ] = await Promise.all([
            sb.from('profiles').select('*', { count: 'exact', head: true }),
            sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
            sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            (sb as any).from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
            sb.from('gym_stores').select('*', { count: 'exact', head: true }),
            (sb as any).from('gym_stores').select('*', { count: 'exact', head: true }).eq('is_active', true),
            (sb as any).from('gym_stores').select('*', { count: 'exact', head: true }).eq('is_banned', true),
            sb.from('purchases').select('amount_paid'),
        ]);

        const totalRevenue = purchases
            ? purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0)
            : 0;
        const totalExpenses = totalRevenue * 0.2;

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalCoaches: totalCoaches || 0,
            totalStudents: totalStudents || 0,
            bannedUsers: bannedUsers || 0,
            totalStores: totalStores || 0,
            activeStores: activeStores || 0,
            bannedStores: bannedStores || 0,
            totalPurchases: purchases?.length || 0,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            platformCommission: totalRevenue * 0.1,
            monthlyGrowth: 15,
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
