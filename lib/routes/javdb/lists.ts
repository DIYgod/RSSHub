// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';
    const sort = ctx.req.param('sort') ?? '0';

    const currentUrl = `/lists/${id}?lst=${sort}${filter && filter !== 'none' ? `&f=${filter}` : ''}`;

    const filters = {
        '': '',
        none: '',
        playable: '可播放',
        single: '單體作品',
        download: '含磁链',
        cnsub: '含字幕',
        preview: '預覽圖',
    };

    const sortOptions = {
        0: '加入时间排序',
        1: '发布时间排序',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} ${sortOptions[sort]}`;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
