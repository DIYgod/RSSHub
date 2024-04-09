import { Route } from '@/types';
import utils from './utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/artist/:id',
    categories: ['multimedia'],
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
    const meta = await got
        .get(`https://api.spotify.com/v1/artists/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();

    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/artists/${id}/albums`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
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
