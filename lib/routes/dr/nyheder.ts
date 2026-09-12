import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/nyheder',
    categories: ['traditional-media'],
    example: '/dr/nyheder',
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
            source: ['www.dr.dk/nyheder'],
            target: '/nyheder',
        },
    ],
    name: 'Seneste nyt (Kort nyt)',
    maintainers: ['cufezhusy'],
    handler: () => getNews('senestenyt'),
    description:
        'DRs seneste nyheder, baseret på den officielle RSS-feed Kort nyt (<https://www.dr.dk/nyheder/service/feeds/senestenyt>). RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
