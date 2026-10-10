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
            source: ['guancha.cn/GuanChaZheTouTiao', 'guancha.cn/'],
        },
    ],
    name: '头条',
    maintainers: ['nczitzk'],
    handler,
    url: 'guancha.cn/GuanChaZheTouTiao',
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
                link: `${rootUrl}${$item.attr('href')!}`,
                pubDate: timezone(parseDate($item.parents('div').first().find('span').text()), 8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                // Guancha only serves the `_s.shtml` variant (the full text on a single page) for
                // multi-page articles. Single-page articles have no such variant, and requesting it
                // redirects to the homepage, which used to make the article body unavailable.

                let body = content('.all-txt').html();

                if (item.link.endsWith('.shtml') && content('.module-page').length > 0) {
                    const fullResponse = await got({
                        method: 'get',
                        url: `${item.link.replace(/\.shtml$/, '')}_s.shtml`,
                    });

                    body = load(fullResponse.data)('.all-txt').html() ?? body;
                }

                if (body) {
                    item.description = `${item.description ?? ''}${body}`;
                }

                return item;
            })
        )
    );

    return {
        title: '观察者网 - 头条',
        link: currentUrl,
        item: items,
    };
}
