// @ts-nocheck
import cache from '@/utils/cache';
const { getSimple, getDetails, getTorrents } = require('./util');

const supportedKeys = new Set(['parody', 'character', 'tag', 'artist', 'group', 'language', 'category']);

export default async (ctx) => {
    const { key, keyword, mode } = ctx.req.param();

    if (!supportedKeys.has(key)) {
        throw new Error('Unsupported key');
    }

    const url = `https://nhentai.net/${key}/${keyword.toLowerCase().replace(' ', '-')}/`;

    const simples = await getSimple(url);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 5;
    let items = simples;
    if (mode === 'detail') {
        items = await getDetails(cache, simples, limit);
    } else if (mode === 'torrent') {
        items = await getTorrents(cache, simples, limit);
    }

    ctx.set('data', {
        title: `nhentai - ${key} - ${keyword}`,
        link: url,
        description: 'hentai',
        item: items,
    });
};
