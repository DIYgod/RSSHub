const utils = require('./utils');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const token = await utils.getPublicToken();
    const { id } = ctx.params;

    const meta = await got
        .get(`https://api.spotify.com/v1/shows/${id}?market=US`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .json();

    const episodes = meta.episodes.items;

    ctx.state.data = {
        title: meta.name,
        description: meta.description,
        link: meta.external_urls.spotify,
        allowEmpty: true,
        item: episodes.map((x) => ({
            title: x.name,
            description: x.description,
            pubDate: parseDate(x.release_date),
            link: x.external_urls.spotify,
        })),
    };

    if (meta.images.length) {
        ctx.state.data.image = meta.images[0].url;
    }
};
