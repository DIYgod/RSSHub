// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';

    const currentUrl = `/makers/${id}${filter ? `?f=${filter}` : ''}`;

    const filters = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
