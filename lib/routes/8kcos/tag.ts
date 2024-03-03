// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
export default async (ctx) => {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const tag = ctx.req.param('tag');
    const url = `${SUB_URL}tag/${tag}/`;
    const resp = await got(url);
    const $ = load(resp.body);
    const itemRaw = $('li.item').toArray();

    ctx.set('data', {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                const { href } = load(e)('h2 > a')[0].attribs;
                return cache.tryGet(href, () => loadArticle(href));
            })
        ),
    });
};
