import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://efe.com';

const categories: Record<string, string> = {
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
};

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

async function handler(ctx) {
    const category = ctx.req.param('category') || 'mundo';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const pageUrl = `${rootUrl}/${category}/`;

    const response = await ofetch(pageUrl);
    const $ = load(response);

    const links = new Set<string>();
    $(`.elementor-loop-container a[href^="${rootUrl}/${category}/"]`).each((_, el) => {
        const href = $(el).attr('href');
        if (href && /\/\d{4}-\d{2}-\d{2}\//.test(href)) {
            links.add(href);
        }
    });

    const items = [];
    for (const link of [...links].slice(0, limit)) {
        const item = await cache.tryGet(link, async () => {
            const detail = await ofetch(link);
            const $detail = load(detail);

            const title = $detail('title').text();
            const dateMatch = detail.match(/"datePublished":\s*"([^"]+)"/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : undefined;

            const image = $detail('meta[property="og:image"]').attr('content');
            const content = $detail('.elementor-widget-theme-post-content');
            content.find('.auto-banner').remove();
            const description = (image ? `<figure><img src="${image}"></figure>` : '') + (content.html() || '');

            return {
                title,
                link,
                pubDate,
                description,
            };
        });
        items.push(item);
    }

    return {
        title: `EFE Noticias - ${categories[category] || category}`,
        link: pageUrl,
        item: items,
    };
}
