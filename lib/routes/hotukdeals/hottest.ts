import { JSDOM } from 'jsdom';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/hottest',
    categories: ['shopping'],
    example: '/hotukdeals/hottest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.hotukdeals.com/'],
        },
    ],
    name: 'hottest',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.hotukdeals.com/',
};

async function handler() {
    const data = await got.get(`https://www.hotukdeals.com/`, {
        headers: {
            Referer: `https://www.hotukdeals.com/`,
        },
    });

    const dom = new JSDOM(data.data, {
        runScripts: 'dangerously',
    });
    const threads = dom.window.__INITIAL_STATE__.widgets.hottestWidget.threads;

    return {
        title: `hotukdeals hottest`,
        link: `https://www.hotukdeals.com/`,
        item: threads.map((item) => ({
            title: item.title,
            description: `<img src="https://images.hotukdeals.com/${item.mainImage.path}/${item.mainImage.name}/re/768x768/qt/60/${item.mainImage.name}.jpg"><br>${item.temperature}° ${item.title}<br>${item.displayPrice}`,
            link: item.url,
        })),
    };
}
