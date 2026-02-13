'use client';

import { useState } from 'react';
import { Play, Clock, BarChart, ChevronRight, Dumbbell, Edit2, Trash2, X, Save, Activity, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn, getDifficultyLabel } from '@/lib/utils';
import type { Exercise } from '@/types/database';

interface ExerciseCardProps {
    exercise: Exercise;
    isAdmin?: boolean; // Koç için düzenleme seçenekleri
    onComplete?: () => void; // Öğrenci için tamamlama
    onEdit?: (exercise: Exercise) => void; // Düzenleme callback
    onDelete?: (exerciseId: string) => void; // Silme callback
}

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
    // Handle different YouTube URL formats
    let videoId = '';

    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
        // Convert to nocookie version
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube-nocookie.com/embed/')) {
        return url; // Already a nocookie embed URL
    }

    // Use youtube-nocookie.com for better embedding support
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url;
}

// Get YouTube video ID from URL
function getYouTubeVideoId(url: string): string {
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        return urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
        return url.split('embed/')[1]?.split('?')[0] || '';
    }
    return '';
}

// Get YouTube thumbnail URL
function getYouTubeThumbnail(url: string): string | null {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

// Check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

export function ExerciseCard({ exercise, isAdmin, onComplete, onEdit, onDelete }: ExerciseCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState(exercise.name);
    const [editDescription, setEditDescription] = useState(exercise.description || '');
    const [editVideoUrl, setEditVideoUrl] = useState(exercise.animation_url || '');
    const [editDuration, setEditDuration] = useState(exercise.duration_seconds?.toString() || '60');
    const [editDifficulty, setEditDifficulty] = useState(exercise.difficulty);

    // Zorluk seviyesine göre renk belirleme - OKUNABİLİR RENKLER
    const difficultyStyles = {
        beginner: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        intermediate: 'text-amber-700 bg-amber-50 border-amber-100',
        advanced: 'text-rose-700 bg-rose-50 border-rose-100',
    };

    const handleSaveEdit = () => {
        if (onEdit) {
            onEdit({
                ...exercise,
                name: editName,
                description: editDescription,
                animation_url: editVideoUrl || null,
                duration_seconds: parseInt(editDuration) || 60,
                difficulty: editDifficulty,
            });
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(exercise.id);
        }
        setShowDeleteConfirm(false);
        setIsOpen(false);
    };

    const isYoutube = exercise.animation_url ? isYouTubeUrl(exercise.animation_url) : false;
    const thumbnailUrl = exercise.animation_url && isYoutube
        ? getYouTubeThumbnail(exercise.animation_url)
        : null;

    return (
        <>
            <Card
                className="group relative overflow-hidden bg-white dark:bg-black border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 border-2 hover:border-primary/20"
                onClick={() => setIsOpen(true)}
            >
                {/* Header: Visual area with Image/Thumbnail */}
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                    {thumbnailUrl ? (
                        <>
                            <img
                                src={thumbnailUrl}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                alt={exercise.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        </>
                    ) : exercise.animation_url && !isYoutube ? (
                        <div className="w-full h-full relative">
                            <video
                                src={exercise.animation_url}
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                preload="metadata"
                                muted
                                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                onMouseOut={(e) => {
                                    const v = e.target as HTMLVideoElement;
                                    v.pause();
                                    v.currentTime = 0;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Dumbbell className="w-10 h-10" />
                            </div>
                        </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
                            <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg",
                            difficultyStyles[exercise.difficulty],
                            "bg-white/90 border-transparent shadow-black/5"
                        )}>
                            {getDifficultyLabel(exercise.difficulty)}
                        </span>
                        {exercise.animation_url && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 bg-black/40 text-white backdrop-blur-md flex items-center gap-1 shadow-lg">
                                <Play className="w-3 h-3 fill-current text-red-500" />
                                VIDEO
                            </span>
                        )}
                    </div>

                    {/* Admin buttons */}
                    {isAdmin && (
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(true); setIsEditing(true); }}
                                className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-900 shadow-xl transition-all hover:bg-white hover:scale-110"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                                className="w-10 h-10 rounded-2xl bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all hover:bg-red-500 hover:scale-110"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Duration Bottom Left */}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">{Math.floor((exercise.duration_seconds || 60) / 60)} DK</span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight group-hover:text-primary transition-colors duration-300">{exercise.name}</h3>
                        </div>
                        {exercise.description && (
                            <p className="text-slate-500 text-xs font-bold line-clamp-2 leading-relaxed h-8">
                                {exercise.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-wrap gap-1.5">
                            {exercise.muscle_groups?.slice(0, 2).map((muscle: string, i: number) => (
                                <span key={i} className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                    {muscle}
                                </span>
                            ))}
                        </div>
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Egzersizi Sil"
                size="sm"
            >
                <div className="py-4">
                    <p className="text-slate-600 text-center mb-6">
                        <strong className="text-slate-900">"{exercise.name}"</strong> egzersizini silmek istediğinize emin misiniz?
                    </p>
                    <div className="flex gap-3">
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="h-12"
                        >
                            İptal
                        </Button>
                        <Button
                            fullWidth
                            onClick={handleDelete}
                            className="h-12 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Detail/Edit Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => { setIsOpen(false); setVideoLoaded(false); setIsEditing(false); }}
                title={isEditing ? "Egzersizi Düzenle" : exercise.name}
                size="lg"
                footer={
                    isEditing ? (
                        <div className="w-full flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsEditing(false)}
                                className="h-12 flex-1"
                            >
                                <X className="w-4 h-4 mr-2" />
                                İptal
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                className="h-12 flex-1 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Kaydet
                            </Button>
                        </div>
                    ) : onComplete ? (
                        <div className="w-full flex gap-3">
                            <Button fullWidth onClick={() => { onComplete(); setIsOpen(false); }} className="bg-green-700 hover:bg-green-800 text-white font-black h-12 rounded-2xl">
                                Egzersizi Tamamla
                            </Button>
                        </div>
                    ) : isAdmin ? (
                        <div className="w-full flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="h-12 flex-1"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Düzenle
                            </Button>
                            <Button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="h-12 flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                            </Button>
                        </div>
                    ) : null
                }
            >
                {isEditing ? (
                    // Edit Form
                    <div className="space-y-6 py-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Egzersiz Adı</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Egzersiz Videosu</label>
                            {editVideoUrl ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group">
                                    <video src={editVideoUrl} className="w-full h-full object-cover" controls />
                                    <button
                                        onClick={() => setEditVideoUrl('')}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-green-500 transition-all cursor-pointer">
                                    <Video className="w-8 h-8 text-slate-300 mb-2" />
                                    <span className="text-xs font-bold text-slate-400">Video Yükle</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="video/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setEditVideoUrl(URL.createObjectURL(file));
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Süre (saniye)</label>
                                <input
                                    type="number"
                                    value={editDuration}
                                    onChange={(e) => setEditDuration(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Zorluk</label>
                                <select
                                    value={editDifficulty}
                                    onChange={(e) => setEditDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                                >
                                    <option value="beginner">Başlangıç</option>
                                    <option value="intermediate">Orta</option>
                                    <option value="advanced">İleri</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    // View Mode
                    <div className="space-y-8 py-2">
                        {/* Video / Visual Section */}
                        <div className="aspect-video w-full rounded-[2.5rem] bg-slate-950 border-4 border-slate-100 overflow-hidden relative shadow-2xl group/video">
                            {exercise.animation_url ? (
                                isYouTubeUrl(exercise.animation_url) ? (
                                    <div className="relative w-full h-full">
                                        {!videoLoaded ? (
                                            <div
                                                className="w-full h-full cursor-pointer relative"
                                                onClick={() => setVideoLoaded(true)}
                                            >
                                                {thumbnailUrl && (
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt={exercise.name}
                                                        className="w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover/video:opacity-80"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (target.src.includes('maxresdefault')) {
                                                                target.src = target.src.replace('maxresdefault', 'hqdefault');
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white scale-90 group-hover/video:scale-110 transition-all duration-700 shadow-2xl">
                                                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover/video:bg-red-700">
                                                            <Play className="w-8 h-8 fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-xs font-black tracking-widest uppercase bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-2xl shadow-2xl">
                                                    VİDEOYU BAŞLATMAK İÇİN TIKLAYIN
                                                </div>
                                            </div>
                                        ) : (
                                            <iframe
                                                src={`${getYouTubeEmbedUrl(exercise.animation_url)}?rel=0&modestbranding=1&autoplay=1&playsinline=1`}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                allowFullScreen
                                                title={exercise.name}
                                                style={{ border: 'none' }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <video
                                        src={exercise.animation_url}
                                        controls
                                        className="w-full h-full object-contain bg-black"
                                    >
                                        Tarayıcınız video oynatmayı desteklemiyor.
                                    </video>
                                )
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-6 text-slate-500">
                                            <Dumbbell className="w-12 h-12" />
                                        </div>
                                        <p className="text-white font-black text-xl">Video Bulunmuyor</p>
                                        <p className="text-slate-500 font-bold mt-2">Bu egzersiz için rehber video henüz eklenmemiş.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-[2rem] p-6 text-center border-2 border-slate-100/50 hover:border-green-200 transition-colors group/stat">
                                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                                <div className="text-2xl font-black text-slate-950 tabular-nums leading-none">
                                    {Math.floor((exercise.duration_seconds || 60) / 60)}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DAKİKA</div>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] p-6 text-center border-2 border-slate-100/50 hover:border-green-200 transition-colors group/stat">
                                <BarChart className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                                <div className="text-lg font-black text-slate-950 leading-none">
                                    {getDifficultyLabel(exercise.difficulty).toUpperCase()}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ZORLUK</div>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] p-6 text-center border-2 border-slate-100/50 hover:border-green-200 transition-colors group/stat">
                                <Activity className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                                <div className="text-lg font-black text-slate-950 leading-none">
                                    {exercise.muscle_groups?.[0]?.toUpperCase() || 'TÜM VÜCUT'}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ANA BÖLGE</div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-8 bg-slate-50/50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                            {exercise.description && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-green-600 rounded-full" />
                                        <h4 className="text-lg font-black text-slate-950 tracking-tight uppercase">NASIL YAPILIR?</h4>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-bold text-lg">
                                        {exercise.description}
                                    </p>
                                </div>
                            )}

                            {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-green-600 rounded-full" />
                                        <h4 className="text-lg font-black text-slate-950 tracking-tight uppercase">HEDEF KAS GRUPLARI</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {exercise.muscle_groups.map((muscle: string, i: number) => (
                                            <span key={i} className="text-xs font-black text-green-700 bg-green-100/50 border border-green-200/50 px-5 py-2.5 rounded-2xl shadow-sm">
                                                {muscle.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
