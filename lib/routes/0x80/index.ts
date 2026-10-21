import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/0x80/blog',
    url: '0x80.pl/notesen.html',
    name: 'Articles',
    maintainers: ['xnum'],
    handler,
};

function extractDateFromURL(url: string) {
    const regex = /\d{4}-\d{2}-\d{2}/;
    const match = url.match(regex);
    return match?.[0];
}

async function handler() {
    // The TLS cert is invalid, we are limited to use HTTP unfortunately.
    const baseUrl = 'http://0x80.pl/';
    const targetUrl = `${baseUrl}notesen.html`;

    const response = await got({
        method: 'get',
        url: targetUrl,
    });

    const $ = load(response.data);

    const alist = $('a.reference.external[href^="notesen/"]');

    const list = alist.toArray().map((item): DataItem & { link: string } => {
        const $item = $(item);

        const link = $item.attr('href') || '';
        const title = $item.text();
        const pubDate = extractDateFromURL(link);

        return {
            title,
            link: new URL(link, baseUrl).href,
            pubDate,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                const author = $('tr.author.field td.field-body').text();
                const articlePubDate = $('tr.added-on.field td.field-body').text();

                item.author = author;
                const pubDate = item.pubDate || articlePubDate;
                item.pubDate = pubDate ? parseDate(pubDate) : undefined;
                $('div.document > h1.title, div.document > table.docinfo').remove();
                item.description = $('div.document').first().html();

                return item;
            })
        )
    );

    return {
        title: '0x80.pl articles',
        link: targetUrl,
        item: items,
    };
}
