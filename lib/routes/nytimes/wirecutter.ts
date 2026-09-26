import { load } from 'cheerio';

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

    const items = await Promise.all(
        feed.items.map((item) => {
            // the feed appends its own tracking parameters
            const link = item.link!.split('?', 1)[0];
            return cache.tryGet(link, async () => {
                const response = await ofetch(link, {
                    // Article pages sit behind bot detection that turns away a share of requests with a 403,
                    // a status ofetch does not retry by default. Retrying clears it — only about half the
                    // articles are refused on a first pass and every one of them answers on a later attempt.
                    retry: 5,
                    retryDelay: 3000,
                    retryStatusCodes: [400, 403, 408, 409, 425, 429, 500, 502, 503, 504],
                });
                const $ = load(response);
                const post = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.post;

                return {
                    title: post.title,
                    link,
                    description: renderPost(post),
                    author: post.authors.map((a) => a.displayName).join(', '),
                    pubDate: parseDate(item.pubDate!),
                    category: [post.primarySection?.name, ...(post.primaryTerms ?? [])].filter(Boolean),
                } as DataItem;
            });
        })
    );

    return {
        title: feed.title!,
        link: 'https://www.nytimes.com/wirecutter',
        description: feed.description,
        item: items,
    };
}
