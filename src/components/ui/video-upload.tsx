'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabaseDataService } from '@/lib/supabase-service';
import { toast } from 'sonner';

interface VideoUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
}

export function VideoUpload({ onUploadComplete, folder = 'videos' }: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('video/')) {
            toast.error('Lütfen geçerli bir video dosyası seçin');
            return;
        }

        // 100MB limit check (example)
        if (file.size > 100 * 1024 * 1024) {
            toast.error('Video boyutu 100MB\'dan küçük olmalıdır');
            return;
        }

        setIsUploading(true);
        try {
            const path = `${folder}/${Date.now()}_${file.name}`;
            const publicUrl = await supabaseDataService.uploadFile('videos', path, file);
            onUploadComplete(publicUrl);
            toast.success('Video başarıyla yüklendi!');
        } catch (error) {
            console.error(error);
            toast.error('Video yüklenirken hata oluştu');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div>
            <input
                type="file"
                id="video-upload"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
            />
            <label htmlFor="video-upload">
                <div className={`
                    cursor-pointer border-dashed border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 
                    transition-all text-slate-500 hover:text-green-600 
                    w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}>
                    <div className="pointer-events-none">
                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2" />
                                <span>Yükleniyor...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 mb-1" />
                                <span className="font-bold">Video Yükle</span>
                                <span className="text-xs font-normal opacity-70">MP4, WebM (Max 100MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            </label>
        </div>
    );
}
