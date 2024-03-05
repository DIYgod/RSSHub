// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, parseArticle } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 12;
    const link = `${baseUrl}/u/${id}`;

    const data = await got(link).then((res) => res.data);
    const $ = load(data);
    const name = $('.author--meta .name').text();

    const list = $('.post--card')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            const postCardTitle = item.find('h2.post--card__title a');
            return {
                title: postCardTitle.attr('title'),
                link: postCardTitle.attr('href'),
                pubDate: parseDate(item.find('time').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `${name}的文章-人人都是产品经理`,
        description: $('.author--meta .description').text(),
        image: $('.author--meta .avatar').attr('src').split('!')[0],
        link,
        item: items,
    });
};
