import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const map = new Map([
    ['top-stories', { title: 'NL Times -- Top Stories', suffix: '/top-stories' }],
    ['health', { title: 'NL Times -- Health', suffix: '/categories/health' }],
    ['crime', { title: 'NL Times -- Crime', suffix: '/categories/crime' }],
    ['politics', { title: 'NL Times -- Politics', suffix: '/categories/politics' }],
    ['business', { title: 'NL Times -- Business', suffix: '/categories/business' }],
    ['tech', { title: 'NL Times -- Tech', suffix: '/categories/tech' }],
    ['culture', { title: 'NL Times -- Culture', suffix: '/categories/culture' }],
    ['sports', { title: 'NL Times -- Sports', suffix: '/categories/sports' }],
    ['weird', { title: 'NL Times -- Weird', suffix: '/categories/weird' }],
    ['1-1-2', { title: 'NL Times -- 1-1-2', suffix: '/categories/1-1-2' }],
]);

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/nltimes/news/top-stories',
    parameters: { category: 'category' },
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
            source: ['nltimes.nl/categories/:category'],
            target: '/news/:category',
        },
    ],
    name: 'News',
    maintainers: ['Hivol'],
    handler,
    description: `| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
| --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
| top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'top-stories';
    const suffix = map.get(category).suffix;

    const rootUrl = 'https://www.nltimes.nl';
    const apiUrl = rootUrl + suffix;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = load(response.data);

    const list = $('.news-card')
        .slice(0, 10)
        .toArray()
        .map((elem) => {
            const item = {
                link: $(elem).children('.news-card__title').first().children('a').first().attr('href'),
                title: $(elem).children('.news-card__title').first().children('a').first().text(),
                date: $(elem).children('.news-card__date').first().text(),
                category: $(elem)
                    .children('.news-card__categories')
                    .first()
                    .children('a')
                    .toArray()
                    .map((elem) => $(elem).text()),
            };
            return item;
        });

    const ProcessFeed = (data) => {
        const $ = load(data);

        return $('.news-article--body').html();
    };

    const items = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const date = timezone(parseDate(item.date, 'DD MMMM YYYY - HH:mm'), +1); // Central European Time
            const link = rootUrl + item.link;
            const category = item.category;

            return cache.tryGet(link, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const description = ProcessFeed(response.data);
                return {
                    title,
                    category,
                    description,
                    pubDate: date,
                    link,
                };
            });
        })
    );

    return {
        title: map.get(category).title,
        language: 'en',
        link: apiUrl,
        description: map.get(category).title,
        item: items,
    };
}
