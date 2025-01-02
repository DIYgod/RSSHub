import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, puppeteerGet } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    radar: [
        {
            source: ['pincong.rocks/topic/:topic'],
        },
    ],
    name: 'Unknown',
    maintainers: ['zphw'],
    handler,
};

async function handler(ctx) {
    const url = `${baseUrl}/topic/${ctx.req.param('topic')}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: `品葱 - ${ctx.req.param('topic')}`,
        link: url,
        item: list
            .map((_, item) => ({
                title: $(item).find('h4 a').text().trim(),
                link: baseUrl + $(item).find('h4 a').attr('href'),
                pubDate: parseDate($(item).attr('data-created-at') * 1000),
            }))
            .get(),
    };
}
