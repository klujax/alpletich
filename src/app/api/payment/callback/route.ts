/**
 * POST /api/payment/callback
 * iyzico ödeme tamamlandığında çağrılır
 * 
 * Güvenlik Düzeltmeleri:
 * - Cookie HMAC imza doğrulaması
 * - Mock mod sadece development'ta kabul edilir
 * - Service role key zorunlu (üretimde)
 */

import { NextRequest, NextResponse } from 'next/server';
import iyzipay, { isIyzicoConfigured } from '@/lib/iyzico';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const COOKIE_SECRET = process.env.COOKIE_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-secret-key';

function verifyCookieSignature(data: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
    hmac.update(data);
    const expected = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function getSupabaseAdmin() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && !supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY gerekli (production)');
    }

    const key = supabaseServiceKey || supabaseAnonKey;
    return createClient(supabaseUrl, key);
}

export async function POST(request: NextRequest) {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const formData = await request.formData();
        const token = formData.get('token') as string;

        if (!token) {
            return redirectWithStatus(request, 'error', 'Token bulunamadı');
        }

        // Cookie'den ödeme meta verisini al ve doğrula
        const paymentMetaCookie = request.cookies.get('payment_meta')?.value;
        let paymentMeta: any = null;

        if (paymentMetaCookie) {
            try {
                const parsed = JSON.parse(paymentMetaCookie);
                
                // HMAC imza doğrulaması
                if (parsed.data && parsed.sig) {
                    if (!verifyCookieSignature(parsed.data, parsed.sig)) {
                        console.error('⚠️ Cookie imza doğrulaması başarısız! Olası manipülasyon.');
                        return redirectWithStatus(request, 'error', 'Güvenlik doğrulaması başarısız');
                    }
                    paymentMeta = JSON.parse(parsed.data);
                } else {
                    // Legacy format (imzasız) — sadece development'ta kabul et
                    if (!isProduction) {
                        paymentMeta = parsed;
                    } else {
                        return redirectWithStatus(request, 'error', 'Güvenlik doğrulaması başarısız');
                    }
                }
            } catch {
                return redirectWithStatus(request, 'error', 'Ödeme verisi okunamadı');
            }
        }

        // MOCK MOD — sadece development'ta kabul et
        if (token.startsWith('mock_token_')) {
            if (isProduction) {
                console.error('⚠️ Production ortamında mock token reddedildi:', token);
                return redirectWithStatus(request, 'error', 'Geçersiz ödeme token\'ı');
            }

            console.log('✅ [DEV] Mock token, ödeme başarılı sayılıyor:', token);
            return handleSuccessfulPayment(request, paymentMeta, {
                price: paymentMeta?.price,
                paymentId: `mock_payment_${Date.now()}`,
                paidPrice: paymentMeta?.price,
                currency: 'TRY',
                installment: 1,
                cardType: 'CREDIT_CARD',
                cardAssociation: 'MASTER_CARD',
                cardFamily: 'Bonus',
                lastFourDigits: '0000',
                binNumber: '554960',
            });
        }

        // iyzico kontrol
        if (!isIyzicoConfigured() || !iyzipay) {
            return redirectWithStatus(request, 'error', 'Ödeme sistemi yapılandırılmamış');
        }

        // iyzico'dan ödeme sonucunu sorgula
        return new Promise((resolve) => {
            iyzipay.checkoutForm.retrieve({
                locale: 'tr',
                conversationId: paymentMeta?.conversationId || '',
                token,
            }, async (err: any, result: any) => {
                if (err) {
                    console.error('iyzico retrieve error:', err);
                    resolve(redirectWithStatus(request, 'error', 'Ödeme doğrulanamadı'));
                    return;
                }

                if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
                    console.error('iyzico payment failed:', result);
                    resolve(redirectWithStatus(
                        request,
                        'error',
                        result.errorMessage || 'Ödeme başarısız oldu'
                    ));
                    return;
                }

                const response = await handleSuccessfulPayment(request, paymentMeta, result);
                resolve(response);
            });
        });

    } catch (error: any) {
        console.error('Payment callback error:', error);
        return redirectWithStatus(request, 'error', 'Sunucu hatası');
    }
}

