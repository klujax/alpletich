import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export function formatTime(time: string): string {
    return new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(`1970-01-01T${time}`));
}

export function getDayName(dayOfWeek: number): string {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    return days[dayOfWeek - 1] || '';
}

export function getDifficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
        beginner: 'Başlangıç',
        intermediate: 'Orta',
        advanced: 'İleri',
    };
    return labels[difficulty] || difficulty;
}

export function getMealTypeLabel(mealType: string): string {
    const labels: Record<string, string> = {
        breakfast: 'Kahvaltı',
        lunch: 'Öğle Yemeği',
        dinner: 'Akşam Yemeği',
        snack: 'Ara Öğün',
    };
    return labels[mealType] || mealType;
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
