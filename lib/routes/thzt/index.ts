import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/thzt/blog',
    url: 'thzt.github.io',
    name: 'Blog',
    maintainers: ['jihuayu'],
    handler,
};

const author = '何幻';

async function handler() {
    const baseUrl = 'https://thzt.github.io';
    const targetUrl = `${baseUrl}/archives/`;

    const response = await got({
        method: 'get',
        url: targetUrl,
    });
    const $ = load(response.data);

    const alist = $('a.post-title-link');
    const list = alist.toArray().map((item) => {
        const element = $(item);

        const link = element.attr('href') || '';
        const span = element.find('span').first();

        const title = span.text() || '';

        return {
            title,
            link,
        };
    }) as DataItem[];
    const items = await Promise.all(
        list.slice(0, 15).map((item) =>
            cache.tryGet(item.link!, async () => {
                const articleUrl = `${baseUrl}/${item.link}`;
                const response = await got({
                    method: 'get',
                    url: articleUrl,
                });

                const $ = load(response.data);

                const articlePubDate = $('span.post-time > time').text();

                item.author = author;
                item.pubDate = parseDate(articlePubDate);
                item.description = $('div.post-body').first().html() || '';
                item.category = [$('span.post-category>span>a>span').first().text()];

                return item;
            })
        )
    );

    return {
        title: 'thzt articles',
        link: targetUrl,
        item: items,
    };
}
