import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/udland',
    categories: ['traditional-media'],
    example: '/dr/udland',
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
            source: ['www.dr.dk/nyheder/udland'],
            target: '/udland',
        },
    ],
    name: 'Udland',
    maintainers: ['cufezhusy'],
    handler: () => getNews('udland'),
    description: 'DRs udlandsnyheder, baseret på den officielle RSS-feed Udland. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
