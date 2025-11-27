import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/apprelease/:app',
    categories: ['program-update'],
    example: '/f-droid/apprelease/com.termux',
    parameters: { app: "App's package name" },
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
            source: ['f-droid.org/en/packages/:app/'],
        },
    ],
    name: 'App Update',
    maintainers: ['garywill'],
    handler,
};

async function handler(ctx) {
    const { app } = ctx.req.param();
    const { data: response } = await got(`https://f-droid.org/en/packages/${app}/`);
    const $ = cheerio.load(response);

    const appName = $('.package-title').find('h3').text().trim();

    const items = $('.package-versions-list .package-version')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.package-version-header a');
            const version = a.eq(0).attr('name');
            return {
                title: version,
                guid: a.eq(1).attr('name'),
                pubDate: parseDate($item.find('.package-version-header').text().split('Added on ')[1]),
                description: [$item.find('.package-version-download').html(), $item.find('.package-version-requirement').html(), $item.find('.package-version-source').html()].join('<br>'),
                link: `https://f-droid.org/en/packages/${app}/#${version}`,
            };
        });

    return {
        title: `${appName} releases on F-Droid`,
        discription: $('.package-summary').text(),
        link: `https://f-droid.org/en/packages/${app}/`,
        item: items,
    };
}
