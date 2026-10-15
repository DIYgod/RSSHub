import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getRssFeed } from './utils';

const getCategory = (category: unknown): string[] => {
    if (typeof category === 'string') {
        return [category];
    }
    return category && typeof category === 'object' && '_' in category && typeof category._ === 'string' ? [category._] : [];
};

export const route: Route = {
    path: '/rss/:cat?',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/nytimes/rss/HomePage',
    parameters: {
        cat: {
            description: "Category name, corresponding to the last segment of [official feed's](https://www.nytimes.com/rss) url.",
        },
    },
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
            source: ['nytimes.com/'],
            target: '',
        },
    ],
    name: 'News',
    maintainers: ['HenryQW', 'pseudoyu', 'dzx-dzx'],
    handler,
    url: 'nytimes.com/',
    description: 'Enhance the official EN RSS feed',
};

async function handler(ctx) {
    const url = `https://rss.nytimes.com/services/xml/rss/nyt/${ctx.req.param('cat')}.xml`;

    const rss = await getRssFeed(url);

    return {
        ...rss,
        item: await pMap(
            rss.items,
            async (e) => {
                try {
                    const detail = await cache.tryGet<Pick<DataItem, 'description' | 'author'>>(`nytimes:rss:detail:v2:${e.link}`, async () => {
                        const res = await ofetch(e.link!, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });

                        const $ = load(res);

                        return {
                            description: $("[name='articleBody']").html(),
                            author: $('meta[name="byl"]').attr('content'),
                        };
                    });
                    return {
                        ...e,
                        description: detail.description,
                        author: detail.author,
                    };
                } catch (error) {
                    if (error instanceof FetchError && error.status === 403) {
                        return {
                            ...e,
                            description: e.content,
                            author: e.creator,
                            category: e.categories?.flatMap(getCategory),
                            pubDate: e.pubDate ? parseDate(e.pubDate) : undefined,
                        };
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        ),
    } as Data;
}
