import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const baseUrl = 'https://' + namespace.url;
const nightlyPath = '/download/nightly/';

export const route: Route = {
    path: '/nightly',
    categories: namespace.categories,
    example: '/koreader/nightly',
    radar: [
        {
            source: ['build.koreader.rocks/download/nightly/'],
            target: '/nightly',
        },
    ],
    name: 'Nightly builds',
    maintainers: ['zha'],
    handler,
    url: 'build.koreader.rocks/download/nightly/',
};

async function handler(_ctx: Context) {
    const listUrl = new URL(nightlyPath, baseUrl).href;
    const html = await ofetch(listUrl);
    const $ = load(html);

    const rows = $('table#list tbody tr').toArray();
    const items: DataItem[] = rows
        .map((row) => {
            const rowEl = $(row);
            const linkEl = rowEl.find('td.link a');
            const href = linkEl.attr('href');
            if (!href || href.startsWith('../') || !href.endsWith('/')) {
                return null;
            }

            const title = linkEl.attr('title') || linkEl.text().trim();
            const link = new URL(href, listUrl).href;
            const dateText = rowEl.find('td.date').text().trim();
            const pubDate = dateText ? parseDate(dateText, 'YYYY-MMM-DD HH:mm', 'en') : undefined;

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter(Boolean);

    const detailItems = await Promise.all(items.map((item) => (item.link ? buildDetailItem(item) : item)));

    return {
        title: 'KOReader Nightly Builds',
        link: listUrl,
        item: detailItems,
    };
}

async function buildDetailItem(item: DataItem) {
    const link = item.link as string;
    return await cache.tryGet(`koreader:nightly:${link}`, async () => {
        const detailHtml = await ofetch(link);
        const $ = load(detailHtml);
        const files = $('table#list tbody tr td.link a')
            .toArray()
            .map((file) => {
                const fileEl = $(file);
                const fileHref = fileEl.attr('href');
                if (!fileHref || fileHref.startsWith('../')) {
                    return null;
                }
                const fileLink = new URL(fileHref, link).href;
                return `<li><a href="${fileLink}">${fileEl.text().trim()}</a></li>`;
            })
            .filter(Boolean)
            .join('');

        return {
            ...item,
            description: files ? `<ul>${files}</ul>` : undefined,
        };
    });
}
