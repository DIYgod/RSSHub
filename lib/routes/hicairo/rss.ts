import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/hicairo',
    radar: [
        {
            source: ['hicairo.com/'],
        },
    ],
    name: '最近发表',
    maintainers: ['cnkmmk'],
    handler,
    url: 'hicairo.com/',
};

async function handler() {
    const currentUrl = 'https://www.hicairo.com';
    const response = await got(`${currentUrl}/feed.php`);
    const $ = load(response.data, { xmlMode: true });
    const title_main = $('channel > title').text();
    const description_main = $('channel > description').text();
    const items = $('channel > item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('link').text();
            const title = $item.find('title').text();
            const description = $item.find('description').text();
            const pubDate = $item.find('pubDate').text();
            return {
                link,
                pubDate, // no need to normalize because it's from a valid RSS feed
                title,
                description,
            };
        });

    return {
        title: title_main,
        description: description_main,
        link: currentUrl,
        item: items,
    };
}
