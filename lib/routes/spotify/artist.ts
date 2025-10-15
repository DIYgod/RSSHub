import { Route, ViewType } from '@/types';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/artist/:id',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/spotify/artist/6k9TBCxyr4bXwZ8Y21Kwn1',
    parameters: { id: 'Artist ID' },
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
            source: ['open.spotify.com/artist/:id'],
        },
    ],
    name: 'Artist Albums',
    maintainers: ['outloudvi'],
    handler,
};

async function handler(ctx) {
    const token = await utils.getPublicToken();
    const id = ctx.req.param('id');
    const meta = await ofetch(`https://api.spotify.com/v1/artists/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const itemsResponse = await ofetch(`https://api.spotify.com/v1/artists/${id}/albums`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const albums = itemsResponse.items;

    return {
        title: `Albums of ${meta.name}`,
        link: meta.external_urls.spotify,
        allowEmpty: true,
        item: albums.map((x) => ({
            title: x.name,
            author: x.artists.map((a) => a.name).join(', '),
            description: `"${x.name}" by ${x.artists.map((a) => a.name).join(', ')}, released at ${x.release_date} with ${x.total_tracks} tracks.`,
            pubDate: parseDate(x.release_date),
            link: x.external_urls.spotify,
        })),
        image: meta.images.length ? meta.images[0].url : undefined,
    };
}
