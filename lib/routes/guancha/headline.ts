import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/headline',
    categories: ['new-media'],
    example: '/guancha/headline',
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
            source: ['guancha.cn/GuanChaZheTouTiao/list_1.shtml', 'guancha.cn/', 'guancha.cn/special/GuanChaZheTouTiao/1'],
        },
    ],
    name: '头条',
    maintainers: ['nczitzk'],
    handler,
    url: 'guancha.cn/special/GuanChaZheTouTiao/1',
};

async function handler() {
    const rootUrl = 'https://www.guancha.cn';
    const currentUrl = `${rootUrl}/GuanChaZheTouTiao/list_1.shtml`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.headline-list li .content-headline h3 a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                description: $item.parent().next().html(),
                summary: $item.parent().next().text(),
                link: new URL($item.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate($item.parents('div').first().find('span').text()), 8),
            };
        });

    items = await Promise.all(
        items.map(async (item) => {
            const article = await cache.tryGet(`guancha:headline:attributed-article:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                return {
                    description: content('.all-txt').html(),
                    author: content('.author-intro p a').text() || content('.editor-intro p a').text() || undefined,
                };
            });
            return { ...item, ...article };
        })
    );

    return {
        title: '观察者网 - 头条',
        link: currentUrl,
        item: items,
    };
}
