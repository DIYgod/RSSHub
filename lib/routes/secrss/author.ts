import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

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
    const dataArray = res.data.data.list;

    const items = await Promise.all(
        dataArray.map((item) => {
            const itemUrl = `${host}${item.url}`;
            return cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                const description = $('.article-body').html().trim();
                return {
                    title: item.title,
                    link: itemUrl,
                    pubDate: parseDate(item.original_timestamp, 'X'),
                    description,
                    category: item.tag,
                };
            });
        })
    );

    return {
        title: `安全内参-${author}`,
        link: 'https://www.secrss.com',
        item: items,
    };
}
