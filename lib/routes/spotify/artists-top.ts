import { Route } from '@/types';
import utils from './utils';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/top/artists',
    categories: ['multimedia'],
    example: '/spotify/top/artists',
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
    name: 'Personal Top Artists',
    maintainers: ['outloudvi'],
    handler,
    url: 'open.spotify.com/',
};

async function handler() {
    const token = await utils.getPrivateToken();
    const itemsResponse = await ofetch(`https://api.spotify.com/v1/me/top/artists`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const items = itemsResponse.items;

    return {
        title: `Spotify: My Top Artists`,
        allowEmpty: true,
        item: items.map((element) => utils.parseArtist(element)),
    };
}
