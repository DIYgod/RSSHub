import { Data, Route, ViewType } from '@/types';
import { extractMiniCards, processCards, rootUrl } from './utils';
export const route: Route = {
    path: '/fresh',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/fresh',
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
            target: '/fresh',
        },
    ],
    name: 'Fresh From the Almanac',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const popularCards = await extractMiniCards('body > div.page-wrap > section.post-sliders > div:nth-child(4) article.mini-card.module.module-article');
    // Can't use wordPress API, these post Id's aren't available in the response
    const items = await processCards(popularCards, true);
    return {
        title: 'Fresh From the Almanac',
        description: 'Properties, selectors, rules, and functions!',
        link: rootUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
