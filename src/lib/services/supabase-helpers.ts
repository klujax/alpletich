/**
 * Supabase Helper Fonksiyonları
 * snake_case <-> camelCase dönüşüm utilityleri
 */

// Map snake_case DB rows to camelCase JS objects
export function toCamels<T = any>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamels) as T;

    const newObj: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[newKey] = toCamels((obj as Record<string, unknown>)[key]);
    }
    return newObj as T;
}

// Map camelCase JS objects to snake_case for DB inserts
export function toSnakes<T = any>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakes) as T;

    const newObj: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
        const newKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        newObj[newKey] = toSnakes((obj as Record<string, unknown>)[key]);
    }
    return newObj as T;
}
