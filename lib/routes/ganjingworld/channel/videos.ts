// RSSHub route for fetching videos from Ganjing World.
// Returns a list of videos in a channel.
// Source: https://www.ganjingworld.com

import { html } from 'hono/html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { ApiResponse } from '../interfaces/api';
import { getFeedLanguage, getLanguage } from '../utils';

export const route: Route = {
    path: '/channel/videos/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/ganjingworld/channel/videos/1eiqjdnq7go1OPYtIbLDVMpM61ok0c',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com/channel/:id', 'www.ganjingworld.com/channel/:id'],
            target: '/channel/videos/:id',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Videos in a channel',
    maintainers: ['yixiangli2001'],

    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${encodeURIComponent(id)}`;
    const parsed = await ofetch<ApiResponse>('https://gw.ganjingworld.com/v1.1/content/get-by-channel', {
        query: { lang: 'zh-TW', start_key: '', channel_id: id, page_size: 24, content_type: 'AllVideo', query: 'basic,description,translations,watch_count', visibility: 'public', mode: 'ready' },
    });
    const title = parsed.data.list.length > 0 ? parsed.data.list[0].channel.name : 'Ganjing World Channel';
    const items = parsed.data.list.map((item) => {
        const pubDate = Number.isFinite(item.time_scheduled) ? parseDate(item.time_scheduled) : undefined;
        const videoUrl = item.video_url || item.media?.[0]?.url || '';
        const posterUrl = item.poster_url || item.image_auto_url || '';

        let description = html`${item.description || ''}`.toString().replaceAll('\n', '<br>');
        if (videoUrl) {
            description = `<video controls src="${videoUrl}" poster="${posterUrl}" style="max-width: 100%;"></video><br/>${description}`;
        } else if (posterUrl) {
            description = `<img src="${posterUrl}"><br/>${description}`;
        }

        return {
            title: item.title,
            author: item.channel.name,
            category: item.hashtags ?? undefined,
            language: getLanguage(item.lang),
            link: `https://www.ganjingworld.com/video/${item.id}`,
            pubDate,
            description,
        };
    });

    return {
        title,
        link: url,
        description: `Videos from Ganjing World Channel ${title}`,
        language: getFeedLanguage(parsed.data.list),
        item: items,
    };
}
