'use client';

import { useState } from 'react';
import { Play, Clock, BarChart, ChevronRight, Dumbbell, Edit2, Trash2, X, Save } from 'lucide-react';
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

    const thumbnailUrl = exercise.animation_url && isYouTubeUrl(exercise.animation_url)
        ? getYouTubeThumbnail(exercise.animation_url)
        : null;

    return (
        <>
            <Card
                hover
                className="group relative overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/50 cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                {/* Header: Visual area */}
                <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-0" />
                    <div
                        className="relative z-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-green-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    >
                        <Dumbbell className="w-12 h-12" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 shadow-sm",
                            difficultyStyles[exercise.difficulty]
                        )}>
                            {getDifficultyLabel(exercise.difficulty)}
                        </span>
                        {exercise.animation_url && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 shadow-sm bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                                <Play className="w-3 h-3 fill-current" />
                                Video
                            </span>
                        )}
                    </div>

                    {/* Admin buttons */}
                    {isAdmin && (
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(true); setIsEditing(true); }}
                                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{exercise.name}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-green-500" />
                            {Math.floor((exercise.duration_seconds || 60) / 60)} dk
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BarChart className="w-4 h-4 text-green-500" />
                            {getDifficultyLabel(exercise.difficulty)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-1.5">
                            {exercise.muscle_groups?.slice(0, 2).map((muscle: string, i: number) => (
                                <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {muscle}
                                </span>
                            ))}
                        </div>
                        <div className="text-green-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
                            <label className="block text-sm font-bold text-slate-700 mb-2">YouTube Video URL</label>
                            <input
                                type="url"
                                value={editVideoUrl}
                                onChange={(e) => setEditVideoUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                            />
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
                        {/* Video Preview */}
                        <div className="aspect-video w-full rounded-3xl bg-slate-900 border-2 border-slate-100 overflow-hidden relative shadow-inner">
                            {exercise.animation_url ? (
                                // Check if it's a YouTube URL
                                isYouTubeUrl(exercise.animation_url) ? (
                                    <div className="relative w-full h-full">
                                        {!videoLoaded ? (
                                            // Show thumbnail first - click to load video
                                            <div
                                                className="w-full h-full cursor-pointer group relative"
                                                onClick={() => setVideoLoaded(true)}
                                            >
                                                {/* Thumbnail */}
                                                {thumbnailUrl && (
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt={exercise.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback to medium quality if maxres doesn't exist
                                                            const target = e.target as HTMLImageElement;
                                                            if (target.src.includes('maxresdefault')) {
                                                                target.src = target.src.replace('maxresdefault', 'hqdefault');
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {/* Play button overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                    <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
                                                        <Play className="w-10 h-10 text-white fill-current ml-1" />
                                                    </div>
                                                </div>
                                                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-bold bg-black/50 px-4 py-2 rounded-full">
                                                    Videoyu izlemek için tıklayın
                                                </p>
                                            </div>
                                        ) : (
                                            // Load video after click
                                            <iframe
                                                src={`${getYouTubeEmbedUrl(exercise.animation_url)}?rel=0&modestbranding=1&autoplay=1&playsinline=1`}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                allowFullScreen
                                                title={exercise.name}
                                                style={{ border: 'none' }}
                                            />
                                        )}
                                        {/* Fallback button to open in YouTube */}
                                        <a
                                            href={exercise.animation_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-3 right-3 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg transition-colors z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                            YouTube'da Aç
                                        </a>
                                    </div>
                                ) : (
                                    // Direct video URL
                                    <video
                                        src={exercise.animation_url}
                                        controls
                                        className="w-full h-full object-contain bg-black"
                                    >
                                        Tarayıcınız video oynatmayı desteklemiyor.
                                    </video>
                                )
                            ) : (
                                // No video - show placeholder
                                <>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/50 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative z-10 text-center">
                                            <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <Play className="w-10 h-10 text-green-600 fill-current ml-1" />
                                            </div>
                                            <p className="text-slate-900 font-black text-lg">Video Eklenmemiş</p>
                                            <p className="text-slate-500 text-sm mt-1">Bu egzersiz için henüz video yok</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                <div className="text-3xl font-black text-slate-900 tabular-nums">{Math.floor((exercise.duration_seconds || 60) / 60)}</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dakika</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                <div className="text-lg font-black text-slate-900">{getDifficultyLabel(exercise.difficulty)}</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zorluk</div>
                            </div>
                        </div>

                        {/* Description */}
                        {exercise.description && (
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Açıklama</h4>
                                <p className="text-slate-600 leading-relaxed font-medium">{exercise.description}</p>
                            </div>
                        )}

                        {/* Target Muscles */}
                        {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Hedef Kaslar</h4>
                                <div className="flex flex-wrap gap-2">
                                    {exercise.muscle_groups.map((muscle: string, i: number) => (
                                        <span key={i} className="text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                            {muscle}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
