import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'https://jwc.qdu.edu.cn/';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/qdu/jwc',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.qdu.edu.cn/jwtz.htm', 'jwc.qdu.edu.cn/'],
        },
    ],
    name: '教务处通知',
    maintainers: ['abc1763613206'],
    handler,
    url: 'jwc.qdu.edu.cn/jwtz.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${base}jwtz.htm`,
    });

    const $ = load(response.data);
    const list = $('.notice_item')
        .children()
        .toArray()
        .flatMap((item) => {
            const href = $(item).find('.active').attr('href');
            if (!href) {
                return [];
            }
            const link = new URL(href, `${base}jwtz.htm`);
            if (!['http:', 'https:'].includes(link.protocol)) {
                return [];
            }
            return { element: item, link: link.href };
        });
    const items = await pMap(
        list,
        (item) => {
            const $item = $(item.element);
            const itemTitle = $item.find('.active').text();
            const itemDate = $item.find('span').text();
            const itemUrl = item.link;
            return cache.tryGet(itemUrl, async () => {
                let description: string | undefined;
                if (new URL(itemUrl).origin === new URL(base).origin) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    // Restricted notices do not expose a public article body.
                    if ($('title').text() !== '系统提示') {
                        description = $('.v_news_content').html()?.trim();
                    }
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '青岛大学 - 教务处通知',
        link: `${base}jwtz.htm`,
        description: '青岛大学 - 教务处通知',
        item: items,
    };
}
