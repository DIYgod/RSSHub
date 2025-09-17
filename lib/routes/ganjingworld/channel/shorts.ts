// RSSHub route for fetching shorts from Ganjing World.
// Returns a list of shorts in a channel.
// Source: https://www.ganjingworld.com
import { Route } from '@/types';
import { ApiResponse } from '../interfaces/api';
import ofetch from '@/utils/ofetch';

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
    example: 'www.ganjingworld.com/channel/1fq5chh3ajo67UNu14uAvfzOp1a80c?tab=shorts',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/:lang?/channel/:id?tab=shorts*',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Shorts in a channel on Ganjing World',
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
        const video_url = item.video_url || (item.media.length > 0 ? item.media[0].url : '');
        const poster_url = item.poster_url || '';
        if (video_url) {
            item.description = `<video controls src="${video_url}" style="max-width: 100%;"></video><br/>`;
        }
        const description = poster_url ? `<p><img src="${poster_url}" alt="${item.title}" referrerpolicy="no-referrer" /></p><p>${item.description || ''}</p>` : `<p>${item.description || ''}</p>`;

        return {
            title: item.title,
            link: `https://www.ganjingworld.com/video/${item.id}`,
            pubDate,
            description: description || '',
        };
    });

    return {
        title,
        link: url,
        description: `Short videos from Ganjing World Channel ${title}`,
        item: items,
    };
}
