import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, playwrightGet } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['bbs'],
    example: '/pincong/topic/美国',
    parameters: { topic: '话题，可在官网获取' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['pincong.rocks/topic/:topic'],
        },
    ],
    name: '话题',
    maintainers: ['zphw'],
    handler,
};

async function handler(ctx) {
    const url = `${baseUrl}/topic/${ctx.req.param('topic')}`;

    // use Playwright due to the obstacle by cloudflare challenge
    const html = await playwrightGet(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: `品葱 - ${ctx.req.param('topic')}`,
        link: url,
        item: list.toArray().map((item) => ({
            title: $(item).find('h4 a').text().trim(),
            link: baseUrl + $(item).find('h4 a').attr('href'),
            pubDate: parseDate($(item).attr('data-created-at') * 1000),
        })),
    };
}
