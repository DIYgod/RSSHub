// RSSHub route for fetching posts from Ganjing World.
// Returns a list of posts in a channel.
// Source: https://www.ganjingworld.com

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { ApiResponse } from '../interfaces/api';
import { getFeedLanguage, getLanguage } from '../utils';

export const route: Route = {
    path: '/channel/posts/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/ganjingworld/channel/posts/1fcahpcut9t3gz4zIvYSJR7qd1cs0c',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com/channel/:id', 'www.ganjingworld.com/channel/:id'],
            target: '/channel/posts/:id',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'posts in a channel',
    maintainers: ['yixiangli2001'],

    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${encodeURIComponent(id)}?tab=posts`;
    const parsed = await ofetch<ApiResponse>('https://gw.ganjingworld.com/v1.0c/social-content/get-owner-posts', {
        query: { owner_id: id, start_key: '', page_size: 48, post_image: true, query: 'basic,post,owner,comment,view,like,is_liked,share' },
    });
    if (parsed.data.list.length === 0) {
        throw new Error('No posts found for this channel. Please make sure the channel ID is correct and that the channel contains posts.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = parsed.data.list.map((item) => {
        const pubDate = Number.isFinite(item.time_scheduled) ? parseDate(item.time_scheduled) : undefined;

        const raw = item.text?.replaceAll('\n', '<br>') || '';
        const media = item.media?.[0];
        const textWithMedia = media ? raw + `<figure><img src="${media.url}"></figure>` : raw;
        return {
            title: item.title,
            author: item.channel.name,
            category: item.hashtags ?? undefined,
            language: getLanguage(item.lang),
            link: `https://www.ganjingworld.com/news/${item.id}`,
            pubDate,
            description: textWithMedia,
        };
    });

    return {
        title,
        link: url,
        description: `Posts from Ganjing World Channel ${title}`,
        language: getFeedLanguage(parsed.data.list),
        item: items,
    };
}
