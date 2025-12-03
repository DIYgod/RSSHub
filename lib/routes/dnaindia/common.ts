import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const listItems = $('div.list-news')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('div.explainer-subtext a');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const itunes_item_image = $('div.article-img img').attr('src');
                const category = $('div.tags ul li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                // Process date
                const timeText = $('p.dna-update').text();
                const dateMatch = timeText.match(/Updated\s*:\s*([\w\s,:\d]+?)(?:\s*\||$)/);
                let time = dateMatch ? dateMatch[1].trim() : '';
                time = time.replace(/\s+IST$/, '');
                const pubDate = timezone(parseDate(time), +5.5);
                // Get author information
                const authorMeta = $('meta[name="author"]').attr('content');
                const author = authorMeta || 'DNA Web Team';

                // Process description
                const description = $('div.article-description')
                    .clone()
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
                    pubDate,
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
        language: 'en-us',
    };
}
