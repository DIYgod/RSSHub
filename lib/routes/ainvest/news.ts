import { fetchContentItems } from '@/routes/ainvest/utils';
import type { Route } from '@/types';
import { ViewType } from '@/types';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/ainvest/news',
    parameters: {},
    view: ViewType.Articles,
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
            source: ['www.ainvest.com/news/'],
        },
    ],
    name: 'Latest News',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.ainvest.com/news/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;
    const streamIds = [109, 416, 438, 529, 721, 834, 835];
    const items = await fetchContentItems(streamIds, limit);

    return {
        title: 'AInvest - Latest News',
        link: 'https://www.ainvest.com/news/',
        language: 'en',
        item: items,
    };
}
