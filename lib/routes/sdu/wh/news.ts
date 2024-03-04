// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const data = require('../data').wh.news;
const extractor = require('../extractor');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const column = ctx.req.param('column') ?? 'xyyw';
    const baseUrl = data.url;
    const response = await got(baseUrl + data.columns[column].url);
    const $ = load(response.data);
    const items = $('.n_newslist li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const title = anchor.attr('title');
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const { description, author, exactDate } = await cache.tryGet(link, () => extractor(link));
            const span = item.find('span');
            const pubDate = exactDate ?? parseDate(span.text(), 'YYYY/MM/DD');
            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        })
    );

    ctx.set('data', {
        title: `${data.name} ${data.columns[column].name}`,
        link: baseUrl + data.columns[column].url,
        item: out,
    });
};
