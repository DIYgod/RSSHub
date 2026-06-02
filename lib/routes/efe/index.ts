import { load } from 'cheerio';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
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
};

export const route: Route = {
    path: '/:category?',
    name: 'Noticias',
    maintainers: ['mlkgrnt'],
    example: '/efe/mundo',
    parameters: { category: 'Categoría, por defecto mundo' },
    handler,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['efe.com/:category'],
            target: '/efe/:category',
        },
    ],
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'mundo';
    const pageUrl = `${rootUrl}/${category}/`;

    const response = await ofetch(pageUrl);
    const $ = load(response);

    const links = new Set<string>();
    $(`a[href^="${rootUrl}/${category}/"]`).each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.match(/\/\d{4}-\d{2}-\d{2}\//)) {
            links.add(href);
        }
    });

    const items = await Promise.all(
        [...links].slice(0, 20).map((link) =>
            cache.tryGet(link, async () => {
                const detail = await ofetch(link);
                const $detail = load(detail);

                const title = $detail('title').first().text().trim();
                const dateMatch = detail.match(/"datePublished":\s*"([^"]+)"/);
                const pubDate = dateMatch ? parseDate(dateMatch[1]) : undefined;

                const content = $detail('article .entry-content, article .elementor-widget-theme-post-content').first();
                const description = content.html() || '';

                return {
                    title,
                    link,
                    pubDate,
                    description,
                };
            })
        )
    );

    return {
        title: `EFE Noticias - ${categories[category] || category}`,
        link: pageUrl,
        item: items,
    };
}
