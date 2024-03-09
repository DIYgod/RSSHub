import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

export const route: Route = {
    path: '/category/:category?',
    categories: ['programming'],
    example: '/secrss/category/产业趋势',
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
    const dataArray = res.data.data;

    const items = await Promise.all(
        dataArray.map((item) => {
            const itemUrl = `${host}/articles/${item.id}`;
            return cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                const description = $('.article-body').html().trim();
                return {
                    title: item.title,
                    link: itemUrl,
                    pubDate: timezone(parseDate(item.published_at), 8),
                    description,
                    author: item.source_author,
                    category: item.tags.map((t) => t.title),
                };
            });
        })
    );

    return {
        title: `安全内参-${category}`,
        link: 'https://www.secrss.com',
        item: items,
    };
}
