// POST /api/payment/initialize
// iyzico Checkout Form oluşturup döndürür

import { NextRequest, NextResponse } from 'next/server';
import iyzipay, { IyzipayClass, generateConversationId, generateBasketItemId, formatPrice, isIyzicoConfigured } from '@/lib/iyzico';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
    try {
        // İyzico yapılandırılmış mı kontrol et
        if (!isIyzicoConfigured() || !iyzipay || !IyzipayClass) {
            return NextResponse.json({
                error: 'Ödeme sistemi henüz yapılandırılmamış. Lütfen yöneticiyle iletişime geçin.',
                code: 'PAYMENT_NOT_CONFIGURED'
            }, { status: 503 });
        }

        const body = await request.json();
        const { packageId, userId, userEmail, userName, userPhone, userAddress } = body;

        if (!packageId || !userId) {
            return NextResponse.json({ error: 'Paket ID ve Kullanıcı ID gerekli' }, { status: 400 });
        }

        // Supabase'den paketi çek
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: pkg, error: pkgError } = await supabase
            .from('sales_packages')
            .select('*, shop:gym_stores(name, coach_id)')
            .eq('id', packageId)
            .single();

        if (pkgError || !pkg) {
            return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
        }

        const price = formatPrice(pkg.price);
        const conversationId = generateConversationId();
        const basketItemId = generateBasketItemId();

        // Callback URL (ödeme tamamlandığında iyzico'nun çağıracağı endpoint)
        const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || 'http://localhost:3000';
        const callbackUrl = `${origin}/api/payment/callback`;

        // iyzico Checkout Form isteği
        const paymentRequest = {
            locale: 'tr',
            conversationId,
            price,
            paidPrice: price,
            currency: IyzipayClass.CURRENCY.TRY,
            basketId: `basket_${packageId}`,
            paymentGroup: IyzipayClass.PAYMENT_GROUP.PRODUCT,
            callbackUrl,
            enabledInstallments: [1, 2, 3, 6, 9, 12],
            buyer: {
                id: userId,
                name: userName?.split(' ')[0] || 'Ad',
                surname: userName?.split(' ').slice(1).join(' ') || 'Soyad',
                gsmNumber: userPhone || '+905000000000',
                email: userEmail || 'user@sportaly.com',
                identityNumber: '11111111111', // TC — demo/sandbox için sabit
                lastLoginDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].substring(0, 8),
                registrationDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].substring(0, 8),
                registrationAddress: userAddress || 'Türkiye',
                ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34000',
            },
            shippingAddress: {
                contactName: userName || 'Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: userAddress || 'Türkiye',
                zipCode: '34000',
            },
            billingAddress: {
                contactName: userName || 'Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: userAddress || 'Türkiye',
                zipCode: '34000',
            },
            basketItems: [
                {
                    id: basketItemId,
                    name: pkg.name,
                    category1: 'Eğitim Paketi',
                    category2: pkg.package_type === 'coaching' ? 'Birebir Koçluk' : 'Program',
                    itemType: IyzipayClass.BASKET_ITEM_TYPE.VIRTUAL,
                    price,
                },
            ],
        };

        // iyzico Checkout Form oluştur
        return new Promise((resolve) => {
            iyzipay.checkoutFormInitialize.create(paymentRequest as any, (err: any, result: any) => {
                if (err) {
                    console.error('iyzico initialize error:', err);
                    resolve(NextResponse.json({ error: 'Ödeme formu oluşturulamadı', details: err }, { status: 500 }));
                    return;
                }

                if (result.status !== 'success') {
                    console.error('iyzico initialize failed:', result);
                    resolve(NextResponse.json({
                        error: 'Ödeme formu oluşturulamadı',
                        details: result.errorMessage || result
                    }, { status: 500 }));
                    return;
                }

                const response = NextResponse.json({
                    status: 'success',
                    checkoutFormContent: result.checkoutFormContent,
                    token: result.token,
                    tokenExpireTime: result.tokenExpireTime,
                    paymentPageUrl: result.paymentPageUrl,
                });

                // Ödeme meta verisini cookie'ye kaydet (callback'te kullanmak için)
                response.cookies.set('payment_meta', JSON.stringify({
                    conversationId,
                    packageId,
                    userId,
                    token: result.token,
                    price: pkg.price,
                    shopId: pkg.shop_id,
                    coachId: (pkg as any).shop?.coach_id,
                    packageName: pkg.name,
                    packageSnapshot: {
                        name: pkg.name,
                        price: pkg.price,
                        packageType: pkg.package_type,
                        features: pkg.features,
                        totalWeeks: pkg.total_weeks,
                    }
                }), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 30, // 30 dakika
                    path: '/',
                    sameSite: 'lax',
                });

                resolve(response);
            });
        });

    } catch (error: any) {
        console.error('Payment initialize error:', error);
        return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
    }
}
