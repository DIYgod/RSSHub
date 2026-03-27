import type { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/exhibitions/:state?',
    categories: ['travel'],
    example: '/brooklynmuseum/exhibitions',
    parameters: { state: '展览进行的状态：`current` 对应展览当前正在进行，`past` 对应过去的展览，`upcoming` 对应即将举办的展览，默认为 `current`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Exhibitions',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    let link;
    const state = ctx.req.param('state');

    switch (state) {
        case undefined:
        case 'current':
            link = 'https://www.brooklynmuseum.org/exhibitions/';
            break;
        default:
            link = `https://www.brooklynmuseum.org/exhibitions/${state}`;
    }

    return await buildData({
        link,
        url: link,
        title: 'Brooklyn Museum - Exhibitions',
        item: {
            item: '.exhibitions .image-card',
            title: `$('h2 > a, h3 > a').text()`,
            link: `$('h2 > a, h3 > a').attr('href')`,
            description: `$('h6').text()`,
        },
    });
}
