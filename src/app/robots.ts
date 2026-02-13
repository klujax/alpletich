import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/coach/', '/student/'],
        },
        sitemap: 'https://sportaly.app/sitemap.xml',
    };
}
