import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['fishshell.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['x2cf'],
    handler,
    url: 'fishshell.com/',
};

async function handler() {
    const link = 'https://fishshell.com/docs/current/relnotes.html';
    const data = await cache.tryGet(link, async () => (await got(link)).data, config.cache.contentExpire, false);
    const $ = load(data);
    return {
        link,
        title: 'Release notes — fish-shell',
        language: 'en',
        item: $('#release-notes > section')
            .toArray()
            .map((item) => {
                const title = $(item).find('h2').contents().first().text();
                const date = title.match(/\(released (.+?)\)/)?.[1];
                return {
                    title,
                    link: new URL($(item).find('a').attr('href'), link).href,
                    pubDate: date ? parseDate(date, 'MMMM D, YYYY') : undefined,
                    description: $(item).html(),
                };
            }),
    };
}
