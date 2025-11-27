import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:id',
    categories: ['new-media'],
    example: '/tophub/Om4ejxvxEN',
    parameters: { id: '榜单id，可在 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'TOPHUB_COOKIE',
                optional: true,
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tophub.today/n/:id'],
        },
    ],
    name: '榜单',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const link = `https://tophub.today/n/${id}`;
    const response = await ofetch(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub?.cookie ?? '',
        },
    });
    const $ = load(response);

    const title = $('.tt h3').text().trim();

    const out = $('.rank-all-item:not(.history-content) .jc-c tr')
        .toArray()
        .map((e) => {
            const info = {
                title: $(e).find('td a').first().text(),
                link: $(e).find('td a').first().attr('href'),
                description: $(e).find('.ws').text().trim(),
            };
            return info;
        });

    return {
        title,
        description: $('.tt p').text().trim(),
        image: $('.ii img').attr('src'),
        link,
        item: out,
    };
}
