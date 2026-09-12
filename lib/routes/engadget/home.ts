import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/engadget',
    radar: [
        {
            source: ['www.engadget.com'],
        },
    ],
    name: 'Home',
    maintainers: ['JamesWDGu', 'KeiLongW'],
    handler,
    url: 'www.engadget.com',
};

async function handler() {
    const feed = await parser.parseURL('https://www.engadget.com/rss.xml');

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet<DataItem>(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const article = $('article');
                article.find('ul.breadcrumbs, .title-gallery, .subtitle, .byline-container').remove();
                article.find('img.lazyload').each((_, el) => {
                    $(el).attr('src', $(el).data('lazy-src') as string);
                });

                return {
                    title: item.title!,
                    description: article.html(),
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item.author,
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: feed.language,
        item: items,
    };
}
