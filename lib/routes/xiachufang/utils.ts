import type { CheerioAPI } from 'cheerio';
import { html } from 'hono/html';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function getPublicationDate(value: string) {
    const elapsed = value.match(/^(\d+)(秒|分钟|小时|天)前$/);
    if (elapsed) {
        const amount = Number(elapsed[1]);
        const unitMs = elapsed[2] === '秒' ? 1000 : elapsed[2] === '分钟' ? 60000 : elapsed[2] === '小时' ? 3_600_000 : 86_400_000;
        if (!Number.isSafeInteger(amount)) {
            return;
        }
        const date = parseDate(Date.now() - amount * unitMs);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }

    return;
}

export const fetchPage = (url: string) =>
    ofetch(url, {
        headers: {
            Referer: url,
        },
    });

export const generateItems = ($: CheerioAPI, timeframe?: string) => {
    const selector = ['week', 'rising', 'monthhonor'].includes(timeframe ?? '') ? '.normal-recipe-list li' : '.ias-container .pure-u';

    return $(selector)
        .toArray()
        .filter((item) => $(item).find('.name a').attr('href'))
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.name a');
            const title = $link.text();
            const link = new URL($link.attr('href')!, 'https://www.xiachufang.com').href;
            const image = $item.find('.cover img');
            const img = (image.attr('data-src') || image.attr('src'))?.replaceAll(/\?.+/g, '');
            let desc = $item.find('.ing').text();
            if (!desc) {
                desc = $item.find('.desc').text();
            }

            return {
                title,
                link,
                pubDate: getPublicationDate($item.find('.stats .pure-u-1-2').first().text().trim()),
                description: html`${img ? html`<img src="${img}" /><br />` : ''}${desc.split('\n').map((line) => html`${line}<br />`)}`.toString(),
                author: $item
                    .find('.author a.avatar-link')
                    .toArray()
                    .map((element) => {
                        const anchor = $(element);
                        const href = anchor.attr('href');
                        return {
                            name: anchor.text(),
                            url: href ? new URL(href, 'https://www.xiachufang.com').href : undefined,
                        };
                    }),
            };
        });
};
