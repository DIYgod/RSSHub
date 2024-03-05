// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';

export default async (ctx) => {
    const token = await utils.getPrivateToken();
    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/top/artists`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const items = itemsResponse.items;

    ctx.set('data', {
        title: `Spotify: My Top Artists`,
        allowEmpty: true,
        item: items.map((element) => utils.parseArtist(element)),
    });
};
