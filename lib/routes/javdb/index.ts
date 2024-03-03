// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'censored';
    const sort = ctx.req.param('sort') ?? '2';
    const filter = ctx.req.param('filter') ?? '1';

    const currentUrl = `${category === 'censored' ? '' : category}?vft=${filter}&vst=${sort}`;

    const categories = {
        censored: '有碼',
        uncensored: '無碼',
        western: '歐美',
        fc2: 'FC2',
    };

    const filters = {
        0: '',
        1: '可下载',
        2: '含字幕',
        3: '含短評',
    };

    const sorts = {
        1: '发布日期排序',
        2: '磁鏈更新排序',
    };

    const title = `${categories[category]} - JavDB - ${filters[filter] === '' ? '|' : `${filters[filter]} | `}${sorts[sort]}`;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
