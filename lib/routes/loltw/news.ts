// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const baseUrl = 'https://lol.garena.tw';

    const response = await got(`${baseUrl}/api/news/search?category=${category}`);

    const list = response.data.data.news.map((item) => ({
        guid: item.id,
        title: item.title,
        author: 'Garena',
        link: `${baseUrl}/news/articles/${item.id}`,
        pubDate: parseDate(item.updated_at * 1000),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(`${baseUrl}/api/news/detail?news_id=${item.guid}`);
                item.description = art(path.join(__dirname, 'templates/news.art'), detailResponse.data.data.news_detail);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '英雄联盟 - 台服新闻',
        link: category ? `${baseUrl}/news/${category}` : `${baseUrl}/news`,
        item: items,
    });
};
