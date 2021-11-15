import got from '~/utils/got.js';
import cache from './cache.js';
import entities from 'entities';
import queryString from 'query-string';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const name = await cache.getPatchnameFromID(ctx, id);

    const host = `https://patchwork.kernel.org/patch/${id}/`;
    const url = `https://patchwork.kernel.org/api/patches/${id}/comments/`;

    const {
        data
    } = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            order: '-date',
        }),
    });

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
