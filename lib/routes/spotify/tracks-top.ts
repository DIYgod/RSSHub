import { Route } from '@/types';
import utils from './utils';
import got from '@/utils/got';

export const route: Route = {
    path: '/top/tracks',
    categories: ['multimedia'],
    example: '/spotify/top/tracks',
    parameters: {},
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['open.spotify.com/'],
    },
    name: 'Personal Top Tracks',
    maintainers: ['outloudvi'],
    handler,
    url: 'open.spotify.com/',
};

async function handler() {
    const token = await utils.getPrivateToken();
    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/top/tracks`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const items = itemsResponse.items;

    return {
        title: `Spotify: My Top Tracks`,
        allowEmpty: true,
        item: items.map((element) => utils.parseTrack(element)),
    };
}
