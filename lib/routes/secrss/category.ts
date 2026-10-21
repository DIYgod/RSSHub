import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/category/:category?',
    categories: ['programming'],
    example: '/secrss/category/产业研究',
    parameters: { category: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['XinRoom', 'SunBK201'],
    handler,
};

async function handler(ctx) {
    const api = 'https://www.secrss.com/api/articles?tag=';
    const { category = '' } = ctx.req.param();
    const host = 'https://www.secrss.com';
    const res = await got(`${api}${category}`);
    const dataArray:
        | Array<{
              id: number;
              title: string;
              published_at: string;
              source_author: string;
              tags: Array<{ title: string }>;
          }>
        | undefined = res.data.data;
    if (res.data.code === '10000' && dataArray === undefined) {
        throw new NotFoundError(`Category "${category}" is unavailable. Choose a current category from ${host}.`);
    }

    if (dataArray === undefined) {
        throw new Error(`Invalid article list response from ${host}.`);
    }

    const items = await pMap(
        dataArray,
        async (item) => {
            const itemUrl = `${host}/articles/${item.id}`;
            const description = await cache.tryGet(`${itemUrl}:description`, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                return $('.article-body').html()!.trim();
            });
            return {
                title: item.title,
                link: itemUrl,
                pubDate: timezone(parseDate(item.published_at), 8),
                description,
                author: item.source_author,
                category: item.tags.map((t) => t.title),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `安全内参-${category}`,
        link: 'https://www.secrss.com',
        item: items,
    };
}
