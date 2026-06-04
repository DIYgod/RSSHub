import { fetchContentItems } from '@/routes/ainvest/utils';
import type { Route } from '@/types';

export const route: Route = {
    path: '/article',
    categories: ['finance'],
    example: '/ainvest/article',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.ainvest.com/news/articles-latest/', 'www.ainvest.com'],
        },
    ],
    name: 'Latest Article',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.ainvest.com/news/articles-latest/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;
    const items = await fetchContentItems([109], limit);

    return {
        title: 'AInvest - Latest Articles',
        link: 'https://www.ainvest.com/news/articles-latest/',
        language: 'en',
        item: items,
    };
}
