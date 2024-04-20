import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/news',
    categories: ['program-update'],
    example: '/qbittorrent/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['qbittorrent.org/news.php', 'qbittorrent.org/'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'qbittorrent.org/news.php',
};

async function handler(ctx) {
    const baseUrl = 'https://www.qbittorrent.org';

    const response = await cache.tryGet(
        `${baseUrl}/news.php`,
        async () =>
            (
                await got(`${baseUrl}/news.php`, {
                    headers: {
                        Referer: baseUrl,
                    },
                })
            ).data,
        config.cache.routeExpire,
        false
    );

    const $ = load(response);

    const item = $('.stretcher')
        .find('h3')
        .toArray()
        .map((item) => {
            item = $(item);
            const pubDate = item
                .text()
                .split(' - ')[0]
                .replace(/\w{3,6}day/, '');
            const title = item.text().split(' - ')[1];
            let description = '';
            // nextUntil() does not work here
            while (item.next().length && item.next().get(0).tagName !== 'h3') {
                item = item.next();
                description += item.html();
            }
            return {
                title,
                description,
                pubDate: parseDate(pubDate, 'MMMM D YYYY'),
            };
        });

    const ret = {
        title: 'qBittorrent News',
        link: `${baseUrl}/news.php`,
        item,
    };

    ctx.set('json', ret);
    return ret;
}
