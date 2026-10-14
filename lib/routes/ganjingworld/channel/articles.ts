// RSSHub route for fetching articles from Ganjing World.
// Returns a list of articles in a channel.
// Source: https://www.ganjingworld.com

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { ApiResponse } from '../interfaces/api';
import { getFeedLanguage, getLanguage } from '../utils';

export const route: Route = {
    path: '/channel/articles/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/ganjingworld/channel/articles/1fcahpcut9t3gz4zIvYSJR7qd1cs0c',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com/channel/:id', 'www.ganjingworld.com/channel/:id'],
            target: '/channel/articles/:id',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Articles in a channel',
    maintainers: ['yixiangli2001'],

    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${encodeURIComponent(id)}?tab=articles`;
    const parsed = await ofetch<ApiResponse>('https://gw.ganjingworld.com/v1.1/content/get-by-channel', {
        query: { channel_id: id, content_type: 'News' },
    });
    if (parsed.data.list.length === 0) {
        throw new Error('No articles found for this channel. Please make sure the channel ID is correct and that the channel contains articles.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = await Promise.all(
        parsed.data.list.map(async (item) => {
            const description = await cache.tryGet(`ganjingworld:article:${item.id}`, async () => {
                const parsedArticle = await ofetch<ApiResponse>('https://gw.ganjingworld.com/v1.1/content/query', {
                    query: { lang: 'zh-TW', query: 'basic,full,translations,like,share,save,view,tag_list', ids: item.id },
                });
                return parsedArticle.data.list[0]?.text ?? '';
            });

            return {
                title: item.title,
                author: item.channel.name,
                category: item.hashtags ?? undefined,
                language: getLanguage(item.lang),
                link: `https://www.ganjingworld.com/news/${item.id}`,
                pubDate: Number.isFinite(item.time_scheduled) ? parseDate(item.time_scheduled) : undefined,
                description,
            };
        })
    );

    return {
        title,
        link: url,
        description: `Articles from Ganjing World Channel ${title}`,
        language: getFeedLanguage(parsed.data.list),
        item: items,
    };
}
