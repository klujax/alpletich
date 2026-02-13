import { NextApiRequest, NextApiResponse } from 'next';

const sitemap = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Content-Type', 'text/xml');
    res.write(`
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
            <url>
                <loc>${process.env.NEXT_PUBLIC_SITE_URL}/</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
            <url>
                <loc>${process.env.NEXT_PUBLIC_SITE_URL}/about</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
            <url>
                <loc>${process.env.NEXT_PUBLIC_SITE_URL}/contact</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
        </urlset>
    `);
    res.end();
};

export default sitemap;