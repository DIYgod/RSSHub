// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const token = await utils.getPrivateToken();

    const limit = ctx.req.param('limit');
    const pageSize = isNaN(Number.parseInt(limit)) ? 50 : Number.parseInt(limit);

    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/tracks?limit=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const tracks = itemsResponse.items;

    ctx.set('data', {
        title: 'Spotify: My Saved Tracks',
        link: 'https://open.spotify.com/collection/tracks',
        description: `Latest ${pageSize} saved tracks on Spotify.`,
        allowEmpty: true,
        item: tracks.map((x) => ({
            ...utils.parseTrack(x.track),
            pubDate: parseDate(x.added_at),
        })),
    });
};
