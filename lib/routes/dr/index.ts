import type { Route } from '@/types';

import { getNews } from './utils';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/dr/senestenyt',
    parameters: {
        category: {
            description: 'DR-sektion, se tabellen nedenfor. Standarden er `senestenyt` (Kort nyt)',
            options: [
                { value: 'senestenyt', label: 'Seneste nyt (Kort nyt)' },
                { value: 'indland', label: 'Indland' },
                { value: 'udland', label: 'Udland' },
                { value: 'penge', label: 'Penge' },
                { value: 'politik', label: 'Politik' },
                { value: 'sporten', label: 'Sport' },
                { value: 'viden', label: 'Viden' },
            ],
        },
    },
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
            target: '/senestenyt',
        },
        {
            source: ['www.dr.dk/nyheder/indland'],
            target: '/indland',
        },
        {
            source: ['www.dr.dk/nyheder/udland'],
            target: '/udland',
        },
        {
            source: ['www.dr.dk/nyheder/penge'],
            target: '/penge',
        },
        {
            source: ['www.dr.dk/nyheder/politik'],
            target: '/politik',
        },
        {
            source: ['www.dr.dk/sporten'],
            target: '/sporten',
        },
        {
            source: ['www.dr.dk/nyheder/viden'],
            target: '/viden',
        },
    ],
    name: 'Nyheder',
    maintainers: ['cufezhusy'],
    handler: (ctx) => getNews(ctx.req.param('category') ?? 'senestenyt'),
    description: `DRs nyheder, baseret på de officielle RSS-feeds. RSSHub forsøger at hente den fulde artikeltekst fra dr.dk. Hvis den fulde tekst ikke kan hentes, bruges beskrivelsen fra den officielle RSS-feed.

| Kategori   | Beskrivelse            |
| ---------- | ---------------------- |
| senestenyt | Seneste nyt (Kort nyt) |
| indland    | Indland                |
| udland     | Udland                 |
| penge      | Penge                  |
| politik    | Politik                |
| sporten    | Sport                  |
| viden      | Viden                  |`,
};
