// RSSHub route for fetching videos from Ganjing World.
// Returns a list of videos in a channel.
// Source: https://www.ganjingworld.com

import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { ApiResponse } from '../interfaces/api';

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
    example: 'www.ganjingworld.com/channel/1h4uri06g634IY6ND9UrE3BuJ1a80c',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/:lang?/channel/:id*',
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

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    const title = parsed.data.list[0].channel.name;
    const items = parsed.data.list.map((item) => {
        const pubDate = new Date(item.time_scheduled);
        const videoUrl = item.video_url || (item.media.length > 0 ? item.media[0].url : '');
        const posterUrl = item.poster_url || '';
        if (videoUrl) {
            item.description = `<video controls src="${videoUrl}" poster="${posterUrl}" style="max-width: 100%;"></video><br/>`;
        }

        return {
            title: item.title,
            link: `https://www.ganjingworld.com/video/${item.id}`,
            pubDate,
            description: item.description,
        };
    });

    return {
        title,
        link: url,
        description: `Videos from Ganjing World Channel ${title}`,
        item: items,
    };
}
