// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 1;
    const { data } = await got(`https://api.dongqiudi.com/app/tabs/web/${id}.json`);
    const articles = data.articles;
    const label = data.label;

    const list = articles.map((item) => ({
        title: item.title,
        link: `https://www.dongqiudi.com/articles/${item.id}.html`,
        category: [item.category, ...(item.secondary_category ?? [])],
        pubDate: parseDate(item.show_time),
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                utils.ProcessFeedType2(item, response);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `懂球帝 - ${label}`,
        link: `https://www.dongqiudi.com/articlesList/${id}`,
        item: out.filter((e) => e !== undefined),
    });
};
