import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';

export const route: Route = {
    path: '/dailyphoto',
    categories: ['picture'],
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
    name: '每日一图',
    maintainers: ['LogicJake', 'OrangeEd1t', 'TonyRL'],
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
