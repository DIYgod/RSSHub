import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/time';

export async function handler(ctx) {
    const { category, topic } = ctx.req.param();
    const baseUrl = 'https://www.dnaindia.com';
    let route;
    if (category) {
        route = `/${category}`;
    } else if (topic) {
        route = `/topic/${topic}`;
    } else {
        logger.error('Invalid URL');
    }
    const link = `${baseUrl}${route}`;
    const { data: response } = await got(link);
    const $ = load(response);

    const listItems = $('div.list-news, div.category_article div.bignews-wrap, div.category_article div.small-listnews')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h2 a');
            return {
                // Category pages cut the visible headline at 80 characters; the image link keeps the full one.
                title: $item.find('a[title]').attr('title') ?? a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            cache.tryGet(`dnaindia:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const itunes_item_image = $('div.article-img img').attr('src');
                const category = $('div.tags ul li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                // Get author information
                const authorMeta = $('meta[name="author"]').attr('content');
                const author = authorMeta || 'DNA Web Team';

                // Process description
                const description = $('div.article-description')
                    .children('div')
                    .remove()
                    .end()
                    .toArray()
                    .map((element) => $(element).html())
                    .join('');

                // Return all properties at once
                return {
                    ...item,
                    itunes_item_image,
                    category,
                    pubDate: parseDate(response.match(/\\"datePublished\\":\\"([^\\"]+)\\"/)[1]),
                    updated: parseDate(response.match(/\\"dateModified\\":\\"([^\\"]+)\\"/)[1]),
                    author,
                    description,
                };
            })
        )
    );

    return {
        title: 'DNA India',
        link,
        item: items,
        description: 'Latest News on dnaIndia.com',
        logo: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        icon: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        language: 'en-us' as const,
    };
}
