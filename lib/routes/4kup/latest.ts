import { Route } from '@/types';
import got from '@/utils/got';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';
import { WPPost } from './types';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/4kup',
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
            source: ['4kup.net/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['AiraNadih'],
    handler,
    url: '4kup.net/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?per_page=${limit}`);

    return {
        title: `${SUB_NAME_PREFIX} - Latest`,
        link: SUB_URL,
        item: posts.map((post) => loadArticle(post as WPPost)),
    };
}
