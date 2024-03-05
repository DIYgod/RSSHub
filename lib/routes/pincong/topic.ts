// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, puppeteerGet } = require('./utils');

export default async (ctx) => {
    const url = `${baseUrl}/topic/${ctx.req.param('topic')}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    ctx.set('data', {
        title: `品葱 - ${ctx.req.param('topic')}`,
        link: url,
        item: list
            .map((_, item) => ({
                title: $(item).find('h4 a').text().trim(),
                link: baseUrl + $(item).find('h4 a').attr('href'),
                pubDate: parseDate($(item).attr('data-created-at') * 1000),
            }))
            .get(),
    });
};
