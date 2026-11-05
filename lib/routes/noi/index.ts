import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { createPageFetcher } from './utils';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/noi',
    name: '新闻',
    maintainers: ['WenryXu'],
    features: { requirePuppeteer: true },
    handler,
};

async function handler() {
    const { getPage, destroy } = createPageFetcher();
    try {
        const $ = await getPage('https://www.noi.cn/xw/index.shtml', '.news-all .news-item');
        const postList = $('.news-all .news-item').toArray();

        const result = await pMap(
            postList,
            (item) => {
                const $item = $(item);
                const title = $item.find('a').text();
                const link = 'https://www.noi.cn' + $item.find('a').attr('href');
                const pubDate = timezone(parseDate($item.find('small').text()), 8);

                return cache.tryGet(link, async () => {
                    const $detail = await getPage(link, '.news-cont');

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
            title: '新闻 - NOI 全国青少年信息学奥林匹克竞赛',
            link: 'https://www.noi.cn/articles.html?type=1',
            item: result,
        };
    } finally {
        await destroy();
    }
}
