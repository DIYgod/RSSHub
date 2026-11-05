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
            source: ['tradingview.com/pine-script-docs/en/:version/Release_notes.html', 'tradingview.com/pine-script-docs/:version/release-notes/'],
            target: '/pine/:version',
        },
    ],
    name: 'Pine Script™ Release notes',
    maintainers: ['nczitzk'],
    handler,
    description: `| v5 | v4 |
| -- | -- |`,
};

function parsePubDate(id: string) {
    const match = id.match(/^([a-z]+)(?:-[a-z]+)?-(\d{4})$/);
    if (!match) {
        return;
    }
    // Release notes specify a month or a month range, normalized to its start in UTC.
    const month = `${match[1].charAt(0).toUpperCase()}${match[1].slice(1)}`;
    const date = parseDate(`${month} 1, ${match[2]} +00:00`, 'MMMM D, YYYY Z');
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const { version = 'v5' } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 100;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`pine-script-docs/${version}/release-notes/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('main.content h2[id], main.content h3[id]')
        .toArray()
        .filter((item) => {
            const $item = $(item);

            return /\w+-\d{4}/.test($item.prop('id'));
        })
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);

            const id = $item.prop('id');
            const title = $item.text();
            const link = new URL(`#${id}`, currentUrl).href;

            return {
                title,
                link,
                description: $.html($item.nextUntil('h2, h3')),
                pubDate: parsePubDate(id),
            };
        });

    const icon = new URL('favicon.ico', rootUrl).href;

    const language = $('html').prop('lang') as Language;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language,
        icon,
        logo: icon,
    };
}
