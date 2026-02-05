'use client';

import { useEffect, useState } from 'react';
import { dataService, authService } from '@/lib/mock-service';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell, Video, Target } from 'lucide-react';
import { Exercise } from '@/types/database';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default function WorkoutsPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExDesc, setNewExDesc] = useState('');
    const [newExVideoUrl, setNewExVideoUrl] = useState('');
    const [newExInstructions, setNewExInstructions] = useState('');
    const [newExMuscles, setNewExMuscles] = useState('');
    const [newExDifficulty, setNewExDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        setIsLoading(true);
        const user = authService.getUser();
        const data = await dataService.getExercises(user?.id);
        setExercises(data);
        setIsLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getUser();

        await dataService.addExercise({
            name: newExName,
            description: newExDesc,
            difficulty: newExDifficulty,
            is_public: true,
            animation_type: newExVideoUrl ? 'video' : 'css',
            animation_url: newExVideoUrl || null,
            category_id: null,
            created_by: user?.id || '1',
            instructions: newExInstructions || null,
            muscle_groups: newExMuscles ? newExMuscles.split(',').map(m => m.trim()) : [],
            duration_seconds: 60
        });

        // Listeyi yenile
        await loadExercises();

        setIsModalOpen(false);
        resetForm();
    };

    const handleEdit = async (exercise: Exercise) => {
        await dataService.updateExercise(exercise);
        await loadExercises();
    };

    const handleDelete = async (exerciseId: string) => {
        await dataService.deleteExercise(exerciseId);
        await loadExercises();
    };

    const resetForm = () => {
        setNewExName('');
        setNewExDesc('');
        setNewExVideoUrl('');
        setNewExInstructions('');
        setNewExMuscles('');
        setNewExDifficulty('beginner');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Egzersizler & Programlar</h1>
                    <p className="text-slate-500 font-medium">Antrenman kütüphanesi ve planlama.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Egzersiz Ekle
                </Button>
            </div>

            {exercises.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                    <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz egzersiz yok</h3>
                    <p className="text-slate-500 mb-6">İlk egzersizinizi ekleyerek başlayın.</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Egzersiz Ekle
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            isAdmin
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add Exercise Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title="Yeni Egzersiz Ekle"
                size="md"
            >
                <form onSubmit={handleAdd} className="space-y-5">
                    <Input
                        label="Egzersiz Adı"
                        placeholder="Örn: Shoulder Press"
                        value={newExName}
                        onChange={(e) => setNewExName(e.target.value)}
                        required
                        leftIcon={<Dumbbell className="w-4 h-4" />}
                    />

                    <Input
                        label="Açıklama"
                        placeholder="Kısa açıklama..."
                        value={newExDesc}
                        onChange={(e) => setNewExDesc(e.target.value)}
                    />

                    <Input
                        label="Video URL (YouTube veya Direkt Link)"
                        placeholder="https://www.youtube.com/watch?v=... veya https://example.com/video.mp4"
                        value={newExVideoUrl}
                        onChange={(e) => setNewExVideoUrl(e.target.value)}
                        leftIcon={<Video className="w-4 h-4" />}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Talimatlar</label>
                        <textarea
                            placeholder="Egzersizin nasıl yapılacağını açıklayın..."
                            value={newExInstructions}
                            onChange={(e) => setNewExInstructions(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none font-medium"
                            rows={3}
                        />
                    </div>

                    <Input
                        label="Kas Grupları (virgülle ayırın)"
                        placeholder="göğüs, triceps, omuz"
                        value={newExMuscles}
                        onChange={(e) => setNewExMuscles(e.target.value)}
                        leftIcon={<Target className="w-4 h-4" />}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Zorluk Seviyesi</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'beginner', label: 'Başlangıç', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                                { value: 'intermediate', label: 'Orta', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                                { value: 'advanced', label: 'İleri', color: 'bg-rose-50 border-rose-200 text-rose-700' },
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setNewExDifficulty(level.value as any)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-bold transition-all ${newExDifficulty === level.value
                                        ? level.color + ' ring-2 ring-offset-2 ring-green-500'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); resetForm(); }}>İptal</Button>
                        <Button type="submit">Egzersizi Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

