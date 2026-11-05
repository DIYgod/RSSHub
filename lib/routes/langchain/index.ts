import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/langchain/blog',
    radar: [
        {
            source: ['blog.langchain.dev/'],
        },
        {
            source: ['www.langchain.com/blog'],
        },
    ],
    url: 'www.langchain.com/blog',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: 'LangChain Blog Posts',
};

type BlogItem = DataItem & { link: string };

async function handler() {
    const rootUrl = 'https://blog.langchain.dev';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    const links = new Set<string>();
    const list = $('a.blog-link-absolute')
        .toArray()
        .map((item): BlogItem | null => {
            const $link = $(item);
            const $item = $link.parent();

            const href = $link.attr('href');
            const title = $item.find('h2').text();
            const excerpt = '';

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, 'https://www.langchain.com').href;
            if (links.has(link)) {
                return null;
            }
            links.add(link);

            return {
                title,
                description: excerpt,
                link,
                author: $item
                    .find('.blog-author-name-item')
                    .toArray()
                    .map((author) => $(author).text())
                    .join(', '),
                category: $item
                    .find('.blog-categories-label')
                    .toArray()
                    .map((tag) => $(tag).text()),
            };
        })
        .filter((item): item is BlogItem => item !== null);
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`langchain:article:v2:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const $detail = load(detailResponse.data);
                const description = $detail('.text-rich-text-v2-key-takeaways, .text-rich-text-v2-blog-post')
                    .toArray()
                    .map((section) => $detail(section).html())
                    .join('');
                if (!description) {
                    throw new Error(`Cannot find the article content on ${item.link}.`);
                }
                const article = JSON.parse($detail('script[type="application/ld+json"]').first().text() || '{}');
                return {
                    description,
                    pubDate: article.datePublished ? parseDate(article.datePublished) : undefined,
                    updated: article.dateModified ? parseDate(article.dateModified) : undefined,
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'LangChain Blog',
        link: rootUrl,
        item: items,
    };
}
