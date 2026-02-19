import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/devblog',
    categories: ['game'],
    example: '/worldofwarships/devblog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blog.worldofwarships.com'],
            target: '/devblog',
        },
    ],
    name: 'Development Blog',
    maintainers: ['SinCerely023'],
    handler,
};

async function handler() {
    const url = 'https://blog.worldofwarships.com/';

    const { data: response } = await got(url);
    const $ = load(response);

    const face = $('[rel=apple-touch-icon]').last();

    const list = $('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const time = item.find('div').first().find('time').first();
            const tag = item.find('div').first().find('ul').first().find('li').first();
            const title = item.find('h2').first().find('a').first();
            const content = item.find('h2').first().next();
            return {
                title: title.attr('title'),
                link: title.attr('href'),
                pubDate: timezone(parseDate(time.attr('data-timestamp') * 1000), 0),
                category: tag.text(),
                author: 'Wargaming',
                description: content.html(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.article__content').first().html();
                return item;
            })
        )
    );

    return {
        title: 'World of Warships - Development Blog',
        link: url,
        item: items,
        image: 'https:' + face.attr('href'),
        language: 'en',
        author: 'Wargaming',
    };
}
