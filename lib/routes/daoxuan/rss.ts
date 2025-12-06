import { load } from 'cheerio';

import type { Route } from '@/types';
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
    const items = $('div.recent-post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a.article-title').first();
            const timeElement = item.find('time').first();
            return {
                title: a.attr('title'),
                link: `https://daoxuan.cc${a.attr('href')}`,
                pubDate: parseDate(timeElement.attr('datetime')),
                description: a.attr('title'),
            };
        });
    return {
        title: '道宣的窝',
        link: url,
        item: items,
    };
}
