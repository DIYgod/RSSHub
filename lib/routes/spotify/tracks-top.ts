import { Route } from '@/types';
import utils from './utils';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/top/tracks',
    categories: ['multimedia'],
    example: '/spotify/top/tracks',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'SPOTIFY_CLIENT_ID',
                description: '',
            },
            {
                name: 'SPOTIFY_CLIENT_SECRET',
                description: '',
            },
            {
                name: 'SPOTIFY_REFRESHTOKEN',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['open.spotify.com/'],
        },
    ],
    name: 'Personal Top Tracks',
    maintainers: ['outloudvi'],
    handler,
    url: 'open.spotify.com/',
};

async function handler() {
    const token = await utils.getPrivateToken();
    const itemsResponse = await ofetch(`https://api.spotify.com/v1/me/top/tracks`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const items = itemsResponse.items;

    return {
        title: `Spotify: My Top Tracks`,
        allowEmpty: true,
        item: items.map((element) => utils.parseTrack(element)),
    };
}
