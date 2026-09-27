import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, get } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['bbs'],
    example: '/pincong/topic/美国',
    parameters: { topic: '话题，可在官网获取' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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

    const html = await get(url);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: `品葱 - ${ctx.req.param('topic')}`,
        link: url,
        item: list.toArray().map((item) => ({
            title: $(item).find('h4 a').text().trim(),
            link: baseUrl + $(item).find('h4 a').attr('href'),
            pubDate: parseDate(Number($(item).attr('data-created-at')) * 1000),
        })),
    };
}
