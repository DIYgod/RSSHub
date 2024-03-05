// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
const url = SUB_URL;

export default async (ctx) => {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const response = await got(url);
    const itemRaw = load(response.body)('ul.post-loop li.item').toArray();
    ctx.set('data', {
        title: `${SUB_NAME_PREFIX}-最新`,
        link: url,
        item:
            response.body &&
            (await Promise.all(
                (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                    const { href } = load(e)('h2 > a')[0].attribs;
                    return cache.tryGet(href, () => loadArticle(href));
                })
            )),
    });
};
