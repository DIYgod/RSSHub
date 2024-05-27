import { Route } from '@/types';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/playlist/:id',
    categories: ['multimedia'],
    example: '/spotify/playlist/4UBVy1LttvodwivPUuwJk2',
    parameters: { id: 'Playlist ID' },
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
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['open.spotify.com/playlist/:id'],
        },
    ],
    name: 'Playlist',
    maintainers: ['outloudvi'],
    handler,
};

async function handler(ctx) {
    const token = await utils.getPublicToken();
    const id = ctx.req.param('id');
    const meta = await ofetch(`https://api.spotify.com/v1/playlists/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const tracks = meta.tracks.items;

    return {
        title: meta.name,
        link: meta.external_urls.spotify,
        description: meta.description,
        allowEmpty: true,
        item: tracks.map((x) => ({
            ...utils.parseTrack(x.track),
            pubDate: parseDate(x.added_at),
        })),
        image: meta.images.length ? meta.images[0].url : undefined,
    };
}
