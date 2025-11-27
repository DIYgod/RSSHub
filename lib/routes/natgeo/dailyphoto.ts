import path from 'node:path';

import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/dailyphoto',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/natgeo/dailyphoto',
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
            source: ['nationalgeographic.com/photo-of-the-day/*', 'nationalgeographic.com/'],
        },
    ],
    name: 'Daily Photo',
    maintainers: ['LogicJake', 'OrangeEd1t', 'TonyRL', 'pseudoyu'],
    handler,
    url: 'nationalgeographic.com/photo-of-the-day/*',
};

async function handler() {
    const rootUrl = 'https://www.nationalgeographic.com';
    const apiUrl = `${rootUrl}/photo-of-the-day`;
    const response = await cache.tryGet(apiUrl, async () => (await got(apiUrl)).data, config.cache.contentExpire, false);
    const $ = load(response);

    const natgeo = JSON.parse($.html().match(/window\['__natgeo__']=(.*);/)[1]);
    const media = natgeo.page.content.mediaspotlight.frms[0].mods[0].edgs[1].media;

    const items = media.map((item) => ({
        title: item.meta.title,
        description: art(path.join(__dirname, 'templates/dailyPhoto.art'), {
            img: item.img,
        }),
        link: rootUrl + item.locator,
        pubDate: parseDate(item.caption.preHeading),
        author: item.img.crdt,
    }));

    return {
        title: 'Nat Geo Photo of the Day',
        link: apiUrl,
        item: items,
    };
}
