import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

import { getPage } from './utils';

export const route: Route = {
    path: '/winners-list',
    categories: ['other'],
    example: '/noi/winners-list',
    name: '获奖名单',
    maintainers: ['WenryXu'],
    features: { antiCrawler: true },
    handler,
};

async function handler() {
    const $ = await getPage('https://www.noi.cn/hjmd/mdgs/');
    const postList = $('.news-all .news-item').toArray();

    const result = await pMap(
        postList,
        (item) => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = new URL($item.find('a').attr('href')!, 'https://www.noi.cn').href;
            const pubDate = parseDate($item.find('small').text(), 8);

            // only follow links on the site itself
            if (!isOnSite(link, 'noi.cn')) {
                return { title, link, guid: link, pubDate };
            }

            return cache.tryGet(link, async () => {
                const $detail = await getPage(link);

                return {
                    title,
                    link,
                    guid: link,
                    pubDate,
                    description: $detail('.news-cont').html(),
                };
            });
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '获奖名单 - NOI 全国青少年信息学奥林匹克竞赛',
        link: 'https://www.noi.cn/hjmd/mdgs/',
        item: result,
    };
}
