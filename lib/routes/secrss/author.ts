// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `安全内参-${author}`,
        link: 'https://www.secrss.com',
        item: items,
    });
};
