'use client';

import { useState, useEffect } from 'react';
import { supabaseDataService, supabaseAuthService } from '@/lib/supabase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, FileText, Plus, Apple, Clock, Flame, ChevronRight, X } from 'lucide-react';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function NutritionPage() {
    const [students, setStudents] = useState<Profile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const user = await supabaseAuthService.getUser();
        if (user) {
            try {
                const sList = await supabaseDataService.getCoachStudents(user.id);
                setStudents(sList);
            } catch (error) {
                console.error("Öğrenci listesi alınamadı:", error);
            }
        }
        setIsLoading(false);
    };

    const filteredStudents = students.filter(s => 
        (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-24 lg:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Beslenme Planları</h1>
                    <p className="text-slate-500 font-medium">Öğrencilerine özel beslenme programları hazırla</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sol Panel - Öğrenci Listesi */}
                <div className="lg:col-span-1 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Öğrenci ara..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-400 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center p-8 text-slate-500">
                                <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">Öğrenci bulunamadı</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredStudents.map(student => (
                                    <button 
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`w-full p-4 flex items-center justify-between text-left transition-all hover:bg-slate-50 ${selectedStudent?.id === student.id ? 'bg-green-50/50 border-l-4 border-green-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                                                {(student.full_name || 'U')[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm truncate">{student.full_name || 'İsimsiz'}</p>
                                                <p className="text-xs text-slate-500 truncate">Aktif Plan: Yok</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ Panel - Beslenme Detayı */}
                <div className="lg:col-span-3 border border-slate-200 rounded-2xl bg-white shadow-sm h-[600px] flex flex-col relative overflow-hidden">
                    {selectedStudent ? (
                        <>
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                        {(selectedStudent.full_name || 'U')[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">{selectedStudent.full_name || 'İsimsiz'}</h2>
                                        <p className="text-sm text-slate-500 font-medium">Beslenme Programı</p>
                                    </div>
                                </div>
                                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-500/20">
                                    <Plus className="w-4 h-4 mr-2" /> Yeni Plan Ata
                                </Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {/* Development placeholder content for data schema integration */}
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="bg-white border text-center border-slate-200 p-8 rounded-2xl shadow-sm">
                                        <Apple className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Bu öğrencinin aktif bir beslenme planı yok</h3>
                                        <p className="text-sm text-slate-500 mb-6">Öğrenci için kalorisi ve makroları hesaplanmış yeni bir beslenme planı oluşturabilirsiniz.</p>
                                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-xl">
                                            İlk Planı Oluştur
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <Apple className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 mb-2">Bir Öğrenci Seçin</h2>
                            <p className="text-slate-500 max-w-sm">
                                Sol taraftaki listeden bir öğrenci seçerek beslenme programını görüntüleyebilir veya yeni bir program atayabilirsiniz.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
