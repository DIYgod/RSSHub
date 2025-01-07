import { Data, Route, ViewType } from '@/types';
import { extractMiniCards, processCards, rootUrl } from './utils';
export const route: Route = {
    path: '/guides',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/guides',
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
            target: '/guides',
        },
    ],
    name: 'CSS Guides',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const guideCards = await extractMiniCards('body > div.page-wrap > section.post-sliders > div:nth-child(3) article.mini-card.module.module-article');
    const items = await processCards(guideCards, true);
    return {
        title: 'Latest CSS Guides',
        description: 'Dive deep into CSS features and concepts',
        link: rootUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
