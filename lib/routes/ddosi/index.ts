import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    example: '/ddosi',
    radar: [
        {
            source: ['ddosi.org/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['XinRoom'],
    handler,
    url: 'ddosi.org/',
};

async function handler() {
    const url = 'https://www.ddosi.org/';
    const response = await got({
        method: 'get',
        url: String(url),
        headers: {
            Referer: url,
        },
        headerGeneratorOptions: PRESETS.MODERN_IOS,
    });
    const $ = load(response.data);
    const list = $('main>article').toArray();

    const items = list.map((i) => {
        const item = $(i);

        const href = item.find('a:first-child').attr('href');
        const title = item.find('.entry-title a').text();
        const description = item.find('.entry-content p').text();
        const date = parseDate(item.find('.meta-date a time').attr('datetime'));

        return {
            title: String(title),
            description: String(description),
            pubDate: date,
            link: String(href),
        };
    });

    return {
        title: '雨苁',
        link: String(url),
        item: items,
    };
}
