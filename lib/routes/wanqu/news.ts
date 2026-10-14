import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/wanqu/news',
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
            source: ['wanqu.co/'],
        },
    ],
    name: '最新推荐',
    maintainers: ['Fatpandac'],
    handler,
    url: 'wanqu.co/',
};

function parseSourceTime(value: unknown) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const rootUrl = 'https://www.wanqu.co';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const items = $('div.mb-4')
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            link: $(item).find('a').attr('href'),
            pubDate: parseSourceTime($(item).find('i.text-helper-color.mr-4').text().trim()),
        }));

    return {
        title: '湾区日报 - 最新推荐',
        link: currentUrl,
        item: items,
    };
}
