const utils = require('./utils');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const token = await utils.getPublicToken();
    const { id } = ctx.params;
    const meta = await got
        .get(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();

    const itemsResponse = await got
        .get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();
    const tracks = itemsResponse.items;

    ctx.state.data = {
        title: meta.name,
        link: meta.external_urls.spotify,
        description: meta.description,
        allowEmpty: true,
        item: tracks.map((x) => ({
            title: x.track.name,
            author: x.track.artists.map((a) => a.name).join(', '),
            description: `"${x.track.name}" by ${x.track.artists.map((a) => a.name).join(', ')} from the album "${x.track.album.name}"`,
            pubDate: parseDate(x.added_at),
            link: x.track.external_urls.spotify,
        })),
    };
};
