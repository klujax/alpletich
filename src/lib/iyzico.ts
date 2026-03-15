// iyzico Configuration & Helper
// API anahtarlarını .env.local dosyasına eklemeniz gerekir

let Iyzipay: any;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Iyzipay = require('iyzipay');
} catch {
    // iyzipay modülü yüklenemezse boş obje döndür
    Iyzipay = null;
}

function createIyzipayClient() {
    if (!Iyzipay) return null;

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const uri = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
        console.warn('⚠️ iyzico API anahtarları tanımlı değil. Ödeme sistemi devre dışı.');
        return null;
    }

    return new Iyzipay({ apiKey, secretKey, uri });
}

const iyzipay = createIyzipayClient();

export default iyzipay;

// Export Iyzipay class for constants (CURRENCY, PAYMENT_GROUP, etc.)
export { Iyzipay as IyzipayClass };

// Helper: Generate a unique conversation ID for iyzico
export function generateConversationId(): string {
    return `sportaly_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Helper: Generate basket item ID
export function generateBasketItemId(): string {
    return `BI_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Helper: Format price for iyzico (string with 2 decimal places)
export function formatPrice(price: number): string {
    return price.toFixed(2);
}

// Helper: Check if iyzico is configured
export function isIyzicoConfigured(): boolean {
    return !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}
