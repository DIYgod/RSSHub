const got = require('@/utils/got');
const cache = require('./cache');
const entities = require('entities');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const name = await cache.getPatchnameFromID(ctx, id);

    const host = `https://patchwork.kernel.org/patch/${id}/`;
    const url = `https://patchwork.kernel.org/api/patches/${id}/comments/`;

    const response = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            order: '-date',
        }),
    });
    const data = response.data;

    ctx.state.data = {
        title: `${name} - Comments`,
        link: host,
        item: data.map((item) => ({
            title: item.subject,
            description: entities.escape(entities.escape(item.content)).replace(/\n/g, '<br>'),
            pubDate: new Date(item.date).toUTCString(),
            link: item.web_url,
        })),
    };
};
