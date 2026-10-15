import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://rustcc.cn';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/rustcc/news',
    radar: [
        {
            source: ['rustcc.cn/'],
        },
    ],
    name: '新闻/聚合',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'rustcc.cn/',
};

async function handler() {
    const newsUrl = 'https://rustcc.cn/section?id=f4703117-7e6b-4caf-aa22-a3ad3db6898f';

    const response = await got({
        url: newsUrl,
    });

    const $ = load(response.data);
    const list: Array<DataItem & { link: string }> = $('.article-list li')
        .toArray()
        .flatMap((el) => {
            const item = $(el);
            const title = item.find('.title');
            if (!title.text()) {
                return [];
            }
            const href = title.attr('href');
            if (!href) {
                throw new Error('RustCC article URL is missing');
            }
            return {
                title: title.text(),
                author: item.find('.info .author').text().trim() || undefined,
                category: item
                    .find('.info .tags')
                    .text()
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                link: new URL(href, baseUrl).href,
                pubDate: timezone(parseDate(item.find('.info .timestamp').text(), 'YYYY-MM-DD HH:mm'), 8),
            };
        });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);
                const body = $('.detail-body');
                if (!body.length) {
                    throw new Error('RustCC article body is missing');
                }
                return body.html();
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'Rust语言中文社区 | 新闻/聚合',
        link: newsUrl,
        description: '获取Rust语言中文社区的新闻/聚合',
        item: items,
    };
}
