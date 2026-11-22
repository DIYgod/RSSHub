import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/v1tx',
    radar: [
        {
            source: ['v1tx.com/'],
            target: '',
        },
    ],
    name: '最新文章',
    maintainers: ['TonyRL'],
    handler,
    url: 'v1tx.com/',
};
async function handler() {
    const baseUrl = 'https://www.v1tx.com';
    const { data: response } = await got(baseUrl);
    const $ = load(response);
    const list = $('h2.entry-title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'updated' | 'author' | 'category'>>(`v1tx:article-details:v5:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const data = JSON.parse($('script[type="application/ld+json"]').text());
                $('.entry-content figure > picture > source, noscript').remove();
                $('.entry-content img').each((_, img) => {
                    if (img.attribs.src?.startsWith('data:')) {
                        img.attribs.src = img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-srcset'];
                    }
                    delete img.attribs.srcset;
                });
                const description = $('.entry-content').html();
                const article = $('.entry-content').closest('article');
                article.find('.tag-hash').remove();
                return {
                    description,
                    pubDate: parseDate(data.datePublished),
                    updated: parseDate(data.dateModified),
                    author: article.find('.entry-header .author a').text(),
                    category: article
                        .find('.entry-header .category-links a, .entry-footer .tags-links a')
                        .toArray()
                        .map((node) => $(node).text()),
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        image: `${baseUrl}/wp-content/uploads/2018/10/cropped-Favicon.webp`,
        item: items,
    };
}
