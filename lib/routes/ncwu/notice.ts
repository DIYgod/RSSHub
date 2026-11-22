import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

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
        .map((item) => {
            const $item = $(item);
            const $links = $item.find('h5.title a');
            const $article = $links.last();
            const date = $item.find('.time span').last().text() + '-' + $item.find('.time .puls').text();
            return {
                title: '「' + $links.first().text() + '」' + $article.text(),
                description: $item.find('p.summary').text(),
                pubDate: parseDate(date, 8),
                link: new URL($article.attr('href')!, baseUrl).href,
            };
        });

    return {
        title: $('title').text(),
        link: baseUrl,
        item: list,
    };
}
