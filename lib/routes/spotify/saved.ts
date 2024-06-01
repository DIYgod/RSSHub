import { Route } from '@/types';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/saved/:limit?',
    categories: ['multimedia'],
    example: '/spotify/saved/50',
    parameters: { limit: 'Track count, 50 by default' },
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
            source: ['open.spotify.com/collection/tracks'],
            target: '/saved',
        },
    ],
    name: 'Personal Saved Tracks',
    maintainers: ['outloudvi'],
    handler,
    url: 'open.spotify.com/collection/tracks',
};

async function handler(ctx) {
    const token = await utils.getPrivateToken();

    const limit = ctx.req.param('limit');
    const pageSize = isNaN(Number.parseInt(limit)) ? 50 : Number.parseInt(limit);

    const itemsResponse = await ofetch(`https://api.spotify.com/v1/me/tracks?limit=${pageSize}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const tracks = itemsResponse.items;

    return {
        title: 'Spotify: My Saved Tracks',
        link: 'https://open.spotify.com/collection/tracks',
        description: `Latest ${pageSize} saved tracks on Spotify.`,
        allowEmpty: true,
        item: tracks.map((x) => ({
            ...utils.parseTrack(x.track),
            pubDate: parseDate(x.added_at),
        })),
    };
}
