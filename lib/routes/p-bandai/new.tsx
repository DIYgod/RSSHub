import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const link = 'https://p-bandai.jp/new_itemlist/';

export const route: Route = {
    path: '/new',
    categories: ['shopping'],
    example: '/p-bandai/new',
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
            source: ['p-bandai.jp/new_itemlist'],
            target: '/new',
        },
    ],
    name: 'New Items',
    maintainers: ['pseudoyu'],
    handler,
    url: 'p-bandai.jp/new_itemlist/',
    description: `Items added in the last 10 days, with the image, the price and the start of sales or reservations.

::: warning
Premium Bandai redirects visitors outside Japan to its international site, so the instance needs a Japanese IP. You can send only these requests through a Japanese proxy with \`PROXY_URI\` and \`PROXY_URL_REGEX=p-bandai\\.jp\`.

The list shortens long item names, and the item pages are behind a browser check, so full names and delivery dates are not included.
:::`,
};

const parseStart = (year: number, month: string, day: string, hour: string) => timezone(parseDate(`${year}-${month}-${day} ${hour}`, 'YYYY-M-D H'), 9);

async function handler() {
    const response = await ofetch.raw<ArrayBuffer, 'arrayBuffer'>(link, { responseType: 'arrayBuffer' });
    if (new URL(response.url).pathname !== '/new_itemlist/') {
        throw new ConfigNotFoundError('Premium Bandai redirected the request to its international site. Send p-bandai.jp requests through a Japanese proxy with PROXY_URI and PROXY_URL_REGEX.');
    }
    const $ = load(new TextDecoder('shift_jis').decode(response._data));
    const year = new Date().getFullYear();

    const items = $('.item_wrap > li')
        .toArray()
        .map((element): DataItem => {
            const $item = $(element);
            const start = $item.find('.start').contents().first().text().trim();
            const price = $item.find('.price').text();
            const [, month, day, hour] = /(\d{1,2})\/(\d{1,2}) (\d{1,2})時/.exec(start) ?? [];
            // The list gives no year and only covers recent days, so a date ahead of now is from last year
            let pubDate = month ? parseStart(year, month, day, hour) : undefined;
            if (pubDate && pubDate > new Date()) {
                pubDate = parseStart(year - 1, month, day, hour);
            }
            // The `b` size of the same image is 560px instead of the 200px thumbnail
            const image = $item.find('img').attr('src')?.replace('/model/m/', '/model/b/');
            return {
                title: $item.find('.itemslist_name span').first().text(),
                description: renderToString(
                    <>
                        {image ? <img src={image} /> : null}
                        <p>{price}</p>
                        <p>{start}</p>
                    </>
                ),
                link: new URL($item.find('a').first().attr('href')!, link).href,
                pubDate,
                image,
            };
        });

    return {
        title: 'プレミアムバンダイ 新着商品',
        link,
        language: 'ja' as const,
        item: items,
    };
}
