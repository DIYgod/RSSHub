import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const rootUrl = 'https://www.oo-software.com';
    const currentUrl = `${rootUrl}/en/${id}/changelog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.content h4')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.text();
            const publishedAt = getPublicationText(title);

            return {
                title,
                link: `${currentUrl}#${title.split(' – ', 1)[0]}`,
                description: $item
                    .nextUntil('h4')
                    .toArray()
                    .map((element) => $(element).prop('outerHTML'))
                    .join(''),
                pubDate: publishedAt ? timezone(parseDate(publishedAt, /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(publishedAt) ? 'DD.MM.YYYY' : ['M/D/YYYY', 'MMMM D, YYYY']), 0) : undefined,
            };
        });

    items[0].enclosure_url = $('.banner-inlay').find('a').attr('href');

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

function getDateSuffix(text: string, start: number, requiredWhitespace: number, lastLineBreak: number) {
    let end = start;
    while (end < text.length && /\s/.test(text[end])) {
        end++;
    }
    if (end - start < requiredWhitespace) {
        return;
    }
    // The original greedy whitespace prefix leaves one character for a whitespace-only capture.
    const captureStart = end === text.length ? end - 1 : end;
    if (captureStart - start < requiredWhitespace || captureStart <= lastLineBreak) {
        return;
    }
    return text.slice(captureStart);
}

function getPublicationText(text: string) {
    let lastLineBreak = -1;
    for (let index = text.length - 1; index >= 0; index--) {
        if (/[\n\r\u{2028}\u{2029}]/u.test(text[index])) {
            lastLineBreak = index;
            break;
        }
    }
    for (const match of text.matchAll(/\b(?:released|published|posted)|\brelease date:/gi)) {
        const start = match.index + match[0].length;
        if (match[0].toLowerCase() === 'release date:') {
            const date = getDateSuffix(text, start, 0, lastLineBreak);
            if (date !== undefined) {
                return date;
            }
        } else {
            const optionalOnPattern = /\s+on/iy;
            optionalOnPattern.lastIndex = start;
            const optionalOn = optionalOnPattern.exec(text);
            const date = optionalOn ? getDateSuffix(text, start + optionalOn[0].length, 1, lastLineBreak) : undefined;
            if (date !== undefined) {
                return date;
            }
            const fallback = getDateSuffix(text, start, 1, lastLineBreak);
            if (fallback !== undefined) {
                return fallback;
            }
        }
    }
}
