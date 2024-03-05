// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';

export default async (ctx) => {
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

    ctx.set('data', {
        title: 'Nat Geo Photo of the Day',
        link: apiUrl,
        item: items,
    });
};
