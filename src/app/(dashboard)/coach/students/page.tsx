'use client';

import { useEffect, useState } from 'react';
import { dataService } from '@/lib/mock-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Plus, User, Mail } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Profile } from '@/types/database';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function StudentsPage() {
    const [students, setStudents] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function loadStudents() {
        setIsLoading(true);
        const data = await dataService.getStudents();
        setStudents(data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadStudents();
    }, []);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await dataService.addStudent(newStudentName, newStudentEmail);
            setIsModalOpen(false);
            setNewStudentName('');
            setNewStudentEmail('');
            // Listeyi yenile
            await loadStudents();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Öğrencilerim</h1>
                    <p className="text-slate-500 font-medium">Tüm öğrencilerinin gelişimi ve takibi burada.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Öğrenci
                </Button>
            </div>

            <div className="grid gap-4">
                {students.map((student) => (
                    <Link href={`/coach/students/${student.id}`} key={student.id}>
                        <Card hover className="bg-white border-slate-200 cursor-pointer transition-all hover:border-green-500/50 group">
                            <CardContent className="flex items-center p-4">
                                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                                    {getInitials(student.full_name || '')}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-green-700 transition-colors">{student.full_name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{student.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="hidden sm:flex">Profili İncele</Button>
                                    <Button variant="ghost" size="sm" className="px-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {students.length === 0 && !isLoading && (
                    <div className="text-slate-400 text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Henüz öğrenci bulunmuyor.</p>
                        <Button variant="ghost" className="mt-2 text-green-600 font-bold" onClick={() => setIsModalOpen(true)}>İlk öğrenciyi ekle</Button>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yeni Öğrenci Ekle"
                description="Öğrencinin bilgilerini girerek sisteme kaydet."
                size="sm"
            >
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <Input
                        label="Ad Soyad"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        required
                        leftIcon={<User className="w-4 h-4" />}
                    />
                    <Input
                        label="E-posta"
                        placeholder="ogrenci@mail.com"
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        required
                        leftIcon={<Mail className="w-4 h-4" />}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit" isLoading={isSubmitting}>Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

