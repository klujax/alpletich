'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Smile } from 'lucide-react';
import { dataService, SportCategory, authService } from '@/lib/mock-service';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function CoachSportsPage() {
    const [sports, setSports] = useState<SportCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Sport Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('⚡');
    const [color, setColor] = useState('blue');

    useEffect(() => {
        loadSports();
    }, []);

    const loadSports = async () => {
        setIsLoading(true);
        const allSports = await dataService.getSports();
        // Sadece sistem ve bu koça ait olanları gösterelim mi? 
        // Şimdilik hepsini gösterelim ama sistem defaultları silinemez olsun.
        setSports(allSports);
        setIsLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getUser();
        if (!user) return;

        try {
            await dataService.createSport({
                coachId: user.id,
                name,
                description,
                icon,
                color
            });
            toast.success('Yeni branş oluşturuldu');
            setIsModalOpen(false);
            resetForm();
            loadSports();
        } catch (error) {
            toast.error('Branş oluşturulurken hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu branşı silmek istediğinize emin misiniz?')) {
            await dataService.deleteSport(id);
            toast.success('Branş silindi');
            loadSports();
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setIcon('⚡');
        setColor('blue');
    };

    const EMOJI_OPTIONS = ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '🏋️', '🤸', '⛹️', '🤺', '🤼', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '⚡', '🔥', '💪', '🏆'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Spor Branşları</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Paketlerinizi altında toplayacağınız spor dallarını yönetin.
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Yeni Branş Ekle
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sports.map((sport) => (
                    <Card key={sport.id} className={`relative group overflow-hidden border-slate-200 hover:shadow-xl transition-all ${sport.isSystemDefault ? 'bg-slate-50/50' : 'bg-white'}`}>
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-${sport.color}-500`} />

                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-4xl">{sport.icon}</div>
                                {sport.isSystemDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-200 text-slate-600">
                                        Sistem
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-900">{sport.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">{sport.description}</CardDescription>
                        </CardHeader>

                        {!sport.isSystemDefault && (
                            <CardContent>
                                <Button
                                    variant="outline"
                                    fullWidth
                                    className="border-red-200 hover:bg-red-50 text-red-600 hover:border-red-300"
                                    onClick={() => handleDelete(sport.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yeni Spor Branşı Oluştur"
            >
                <form onSubmit={handleCreate} className="space-y-6 py-4">
                    <Input
                        label="Branş Adı"
                        placeholder="Örn: Pilates, Crossfit, Boks"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Simge (Emoji)</label>
                        <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`text-xl p-1 rounded hover:bg-white hover:shadow-sm transition-all ${icon === emoji ? 'bg-white shadow ring-2 ring-green-500' : ''}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Renk Teması</label>
                        <div className="flex gap-3">
                            {['green', 'blue', 'orange', 'purple', 'red', 'pink', 'teal'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: `var(--${c}-500, ${c})` }}
                                >
                                    {/* Fallback for colors not in tailwind safelist if needed */}
                                    <span className={`block w-full h-full rounded-full bg-${c}-500`} style={{ backgroundColor: c === 'teal' ? '#14b8a6' : c === 'pink' ? '#ec4899' : '' }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none"
                            placeholder="Bu spor dalı neleri kapsıyor?"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} fullWidth>İptal</Button>
                        <Button type="submit" fullWidth className="bg-green-600 hover:bg-green-700 text-white">
                            Oluştur
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
