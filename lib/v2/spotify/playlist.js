const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    });

    if (meta.images.length) {
        ctx.state.data.image = meta.images[0].url;
    }
};
