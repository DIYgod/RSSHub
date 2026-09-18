import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/penge',
    categories: ['traditional-media'],
    example: '/dr/penge',
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
            source: ['www.dr.dk/nyheder/penge'],
            target: '/penge',
        },
    ],
    name: 'Penge',
    maintainers: ['cufezhusy'],
    handler: () => getNews('penge'),
    description: 'DRs økonominyheder, baseret på den officielle RSS-feed Penge. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
