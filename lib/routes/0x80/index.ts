import { load } from 'cheerio';

import type { Route } from '@/types';
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
    return match ? match[0] : null;
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

    const alist = $('a.reference.external');

    const list = alist
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href') || '';
            const title = item.text() || '';
            const pubDate = extractDateFromURL(link);

            return {
                title,
                link,
                pubDate,
                category: 'Uncategoried',
            };
        })
        .filter((item) => item.link.startsWith('notesen'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const articleUrl = `${baseUrl}${item.link}`;
                const response = await got({
                    method: 'get',
                    url: articleUrl,
                });

                const $ = load(response.data);

                const author = $('tr.author.field td.field-body').text();
                const articlePubDate = $('tr.added-on.field td.field-body').text();

                item.author = author;
                // Some articles might be missing the added-on field.
                // As a safeguard, if the date from url is null, fallbacks to the article one.
                item.pubDate = parseDate(item.pubDate || articlePubDate);
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
