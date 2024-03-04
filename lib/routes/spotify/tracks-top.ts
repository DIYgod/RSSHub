// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';

export default async (ctx) => {
    const token = await utils.getPrivateToken();
    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/top/tracks`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const items = itemsResponse.items;

    ctx.set('data', {
        title: `Spotify: My Top Tracks`,
        allowEmpty: true,
        item: items.map((element) => utils.parseTrack(element)),
    });
};
