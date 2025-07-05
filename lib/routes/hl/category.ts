import { Route } from '@/types';
import getHlcg from './hlcg';
export const route: Route = {
    path: '/:category',
    categories: ['reading'],
    example: '18hlw.com/hlcg',
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
    name: 'hl',
    maintainers: ['zy97'],
    handler,
};
async function handler(ctx) {
    let category = ctx.req.param('category');
    switch (category) {
        case 'hlcg':
            category = 'hlcg';
            break;
        case 'jrrs':
            category = 'jrrs';
            break;
        case 'jqrm':
            category = 'jqrm';
            break;
        default:
            category = 'hlcg';
            break;
    }
    return await getHlcg(category);
}
