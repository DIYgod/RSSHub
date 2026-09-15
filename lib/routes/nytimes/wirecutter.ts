import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
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
        antiCrawler: false,
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
    const feedText = await ofetch(feedUrl, {
        // rss-parser's parseURL relies on Node's https.get, which is unavailable on Cloudflare Workers
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedText);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            // the feed appends its own tracking parameters
            const link = item.link?.split('?', 1)[0];
            try {
                return await cache.tryGet(link!, async () => {
                    const response = await ofetch(link!);
                    const $ = load(response);
                    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                    const post = nextData.props?.pageProps?.post;
                    if (!post?.chapters) {
                        throw new Error('no post chapters in __NEXT_DATA__');
                    }

                    return {
                        title: post.title ?? item.title,
                        link,
                        description: renderPost(post),
                        author: (post.authors ?? []).map((a) => a.displayName).join(', ') || item.creator,
                        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                        category: [post.primarySection?.name, ...(post.primaryTerms ?? [])].filter(Boolean),
                    } as DataItem;
                });
            } catch (error) {
                // A single unreadable review should not take down the whole feed; this result is not cached, so it is retried next time
                logger.warn(`nytimes/wirecutter: falling back to the feed summary for ${link}: ${error}`);
                return {
                    title: item.title,
                    link,
                    description: item.content,
                    author: item.creator,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                } as DataItem;
            }
        })
    );

    return {
        title: feed.title ?? 'Wirecutter',
        link: 'https://www.nytimes.com/wirecutter',
        description: feed.description,
        item: items,
    };
}
