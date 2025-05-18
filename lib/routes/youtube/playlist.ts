import { Route, ViewType } from '@/types';
import { callApi } from './utils';
import { getDataByPlaylistId as getDataByPlaylistIdYoutubei } from './api/youtubei';
import { getDataByPlaylistId as getDataByPlaylistIdGoogle } from './api/google';

export const route: Route = {
    path: '/playlist/:id/:embed?',
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    example: '/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z',
    parameters: { id: 'YouTube playlist id', embed: 'Default to embed the video, set to any value to disable embedding' },
    features: {
        requireConfig: [
            {
                name: 'YOUTUBE_KEY',
                description: ' YouTube API Key, support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/)',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Playlist',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const embed = !ctx.req.param('embed');

    const data = await callApi({
        googleApi: getDataByPlaylistIdGoogle,
        youtubeiApi: getDataByPlaylistIdYoutubei,
        params: { playlistId: id, embed },
    });

    return data;
}
