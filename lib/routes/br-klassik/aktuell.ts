import type { Route } from '@/types';

import { getArticle, getList } from './utils';

const baseUrl = 'https://www.br-klassik.de';

export const route: Route = {
    path: '/aktuell',
    categories: ['traditional-media'],
    example: '/br-klassik/aktuell',
    parameters: {},
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'Aktuell (News & Kritik)',
    maintainers: ['wongJG'],
    handler,
    description: 'News und Kritik aus der Welt der Klassischen Musik.',
    radar: [
        {
            source: ['www.br-klassik.de/aktuell/index.html'],
            target: '/aktuell',
        },
    ],
};

async function handler() {
    const list = await getList('/aktuell/index.html');

    const items = await Promise.all(list.map((item) => getArticle(item)));

    return {
        title: 'BR-Klassik | Aktuell',
        link: `${baseUrl}/aktuell/index.html`,
        description: 'News und Kritik aus der Welt der Klassischen Musik',
        item: items,
    };
}
