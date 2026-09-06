import type { Route } from '@/types';
import got from '@/utils/got';

import { parseFloorItem, parseModule } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['shopping'],
    example: '/xiaomiyoupin/latest',
    parameters: {},
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
            source: ['xiaomiyoupin.com/'],
        },
    ],
    name: '小米有品每日上新',
    maintainers: ['xyqfer', 'DIYgod', 'bigfei'],
    handler,
    url: 'xiaomiyoupin.com/',
};

async function handler() {
    const response = await got('https://m.xiaomiyoupin.com/homepage/main/v1005');
    const floors = parseModule(response.data.data.homepage.floors, 'product_hot');
    const items = parseFloorItem(floors);

    return {
        title: '小米有品每日上新',
        link: 'https://m.xiaomiyoupin.com/w/newproduct?pageid=1605',
        description: '小米有品每日上新',
        item: items,
    };
}
