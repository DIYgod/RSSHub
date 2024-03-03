// @ts-nocheck
import cache from '@/utils/cache';
const { getSimple, getDetails, getTorrents } = require('./util');

export default async (ctx) => {
    const { keyword, mode } = ctx.req.param();

    const url = `https://nhentai.net/search/?q=${keyword}`;

    const simples = await getSimple(url);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 5;
    let items = simples;
    if (mode === 'detail') {
        items = await getDetails(cache, simples, limit);
    } else if (mode === 'torrent') {
        items = await getTorrents(cache, simples, limit);
    }

    ctx.set('data', {
        title: `nhentai - search - ${keyword}`,
        link: url,
        item: items,
    });
};
