'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Video, Trash2, Copy, Check } from 'lucide-react';
import { VideoUpload } from '@/components/ui/video-upload';
import { supabaseAuthService } from '@/lib/supabase-service';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

interface VideoFile {
    name: string;
    url: string;
    created_at: string;
    size: number;
}

export default function WorkoutsPage() {
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setIsLoading(true);
        const user = await supabaseAuthService.getUser();
        if (!user) return;

        try {
            // "videos" bucket'ında koçun id'si ile bir klasör oluşturup oraya yüklenmişse veya direkt "coach-videos" klasörüyse.
            // Biz yüklerken "coach-videos" dedik ama dosyaları oradan listeleyebiliriz.
            // TODO: Eğer ileride sadece koçun videolarını listelemek istersen folder ismi `${user.id}` ile başlamalı
            // Şimdilik "coach-videos" altındaki tüm videoları listeliyor
            
            // Note: src/components/ui/video-upload.tsx icerisinde folder="coach-videos" pasliyoruz.
            // Fakat 'uploadFile' methodunda bucket: 'videos', folderPath: upload ederkenki path.
            const { supabaseDataService: dataService } = await import('@/lib/supabase-service');
            const data = await (dataService as any).listFiles('videos', 'coach-videos');
            
            // Supabase API'sinden gelen "." (".emptyFolderPlaceholder" vb.) dizin işaretçilerini göstermemek için
            const validFiles = data.filter((f: any) => f.name && f.name !== '.emptyFolderPlaceholder');
            
            setVideos(validFiles as VideoFile[]);
        } catch (error) {
            console.error("Error loading videos:", error);
            toast.error("Videolar yüklenirken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadComplete = (url: string) => {
        // Yeniden listeleme yapabiliriz veya sadece url bilgisini kullanarak manuel ekleyebiliriz
        loadVideos(); 
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast.success('Video bağlantısı kopyalandı');
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const handleDelete = async (videoName: string) => {
        if (!confirm('Bu videoyu silmek istediğinize emin misiniz?')) return;
        
        try {
            const { supabaseDataService: dataService } = await import('@/lib/supabase-service');
            await (dataService as any).deleteFile('videos', `coach-videos/${videoName}`);
            toast.success('Video başarıyla silindi.');
            loadVideos();
        } catch (error) {
            console.error("Error deleting video:", error);
            toast.error('Video silinirken bir hata oluştu.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Video Kütüphanesi</h1>
                    <p className="text-slate-500 font-medium">Antrenman ve ders videolarını yönet</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Yeni Video Yükle</h3>
                            <VideoUpload onUploadComplete={handleUploadComplete} folder="coach-videos" />
                            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                                Yüklediğiniz videoları antrenman programlarınıza veya öğrenci mesajlarına ekleyebilirsiniz.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Video List */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Yüklenen Videolar</h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Video className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="font-bold text-slate-700">Henüz video yok</h4>
                            <p className="text-slate-400 text-sm">İlk videonu yükleyerek başla</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((video, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Video className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate">{video.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Hazır</span>
                                            <span className="text-xs text-slate-400">{new Date(video.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-slate-400 hover:text-green-600 hover:bg-green-50"
                                            onClick={() => copyToClipboard(video.url)}
                                            title="Linki Kopyala"
                                        >
                                            {copiedUrl === video.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(video.name)}
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
