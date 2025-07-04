import { Route } from '@/types';
import getHlcg from './hlcg';
export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: 'd2rpapu8kgjdgu.cloudfront.net/hlcg',
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
            source: ['d2rpapu8kgjdgu.cloudfront.net/:category'],
        },
    ],
    name: 'hl',
    maintainers: ['bomky'],
    handler,
};
async function handler(ctx) {
    const category = ctx.req.param('category');

    switch (category) {
        case 'hlcg':
            // 每周质量报告
            return await getHlcg();

        default:
            // 央视新闻
            return await getHlcg();
    }
}
