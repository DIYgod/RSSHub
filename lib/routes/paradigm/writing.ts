import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://www.paradigm.xyz';

export const route: Route = {
    path: '/writing',
    categories: ['finance'],
    example: '/paradigm/writing',
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
            source: ['paradigm.xyz/writing'],
        },
    ],
    name: 'Writing',
    maintainers: ['Fatpandac'],
    handler,
    url: 'paradigm.xyz/writing',
};

interface ArticleSchema {
    '@type': string;
    datePublished: string;
    dateModified: string;
    author: Array<{ name: string; url: string }>;
    articleSection: string;
}

async function handler() {
    const url = `${baseUrl}/writing`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('#all-writing .item-link')
        .toArray()
        .map((element) => {
            const item = $(element);
            return { title: item.find('h2').text(), link: new URL(element.attribs.href, baseUrl).href, image: item.find('img').attr('src') };
        });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`paradigm:article:body:${item.link}`, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const schema: ArticleSchema = $('script[type="application/ld+json"]')
                    .toArray()
                    .map((element) => JSON.parse($(element).text()))
                    .find((item) => item['@type'] === 'Article');
                return {
                    description: $('article .story-item__body').html(),
                    author: schema.author.map((author) => ({ name: author.name, url: author.url })),
                    pubDate: parseDate(schema.datePublished),
                    updated: parseDate(schema.dateModified),
                    category: [schema.articleSection],
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
    return { title: 'Paradigm - Writing', link: url, item: items };
}
