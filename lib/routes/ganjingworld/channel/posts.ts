// RSSHub route for fetching posts from Ganjing World.
// Returns a list of posts in a channel.
// Source: https://www.ganjingworld.com

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { ApiResponse } from '../interfaces/api';

// Minimal helper to turn "\u003C" etc. into real characters
export function decodeEscapedHtml(input: string) {
    // 1) Decode \uXXXX and \xXX escape sequences (when they appear literally in the string)
    const unicodeDecoded = input.replaceAll(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
    const hexDecoded = unicodeDecoded.replaceAll(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));

    // 2) Decode a few common HTML entities if present
    return hexDecoded.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

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
            source: ['ganjingworld.com'],
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
    const url = `https://www.ganjingworld.com/channel/${id}?tab=posts`;
    const apiUrl = `https://gw.ganjingworld.com/v1.0c/social-content/get-owner-posts?owner_id=${id}&start_key=&page_size=48&post_image=true&query=basic,post,owner,comment,view,like,is_liked,share%20Request%20Method `;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    if (parsed.data.list.length === 0) {
        throw new Error('No posts found for this channel. Please make sure the channel ID is correct and that the channel contains shorts.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = await Promise.all(
        parsed.data.list.map((item) => {
            const pubDate = new Date(item.timeScheduled);
            const raw = item.text.replaceAll('\n', '<br>') || '';
            const textWithMedia = raw + `<figure><img src="${item.media[0].url}"></figure>`;
            return {
                title: item.title,
                link: `https://www.ganjingworld.com/news/${item.id}`,
                pubDate,
                description: textWithMedia,
            };
        })
    );

    return {
        title,
        link: url,
        description: `posts from Ganjing World Channel ${title}`,
        item: items,
    };
}
