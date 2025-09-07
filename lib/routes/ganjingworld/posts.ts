import { Route } from '@/types';
import { ApiResponse } from './interfaces/api';

import ofetch from '@/utils/ofetch';
import sanitizeHtml from 'sanitize-html';

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
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: 'www.ganjingworld.com/channel/1fcahpcut9t3gz4zIvYSJR7qd1cs0c?tab=posts',
    parameters: { id: 'Channel ID' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/channel/:id?tab=posts',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'posts in a channel on Ganjing World',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${id}?tab=posts`;
    const apiUrl = `https://gw.ganjingworld.com/v1.0c/social-content/get-owner-posts?owner_id=${id}&start_key=&page_size=48&post_image=true&query=basic,post,owner,comment,view,like,is_liked,share%20Request%20Method `;
    // const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?channel_id=1fcahpcut9t3gz4zIvYSJR7qd1cs0c&content_type=News`;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    if (parsed.data.list.length === 0) {
        throw new Error('No posts found for this channel. Please make sure the channel ID is correct and that the channel contains shorts.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = await Promise.all(
        parsed.data.list.map((item) => {
            const pubDate = new Date(item.time_scheduled);
            const raw = item.text || '';
            const decoded = /\\u003C|\\x3C|&lt;/.test(raw) ? decodeEscapedHtml(raw) : raw;
            const clean = sanitizeHtml(decoded, {
                allowedTags: ['p', 'span', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'em', 'strong', 'br', 'blockquote', 'figure', 'img', 'a'],
                allowedAttributes: {
                    a: ['href', 'title', 'target', 'rel'],
                    img: ['src', 'alt', 'width', 'height', 'title', 'loading', 'referrerpolicy'],
                    span: ['lang', 'dir'],
                },
                disallowedTagsMode: 'discard',
            });
            const textWithMedia = clean + `<figure><img src="${item.media[0].url}" referrerpolicy="no-referrer"></figure>`;
            return {
                title: item.title,
                link: `https://www.ganjingworld.com/news/${item.id}`,
                pubDate,
                description: textWithMedia || '',
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
