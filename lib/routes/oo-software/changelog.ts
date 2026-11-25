import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/changelog/:id',
    categories: ['program-update'],
    example: '/oo-software/changelog/shutup10',
    parameters: { id: 'Software id, see below, shutup10 by default, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Changelog',
    maintainers: ['nczitzk'],
    handler,
    description: `| Software        | Id          |
| --------------- | ----------- |
| O\\&O ShutUp10++ | shutup10    |
| O\\&O AppBuster  | ooappbuster |
| O\\&O Lanytix    | oolanytix   |
| O\\&O DeskInfo   | oodeskinfo  |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'shutup10';
    const limit = getRouteLimit(ctx, 20);

    const rootUrl = 'https://www.oo-software.com';
    const currentUrl = `${rootUrl}/en/${id}/changelog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.changelog__content h4, .content h4')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.text();
            const publishedAt = title.match(/(?:released|published|posted|release date:)\s+(?:on\s+)?(\S+)$/i)?.[1];

            return {
                title,
                link: `${currentUrl}#${title.split(' – ', 1)[0]}`,
                description: $item
                    .nextUntil('h4')
                    .toArray()
                    .map((element) => $(element).prop('outerHTML'))
                    .join(''),
                pubDate: publishedAt ? parseDate(publishedAt, /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(publishedAt) ? 'DD.MM.YYYY' : 'M/D/YYYY', 0) : undefined,
            };
        });

    const downloadLink = $('a[href*="/download/current/"]').attr('href');
    if (items[0] && downloadLink) {
        items[0].enclosure_url = new URL(downloadLink, rootUrl).href;
    }

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
