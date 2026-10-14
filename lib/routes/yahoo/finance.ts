import type { Route } from '@/types';

import { getFinanceTopic } from './utils';

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
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20;
    const data = await getFinanceTopic('https://finance.yahoo.com', topic, limit);
    return { ...data, language: 'en' as const };
}
