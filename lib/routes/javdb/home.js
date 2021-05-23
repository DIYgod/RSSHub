const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'censored';
    ctx.params.sort = ctx.params.sort || '2';
    ctx.params.filter = ctx.params.filter || '1';

    const currentUrl = `${utils.rootUrl}/${ctx.params.caty === 'censored' ? '' : ctx.params.caty}?vft=${ctx.params.filter}&vst=${ctx.params.sort}`;

    const category = {
        censored: '有碼',
        uncensored: '無碼',
        western: '歐美',
        fc2: 'FC2',
    };

    const filter = {
        0: '',
        1: '可下载',
        2: '含字幕',
        3: '含短評',
    };

    const sort = {
        1: '发布日期排序',
        2: '磁鏈更新排序',
    };

    const title = `${category[ctx.params.caty]} - JavDB - ${filter[ctx.params.filter] === '' ? '|' : `${filter[ctx.params.filter]} | `}${sort[ctx.params.sort]}`;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
