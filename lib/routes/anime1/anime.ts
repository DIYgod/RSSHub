import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: 'anime/:category/:name',
    name: 'Anime',
    url: 'anime1.me',
    maintainers: ['cxheng315'],
    example: '/anime1/anime/2024年夏季/神之塔-第二季',
    categories: ['anime'],
    parameters: {
        category: 'Anime1 Category',
        name: 'Anime1 Name',
    },
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
            source: ['anime1.me/category/:category/:name'],
            target: '/anime/:category/:name',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category, name } = ctx.req.param();

    const response = await ofetch(`https://anime1.me/category/${category}/${name}`);

    const $ = load(response);

    const title = $('.page-title').text().trim();

    const items = $('article')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('.entry-title a').text().trim();
            return {
                title,
                link: $el.find('.entry-title a').attr('href'),
                description: title,
                pubDate: parseDate($el.find('time').attr('datetime') || ''),
                itunes_item_image: $el.find('video').attr('poster'),
            };
        });

    return {
        title,
        link: `https://anime1.me/category/${category}/${name}`,
        description: title,
        item: items,
    };
}
