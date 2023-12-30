const utils = require('./utils');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const token = await utils.getPrivateToken();

    const { limit } = ctx.params;
    const pageSize = !isNaN(parseInt(limit)) ? parseInt(limit) : 50;

    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/me/tracks?limit=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const tracks = itemsResponse.items;

    ctx.state.data = {
        title: 'Spotify: My Saved Tracks',
        link: 'https://open.spotify.com/collection/tracks',
        description: `Latest ${pageSize} saved tracks on Spotify.`,
        allowEmpty: true,
        item: tracks.map((x) => ({
            ...utils.parseTrack(x.track),
            pubDate: parseDate(x.added_at),
        })),
    };
};
