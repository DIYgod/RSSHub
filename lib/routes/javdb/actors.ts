// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';

    const currentUrl = `/actors/${id}${filter ? `?t=${filter}` : ''}`;

    const filters = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
