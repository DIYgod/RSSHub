import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { renderPost } from './templates/wirecutter';

const feedUrl = 'https://www.nytimes.com/wirecutter/feed/';

export const route: Route = {
    path: '/wirecutter',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/nytimes/wirecutter',
    parameters: {},
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
            source: ['www.nytimes.com/wirecutter', 'www.nytimes.com/wirecutter/reviews/:slug'],
        },
    ],
    name: 'Wirecutter',
    maintainers: ['IvanWng97'],
    handler,
    description: 'The official feed only carries the opening few paragraphs; this route returns the whole review, including the picks and their photos.',
};

async function handler() {
    const feed = await parser.parseURL(feedUrl);

    const items = await pMap(
        feed.items,
        async (item) => {
            // the feed appends its own tracking parameters
            const link = item.link!.split('?', 1)[0];
            try {
                return await cache.tryGet(link, async () => {
                    const response = await ofetch(link);
                    const $ = load(response);
                    const post = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.post;

                    return {
                        title: post.title,
                        link,
                        description: renderPost(post),
                        author: post.authors.map((a) => a.displayName).join(', '),
                        pubDate: parseDate(item.pubDate!),
                        category: [post.primarySection?.name, post.auxiliarySection?.name].filter(Boolean),
                    } as DataItem;
                });
            } catch {
                // Article pages sit behind DataDome, which turns away a share of requests with a 403.
                // Fall back to the opening paragraphs the feed carries; nothing is cached, so the next run tries again.
                return {
                    title: item.title!,
                    link,
                    description: item['content:encoded'] ?? item.content,
                    author: item.creator,
                    pubDate: parseDate(item.pubDate!),
                } as DataItem;
            }
        },
        { concurrency: 2 }
    );

    return {
        title: feed.title!,
        link: 'https://www.nytimes.com/wirecutter',
        description: feed.description,
        item: items,
    };
}
