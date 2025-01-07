import { Data, Route, ViewType } from '@/types';
import { extractMiniCards, processCards, rootUrl } from './utils';
export const route: Route = {
    path: '/popular/:dateSort?',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/popular',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        dateSort: {
            description: 'Sort posts by publication date instead of popularity',
            default: 'true',
            options: [
                { value: 'false', label: 'False' },
                { value: 'true', label: 'True' },
            ],
        },
    },
    radar: [
        {
            source: ['css-tricks.com'],
            target: '/popular',
        },
    ],
    name: 'Popular this month',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx) {
    const dateSort = ctx.req.param('dateSort') ? JSON.parse(ctx.req.param('dateSort')) : true;
    const popularCards = await extractMiniCards('div.popular-articles > div.mini-card-grid article.mini-card.module.module-article');
    const items = await processCards(popularCards, true, dateSort);
    return {
        title: 'Popular this month',
        description: 'Popular CSS articles this month',
        link: rootUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
