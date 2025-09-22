import { Data, Route, ViewType } from '@/types';
import { extractMiniCards, processWithWp, rootUrl } from './utils';
export const route: Route = {
    path: '/popular',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/css-tricks/popular',
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
            source: ['css-tricks.com'],
            target: '/popular',
        },
    ],
    name: 'Popular this month',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const { cards: popularCards } = await extractMiniCards('div.popular-articles > div.mini-card-grid article.mini-card.module.module-article');
    const items = await processWithWp(popularCards, true);
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
