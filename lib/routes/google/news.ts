import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const baseUrl = 'https://news.google.com';

export const route: Route = {
    path: '/news/:category/:locale',
    categories: ['new-media'],
    example: '/google/news/Top stories/hl=en-US&gl=US&ceid=US:en',
    parameters: { category: 'Category Title', locale: 'locales, could be found behind `?`, including `hl`, `gl`, and `ceid` as parameters' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['zoenglinghou'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const locale = ctx.req.param('locale');

    const categoryUrls = await cache.tryGet(`google:news:${locale}`, async () => {
        const { data: front_data } = await got(`${baseUrl}/?${locale}`);

        const $ = load(front_data);
        return [
            ...$('a.brSCsc')
                .toArray()
                .slice(3) // skip Home, For you and Following
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
            ...$('a.aqvwYd') // Home
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
        ];
    });
    const categoryUrl = categoryUrls.find((item) => item.category === category).url;

    const { data } = await got(categoryUrl);
    const $ = load(data);

    const list = [...$('.UwIKyb'), ...$('.IBr9hb'), ...$('.IFHyqb')]; // 3 rows of news, 3-rows-wide news, single row news

    const items = list.map((item) => {
        item = $(item);
        const title = item.find('h4').text();
        return {
            title,
            description: art(path.join(__dirname, 'templates/news.art'), {
                img: item.find('img.Quavad').attr('src'),
                brief: title,
            }),
            pubDate: parseDate(item.find('time').attr('datetime')),
            author: item.find('.oovtQ').text(),
            link: new URL(item.find('a.WwrzSb').first().attr('href'), baseUrl).href,
        };
    });

    return {
        title: $('title').text(),
        link: categoryUrl,
        item: items,
    };
}
