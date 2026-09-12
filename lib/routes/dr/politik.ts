import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/politik',
    categories: ['traditional-media'],
    example: '/dr/politik',
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
            source: ['www.dr.dk/nyheder/politik'],
            target: '/politik',
        },
    ],
    name: 'Politik',
    maintainers: ['cufezhusy'],
    handler: () => getNews('politik'),
    description: 'DRs politiske nyheder, baseret på den officielle RSS-feed Politik. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
