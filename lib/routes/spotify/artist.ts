// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
