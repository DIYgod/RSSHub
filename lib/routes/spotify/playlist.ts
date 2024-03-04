// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const token = await utils.getPublicToken();
    const id = ctx.req.param('id');
    const meta = await got
        .get(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const tracks = meta.tracks.items;

    ctx.set('data', {
        title: meta.name,
        link: meta.external_urls.spotify,
        description: meta.description,
        allowEmpty: true,
        item: tracks.map((x) => ({
            ...utils.parseTrack(x.track),
            pubDate: parseDate(x.added_at),
        })),
        image: meta.images.length ? meta.images[0].url : undefined,
    });
};
