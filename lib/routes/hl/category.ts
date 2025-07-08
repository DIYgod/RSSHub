import { Route } from '@/types';
import getHlcg from './hlcg';
export const route: Route = {
    path: '/:category',
    categories: ['new-media'],
    example: '18hlw.com/hlcg/',
    parameters: { category: '分类名' },
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
            source: ['18hlw.com/:category'],
        },
    ],
    name: 'hlw',
    maintainers: ['zy97'],
    handler,
};
async function handler(ctx) {
    let category = ctx.req.param('category');
    const categories = ['hlcg', 'jrrs', 'jqrm'];
    if (!categories.includes(category)) {
        category = 'hlcg';
    }
    return await getHlcg(category);
}
