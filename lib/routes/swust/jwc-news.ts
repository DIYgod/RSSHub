import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { evil, request } from './utils';

export const route: Route = {
    path: '/jwc/news',
    categories: ['university'],
    example: '/swust/jwc/news',
    name: '教务处新闻',
    maintainers: ['lengthmin'],
    handler,
};

const api = 'http://www.dean.swust.edu.cn/cms/portal/news.json';
const host = 'http://www.dean.swust.edu.cn/';
const page = 'http://www.dean.swust.edu.cn/news/';

async function handler() {
    const response = await request(api);
    const data = evil(response);

    return {
        allowEmpty: true,
        title: '西南科技大学教务处 新闻',
        link: host,
        description: '西南科技大学教务处 新闻',
        item: await Promise.all(
            data.map((item) => {
                const link = page + item.id;

                return cache.tryGet(link, () =>
                    Promise.resolve({
                        title: item.title,
                        link,
                        pubDate: timezone(parseDate(item.outdate), 8),
                        author: item.publisher,
                    })
                );
            })
        ),
    };
}
