import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    request.cookies.delete({
                        name,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.delete({
                        name,
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Rota kontrolü
    const url = request.nextUrl.pathname;
    
    // Auth olmayanları giriş yapmaya zorla (gizli sayfalarsa)
    if (!user && (url.startsWith('/admin') || url.startsWith('/coach') || url.startsWith('/student') || url.startsWith('/marketplace') || url.startsWith('/checkout') || url.startsWith('/settings'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based kontrol
    if (user) {
        // Oturum açmış kullanıcılar giriş sayfalarına girmemeli
        if (url === '/login' || url === '/register') {
            return NextResponse.redirect(new URL('/marketplace', request.url));
        }

        // Rolünü almak için public.profiles sorgusu atıyoruz
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
        const role = profile?.role || 'student';
        
        // Admin rotalarına erişim
        if (url.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/marketplace', request.url));
        }

        // Coach rotalarına erişim
        if (url.startsWith('/coach') && role !== 'coach' && role !== 'admin') {
            return NextResponse.redirect(new URL('/marketplace', request.url));
        }

        // Student rotalarına erişim
        if (url.startsWith('/student') && role !== 'student' && role !== 'admin') {
            return NextResponse.redirect(new URL('/marketplace', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Rota dışındakileri hariç tut (assetler, favicon, api, vb)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
