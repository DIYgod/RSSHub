import type { Context } from 'hono';
import MarkdownIt from 'markdown-it';

import type { DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:language?',
    categories: ['picture'],
    example: '/getdailyart/en',
    parameters: {
        language: 'Support en, es, fr, de, it, zh, ja, etc. `jp` is accepted as an alias for Japanese. English by default.',
    },
    name: 'Artwork of the day',
    maintainers: ['zphw'],
    handler,
};

const md = MarkdownIt({ html: true, breaks: true });

interface Artwork {
    id: number;
    name: string;
    image: string;
    date: string;
    size: string;
    technique: string;
    copyrights: string;
    description: string;
    publish_date: string;
    share_url: string;
    authors: Array<{ name: string }>;
    museum: { name: string } | null;
    genre: { name: string } | null;
}

async function handler(ctx: Context) {
    const { language = 'en' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);
    const apiUrl = 'https://api.getdailyart.com/api';

    const headers = { lang: language === 'jp' ? 'ja' : language, timezone: 'UTC' };
    const [daily, archival] = await Promise.all([ofetch(`${apiUrl}/artworks/daily`, { query: { inches: 0 }, headers }), ofetch(`${apiUrl}/artworks/archival`, { query: { inches: 0, limit: limit - 1, page: 1 }, headers })]);

    return {
        title: 'DailyArt',
        link: 'https://www.getdailyart.com/',
        language: (language === 'jp' ? 'ja' : language) as Language,
        item: uniqueArtworks([daily, ...archival.data])
            .slice(0, limit)
            .map((artwork: Artwork): DataItem => ({
                title: artwork.name,
                description: `<img src="${artwork.image}"><p>${[artwork.date, artwork.size, artwork.technique, artwork.museum?.name, artwork.copyrights].filter(Boolean).join(' · ')}</p>${md.render(artwork.description)}`,
                author: artwork.authors.map((author) => author.name).join(', '),
                category: artwork.genre ? [artwork.genre.name] : undefined,
                pubDate: parseDate(artwork.publish_date),
                link: artwork.share_url.split('?', 1)[0].replace('//getdailyart.com/', '//www.getdailyart.com/'),
                guid: `getdailyart:${artwork.id}`,
            })),
    };
}

function uniqueArtworks(artworks: Artwork[]) {
    const seenIds = new Set<number>();
    return artworks.filter((artwork) => {
        if (seenIds.has(artwork.id)) {
            return false;
        }
        seenIds.add(artwork.id);
        return true;
    });
}
