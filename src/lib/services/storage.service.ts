/**
 * Storage Service — Dosya yükleme
 */

import { getSupabase } from '../supabase';

export const storageService = {
    async uploadFile(bucket: string, path: string, file: File) {
        const sb = getSupabase();
        const { data, error } = await sb.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        });
        if (error) throw error;

        const {
            data: { publicUrl },
        } = sb.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    },

    async listFiles(bucket: string, folderPath?: string) {
        const sb = getSupabase();
        const { data, error } = await sb.storage
            .from(bucket)
            .list(folderPath || '', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) throw error;

        return data.map((file) => {
            const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;
            const {
                data: { publicUrl },
            } = sb.storage.from(bucket).getPublicUrl(fullPath);
            return {
                name: file.name,
                url: publicUrl,
                created_at: file.created_at,
                size: file.metadata?.size || 0,
            };
        });
    },

    async deleteFile(bucket: string, path: string) {
        const { error } = await getSupabase().storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
    },
};
