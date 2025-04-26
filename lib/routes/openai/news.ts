import { Route } from '@/types';
import { fetchArticles, BASE_URL } from './common';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/openai/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['goestav', 'StevenRCE0', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.param('limit') || 10;

    const link = new URL('/news/', BASE_URL).href;
    const articles = await fetchArticles(limit);

    return {
        title: 'OpenAI News',
        link,
        item: articles,
    };
}
