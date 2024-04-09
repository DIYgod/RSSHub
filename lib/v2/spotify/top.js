const utils = require('./utils');
const got = require('@/utils/got');

module.exports = (type) => async (ctx) => {
    if (type !== 'tracks' && type !== 'artists') {
        throw `Invalid type: ${type}`;
    }

    const token = await utils.getPrivateToken();
    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/top/${type}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const items = itemsResponse.items;

    ctx.state.data = {
        title: `Spotify: My Top ${type[0].toUpperCase() + type.slice(1)}`,
        allowEmpty: true,
        item: type === 'tracks' ? items.map(utils.parseTrack) : items.map(utils.parseArtist),
    };
};
