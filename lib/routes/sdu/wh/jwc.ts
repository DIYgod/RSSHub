// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const data = require('../data').wh.jwc;
const extractor = require('../extractor');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const column = ctx.req.param('column') ?? 'gztz';
    const baseUrl = data.url;
    const response = await got(baseUrl + data.columns[column].url);
    const $ = load(response.data);
    const items = $('.articleul li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const dateElement = item.find('div:last-of-type');
            const dateText = dateElement.text();
            dateElement.remove();
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const title = item.text();
            const { description, author: exactAuthor, exactDate } = await cache.tryGet(link, () => extractor(link));
            const author = exactAuthor ?? '教务处';
            const pubDate = exactDate ?? timezone(parseDate(dateText.slice(1, -1), 'YYYY-MM-DD'), +8);
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
