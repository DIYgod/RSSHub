import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/viden',
    categories: ['traditional-media'],
    example: '/dr/viden',
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
            source: ['www.dr.dk/nyheder/viden'],
            target: '/viden',
        },
    ],
    name: 'Viden',
    maintainers: ['cufezhusy'],
    handler: () => getNews('viden'),
    description: 'DRs videnskabsnyheder, baseret på den officielle RSS-feed Viden. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.',
};
