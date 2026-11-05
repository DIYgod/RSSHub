import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const rootUrl = 'https://efe.com';

const categories = {
    mundo: 'Mundo',
    espana: 'España',
    economia: 'Economía',
    cultura: 'Cultura',
    'ciencia-y-tecnologia': 'Ciencia y Tecnología',
    deportes: 'Deportes',
    salud: 'Salud',
    'medio-ambiente': 'Medio Ambiente',
    educacion: 'Educación',
    'euro-efe': 'EuroEFE',
} satisfies Record<string, string>;

export const route: Route = {
    path: '/:category?',
    name: 'Category',
    maintainers: ['mlkgrnt'],
    example: '/efe/mundo',
    parameters: {
        category: {
            description: 'Category slug, see table below. Defaults to mundo.',
            default: 'mundo',
        },
    },
    handler,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['efe.com/:category'],
            target: '/:category',
        },
    ],
};

interface Post {
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    date_gmt?: string;
    modified_gmt?: string;
    jetpack_featured_media_url?: string;
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:term'?: Array<Array<{ name: string }>>;
    };
}

function getGmtDate(date?: string) {
    if (!date) {
        return;
    }
    const result = parseDate(`${date}Z`);
    return Number.isFinite(result.getTime()) ? result : undefined;
}

async function handler(ctx) {
    const category = ctx.req.param('category') || 'mundo';
    const pageUrl = `${rootUrl}/${category}/`;
    const categoryInfo = await cache.tryGet(`efe:category:${category}`, async () => {
        const result = await ofetch<Array<{ id: number; name: string }>>(`${rootUrl}/wp-json/wp/v2/categories`, { query: { slug: category } });
        if (!result[0]) {
            throw new InvalidParameterError(`Unknown EFE category: ${category}. Use a category slug from efe.com.`);
        }
        return result[0];
    });
    const posts = await ofetch<Post[]>(`${rootUrl}/wp-json/wp/v2/posts`, {
        query: { categories: categoryInfo.id, per_page: Math.min(getRouteLimit(ctx, 20), 100), _embed: 'author,wp:term,wp:featuredmedia' },
    });
    const items = posts.map((post) => {
        const $ = load(post.content.rendered);
        $('.auto-banner, script, style').remove();
        return {
            title: load(post.title.rendered).text(),
            link: post.link,
            description: $('body').html(),
            pubDate: getGmtDate(post.date_gmt),
            updated: getGmtDate(post.modified_gmt),
            author: post._embedded?.author?.[0]?.name,
            category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
            image: post.jetpack_featured_media_url,
        };
    });

    return {
        title: `EFE Noticias - ${categories[category] || categoryInfo.name}`,
        link: pageUrl,
        language: 'es' as const,
        item: items,
    };
}
