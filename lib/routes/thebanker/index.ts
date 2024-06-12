import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/thebanker/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'The Banker - News in Brief',
    maintainers: ['benjaminyzhang'],
    description: 'RSS feed for The Banker website news briefs.',
    handler,
};

async function handler(_) {
    const url = 'https://www.thebanker.com/News-in-Brief';
    const response = await got(url);
    const $ = load(response.data);
    const selectors = ['div#layout-content-wrapper > div > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(2)'];
    const list = [];

    for (const selector of selectors) {
        $(selector).each((_, e) => {
            const title = $(e).find('div:nth-child(2) > a[data-cy="card-title-link"] > h3').text();
            const link = $(e).find('div:nth-child(2) > a[data-cy="card-title-link"]').attr('href');
            const description = $(e).find('div:nth-child(2) > a:nth-child(2) > p').text();

            if (link) {
                list.push({ title, link, description });
            }
        });
    }

    const result = await Promise.all(
        list.map((item) => cache.tryGet(item.link, () => Promise.resolve(item)))
    );

    return {
        title: 'The Banker - News in Brief',
        link: 'https://www.thebanker.com/News-in-Brief',
        item: result,
    };
}
