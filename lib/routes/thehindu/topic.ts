import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['traditional-media'],
    example: '/thehindu/topic/rains',
    parameters: { topic: 'Topic slug, can be found in URL.' },
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
            source: ['thehindu.com/topic/:topic'],
        },
    ],
    name: 'Topic',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://www.thehindu.com';
    const topic = ctx.req.param('topic');
    const link = `${baseUrl}/topic/${topic}/`;
    const { data: response } = await got(link);

    const $ = load(response);

    const list = $('.element')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.title a');
            return {
                title: a.text(),
                link: a.attr('href'),
                author: $item.find('.author-name').text() || undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.position-relative, .articleblock-container, .article-ad, .comments-shares').remove();
                const published = $('meta[itemprop="datePublished"]').attr('content');
                const modified = $('meta[itemprop="dateModified"]').attr('content');
                return {
                    description: ($('h2.sub-title').prop('outerHTML') ?? '') + ($('div.article-picture').html() ?? '') + ($('div[itemprop="articleBody"]').html() ?? ''),
                    pubDate: published ? parseDate(published) : undefined,
                    updated: modified ? parseDate(modified) : undefined,
                    category: $('meta[property="article:tag"]')
                        .toArray()
                        .map((tag) => $(tag).attr('content')!),
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link: `${baseUrl}/topic/${topic}/`,
        image: $('meta[property="og:image"]').attr('content'),
        logo: $('link[rel="apple-touch-icon"]').attr('href'),
        icon: $('link[rel="icon"]').attr('href'),
        language: 'en',
        item: items,
    };
}
