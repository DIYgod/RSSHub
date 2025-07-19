import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    categories: ['design'],
    example: '/apple/design',
    handler,
    maintainers: ['jean-jacket'],
    name: 'Design updates',
    path: '/design',
    url: 'developer.apple.com/design/whats-new/',
};

// Average time between updates is 16 days
const CACHE_EXPIRE = 1_382_400;

async function handler() {
    const LINK = 'https://developer.apple.com/design/whats-new/';

    return await cache.tryGet(
        'apple:design',
        async () => {
            const response = await ofetch(LINK);
            const $ = load(response);

            const items = $('table')
                .toArray()
                .flatMap((item) => {
                    const table = $(item);
                    const date = table.find('.date').first().text();

                    return table
                        .find('.topic-item')
                        .toArray()
                        .map((row) => {
                            const update = $(row);
                            const titleTag = update.find('span.topic-title a');
                            const title = titleTag.text();
                            const link = `https://developer.apple.com${titleTag.attr('href')}`;
                            const description = update.find('span.description').text();
                            return {
                                description,
                                link,
                                pubDate: parseDate(date),
                                title,
                            };
                        });
                });

            return {
                item: items,
                link: LINK,
                title: 'Apple design updates',
            };
        },
        CACHE_EXPIRE,
        false
    );
}
