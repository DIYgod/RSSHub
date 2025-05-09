import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

export const route: Route = {
    path: '/new',
    categories: ['multimedia'],
    example: '/missav/new',
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
            source: ['missav.ws/dm397/new', 'missav.ws/new', 'missav.ws/'],
        },
        {
            source: ['missav.ai/dm397/new', 'missav.ai/new', 'missav.ai/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.ws/dm397/new',
};

async function handler() {
    const baseUrl = 'https://missav.ws';
    const response = await ofetch(`${baseUrl}/dm397/new`, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = cheerio.load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.text-secondary');
            const poster = new URL($item.find('img').data('src'));
            poster.searchParams.set('class', 'normal');
            const video = $item.find('video').data('src');
            return {
                title: title.text().trim(),
                link: title.attr('href'),
                description: art(path.join(__dirname, 'templates/preview.art'), {
                    poster: poster.href,
                    video,
                    type: video.split('.').pop(),
                }),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
}
