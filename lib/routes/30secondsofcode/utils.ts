import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://www.30secondsofcode.org';

export async function processList(listElements) {
    const items = await Promise.allSettled(
        listElements.map((item) => {
            const $ = load(item);
            const link = $(' article > h3 > a').attr('href');
            const date = $(' article > small > time').attr('datetime');
            return processItem({ link, date });
        })
    );
    return items.map((item) => (item.status === 'fulfilled' ? item.value : ({ title: 'Error Reading Item' } as DataItem)));
}

async function processItem({ link: articleLink, date }) {
    return await cache.tryGet(`30secondsofcode:${articleLink}`, async () => {
        const finalLink = `${rootUrl}${articleLink}`;
        const response = await ofetch(finalLink);
        const $ = load(response);
        const tags = $.root()
            .find('body > main > nav > ol > li:not(:first-child):not(:last-child)')
            .toArray()
            .map((tag) => $(tag).find('a').text());
        const article = $('main > article');
        const title = article.find('h1').text();
        article.find('img').each((_, element) => {
            const img = $(element);
            const src = img.attr('src');
            if (src?.startsWith('/')) {
                img.attr('src', `${rootUrl}${src}`);
            }
        });
        const image = article.find('img').attr('src');
        const description = article.clone().find('h1, script').remove().end().html();

        return {
            title,
            link: finalLink,
            pubDate: parseDate(date),
            description,
            author: '30 Seconds of Code',
            category: tags,
            image: `${rootUrl}${image}`,
            banner: `${rootUrl}${image}`,
        } as DataItem;
    });
}
