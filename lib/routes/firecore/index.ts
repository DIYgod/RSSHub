import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:os',
    categories: ['program-update'],
    example: '/firecore/ios',
    parameters: { os: '`ios`,`tvos`,`macos`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Release Notes',
    maintainers: ['NathanDai'],
    handler,
};

async function handler(ctx) {
    const host = 'https://firecore.com/releases';
    const { data } = await got(host);
    const $ = load(data);
    const items = $(`div.tab-pane.fade#${ctx.req.param('os')}`)
        .find('.release-date')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item
                .parent()
                .contents()
                .filter((_, el) => el.nodeType === 3)
                .text();
            const pubDate = parseDate(item.text().match(/(\d{4}-\d{2}-\d{2})/)[1]);

            const next = item.parent().nextUntil('hr');
            return {
                title,
                description: next
                    .toArray()
                    .map((item) => $(item).html())
                    .join(''),
                pubDate,
            };
        });

    return {
        title: `Infuse Release Notes (${ctx.req.param('os')})`,
        link: 'https://firecore.com/releases',
        item: items,
    };
}
