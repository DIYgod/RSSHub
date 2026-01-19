// RSSHub route for fetching shorts from Ganjing World.
// Returns a list of shorts in a channel.
// Source: https://www.ganjingworld.com
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { ApiResponse } from '../interfaces/api';

export const route: Route = {
    path: '/channel/shorts/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/ganjingworld/channel/shorts/1fq5chh3ajo67UNu14uAvfzOp1a80c',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/channel/shorts/:id',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Shorts in a channel',
    maintainers: ['yixiangli2001'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${id}?tab=shorts`;
    const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?channel_id=${id}&content_type=Shorts&page_size=30&query=basic%2Cwatch_count&visibility=public&mode=ready`;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    if (parsed.data.list.length === 0) {
        throw new Error('No shorts found for this channel. Please make sure the channel ID is correct and that the channel contains shorts.');
    }
    const title = parsed.data.list[0].channel.name;
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
        description: `Short videos from Channel ${title}`,
        item: items,
    };
}
