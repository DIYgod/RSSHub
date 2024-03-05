// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const api = 'https://api.anquanke.com/data/v1/posts?size=10&page=1&category=';
    const type = ctx.req.param('category');
    const fulltext = ctx.req.param('fulltext');
    const host = 'https://www.anquanke.com';
    const res = await got(`${api}${type}`);
    const dataArray = res.data.data;

    const items = await Promise.all(
        dataArray.map(async (item) => {
            const art_url = `${host}/${type === 'week' ? 'week' : 'post'}/id/${item.id}`;
            return {
                title: item.title,
                description:
                    fulltext === 'fulltext' || fulltext === 'quanwen'
                        ? await cache.tryGet(art_url, async () => {
                              const { data: res } = await got(art_url);
                              const content = load(res);
                              return content('#js-article').html();
                          })
                        : item.desc,
                pubDate: timezone(parseDate(item.date), +8),
                link: art_url,
                author: item.author.nickname,
            };
        })
    );

    ctx.set('data', {
        title: `安全客-${dataArray[0].category_name}`,
        link: `https://www.anquanke.com/${type === 'week' ? 'week-list' : type}`,
        item: items,
    });
};
