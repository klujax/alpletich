'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function StudentNutritionPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
            <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Construction className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Beslenme Planı</h1>
            <p className="text-slate-500 font-medium max-w-md mb-8">
                Beslenme planınız koçunuzun size atadığı paketler içerisinde yer almaktadır. Paketlerinizi görüntülemek için aşağıdaki butona tıklayın.
            </p>
            <Link href="/student/my-courses">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Derslerime Dön
                </Button>
            </Link>
        </div>
    );
}
