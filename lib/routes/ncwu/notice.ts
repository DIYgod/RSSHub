import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const baseUrl = 'https://www.ncwu.edu.cn/xxtz.htm';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/ncwu/notice',
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
            source: ['ncwu.edu.cn/xxtz.htm'],
        },
    ],
    name: '学校通知',
    maintainers: ['vuhe'],
    handler,
    url: 'ncwu.edu.cn/xxtz.htm',
};

async function handler() {
    const response = await got(baseUrl);

    const $ = load(response.data);
    const list = $('div.list-media')
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const $links = $item.find('h5.title a');
            const $article = $links.last();
            const href = $article.attr('href');
            if (!href) {
                return [];
            }
            const date = $item.find('.time span').last().text() + '-' + $item.find('.time .puls').text();
            return {
                title: '「' + $links.first().text() + '」' + $article.text(),
                description: $item.find('p.summary').text(),
                pubDate: parseDateInTimezone(date, 8),
                link: new URL(href, baseUrl).href,
            };
        });

    return {
        title: $('title').text(),
        link: baseUrl,
        item: list,
    };
}
