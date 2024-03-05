// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `安全内参-${category}`,
        link: 'https://www.secrss.com',
        item: items,
    });
};
