import type { DataItem, Route } from '@/types';
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

    const payload = new Map<string, number | string>([
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

    const items = await Promise.all(
        response.data.articles.map((article) => {
            const link = `${baseUrl}/#/cn/Details_${article.addDate.split(' ', 1)[0].replaceAll('-', '')}${article.id}.html`;
            const item: DataItem = {
                title: article.title,
                description: article.summary,
                link,
                pubDate: timezone(parseDate(article.addDate, 'YYYY-MM-DD HH:mm:ss'), 8),
                author: article.author,
                id: String(article.id),
            };

            return cache.tryGet(link, async () => {
                const payload = new Map<string, number | string>([
                    ['id', article.id],
                    ['middleware', String(Date.now())],
                ]);

                const detail = await ofetch<NewsDetail>(`${baseUrl}/news/makeNewsDetail`, {
                    method: 'POST',
                    body: {
                        ...Object.fromEntries(payload),
                        sign: sign(payload),
                    },
                });

                item.description = detail.data.content;

                return item;
            });
        })
    );

    return {
        title: '精真估 > 资讯',
        link: `${baseUrl}/#/index/boot`,
        item: items,
    };
}
