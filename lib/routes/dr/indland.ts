import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/indland',
    categories: ['traditional-media'],
    example: '/dr/indland',
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
            source: ['www.dr.dk/nyheder/indland'],
            target: '/indland',
        },
    ],
    name: 'Indland',
    maintainers: ['cufezhusy'],
    handler: () => getNews('indland'),
    description: 'DRs indlandsnyheder, baseret på den officielle RSS-feed Indland. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
