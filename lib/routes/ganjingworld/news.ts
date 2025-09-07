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
    path: '/channel/articles/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: 'www.ganjingworld.com/channel/1fcahpcut9t3gz4zIvYSJR7qd1cs0c?tab=articles',
    parameters: { id: 'Channel ID' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/channel/:id?tab=articles',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Articles in a channel on Ganjing World',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${id}?tab=articles`;
    const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?channel_id=${id}&content_type=News`;
    // const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?channel_id=1fcahpcut9t3gz4zIvYSJR7qd1cs0c&content_type=News`;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    if (parsed.data.list.length === 0) {
        throw new Error('No articles found for this channel. Please make sure the channel ID is correct and that the channel contains shorts.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = await Promise.all(
        parsed.data.list.map(async (item) => {
            const pubDate = new Date(item.time_scheduled);
            const fetchArticleUrl = `https://gw.ganjingworld.com/v1.1/content/query?lang=zh-TW&query=basic%2Cfull%2Ctranslations%2Clike%2Cshare%2Csave%2Cview%2Ctag_list&ids=${item.id}`;
            const parsedArticle: ApiResponse = await ofetch<ApiResponse>(fetchArticleUrl);
            const raw = parsedArticle.data.list[0].text || '';
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
            return {
                title: item.title,
                link: `https://www.ganjingworld.com/news/${item.id}`,
                pubDate,
                description: clean || '',
                // description: '',
            };
        })
    );

    return {
        title,
        link: url,
        description: `Articles from Ganjing World Channel ${title}`,
        item: items,
    };
}
