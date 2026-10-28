import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['multimedia'],
    example: '/storyfm/index',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['storyfm.cn/'],
        },
    ],
    name: '首页',
    maintainers: ['sanmmm'],
    handler,
    url: 'storyfm.cn/',
};

async function handler() {
    const url = 'http://storyfm.cn';
    const response = await got(url);
    const $ = load(response.data);
    const items = $('.e-ep')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const anchor = $item.find('h2.e-ep__title a');
            const source = $item.find('audio source');
            const date = $item.find('.whitespace-nowrap').text();
            return {
                title: anchor.text(),
                link: anchor.attr('href'),
                description: [$item.find('.zoom-image-container-progression img').first().toString(), $item.find('.e-ep__description').toString(), $item.find('audio').first().toString()].join(''),
                pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined,
                enclosure_url: source.attr('src'),
                enclosure_type: source.attr('type'),
            };
        });
    return {
        title: '故事FM',
        description: '故事FM',
        link: url,
        item: items,
    };
}
