// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const filter = ctx.req.param('filter') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';
    const sort = ctx.req.param('sort') ?? '0';

    const currentUrl = `/search?q=${keyword}${filter && filter !== 'none' ? `&f=${filter}` : ''}&sb=${sort}`;

    const filters = {
        '': '',
        none: '',
        playable: '可播放',
        single: '單體作品',
        actor: '演員',
        maker: '片商',
        director: '導演',
        series: '系列',
        code: '番號',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const sorts = {
        0: '按相关度排序',
        1: '按发布时间排序',
    };

    const title = `關鍵字 ${keyword} ${filters[filter] === '' ? '' : `+ ${filters[filter]}`} ${sorts[sort]} 搜索結果 - JavDB`;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
