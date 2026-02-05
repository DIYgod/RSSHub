// RSSHub route for fetching videos from Ganjing World.
// Returns a list of videos in a channel.
// Source: https://www.ganjingworld.com

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { ApiResponse } from '../interfaces/api';

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
            source: ['ganjingworld.com'],
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
    const url = `https://www.ganjingworld.com/channel/${id}`;
    const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?lang=zh-TW&start_key=&channel_id=${id}&page_size=24&content_type=AllVideo&query=basic%2Ctranslations%2Cwatch_count&visibility=public&mode=ready`;
    // const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?lang=zh-TW&start_key=&channel_id=1eiqjdnq7go1OPYtIbLDVMpM61ok0c&page_size=24&content_type=AllVideo&query=basic%2Ctranslations%2Cwatch_count&visibility=public&mode=ready`;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    const title = parsed.data.list.length > 0 ? parsed.data.list[0].channel.name : 'Ganjing World Channel';
    const items = parsed.data.list.map((item) => {
        const pubDate = new Date(item.time_scheduled);
        const videoUrl = item.video_url || (item.media.length > 0 ? item.media[0].url : '');
        const posterUrl = item.poster_url || item.image_auto_url || '';

        let description = item.description || '';
        if (videoUrl) {
            description = `<video controls src="${videoUrl}" poster="${posterUrl}" style="max-width: 100%;"></video><br/>${description}`;
        }

        return {
            title: item.title,
            link: `https://www.ganjingworld.com/video/${item.id}`,
            pubDate,
            description,
        };
    });

    return {
        title,
        link: url,
        description: `Videos from Ganjing World Channel ${title}`,
        item: items,
    };
}
