import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseItem } from './news/utils';

export const route: Route = {
    path: '/finance/:topic?',
    example: '/yahoo/finance/latest-news',
    name: 'Finance news',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    parameters: { topic: 'Topic slug from the Yahoo Finance URL, defaults to latest-news.' },
    radar: [{ source: ['finance.yahoo.com/topic/:topic'], target: '/finance/:topic' }],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'latest-news';
    const link = `https://finance.yahoo.com/topic/${topic}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = Number(ctx.req.query('limit')) || 20;
    const seen = new Set<string>();
    const items = $('a[data-ylk*="topic-stream"]:has(h3)')
        .toArray()
        .map((element) => ({ title: $(element).find('h3').text(), link: new URL($(element).attr('href')!, link).href }))
        .filter((item) => {
            if (seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    return { title: $('title').text(), link, language: 'en' as const, item: await pMap(items, parseItem, { concurrency: 3 }) };
}
