import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/new',
    categories: ['multimedia'],
    example: '/missav/new',
    parameters: {},
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
            source: ['missav.com/dm397/new', 'missav.com/new', 'missav.com/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.com/dm397/new',
};

async function handler() {
    const baseUrl = 'https://missav.com';
    const { data: response } = await got(`${baseUrl}/dm397/new`);
    const $ = load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.text-secondary');
            const poster = new URL(item.find('img').data('src'));
            poster.searchParams.set('class', 'normal');
            const video = item.find('video').data('src');
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
