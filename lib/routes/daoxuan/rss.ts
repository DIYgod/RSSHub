import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/daoxuan',
    radar: [
        {
            source: ['daoxuan.cc/'],
        },
    ],
    name: '推荐阅读文章',
    maintainers: ['dx2331lxz'],
    url: 'daoxuan.cc/',
    handler,
};

async function handler() {
    const url = 'https://daoxuan.cc/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('div.recent-post-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.article-title');
            const timeElement = $item.find('time');
            const pubDate = timeElement.attr('datetime');
            return {
                title: a.attr('title')!,
                link: `https://daoxuan.cc${a.attr('href')}`,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                category: $item
                    .find('.article-meta__tags')
                    .toArray()
                    .map((tag) => $(tag).text()),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`daoxuan:article:${item.link}`, async () => {
                const detail = await got(item.link);
                const content = load(detail.data);
                const article = content('article.article-container');
                if (!article.length) {
                    throw new Error(`Daoxuan article content was not found at ${item.link}`);
                }
                return article.html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );
    return {
        title: '道宣的窝',
        link: url,
        item: items,
    };
}
