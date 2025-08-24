import { Route } from '@/types';
// import { load } from 'cheerio';
import ofetch from '@/utils/ofetch'; // Unified request library used
// import cache from '@/utils/cache';
// import { parseDate } from 'tough-cookie';
import { ApiResponse } from './interfaces/api';

export const route: Route = {
    path: '/channel/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: 'www.ganjingworld.com/channel/1h4uri06g634IY6ND9UrE3BuJ1a80c',
    parameters: { id: 'Channel ID' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/channel/:id',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Videos in a channel on Ganjing World',
    maintainers: [],
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

        return {
            title: item.title,
            link: `https://www.ganjingworld.com/video/${item.id}`,
            pubDate,
            description: item.description || '',
        };
    });

    return {
        title,
        link: url,
        description: `Videos from Ganjing World Channel ${title}`,
        item: items,
    };
}
