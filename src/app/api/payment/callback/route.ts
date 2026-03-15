// POST /api/payment/callback
// iyzico ödeme tamamlandığında bu endpoint'i çağırır

import { NextRequest, NextResponse } from 'next/server';
import iyzipay, { isIyzicoConfigured } from '@/lib/iyzico';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
    try {
        // iyzico callback'ten gelen token
        const formData = await request.formData();
        const token = formData.get('token') as string;

        if (!token) {
            return redirectWithStatus(request, 'error', 'Token bulunamadı');
        }

        // Cookie'den ödeme meta verisini al
        const paymentMetaCookie = request.cookies.get('payment_meta')?.value;
        let paymentMeta: any = null;

        if (paymentMetaCookie) {
            try {
                paymentMeta = JSON.parse(paymentMetaCookie);
            } catch { }
        }

        // MOCK MOD kontrolü
        if (token.startsWith('mock_token_')) {
            // Mock senaryosunda her zaman başarılı say
            console.log('✅ Mock token yakalandı, ödeme başarılı sayılıyor:', token);
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
                binNumber: '554960'
            });
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

                // ✅ Ödeme başarılı
                const response = await handleSuccessfulPayment(request, paymentMeta, result);
                resolve(response);
            });
        });

    } catch (error: any) {
        console.error('Payment callback error:', error);
        return redirectWithStatus(request, 'error', 'Sunucu hatası');
    }
}

async function handleSuccessfulPayment(request: NextRequest, paymentMeta: any, result: any): Promise<NextResponse> {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Bitiş tarihini hesapla
        let expiresAt = null;
        if (paymentMeta?.packageSnapshot?.packageType === 'coaching' && paymentMeta?.packageSnapshot?.totalWeeks) {
            const date = new Date();
            date.setDate(date.getDate() + (paymentMeta.packageSnapshot.totalWeeks * 7));
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
                ...paymentMeta?.packageSnapshot,
                iyzicoPaymentId: result.paymentId,
                iyzicoPaymentTransactionId: result.itemTransactions?.[0]?.paymentTransactionId,
                paidPrice: result.paidPrice,
                currency: result.currency,
                installment: result.installment,
                cardType: result.cardType,
                cardAssociation: result.cardAssociation,
                cardFamily: result.cardFamily,
                lastFourDigits: result.lastFourDigits,
                binNumber: result.binNumber,
            },
        });

        if (insertError) {
            console.error('Purchase insert error:', insertError);
            return redirectWithStatus(request, 'error', 'Ödeme alındı ama kayıt oluşturulamadı. Lütfen destek ile iletişime geçin.');
        }

        // Coach-student ilişkisi oluştur (eğer yoksa)
        if (paymentMeta?.coachId && paymentMeta?.userId) {
            // Mevcut ilişki var mı kontrol et
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

        // enrolled_students sayısını artır
        if (paymentMeta?.packageId) {
            try {
                const { error: rpcError } = await supabase.rpc('increment_enrolled_students', {
                    pkg_id: paymentMeta.packageId
                });
                if (rpcError) {
                    // RPC yoksa manual güncelle
                    const { data: pkgData } = await supabase
                        .from('sales_packages')
                        .select('enrolled_students')
                        .eq('id', paymentMeta.packageId)
                        .single();
                    if (pkgData) {
                        await supabase.from('sales_packages').update({
                            enrolled_students: (pkgData.enrolled_students || 0) + 1
                        }).eq('id', paymentMeta.packageId);
                    }
                }
            } catch {
                // Ignore error in incrementing
            }
        }

        // Cookie'yi temizle
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
        return redirectWithStatus(request, 'error', 'Ödeme alındı ama kayıt oluşturulamadı. Lütfen destek ile iletişime geçin.');
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
