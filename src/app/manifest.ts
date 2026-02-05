import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Alpletich Fitness',
        short_name: 'Alpletich',
        description: 'Kişiselleştirilmiş antrenman programları ve profesyonel koç desteği',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#16a34a',
        icons: [
            {
                src: '/shark-logo.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
            },
            {
                src: '/shark-logo.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    };
}
