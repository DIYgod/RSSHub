// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const tag = ctx.req.param('tag');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/by-tag`, {
        searchParams: {
            tag,
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('data', {
        title: `4Gamers - #${tag}`,
        link: `https://www.4gamers.com.tw/news/tag/${tag}`,
        item: items,
    });
};
