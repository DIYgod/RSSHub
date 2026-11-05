import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/author/:author',
    categories: ['programming'],
    example: '/secrss/author/网络安全威胁和漏洞信息共享平台',
    parameters: { author: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作者',
    maintainers: ['XinRoom', 'SunBK201'],
    handler,
};

async function handler(ctx) {
    const api = 'https://www.secrss.com/api/articles/group?author=';
    const author = ctx.req.param('author');
    const host = 'https://www.secrss.com';
    const res = await got(`${api}${author}`);
    const dataArray: Array<{
        url: string;
        title: string;
        original_timestamp: number;
        tag: string;
    }> = res.data.data.list;

    const items = await pMap(
        dataArray,
        async (item) => {
            const itemUrl = `${host}${item.url}`;
            const description = await cache.tryGet(`${itemUrl}:description`, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                return $('.article-body').html()!.trim();
            });
            return {
                title: item.title,
                author,
                link: itemUrl,
                pubDate: parseDate(item.original_timestamp, 'X'),
                description,
                category: item.tag,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `安全内参-${author}`,
        link: 'https://www.secrss.com',
        item: items,
    };
}
