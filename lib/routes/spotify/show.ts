import { Route, ViewType } from '@/types';
import utils from './utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/show/:id',
    categories: ['multimedia', 'popular'],
    view: ViewType.Audios,
    example: '/spotify/show/5CfCWKI5pZ28U0uOzXkDHe',
    parameters: { id: 'Show ID' },
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
            source: ['open.spotify.com/show/:id'],
        },
    ],
    name: 'Show/Podcasts',
    maintainers: ['caiohsramos', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const token = await utils.getPublicToken();
    const id = ctx.req.param('id');

    const meta = await ofetch(`https://api.spotify.com/v1/shows/${id}?market=US`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const episodes = meta.episodes.items;

    return {
        title: meta.name,
        description: meta.description,
        link: meta.external_urls.spotify,
        language: meta.languages[0],
        itunes_author: meta.publisher,
        itunes_category: meta.type,
        itunes_explicit: meta.explicit,
        allowEmpty: true,
        item: episodes.map((x) => ({
            title: x.name,
            description: x.html_description,
            pubDate: parseDate(x.release_date),
            link: x.external_urls.spotify,
            itunes_item_image: x.images[0].url,
            itunes_duration: x.duration_ms / 1000,
            enclosure_url: x.audio_preview_url,
            enclosure_type: 'audio/mpeg',
        })),
        image: meta.images.length ? meta.images[0].url : undefined,
    };
}
