import { decodeHTML } from 'entities';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.acea.auto';

const types = {
    'press-releases': 'Press releases',
    news: 'News',
    facts: 'Facts',
    figures: 'Figures',
    publications: 'Publications',
};

export const route: Route = {
    path: '/publications/:type?',
    example: '/acea/publications/press-releases',
    name: 'Publications',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    parameters: {
        type: {
            description: 'Native content type',
            options: Object.entries(types).map(([value, label]) => ({ value, label })),
            default: 'press-releases',
        },
    },
    radar: [{ source: ['www.acea.auto/nav/'], target: '/publications' }],
    handler,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') ?? 'press-releases';
    const response = await ofetch(`${baseUrl}/wp-admin/admin-ajax.php`, {
        method: 'POST',
        responseType: 'json',
        body: new URLSearchParams({ action: 'load_results', 'filters[content][]': type, 'filters[pageNumber]': '1', 'filters[orderby]': 'date' }),
    });
    const limit = Number(ctx.req.query('limit')) || 20;
    const posts = response.posts.slice(0, limit);

    const details = await ofetch(`${baseUrl}/wp-json/wp/v2/allpt`, {
        query: {
            include: posts.map((post) => post.ID).join(','),
            per_page: posts.length,
            _fields: 'id,date_gmt,content',
        },
    });

    const items = posts.map((post) => {
        const detail = details.find((detail) => detail.id === post.ID);
        return {
            title: decodeHTML(post.title),
            link: post.permalink,
            description: detail.content.rendered,
            pubDate: parseDate(`${detail.date_gmt}Z`),
            category: post.tag.map((tag) => decodeHTML(tag.name)),
            image: post.thumb?.url,
        };
    });

    return {
        title: `${types[type]} | ACEA - European Automobile Manufacturers' Association`,
        link: `${baseUrl}/nav/?content=${encodeURIComponent(type)}`,
        language: 'en' as const,
        item: items,
    };
}
