import type { Route } from '@/types';

import { getFinanceTopic } from './utils';

export const route: Route = {
    path: '/finance/hk/:topic?',
    example: '/yahoo/finance/hk/latest-news',
    name: 'Finance news (Hong Kong)',
    categories: ['finance'],
    maintainers: ['pseudoyu'],
    parameters: { topic: 'Topic slug from the Yahoo Finance Hong Kong URL, defaults to latest-news.' },
    radar: [{ source: ['hk.finance.yahoo.com/topic/:topic'], target: '/finance/hk/:topic' }],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'latest-news';
    const limit = Number(ctx.req.query('limit')) || 20;
    const data = await getFinanceTopic('https://hk.finance.yahoo.com', topic, limit);
    return { ...data, language: 'zh-HK' as const };
}
