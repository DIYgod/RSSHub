import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.fsmgov.org';
const apiUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/fsmgov',
    radar: [{ source: ['fsmgov.org/', 'fsmgov.org/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'fsmgov.org/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const posts = await ofetch(apiUrl, { query: { per_page: limit, _embed: '1' } });
    const items = posts.map((item) => {
        const media = item._embedded?.['wp:featuredmedia']?.[0];
        const image = media?.source_url;
        const parts: string[] = [];
        if (image) {
            parts.push(`<img src="${image}" />`);
        }
        parts.push(item.content?.rendered || item.excerpt?.rendered || '');
        return {
            title: load(item.title?.rendered ?? '').text(),
            link: item.link,
            description: parts.join('<br>') || undefined,
            pubDate: item.date_gmt ? parseDate(item.date_gmt) : parseDate(item.date),
            author: item._embedded?.author?.[0]?.name,
            category: item._embedded?.['wp:term']
                ?.flat()
                ?.map((t) => t.name)
                .filter(Boolean),
            guid: String(item.id),
            image,
        };
    });
    return { title: 'FSM News', link: rootUrl, language: 'en', item: items };
}
