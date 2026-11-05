import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hot',
    categories: ['other'],
    example: '/tianyancha/hot',
    features: { antiCrawler: true },
    name: '热门搜索',
    maintainers: ['nczitzk'],
    handler,
};

async function getArticleDetails(link: string): Promise<Pick<DataItem, 'author' | 'description' | 'pubDate'>> {
    const details = await cache.tryGet(link, async () => {
        const detailResponse = await ofetch(link);
        const content = load(detailResponse);
        const publishedDate = content('.resource').next().text();
        return {
            author: content('.resource').text().replace('来源：', ''),
            description: content('.news-content').html(),
            pubDate: publishedDate.trim() ? parseRelativeDate(publishedDate) : undefined,
        };
    });
    return { author: details.author, description: details.description, pubDate: details.pubDate };
}

async function handler() {
    const rootUrl = 'https://www.tianyancha.com/';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    const list = $('.key')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await pMap(list, async (item) => ({ ...item, ...(await getArticleDetails(item.link!)) }), { concurrency: 3 });

    return {
        title: '热门搜索 - 天眼查',
        link: rootUrl,
        item: items,
    };
}
