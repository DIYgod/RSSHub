import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pine/:version?',
    categories: ['program-update'],
    example: '/tradingview/pine',
    parameters: {
        version: 'Version, see below, `v5` by default',
    },
    radar: [
        {
            source: ['tradingview.com/pine-script-docs/en/:version/Release_notes.html'],
            target: '/pine/:version',
        },
    ],
    name: 'Pine Script™ Release notes',
    maintainers: ['nczitzk'],
    handler,
    description: `| v5 | v4 |
| -- | -- |`,
};

async function handler(ctx) {
    const { version = 'v5' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`pine-script-docs/en/${version}/Release_notes.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('div.section')
        .toArray()
        .filter((item) => {
            const $item = $(item);

            return /\w+-\d{4}/.test($item.prop('id'));
        })
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);

            const id = $item.prop('id');
            const title = $item.find('a.toc-backref').first().text();
            const link = new URL($item.find('a.headerlink').prop('href')!, currentUrl).href;

            $item.children().first().remove();

            return {
                title,
                link,
                description: $item.html(),
                pubDate: parseDate(`${id.charAt(0).toUpperCase()}${id.slice(1)}`, 'MMMM-YYYY'),
            };
        });

    const image = new URL('_images/Pine_Script_logo.svg', currentUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div.text-logo').text(),
        language: $('html').prop('lang') as Language,
        image,
        icon,
        logo: icon,
    };
}
