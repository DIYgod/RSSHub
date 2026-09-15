import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/sport',
    categories: ['sport'],
    example: '/dr/sport',
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
            source: ['www.dr.dk/sporten'],
            target: '/sport',
        },
    ],
    name: 'Sport',
    maintainers: ['cufezhusy'],
    handler: () => getNews('sporten'),
    description: 'DRs sportsnyheder, baseret på den officielle RSS-feed Sport. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