async function handleSuccessfulPayment(
    request: NextRequest,
    paymentMeta: any,
    result: any
): Promise<NextResponse> {
    try {
        const supabase = getSupabaseAdmin();

        let expiresAt = null;
        if (paymentMeta?.packageType === 'coaching' && paymentMeta?.totalWeeks) {
            const date = new Date();
            date.setDate(date.getDate() + paymentMeta.totalWeeks * 7);
            expiresAt = date.toISOString();
        }

        const { error: insertError } = await supabase.from('purchases').insert({
            user_id: paymentMeta?.userId,
            package_id: paymentMeta?.packageId,
            shop_id: paymentMeta?.shopId,
            amount_paid: result.price || paymentMeta?.price,
            status: 'active',
            purchased_at: new Date().toISOString(),
            expires_at: expiresAt,
            package_snapshot: {
                packageName: paymentMeta?.packageName,
                packageType: paymentMeta?.packageType,
                totalWeeks: paymentMeta?.totalWeeks,
                iyzicoPaymentId: result.paymentId,
                paidPrice: result.paidPrice,
                currency: result.currency,
                installment: result.installment,
                cardType: result.cardType,
                lastFourDigits: result.lastFourDigits,
            },
        });

        if (insertError) {
            console.error('Purchase insert error:', insertError);
            return redirectWithStatus(
                request,
                'error',
                'Ödeme alındı ama kayıt oluşturulamadı. Destek ile iletişime geçin.'
            );
        }

        // Coach-student ilişkisi
        if (paymentMeta?.coachId && paymentMeta?.userId) {
            const { data: existingRelation } = await supabase
                .from('coach_students')
                .select('id')
                .eq('coach_id', paymentMeta.coachId)
                .eq('student_id', paymentMeta.userId)
                .maybeSingle();

            if (!existingRelation) {
                await supabase.from('coach_students').insert({
                    coach_id: paymentMeta.coachId,
                    student_id: paymentMeta.userId,
                    status: 'active',
                });
            }
        }

        // enrolled_students artır
        if (paymentMeta?.packageId) {
            try {
                const { error: rpcError } = await supabase.rpc('increment_enrolled_students', {
                    pkg_id: paymentMeta.packageId,
                });
                if (rpcError) {
                    const { data: pkgData } = await supabase
                        .from('sales_packages')
                        .select('enrolled_students')
                        .eq('id', paymentMeta.packageId)
                        .single();
                    if (pkgData) {
                        await supabase
                            .from('sales_packages')
                            .update({ enrolled_students: ((pkgData as any).enrolled_students || 0) + 1 } as any)
                            .eq('id', paymentMeta.packageId);
                    }
                }
            } catch {
                // İgnore
            }
        }

        const response = redirectWithStatus(
            request,
            'success',
            'Ödeme başarılı',
            paymentMeta?.packageId
        );
        response.cookies.delete('payment_meta');
        return response;

    } catch (dbError: any) {
        console.error('Database error after payment:', dbError);
        return redirectWithStatus(
            request,
            'error',
            'Ödeme alındı ama kayıt oluşturulamadı. Destek ile iletişime geçin.'
        );
    }
}

function redirectWithStatus(
    request: NextRequest,
    status: 'success' | 'error',
    message: string,
    packageId?: string
): NextResponse {
    const origin = request.headers.get('origin')
        || request.nextUrl.origin
        || 'http://localhost:3000';

    const redirectUrl = new URL('/checkout/result', origin);
    redirectUrl.searchParams.set('status', status);
    redirectUrl.searchParams.set('message', message);
    if (packageId) redirectUrl.searchParams.set('packageId', packageId);

    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
}
