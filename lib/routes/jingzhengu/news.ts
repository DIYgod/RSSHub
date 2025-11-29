import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import type { NewsDetail, NewsInfo } from './types';
import { sign } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['other'],
    example: '/jingzhengu/news',
    radar: [
        {
            source: ['www.jingzhengu.com'],
        },
    ],
    name: '资讯',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.jingzhengu.com',
};

async function handler() {
    const baseUrl = 'https://www.jingzhengu.com';

    const payload: Map<string, any> = new Map([
        ['pageNo', 1],
        ['middleware', String(Date.now())],
    ]);
    const response = await ofetch<NewsInfo>(`${baseUrl}/news/makeNewsInfo`, {
        method: 'POST',
        body: {
            ...Object.fromEntries(payload),
            sign: sign(payload),
        },
    });

    const list = response.data.articles.map((item) => ({
        title: item.title,
        description: item.summary,
        link: `${baseUrl}/#/cn/Details_${item.addDate.split(' ')[0].replaceAll('-', '')}${item.id}.html`,
        pubDate: timezone(parseDate(item.addDate, 'YYYY-MM-DD HH:mm:ss'), 8),
        author: item.author,
        id: item.id,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const payload: Map<string, any> = new Map([
                    ['id', item.id],
                    ['middleware', String(Date.now())],
                ]);

                const response = await ofetch<NewsDetail>(`${baseUrl}/news/makeNewsDetail`, {
                    method: 'POST',
                    body: {
                        ...Object.fromEntries(payload),
                        sign: sign(payload),
                    },
                });

                item.description = response.data.content;

                return item;
            })
        )
    );

    return {
        title: '精真估 > 资讯',
        link: `${baseUrl}/#/index/boot`,
        item: items,
    };
}
