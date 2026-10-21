import type { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/exhibitions',
    categories: ['travel'],
    example: '/jewishmuseum/exhibitions',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Exhibitions',
    maintainers: ['chazeon'],
    handler,
};

async function handler() {
    const link = 'https://thejewishmuseum.org/exhibitions';

    return await buildData({
        link,
        url: link,
        title: 'The Jewish Museum - Exhibitions',
        item: {
            item: '#hero-exhibitions a:has(.text-card-title)',
            title: ($) => $('.text-card-title').text(),
            link: ($) => $('.text-card-title').closest('a').attr('href'),
        },
    });
}
