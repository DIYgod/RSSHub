// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
const { baseUrl, cookieJar, getArticleList, getArticle } = require('./utils');

export default async (ctx) => {
    const { journal = 'nature' } = ctx.req.param();
    const url = `${baseUrl}/${journal}/articles?type=research-highlight`;

    const res = await got(url, { cookieJar });
    const $ = load(res.data);

    let items = getArticleList($);

    items = await Promise.all(items.map((item) => getArticle(item)));

    ctx.set('data', {
        title: $('title').text().trim(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    });
};
